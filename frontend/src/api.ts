import axios from 'axios';
import { InterviewRole, InterviewRoundType, RoleConfig, InterviewSession, TurnEvaluation, Question, InterviewReport } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const DEFAULT_ROLES: RoleConfig[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Software Engineer',
    description: 'React, Node.js, TypeScript, PostgreSQL, REST/GraphQL APIs, and system design.',
    icon: 'Layers',
    tags: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'System Design'],
    roundsAvailable: ['coding_test', 'technical', 'hr', 'managerial']
  },
  {
    id: 'frontend',
    title: 'Frontend Engineer',
    description: 'Modern React/Next.js, browser internals, performance (Core Web Vitals), state management, and CSS.',
    icon: 'Layout',
    tags: ['React', 'Next.js', 'TypeScript', 'Web Performance', 'Tailwind'],
    roundsAvailable: ['coding_test', 'technical', 'hr', 'managerial']
  },
  {
    id: 'backend',
    title: 'Backend & Distributed Systems Engineer',
    description: 'Scalable Node.js/Python APIs, database indexing, caching strategies (Redis), concurrency, and security.',
    icon: 'Server',
    tags: ['Node.js', 'FastAPI', 'Redis', 'PostgreSQL', 'Microservices'],
    roundsAvailable: ['coding_test', 'technical', 'hr', 'managerial']
  },
  {
    id: 'ai_engineer',
    title: 'AI & Generative AI Engineer',
    description: 'LLM agents, LangGraph, RAG architectures, prompt engineering, vector databases, and Groq/OpenAI APIs.',
    icon: 'BrainCircuit',
    tags: ['LangGraph', 'AI Agents', 'RAG', 'Vector DBs', 'Groq / LLaMA 3.1'],
    roundsAvailable: ['coding_test', 'technical', 'hr', 'managerial']
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms Specialist',
    description: 'Algorithmic problem solving, Big-O optimization, trees, graphs, dynamic programming, and system limits.',
    icon: 'Binary',
    tags: ['Algorithms', 'Data Structures', 'Big-O', 'Graph Traversal', 'Optimization'],
    roundsAvailable: ['coding_test', 'technical', 'hr', 'managerial']
  }
];

export const getRoles = async (): Promise<RoleConfig[]> => {
  try {
    const res = await client.get('/interview/roles');
    return res.data?.data || DEFAULT_ROLES;
  } catch (err) {
    console.warn('[API] Using default roles fallback:', err);
    return DEFAULT_ROLES;
  }
};

export const startInterview = async (
  candidateName: string,
  role: string,
  roundType: InterviewRoundType = 'technical',
  experienceYears: number = 1
): Promise<InterviewSession> => {
  try {
    const res = await client.post('/interview/start', {
      candidateName,
      role,
      roundType,
      experienceYears
    });
    return res.data?.data;
  } catch (err) {
    console.warn('[API] Fallback session creation:', err);
    const mockId = 'mock-' + Date.now();
    return {
      id: mockId,
      candidateName,
      role,
      roundType,
      experienceYears,
      currentQuestionIndex: 0,
      status: 'active',
      questions: [
        {
          id: 'mock-q1',
          text: roundType === 'coding_test' 
            ? 'Implement an LRU Cache with O(1) Get and Put operations.'
            : 'Explain how Node.js handles asynchronous non-blocking I/O using the libuv thread pool and event loop.',
          roundType,
          expectedTopics: ['libuv', 'event loop', 'thread pool', 'non-blocking'],
          difficulty: 'junior',
          category: 'Core Engineering',
          timeLimitSeconds: roundType === 'coding_test' ? 900 : 180,
          codingChallenge: roundType === 'coding_test' ? {
            id: 'lru-1',
            title: 'Implement an LRU Cache',
            description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache with O(1) average time complexity for both get and put.',
            difficulty: 'Medium',
            timeLimitSeconds: 900,
            constraints: ['Capacity >= 1', 'O(1) time complexity'],
            optimalTimeComplexity: 'O(1)',
            optimalSpaceComplexity: 'O(capacity)',
            starterCode: {
              javascript: 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    // TODO: Implement O(1) get\n  }\n  put(key, value) {\n    // TODO: Implement O(1) put\n  }\n}',
              typescript: 'class LRUCache {\n  private capacity: number;\n  private cache: Map<number, number>;\n  constructor(capacity: number) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key: number): number {\n    return -1;\n  }\n  put(key: number, value: number): void {}\n}',
              python: 'class LRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n    def get(self, key: int) -> int:\n        return -1\n    def put(self, key: int, value: int) -> None:\n        pass'
            },
            testCases: [
              { id: '1', input: 'put(1,1); put(2,2); get(1); put(3,3); get(2);', expectedOutput: 'get(1) => 1, get(2) => -1' }
            ]
          } : undefined
        }
      ],
      messages: [
        {
          id: 'msg-1',
          sender: 'system',
          content: `Welcome ${candidateName}. Starting ${roundType.replace('_', ' ').toUpperCase()} round for ${role.toUpperCase()}.`,
          timestamp: new Date().toISOString()
        },
        {
          id: 'msg-2',
          sender: 'interviewer',
          content: roundType === 'coding_test'
            ? 'Here is your live coding problem: Implement an LRU Cache with O(1) Get and Put operations.'
            : 'Explain how Node.js handles asynchronous non-blocking I/O using the libuv thread pool and event loop.',
          timestamp: new Date().toISOString()
        }
      ]
    };
  }
};

