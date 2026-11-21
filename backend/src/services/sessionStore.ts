import { InterviewSession } from '../types';

export class SessionStore {
  private sessions: Map<string, InterviewSession>;

  constructor() {
    this.sessions = new Map();
  }

  public get(id: string): InterviewSession | null {
    const session = this.sessions.get(id);
    if (!session) return null;
    return session;
  }

  public set(id: string, session: InterviewSession): void {
    this.sessions.set(id, session);
  }

  public save(session: InterviewSession): void {
    this.sessions.set(session.id, session);
  }

  public delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  public listAll(): InterviewSession[] {
    return Array.from(this.sessions.values());
  }

  public count(): number {
    return this.sessions.size;
  }
}

export const sessionStore = new SessionStore();
