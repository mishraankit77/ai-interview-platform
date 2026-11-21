export type InterviewRole = 'fullstack' | 'frontend' | 'backend' | 'ai_engineer' | 'dsa';

export type DifficultyLevel = 'junior' | 'mid' | 'senior';

export type InterviewRoundType = 
  | 'coding_test'       // Round 1: Live Coding Test
  | 'technical'         // Round 2: Technical & Architecture Interview
  | 'hr'                // Round 3: HR & Cultural Fit Interview
  | 'managerial';       // Round 4: Engineering Managerial Interview

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface CodingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimitSeconds: number; // e.g. 900 (15 mins)
  starterCode: {
    javascript: string;
    typescript: string;
    python: string;
  };
  testCases: TestCase[];
  constraints: string[];
  optimalTimeComplexity: string;
  optimalSpaceComplexity: string;
}

export interface TurnEvaluation {
  score: number; // 0-100 overall turn score (strict, honest)
  technicalAccuracy: number; // 0-100
  communicationClarity: number; // 0-100
  problemSolving: number; // 0-100
  depthOfKnowledge: number; // 0-100
  feedback: string; // Honest, direct feedback with specifics
  strengths: string[];
  weaknesses: string[]; // Specific gaps or missed edge cases
  suggestedAnswer: string; // Industry-standard benchmark answer
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Unsatisfactory';
}

export interface Message {
  id: string;
  sender: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
  evaluation?: TurnEvaluation;
  agentRole?: 'Interviewer' | 'Evaluator' | 'ReportEngine' | 'System';
  codeSnippet?: string;
  codeLanguage?: string;
}

export interface Question {
  id: string;
  text: string;
  roundType: InterviewRoundType;
  expectedTopics: string[];
  difficulty: DifficultyLevel | string;
  category: string;
  timeLimitSeconds: number; // e.g. 180s for technical, 120s for HR, 900s for coding
  codingChallenge?: CodingChallenge;
}

export interface OverallMetrics {
  averageScore: number;
  technicalScore: number;
  communicationScore: number;
  problemSolvingScore: number;
  depthScore: number;
  turnsEvaluated: number;
}

export interface DetailedTurnBreakdown {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  strengths?: string[];
  weaknesses?: string[];
  idealResponse: string;
  verdict: string;
}

export interface InterviewReport {
  id: string;
  candidateName: string;
  role: InterviewRole;
  roundType: InterviewRoundType | 'full_loop';
  experienceYears: number;
  overallScore: number;
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
  summary: string;
  radarScores: {
    technicalAccuracy: number;
    communication: number;
    problemSolving: number;
    depthAndInternals: number;
    cultureAndLeadership: number;
  };
  strengths: string[];
  areasForImprovement: string[];
  detailedBreakdown: DetailedTurnBreakdown[];
  generatedAt: string;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  role: InterviewRole;
  roundType: InterviewRoundType;
  experienceYears: number;
  currentQuestionIndex: number;
  questions: Question[];
  messages: Message[];
  metrics: OverallMetrics;
  report?: InterviewReport;
  createdAt: string;
  status: 'active' | 'completed';
}

export interface RoleConfig {
  id: InterviewRole;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  roundsAvailable: InterviewRoundType[];
}
