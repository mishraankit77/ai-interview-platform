import { v4 as uuidv4 } from 'uuid';
import { 
  InterviewSession, 
  InterviewRole, 
  InterviewRoundType,
  Message, 
  Question, 
  TurnEvaluation, 
  InterviewReport
} from '../types';
import { llmService } from '../services/llmService';
import { sessionStore } from '../services/sessionStore';

const MAX_QUESTIONS_PER_ROUND = 3;

export class InterviewOrchestrator {
  public async createSession(
    candidateName: string,
    role: InterviewRole = 'fullstack',
    roundType: InterviewRoundType = 'technical',
    experienceYears: number = 1
  ): Promise<InterviewSession> {
    const sessionId = uuidv4();

    // Generate dynamic initial question tailored to the round and role
    const initialQuestion = llmService.getInitialQuestion(roundType, role);

    const initialMessages: Message[] = [
      {
        id: uuidv4(),
        sender: 'system',
        content: `Welcome, ${candidateName}. Starting Round: ${roundType.replace('_', ' ').toUpperCase()} for ${role.toUpperCase()} role.`,
        timestamp: new Date().toISOString(),
        agentRole: 'System'
      },
      {
        id: uuidv4(),
        sender: 'interviewer',
        content: initialQuestion.text,
        timestamp: new Date().toISOString(),
        agentRole: 'Interviewer'
      }
    ];

    const session: InterviewSession = {
      id: sessionId,
      candidateName,
      role,
      roundType,
      experienceYears,
      currentQuestionIndex: 0,
      questions: [initialQuestion],
      messages: initialMessages,
      metrics: {
        averageScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        problemSolvingScore: 0,
        depthScore: 0,
        turnsEvaluated: 0
      },
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    sessionStore.save(session);
    return session;
  }

  public async processCandidateAnswer(
    sessionId: string,
    candidateAnswer: string,
    codeSnippet?: string,
    codeLanguage?: string
  ): Promise<{
    session: InterviewSession;
    evaluation: TurnEvaluation;
    nextQuestion?: Question;
    isComplete: boolean;
    report?: InterviewReport;
  }> {
    const session = sessionStore.get(sessionId);
    if (!session) {
      throw new Error(`Interview session not found: ${sessionId}`);
    }

    const currentQuestion = session.questions[session.currentQuestionIndex];

    // Candidate message
    const candidateMsg: Message = {
      id: uuidv4(),
      sender: 'candidate',
      content: candidateAnswer,
      timestamp: new Date().toISOString(),
      codeSnippet,
      codeLanguage
    };

    // Run honest evaluator agent
    const history = session.messages.map(m => ({ sender: m.sender, content: m.content }));
    const evaluation = await llmService.evaluateAnswer(
      session.roundType,
      currentQuestion,
      codeSnippet ? `${candidateAnswer}\n\nCode Submitted:\n\`\`\`${codeLanguage || 'js'}\n${codeSnippet}\n\`\`\`` : candidateAnswer,
      history
    );

    candidateMsg.evaluation = evaluation;
    session.messages.push(candidateMsg);

    // Update cumulative metrics
    const evaluatedTurns = session.messages.filter(m => m.sender === 'candidate' && m.evaluation);
    const n = evaluatedTurns.length;
    session.metrics.turnsEvaluated = n;
    session.metrics.averageScore = Math.round(evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.score || 0), 0) / n);
    session.metrics.technicalScore = Math.round(evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.technicalAccuracy || 0), 0) / n);
    session.metrics.communicationScore = Math.round(evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.communicationClarity || 0), 0) / n);
    session.metrics.problemSolvingScore = Math.round(evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.problemSolving || 0), 0) / n);
    session.metrics.depthScore = Math.round(evaluatedTurns.reduce((acc, t) => acc + (t.evaluation?.depthOfKnowledge || 0), 0) / n);

    // DYNAMIC & ADAPTIVE NEXT QUESTION FORMULATION
    // Check if more questions should be asked
    const totalAsked = session.questions.length;
    if (totalAsked < MAX_QUESTIONS_PER_ROUND) {
      // Formulate ADAPTIVE next question based on the situation and candidate's answer!
      const adaptiveNextQ = await llmService.generateAdaptiveQuestion(
        session,
        candidateAnswer,
        evaluation
      );

      session.questions.push(adaptiveNextQ);
      session.currentQuestionIndex = totalAsked;

      const interviewerMsg: Message = {
        id: uuidv4(),
        sender: 'interviewer',
        content: adaptiveNextQ.text,
        timestamp: new Date().toISOString(),
        agentRole: 'Interviewer'
      };
      session.messages.push(interviewerMsg);

      sessionStore.save(session);
      return {
        session,
        evaluation,
        nextQuestion: adaptiveNextQ,
        isComplete: false
      };
    } else {
      // Completed round! Generate Final Executive Audit Report
      session.status = 'completed';
      const report = llmService.generateFinalReport(session);
      session.report = report;

      const completionMsg: Message = {
        id: uuidv4(),
        sender: 'system',
        content: `Interview Round (${session.roundType.toUpperCase()}) completed! Final Score: ${report.overallScore}/100. Hiring Verdict: ${report.hiringRecommendation}.`,
        timestamp: new Date().toISOString(),
        agentRole: 'ReportEngine'
      };
      session.messages.push(completionMsg);

      sessionStore.save(session);
      return {
        session,
        evaluation,
        isComplete: true,
        report
      };
    }
  }
}

export const interviewOrchestrator = new InterviewOrchestrator();
