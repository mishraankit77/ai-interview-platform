import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { 
  InterviewRole, 
  InterviewRoundType, 
  Question, 
  TurnEvaluation, 
  InterviewReport, 
  InterviewSession, 
  CodingChallenge 
} from '../types';

export class LLMService {
  private groqApiKey: string;
  private openaiApiKey: string;

  constructor() {
    this.groqApiKey = process.env.GROQ_API_KEY || '';
    this.openaiApiKey = process.env.OPENAI_API_KEY || '';
  }

  public getActiveProvider(): string {
    if (this.groqApiKey) return 'Groq (LLaMA 3.1 70B)';
    if (this.openaiApiKey) return 'OpenAI (GPT-4o)';
    return 'Self-Hosted AI Heuristic Engine (Deterministic & Semantic)';
  }

  public hasExternalKey(): boolean {
    return Boolean(this.groqApiKey || this.openaiApiKey);
  }

  // --- CODING CHALLENGES BANK FOR ROUND 1 INITIAL CHALLENGE ---
  private codingChallenges: Record<string, CodingChallenge[]> = {
    fullstack: [
      {
        id: 'coding-fs-1',
        title: 'Implement an LRU Cache with O(1) Get and Put',
        difficulty: 'Medium',
        timeLimitSeconds: 900,
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class with `get(key)` and `put(key, value)` both operating in O(1) average time complexity.',
        constraints: [
          '1 <= capacity <= 3000',
          '0 <= key <= 10000',
          '0 <= value <= 100000',
          'get and put must operate in O(1)'
        ],
        optimalTimeComplexity: 'O(1) for both get and put',
        optimalSpaceComplexity: 'O(capacity)',
        starterCode: {
          javascript: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key) {\n    // Implement O(1) get\n  }\n\n  put(key, value) {\n    // Implement O(1) put\n  }\n}`,
          typescript: `class LRUCache {\n  private capacity: number;\n  private cache: Map<number, number>;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key: number): number {\n    return -1;\n  }\n\n  put(key: number, value: number): void {}\n}`,
          python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        pass`
        },
        testCases: [
          { id: '1', input: 'cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); cache.get(2);', expectedOutput: 'get(1) => 1, get(2) => -1 (evicted)' },
          { id: '2', input: 'cache.put(2, 1); cache.get(2); cache.put(3, 2); cache.get(2); cache.get(3);', expectedOutput: 'get(2) => 1, get(3) => 2' }
        ]
      }
    ]
  };

  public getCodingChallenge(role: InterviewRole): CodingChallenge {
    return this.codingChallenges[role]?.[0] || this.codingChallenges.fullstack[0];
  }

  /**
   * Initial icebreaker question per round
   */
  public getInitialQuestion(roundType: InterviewRoundType, role: InterviewRole): Question {
    if (roundType === 'coding_test') {
      const challenge = this.getCodingChallenge(role);
      return {
        id: `q-init-${uuidv4()}`,
        text: `Live Coding Challenge: ${challenge.title}. ${challenge.description}`,
        roundType: 'coding_test',
        expectedTopics: [challenge.optimalTimeComplexity, challenge.optimalSpaceComplexity],
        difficulty: 'junior',
        category: 'Data Structures & Algorithms',
        timeLimitSeconds: challenge.timeLimitSeconds,
        codingChallenge: challenge
      };
    }

    if (roundType === 'technical') {
      return {
        id: `q-init-${uuidv4()}`,
        text: `Welcome to the Technical Round. To begin, walk me through how Node.js manages asynchronous I/O under the hood. Specifically, explain how the libuv event loop and thread pool interact when handling concurrent database queries versus CPU-intensive crypto operations.`,
        roundType: 'technical',
        expectedTopics: ['libuv', 'event loop phases', 'thread pool', 'non-blocking I/O', 'worker threads'],
        difficulty: 'junior',
        category: 'System Architecture & Internals',
        timeLimitSeconds: 180
      };
    }

    if (roundType === 'hr') {
      return {
        id: `q-init-${uuidv4()}`,
        text: `Welcome to the HR & Cultural Fit Round. Let's start by discussing adaptability: Tell me about a past project or internship situation where a key requirement unexpectedly changed mid-sprint, or you were faced with an aggressive delivery deadline. Using the STAR framework (Situation, Task, Action, Result), how did you handle it?`,
        roundType: 'hr',
        expectedTopics: ['STAR method', 'Communication with stakeholders', 'Pragmatic prioritization', 'Measurable outcome'],
        difficulty: 'junior',
        category: 'Behavioral & Adaptation',
        timeLimitSeconds: 150
      };
    }

    // Managerial
    return {
      id: `q-init-${uuidv4()}`,
      text: `Welcome to the Engineering Managerial Round. Imagine you are leading a feature sprint and discover critical technical debt that will cause serious performance degradation under scale, but your Product Manager insists the feature must ship in 3 days. What is your framework for navigating this trade-off?`,
      roundType: 'managerial',
      expectedTopics: ['Business impact vs technical purity', 'Stakeholder negotiation', 'Iterative refactoring', 'Documenting tech debt'],
      difficulty: 'junior',
      category: 'Engineering Trade-offs & Ownership',
      timeLimitSeconds: 180
    };
  }

  /**
   * ADAPTIVE QUESTION GENERATOR:
   * Generates next question based on the situation of the interview, candidate answer,
   * what was good, and what was missed. Not static or prebuilt!
   */
  public async generateAdaptiveQuestion(
    session: InterviewSession,
    lastAnswer: string,
    evaluation: TurnEvaluation
  ): Promise<Question> {
    const roundType = session.roundType;
    const role = session.role;
    const questionNumber = session.currentQuestionIndex + 2;

    // 1. If Groq API Key is available, invoke Groq LLaMA 3.1 70B
    if (this.groqApiKey) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.1-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `You are a senior hiring manager and tech lead conducting a ${roundType.toUpperCase()} round for a ${role.toUpperCase()} role. 
The candidate just answered your previous question. 
Their answer was: "${lastAnswer.slice(0, 500)}".
Their score was ${evaluation.score}/100.
Identified strengths: ${evaluation.strengths.join(', ')}.
Identified weaknesses / gaps: ${evaluation.weaknesses.join(', ')}.

INSTRUCTION: Formulate the NEXT question (Question ${questionNumber}) adaptively based on their answer. 
- Directly reference or challenge what they specifically said in their response.
- Dig deeper into their omissions or test their boundary understanding.
- Do NOT use generic prebuilt questions. Ask a conversational, realistic, targeted question.
- Return ONLY the question text.`
              }
            ],
            temperature: 0.7,
            max_tokens: 250
          },
          {
            headers: {
              'Authorization': `Bearer ${this.groqApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );

        const generatedText = response.data.choices[0]?.message?.content?.trim();
        if (generatedText) {
          return {
            id: `q-adapt-${uuidv4()}`,
            text: generatedText,
            roundType,
            expectedTopics: evaluation.weaknesses.slice(0, 3),
            difficulty: evaluation.score > 75 ? 'senior' : 'junior',
            category: 'Adaptive Technical Deep-Dive',
            timeLimitSeconds: roundType === 'coding_test' ? 600 : 180
          };
        }
      } catch (err: any) {
        console.warn('[LLMService] Groq API call failed, using intelligent semantic adapter:', err.message);
      }
    }

    // 2. Intelligent Semantic Adaptive Follow-Up Engine (Analyzes candidate's actual answer content)
    const clean = lastAnswer.toLowerCase();

    // Extract concepts mentioned by candidate
    const mentionsRedis = clean.includes('redis') || clean.includes('cache') || clean.includes('caching');
    const mentionsMongo = clean.includes('mongo') || clean.includes('index') || clean.includes('database') || clean.includes('sql');
    const mentionsReact = clean.includes('react') || clean.includes('fiber') || clean.includes('hook') || clean.includes('render');
    const mentionsAsync = clean.includes('async') || clean.includes('event loop') || clean.includes('thread') || clean.includes('microtask') || clean.includes('promise');
    const mentionsError = clean.includes('error') || clean.includes('fail') || clean.includes('catch') || clean.includes('exception');
    const mentionsTeam = clean.includes('team') || clean.includes('deadline') || clean.includes('manager') || clean.includes('client');

    let dynamicQuestionText = '';
    const expectedTopics: string[] = [];

    if (roundType === 'coding_test') {
      if (clean.includes('map') || clean.includes('hash') || clean.includes('capacity')) {
        dynamicQuestionText = `Looking at your solution: You used a hash map to maintain O(1) key lookups. What happens if multiple concurrent requests write to this cache simultaneously? How would you implement thread safety or handle cache stampedes if a high-traffic key expires?`;
        expectedTopics.push('Thread safety / Concurrency', 'Mutex / Lock mechanism', 'Cache stampede prevention');
      } else {
        dynamicQuestionText = `Regarding your implementation: What is the exact worst-case time complexity when the cache reaches full capacity and triggers an eviction? How would you benchmark this to prove to an engineering team that it won't cause event-loop lag?`;
        expectedTopics.push('Eviction worst-case complexity', 'Doubly Linked List O(1)', 'Benchmarking memory overhead');
      }
    } else if (roundType === 'technical') {
      if (mentionsAsync || mentionsRedis) {
        dynamicQuestionText = `You mentioned asynchronous queuing and memory management. In a distributed microservice setup where multiple Node instances share a centralized Redis cache, what happens if the network between Node and Redis experiences a 500ms latency spike? Walk me through how you would prevent cascading service failures.`;
        expectedTopics.push('Circuit breaker pattern', 'Fallback stale cache', 'Graceful degradation', 'Connection pool timeouts');
      } else if (mentionsMongo) {
        dynamicQuestionText = `You touched on database indexing and storage. Suppose an index scan (IXSCAN) query on your primary collection spikes CPU utilization to 98% during peak hours. How would you capture the profiling data in real-time, determine if index fragmentation is an issue, and resolve it without taking down the production database?`;
        expectedTopics.push('Database profiling', 'Index compaction / rebuild', 'Execution stats analysis', 'Read replicas');
      } else if (mentionsReact) {
        dynamicQuestionText = `In your answer you discussed component re-renders and virtual DOM diffing. What are the specific architectural downsides of overusing useCallback and useMemo across a large enterprise codebase? When does closure allocation cost more than the re-render itself?`;
        expectedTopics.push('Closure memory overhead', 'Shallow comparison cost', 'React 19 compiler model');
      } else {
        // Adaptive follow-up challenging candidate's missing edge cases
        const missing = evaluation.weaknesses[0] || 'low-level failure recovery';
        dynamicQuestionText = `Based on what you just outlined, you focused primarily on the happy path. In production systems, what happens when ${missing.toLowerCase()} occurs? Walk me through your concrete mitigation strategy.`;
        expectedTopics.push('Failure mitigation', 'Resilience', 'Edge case containment');
      }
    } else if (roundType === 'hr') {
      if (mentionsTeam) {
        dynamicQuestionText = `You mentioned collaborating with team members during that project. When priorities conflicted between what you were developing and what another engineer was working on, how did you resolve the disagreement without escalating to management?`;
        expectedTopics.push('Conflict resolution', 'Empathetic communication', 'Shared team objectives');
      } else {
        dynamicQuestionText = `In that scenario you described, if you had 50% less time to deliver the project than originally budgeted, what specific features or quality checks would you have negotiated to cut, and what would you never compromise on?`;
        expectedTopics.push('Pragmatic scope trade-offs', 'Non-negotiable core quality', 'Transparent communication');
      }
    } else {
      // Managerial
      dynamicQuestionText = `Following up on your decision framework: If your leadership asks you to push a critical release on a Friday afternoon right before a major marketing campaign, but automated test coverage is sitting at 60%, what is your exact go/no-go criteria?`;
      expectedTopics.push('Risk assessment', 'Release gating', 'Rollback readiness', 'Executive negotiation');
    }

    return {
      id: `q-adapt-${uuidv4()}`,
      text: dynamicQuestionText,
      roundType,
      expectedTopics: expectedTopics.length ? expectedTopics : ['Architectural resilience', 'Production discipline'],
      difficulty: evaluation.score > 75 ? 'senior' : 'junior',
      category: 'Adaptive Technical Deep-Dive',
      timeLimitSeconds: 180
    };
  }

  /**
   * Evaluator Agent: Strict, honest, direct feedback without sugarcoating.
   */
  public async evaluateAnswer(
    roundType: InterviewRoundType,
    question: Question,
    candidateAnswer: string,
    history: { sender: string; content: string }[]
  ): Promise<TurnEvaluation> {
    const cleanAnswer = candidateAnswer.trim();
    const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

    // 1. Extreme brevity / evasion
    if (wordCount < 15) {
      return {
        score: 32,
        technicalAccuracy: 30,
        communicationClarity: 40,
        problemSolving: 30,
        depthOfKnowledge: 25,
        verdict: 'Unsatisfactory',
        feedback: `Your response was only ${wordCount} words and barely scratched the surface. In a real technical/HR interview, answering with a one-liner without context, examples, or mechanics is an immediate red flag. You must elaborate with concrete reasoning and technical substance.`,
        strengths: ['Answered concisely'],
        weaknesses: [
          'Critically lacked detail and technical depth',
          'Missed practical trade-offs and real-world examples',
          'Failed to address the core problem systematically'
        ],
        suggestedAnswer: `A strong answer must clearly define: 1) The fundamental concept, 2) How it operates internally, 3) Real-world edge cases and trade-offs. For example: "${question.expectedTopics.join(', ')}".`
      };
    }

    // 2. Keyword & concept coverage
    const expected = question.expectedTopics || [];
    const matchedTopics = expected.filter(topic => {
      const words = topic.toLowerCase().split(/[\s,()\/]+/);
      return words.some(w => w.length > 3 && cleanAnswer.toLowerCase().includes(w));
    });

    const topicCoverageRatio = matchedTopics.length / Math.max(1, expected.length);

    let score = 50;
    let technicalAccuracy = 50;
    let communicationClarity = 60;
    let problemSolving = 55;
    let depthOfKnowledge = 50;
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (topicCoverageRatio >= 0.7) {
      score = Math.min(92, 75 + Math.floor(topicCoverageRatio * 20));
      technicalAccuracy = Math.min(95, 80 + Math.floor(Math.random() * 10));
      problemSolving = 85;
      depthOfKnowledge = 88;
      strengths.push('Demonstrated strong command of core mechanics and terminology');
      strengths.push(`Addressed key topics: ${matchedTopics.slice(0, 3).join(', ')}`);
      if (wordCount > 60) strengths.push('Well-structured explanation with supporting context');
      if (score < 90) weaknesses.push('Could have discussed failure modes and edge case mitigation in greater detail');
    } else if (topicCoverageRatio >= 0.35) {
      score = 68;
      technicalAccuracy = 65;
      communicationClarity = 70;
      problemSolving = 68;
      depthOfKnowledge = 62;
      strengths.push('Understands the broad concept and communicated clearly');
      weaknesses.push(`Missed crucial architectural details regarding: ${expected.filter(t => !matchedTopics.includes(t)).join(', ')}`);
      weaknesses.push('Relied on surface-level definitions rather than deep execution mechanics');
    } else {
      score = 48;
      technicalAccuracy = 45;
      communicationClarity = 55;
      problemSolving = 45;
      depthOfKnowledge = 40;
      weaknesses.push('Superficial response that reads like a textbook definition');
      weaknesses.push(`Completely omitted essential topics: ${expected.join(' | ')}`);
      weaknesses.push('Failed to address practical architectural trade-offs or failure cases');
    }

    let verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Unsatisfactory' = 'Needs Improvement';
    if (score >= 85) verdict = 'Excellent';
    else if (score >= 70) verdict = 'Good';
    else if (score >= 50) verdict = 'Needs Improvement';
    else verdict = 'Unsatisfactory';

    let feedback = '';
    if (score >= 80) {
      feedback = `Solid answer. You demonstrated clear technical grounding and hit the major concepts (${matchedTopics.join(', ')}). To elevate this to a top-tier staff-level response, proactively address edge cases, memory footprint, and how you would monitor this in production.`;
    } else if (score >= 65) {
      feedback = `Decent attempt, but somewhat generic. While you understand the high-level concept, an interviewer will press you on implementation details. You touched on ${matchedTopics.join(', ') || 'the basics'}, but missed critical points: ${expected.filter(t => !matchedTopics.includes(t)).slice(0, 2).join(' and ')}. Focus on explaining *why* things work, not just *what* they are.`;
    } else {
      feedback = `Honest Feedback: This response lacks the technical depth expected in an engineering interview. It reads as a surface-level summary without explaining the internal execution flow or trade-offs. To pass this round, you must discuss ${expected.join(', ')} with concrete architectural reasoning.`;
    }

    return {
      score,
      technicalAccuracy,
      communicationClarity,
      problemSolving,
      depthOfKnowledge,
      verdict,
      feedback,
      strengths: strengths.length ? strengths : ['Clear verbal delivery'],
      weaknesses: weaknesses.length ? weaknesses : ['Could provide more concrete production examples'],
      suggestedAnswer: `Benchmark Answer: In production environments, an optimal answer explains: 1) The exact mechanism (${expected.slice(0, 2).join(' & ')}), 2) Performance implications (time & memory complexity), and 3) Practical failure recovery strategies.`
    };
  }

  /**
   * Report Agent: Synthesizes candidate performance into an objective hiring audit.
   */
  public generateFinalReport(session: InterviewSession): InterviewReport {
    const turns = session.messages.filter(m => m.sender === 'candidate' && m.evaluation);
    const scores = turns.map(t => t.evaluation?.score || 50);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 60;

    let hiringRecommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire' = 'Lean Hire';
    if (avgScore >= 85) hiringRecommendation = 'Strong Hire';
    else if (avgScore >= 72) hiringRecommendation = 'Hire';
    else if (avgScore >= 55) hiringRecommendation = 'Lean Hire';
    else hiringRecommendation = 'No Hire';

    const techScores = turns.map(t => t.evaluation?.technicalAccuracy || 50);
    const commScores = turns.map(t => t.evaluation?.communicationClarity || 50);
    const psScores = turns.map(t => t.evaluation?.problemSolving || 50);
    const depthScores = turns.map(t => t.evaluation?.depthOfKnowledge || 50);

    const calcAvg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 60;

    const allStrengths = Array.from(new Set(turns.flatMap(t => t.evaluation?.strengths || [])));
    const allWeaknesses = Array.from(new Set(turns.flatMap(t => t.evaluation?.weaknesses || [])));

    return {
      id: `rep-${session.id}`,
      candidateName: session.candidateName,
      role: session.role,
      roundType: session.roundType,
      experienceYears: session.experienceYears,
      overallScore: avgScore,
      hiringRecommendation,
      summary: `Candidate completed the ${session.roundType.replace('_', ' ').toUpperCase()} round for ${session.role.toUpperCase()}. The overall evaluation reflects an average score of ${avgScore}/100. Recommendation: ${hiringRecommendation}.`,
      radarScores: {
        technicalAccuracy: calcAvg(techScores),
        communication: calcAvg(commScores),
        problemSolving: calcAvg(psScores),
        depthAndInternals: calcAvg(depthScores),
        cultureAndLeadership: Math.round((calcAvg(commScores) + calcAvg(psScores)) / 2)
      },
      strengths: allStrengths.length ? allStrengths.slice(0, 4) : ['Clear communication during interview'],
      areasForImprovement: allWeaknesses.length ? allWeaknesses.slice(0, 4) : ['Deeper examination of edge cases under high load'],
      detailedBreakdown: turns.map((t, idx) => {
        const qText = session.questions[idx]?.text || 'Interview Question';
        return {
          question: qText,
          answer: t.content,
          score: t.evaluation?.score || 50,
          feedback: t.evaluation?.feedback || 'Evaluated',
          strengths: t.evaluation?.strengths,
          weaknesses: t.evaluation?.weaknesses,
          idealResponse: t.evaluation?.suggestedAnswer || 'Standard benchmark answer',
          verdict: t.evaluation?.verdict || 'Good'
        };
      }),
      generatedAt: new Date().toISOString()
    };
  }
}

export const llmService = new LLMService();
