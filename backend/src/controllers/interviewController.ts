import { Request, Response } from 'express';
import { interviewOrchestrator } from '../agents/interviewOrchestrator';
import { sessionStore } from '../services/sessionStore';
import { InterviewRole, InterviewRoundType, RoleConfig } from '../types';
import { getSocketIO } from '../socket';

export const AVAILABLE_ROLES: RoleConfig[] = [
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

export class InterviewController {
  public async getRoles(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: AVAILABLE_ROLES,
      rounds: [
        { id: 'coding_test', title: 'Round 1: Live Coding Test', duration: '15 Mins', description: 'Interactive algorithm and implementation challenge with code editor.' },
        { id: 'technical', title: 'Round 2: Technical & Architecture', duration: '10 Mins', description: 'Deep technical dive into systems, internals, and trade-offs.' },
        { id: 'hr', title: 'Round 3: HR & Culture Fit', duration: '8 Mins', description: 'Behavioral, adaptation, collaboration, and career alignment (STAR).' },
        { id: 'managerial', title: 'Round 4: Managerial & Leadership', duration: '10 Mins', description: 'Engineering trade-offs, incident response, technical debt, and team dynamics.' }
      ]
    });
  }

  public async startInterview(req: Request, res: Response): Promise<void> {
    try {
      const { 
        candidateName = 'Candidate', 
        role = 'fullstack', 
        roundType = 'technical',
        experienceYears = 1 
      } = req.body;

      const validRoles: InterviewRole[] = ['fullstack', 'frontend', 'backend', 'ai_engineer', 'dsa'];
      const validRounds: InterviewRoundType[] = ['coding_test', 'technical', 'hr', 'managerial'];

      const sanitizedRole: InterviewRole = validRoles.includes(role) ? role : 'fullstack';
      const sanitizedRound: InterviewRoundType = validRounds.includes(roundType) ? roundType : 'technical';

      const session = await interviewOrchestrator.createSession(
        candidateName,
        sanitizedRole,
        sanitizedRound,
        Number(experienceYears) || 1
      );

      // Notify sockets if connected
      const io = getSocketIO();
      if (io) {
        io.to(session.id).emit('session:started', { session });
      }

      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error: any) {
      console.error('[InterviewController] Error starting interview:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start interview session'
      });
    }
  }

  public async submitAnswer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { answer, codeSnippet, codeLanguage } = req.body;

      if (!answer && !codeSnippet) {
        res.status(400).json({
          success: false,
          error: 'An answer or code snippet is required.'
        });
        return;
      }

      const result = await interviewOrchestrator.processCandidateAnswer(
        id,
        answer || 'Submitted code solution.',
        codeSnippet,
        codeLanguage
      );

      const io = getSocketIO();
      if (io) {
        io.to(id).emit('answer:evaluated', {
          evaluation: result.evaluation,
          isComplete: result.isComplete,
          nextQuestion: result.nextQuestion,
          report: result.report
        });
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('[InterviewController] Error submitting answer:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process answer'
      });
    }
  }

  public async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = sessionStore.get(id);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      res.json({
        success: true,
        data: session
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  public async getReport(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const session = sessionStore.get(id);

      if (!session) {
        res.status(404).json({
          success: false,
          error: 'Session not found'
        });
        return;
      }

      if (!session.report) {
        res.status(400).json({
          success: false,
          error: 'Report has not yet been generated for this active session.'
        });
        return;
      }

      res.json({
        success: true,
        data: session.report
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

export const interviewController = new InterviewController();