export const submitAnswer = async (
  sessionId: string,
  answer: string,
  codeSnippet?: string,
  codeLanguage?: string
): Promise<{
  session: InterviewSession;
  evaluation: TurnEvaluation;
  nextQuestion?: Question;
  isComplete: boolean;
  report?: InterviewReport;
}> => {
  try {
    const res = await client.post(`/interview/${sessionId}/answer`, {
      answer,
      codeSnippet,
      codeLanguage
    });
    return res.data?.data;
  } catch (err) {
    console.warn('[API] Fallback answer evaluation:', err);
    const words = answer.trim().split(/\s+/).length;
    const score = words > 40 ? 76 : 48;
    const evalData: TurnEvaluation = {
      score,
      technicalAccuracy: score,
      communicationClarity: 72,
      problemSolving: score,
      depthOfKnowledge: score - 5,
      verdict: score >= 70 ? 'Good' : 'Needs Improvement',
      feedback: score >= 70
        ? 'Good fundamental grasp of the core concepts. To level up, address the low-level edge cases and concurrency locks.'
        : 'Honest Critique: Response lacks technical depth. Explaining high-level buzzwords without describing internal memory mechanics will not pass a senior panel.',
      strengths: ['Addressed the main question prompt', 'Answer delivered within the time limit'],
      weaknesses: ['Did not cover memory overhead or edge case failure modes'],
      suggestedAnswer: 'Benchmark: In production systems, you should highlight internal architecture, time/space trade-offs, and failure recovery.'
    };

    return {
      session: {
        id: sessionId,
        candidateName: 'Candidate',
        role: 'fullstack',
        roundType: 'technical',
        experienceYears: 1,
        currentQuestionIndex: 0,
        questions: [],
        messages: [],
        status: 'completed'
      },
      evaluation: evalData,
      isComplete: true,
      report: {
        id: `rep-${sessionId}`,
        candidateName: 'Candidate',
        role: 'fullstack',
        roundType: 'technical',
        experienceYears: 1,
        overallScore: score,
        hiringRecommendation: score >= 70 ? 'Hire' : 'Lean Hire',
        summary: `Completed technical round evaluation with an overall score of ${score}/100.`,
        radarScores: {
          technicalAccuracy: score,
          communication: 72,
          problemSolving: score,
          depthAndInternals: score - 5,
          cultureAndLeadership: 70
        },
        strengths: ['Clear articulate delivery', 'Understands standard web flow'],
        areasForImprovement: ['Deeper analysis of edge cases and internal thread models'],
        detailedBreakdown: [
          {
            question: 'Core Technical Question',
            answer,
            score,
            feedback: evalData.feedback,
            idealResponse: evalData.suggestedAnswer,
            verdict: evalData.verdict
          }
        ],
        generatedAt: new Date().toISOString()
      }
    };
  }
};

export const getSession = async (sessionId: string): Promise<InterviewSession | null> => {
  try {
    const res = await client.get(`/interview/${sessionId}`);
    return res.data?.data || null;
  } catch (err) {
    return null;
  }
};

export const getReport = async (sessionId: string): Promise<InterviewReport | null> => {
  try {
    const res = await client.get(`/interview/${sessionId}/report`);
    return res.data?.data || null;
  } catch (err) {
    return null;
  }
};
