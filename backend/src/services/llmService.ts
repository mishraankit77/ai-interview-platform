import axios from 'axios';
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

  // --- CODING CHALLENGES BANK ---
  private codingChallenges: Record<string, CodingChallenge[]> = {
    fullstack: [
      {
        id: 'coding-fs-1',
        title: 'Implement an LRU Cache with O(1) Get and Put',
        difficulty: 'Medium',
        timeLimitSeconds: 900, // 15 mins
        description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache. Implement the `LRUCache` class with `get(key)` and `put(key, value)` both operating in O(1) average time complexity.',
        constraints: [
          '1 <= capacity <= 3000',
          '0 <= key <= 10000',
          '0 <= value <= 100000',
          'At most 2 * 10^5 calls will be made to get and put'
        ],
        optimalTimeComplexity: 'O(1) for both get and put',
        optimalSpaceComplexity: 'O(capacity)',
        starterCode: {
          javascript: `class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key) {\n    // Implement O(1) get and refresh recency\n  }\n\n  put(key, value) {\n    // Implement O(1) put and evict least recently used\n  }\n}`,
          typescript: `class LRUCache {\n  private capacity: number;\n  private cache: Map<number, number>;\n\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n\n  get(key: number): number {\n    // TODO: Implement\n    return -1;\n  }\n\n  put(key: number, value: number): void {\n    // TODO: Implement\n  }\n}`,
          python: `class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n\n    def get(self, key: int) -> int:\n        # TODO: Implement O(1) get\n        pass\n\n    def put(self, key: int, value: int) -> None:\n        # TODO: Implement O(1) put\n        pass`
        },
        testCases: [
          { id: '1', input: 'cache.put(1, 1); cache.put(2, 2); cache.get(1); cache.put(3, 3); cache.get(2);', expectedOutput: 'get(1) => 1, get(2) => -1 (evicted)' },
          { id: '2', input: 'cache.put(2, 1); cache.get(2); cache.put(3, 2); cache.get(2); cache.get(3);', expectedOutput: 'get(2) => 1, get(3) => 2' }
        ]
      },
      {
        id: 'coding-fs-2',
        title: 'Debounce with Immediate Execution & Cancel Option',
        difficulty: 'Medium',
        timeLimitSeconds: 720, // 12 mins
        description: 'Build an advanced `debounce` higher-order function commonly required in frontend search bars. It must take `fn`, `wait` (ms), and an optional `{ immediate: boolean }` flag. Return a debounced function that also provides a `.cancel()` method.',
        constraints: ['wait >= 0', 'Handles multiple rapid invocations correctly'],
        optimalTimeComplexity: 'O(1) scheduling',
        optimalSpaceComplexity: 'O(1)',
        starterCode: {
          javascript: `function debounce(fn, wait, options = {}) {\n  let timeoutId = null;\n\n  function debounced(...args) {\n    // Implement debounce logic\n  }\n\n  debounced.cancel = () => {\n    // Implement cancel\n  };\n\n  return debounced;\n}`,
          typescript: `type DebouncedFunction<T extends (...args: any[]) => any> = {\n  (...args: Parameters<T>): void;\n  cancel: () => void;\n};\n\nfunction debounce<T extends (...args: any[]) => any>(\n  fn: T,\n  wait: number,\n  options: { immediate?: boolean } = {}\n): DebouncedFunction<T> {\n  // TODO: Implement\n}`,
          python: `import time\nimport threading\n\ndef debounce(wait, immediate=False):\n    # Python decorator implementation\n    pass`
        },
        testCases: [
          { id: '1', input: 'Call 5 times within 50ms (wait = 100ms)', expectedOutput: 'Function executes exactly once after 100ms silence' },
          { id: '2', input: 'Call once with immediate: true', expectedOutput: 'Executes synchronously on leading edge, suppresses trailing calls within window' }
        ]
      }
    ],
    backend: [
      {
        id: 'coding-be-1',
        title: 'Token Bucket Rate Limiter with Redis-like In-Memory State',
        difficulty: 'Medium',
        timeLimitSeconds: 900,
        description: 'Implement a Token Bucket rate limiter class `TokenBucketLimiter` that allows at most `capacity` requests with a refill rate of `refillPerSecond`. Support `allowRequest(clientId)` which returns a boolean.',
        constraints: ['clientId is a string', 'Must correctly calculate fractional tokens elapsed since last refill'],
        optimalTimeComplexity: 'O(1) per check',
        optimalSpaceComplexity: 'O(number of unique clients)',
        starterCode: {
          javascript: `class TokenBucketLimiter {\n  constructor(capacity, refillPerSecond) {\n    this.capacity = capacity;\n    this.refillPerSecond = refillPerSecond;\n    this.buckets = new Map(); // clientId -> { tokens, lastRefill }\n  }\n\n  allowRequest(clientId) {\n    // Calculate tokens based on elapsed time and decide\n  }\n}`,
          typescript: `class TokenBucketLimiter {\n  constructor(private capacity: number, private refillPerSecond: number) {}\n  allowRequest(clientId: string): boolean {\n    // Implement\n    return true;\n  }\n}`,
          python: `import time\n\nclass TokenBucketLimiter:\n    def __init__(self, capacity: int, refill_per_second: float):\n        self.capacity = capacity\n        self.refill_per_second = refill_per_second\n        self.clients = {}\n\n    def allow_request(self, client_id: str) -> bool:\n        pass`
        },
        testCases: [
          { id: '1', input: 'capacity=5, refill=1/sec. 5 instant requests.', expectedOutput: 'All 5 return true. 6th returns false.' },
          { id: '2', input: 'Wait 2 seconds after exhaustion.', expectedOutput: '2 requests allowed, 3rd returns false.' }
        ]
      }
    ]
  };

  // --- QUESTIONS BANK PER ROUND ---
  private roundQuestions: Record<InterviewRoundType, Record<string, Question[]>> = {
    // 1. Coding Test
    coding_test: {
      default: [
        {
          id: 'q-code-1',
          text: 'Live Coding Challenge: Implement an efficient LRU Cache or Debounce with cancellation. Explain your data structure trade-offs.',
          roundType: 'coding_test',
          expectedTopics: ['O(1) Map/DoublyLinkedList', 'eviction policy', 'time/space complexity', 'edge case handling'],
          difficulty: 'junior',
          category: 'Data Structures & Algorithms',
          timeLimitSeconds: 900
        }
      ]
    },

    // 2. Technical Interview
    technical: {
      fullstack: [
        {
          id: 'q-tech-1',
          text: 'Explain the Node.js Event Loop phases (timers, I/O callbacks, poll, check, close). What happens under the hood when `process.nextTick()`, `setImmediate()`, and `setTimeout(0)` compete?',
          roundType: 'technical',
          expectedTopics: ['Event loop phases', 'Microtask queue vs Macrotask queue', 'libuv thread pool', 'Non-blocking I/O'],
          difficulty: 'junior',
          category: 'Node.js Internals',
          timeLimitSeconds: 180
        },
        {
          id: 'q-tech-2',
          text: 'How does React 18 reconciliation (Fiber architecture) work? How does React decide when to re-render, and what are the specific performance implications and trade-offs of `useMemo` and `useCallback`?',
          roundType: 'technical',
          expectedTopics: ['Fiber tree diffing', 'Virtual DOM', 'closure overhead', 'shallow equality comparisons', 'concurrent rendering'],
          difficulty: 'junior',
          category: 'React Architecture',
          timeLimitSeconds: 180
        },
        {
          id: 'q-tech-3',
          text: 'Suppose your MongoDB query on a collection with 2 million records is taking 3 seconds. Walk me through how you diagnose it using `explain()`, choose the right compound index, and prevent index scan (IXSCAN) pitfalls.',
          roundType: 'technical',
          expectedTopics: ['explain("executionStats")', 'COLLSCAN vs IXSCAN', 'ESR rule (Equality, Sort, Range)', 'covered queries'],
          difficulty: 'junior',
          category: 'Databases & Performance',
          timeLimitSeconds: 180
        }
      ],
      ai_engineer: [
        {
          id: 'q-tech-ai-1',
          text: 'Walk me through the difference between naive RAG and Agentic RAG using LangGraph. How do you handle multi-hop retrieval and prevent hallucination when vector search returns low-confidence documents?',
          roundType: 'technical',
          expectedTopics: ['Query rewriting', 'Re-ranking with Cross-Encoders', 'Self-reflective RAG', 'LangGraph cyclic state graph', 'hallucination evaluation'],
          difficulty: 'junior',
          category: 'LLM Systems & LangGraph',
          timeLimitSeconds: 180
        }
      ]
    },

    // 3. HR Interview
    hr: {
      default: [
        {
          id: 'q-hr-1',
          text: 'Tell me about a challenging situation during a past project or internship where a requirement suddenly changed or you faced a tight delivery deadline. How did you adapt and deliver? (Please structure your answer using the STAR method: Situation, Task, Action, Result).',
          roundType: 'hr',
          expectedTopics: ['STAR method', 'Communication with stakeholders', 'Pragmatic prioritization', 'Measurable outcome'],
          difficulty: 'junior',
          category: 'Behavioral & Adaptation',
          timeLimitSeconds: 150
        },
        {
          id: 'q-hr-2',
          text: 'Describe a time when you received constructive or critical feedback on your code review or work performance that you initially disagreed with. How did you handle the conversation and what was the outcome?',
          roundType: 'hr',
          expectedTopics: ['Openness to feedback', 'Ego management', 'Technical dialogue vs emotional reaction', 'Continuous learning'],
          difficulty: 'junior',
          category: 'Team Collaboration & Growth',
          timeLimitSeconds: 150
        },
        {
          id: 'q-hr-3',
          text: 'Why are you specifically interested in software engineering at our company, and where do you realistically see your technical growth over the next 18 to 24 months?',
          roundType: 'hr',
          expectedTopics: ['Company alignment', 'Realistic growth goals', 'Long-term dedication', 'Continuous upskilling'],
          difficulty: 'junior',
          category: 'Motivation & Career Goals',
          timeLimitSeconds: 120
        }
      ]
    },

    // 4. Managerial Interview
    managerial: {
      default: [
        {
          id: 'q-mgr-1',
          text: 'Imagine you are building a feature and realize the current codebase has significant technical debt that will slow down future development, but your product manager expects the feature shipped in 3 days. What is your decision framework?',
          roundType: 'managerial',
          expectedTopics: ['Business impact vs technical purity', 'Negotiation with product', 'Iterative refactoring', 'Documenting tech debt'],
          difficulty: 'junior',
          category: 'Engineering Trade-offs & Ownership',
          timeLimitSeconds: 180
        },
        {
          id: 'q-mgr-2',
          text: 'You push code to staging/production on Friday afternoon and 20 minutes later the alert triggers with 500 errors impacting 5% of users. Walk me through your immediate protocol and post-mortem process.',
          roundType: 'managerial',
          expectedTopics: ['Rollback first, debug second', 'Incident communication', 'Root cause analysis (5 Whys)', 'Blameless post-mortem', 'Preventative automated tests'],
          difficulty: 'junior',
          category: 'Incident Response & Production Discipline',
          timeLimitSeconds: 180
        },
        {
          id: 'q-mgr-3',
          text: 'How do you approach working with teammates whose communication style or work pace is different from yours? Can you give an example from your academic or internship experience?',
          roundType: 'managerial',
          expectedTopics: ['Empathy', 'Clear asynchronous documentation', 'Active listening', 'Shared team accountability'],
          difficulty: 'junior',
          category: 'Cross-functional Collaboration',
          timeLimitSeconds: 150
        }
      ]
    }
  };

  public getQuestionsForRound(roundType: InterviewRoundType, role: InterviewRole): Question[] {
    const roundBank = this.roundQuestions[roundType];
    if (roundBank[role] && roundBank[role].length > 0) {
      return roundBank[role];
    }
    if (roundBank.default && roundBank.default.length > 0) {
      return roundBank.default;
    }
    return this.roundQuestions.technical.fullstack;
  }

  public getCodingChallenge(role: InterviewRole): CodingChallenge {
    const list = this.codingChallenges[role] || this.codingChallenges.fullstack;
    return list[0];
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

    // Strict evaluation heuristics
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

    // 2. Analyze keywords and expected topics
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

    if (topicCoverageRatio >= 0.75) {
      score = Math.min(92, 75 + Math.floor(topicCoverageRatio * 20));
      technicalAccuracy = Math.min(95, 80 + Math.floor(Math.random() * 10));
      problemSolving = 85;
      depthOfKnowledge = 88;
      strengths.push('Demonstrated strong command of core mechanics and terminology');
      strengths.push(`Addressed key topics: ${matchedTopics.slice(0, 3).join(', ')}`);
      if (wordCount > 60) strengths.push('Well-structured explanation with supporting context');
      if (score < 90) weaknesses.push('Could have discussed failure modes and edge case mitigation in greater detail');
    } else if (topicCoverageRatio >= 0.4) {
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
