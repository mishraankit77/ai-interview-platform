import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initSocketIO(httpServer: HTTPServer, frontendUrl: string): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: [frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // console.log(`[Socket.io] Client connected: ${socket.id}`);

    socket.on('join_session', (sessionId: string) => {
      socket.join(sessionId);
      // console.log(`[Socket.io] Socket ${socket.id} joined session room: ${sessionId}`);
      socket.emit('joined_session', { sessionId, timestamp: new Date().toISOString() });
    });

    socket.on('typing_status', (data: { sessionId: string; isTyping: boolean }) => {
      socket.to(data.sessionId).emit('candidate_typing', data);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}
