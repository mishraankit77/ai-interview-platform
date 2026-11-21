export type InterviewRoundType = 'coding_test' | 'technical' | 'hr' | 'managerial';

export type InterviewRole = 'fullstack' | 'frontend' | 'backend' | 'ai_engineer' | 'dsa';

export type RoleCategory = InterviewRole;

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
  timeLimitSeconds: number;
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
  score: number;
  technicalAccuracy: number;
  communicationClarity: number;
  problemSolving: number;
  depthOfKnowledge: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  suggestedAnswer: string;
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Unsatisfactory';
}

export interface Question {
  id: string;
  text: string;
  roundType: InterviewRoundType;
  expectedTopics: string[];
  difficulty: string;
  category: string;
  timeLimitSeconds: number;
  codingChallenge?: CodingChallenge;
}

export interface Message {
  id: string;
  sender: 'interviewer' | 'candidate' | 'system';
  content: string;
  timestamp: string;
  evaluation?: TurnEvaluation;
  agentRole?: string;
  codeSnippet?: string;
  codeLanguage?: string;
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
  role: string;
  roundType: InterviewRoundType;
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
  role: string;
  roundType: InterviewRoundType;
  experienceYears: number;
  currentQuestionIndex: number;
  questions: Question[];
  messages: Message[];
  status: 'active' | 'completed';
  report?: InterviewReport;
}

export interface RoleConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  tags: string[];
  roundsAvailable: InterviewRoundType[];
}
