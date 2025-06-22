import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { prisma } from '@/lib/prisma';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: ServerIO;
    };
  };
};

interface User {
  id: string;
  name: string;
  image?: string;
  role: string;
}

interface CollaborationSession {
  id: string;
  title: string;
  type: string;
  participants: User[];
  code: string;
  language: string;
  createdAt: Date;
}

interface UserPresence {
  userId: string;
  user: User;
  sessionId: string;
  cursor?: {
    line: number;
    column: number;
  };
  selection?: {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  lastSeen: Date;
}

// Store active sessions and user presence
const activeSessions = new Map<string, CollaborationSession>();
const userPresence = new Map<string, UserPresence[]>();
const sessionParticipants = new Map<string, Set<string>>();

export const initializeSocket = (server: NetServer) => {
  const io = new ServerIO(server, {
    path: '/api/socket',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://ezekaj.github.io'] 
        : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user authentication
    socket.on('authenticate', async (data: { userId: string; sessionToken: string }) => {
      try {
        // Verify session token and get user data
        const user = await getUserFromSession(data.sessionToken);
        if (user) {
          socket.data.user = user;
          socket.emit('authenticated', { user });
        } else {
          socket.emit('authentication_failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('authentication_failed');
      }
    });

    // Handle joining a collaboration session
    socket.on('join_session', async (sessionId: string) => {
      if (!socket.data.user) {
        socket.emit('error', 'Not authenticated');
        return;
      }

      try {
        // Get session from database
        const session = await prisma.collaboration.findUnique({
          where: { id: sessionId },
          include: {
            participants: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
              },
            },
            chatMessages: {
              take: 50,
              orderBy: { createdAt: 'desc' },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        });

        if (!session) {
          socket.emit('error', 'Session not found');
          return;
        }

        // Check if user is a participant
        const isParticipant = session.participants.some(p => p.id === socket.data.user.id);
        if (!isParticipant) {
          socket.emit('error', 'Not authorized to join this session');
          return;
        }

        // Join the socket room
        socket.join(sessionId);
        socket.data.sessionId = sessionId;

        // Add to session participants
        if (!sessionParticipants.has(sessionId)) {
          sessionParticipants.set(sessionId, new Set());
        }
        sessionParticipants.get(sessionId)!.add(socket.data.user.id);

        // Update user presence
        updateUserPresence(sessionId, socket.data.user, {});

        // Send session data to user
        socket.emit('session_joined', {
          session: {
            id: session.id,
            title: session.title,
            type: session.type,
            participants: session.participants,
            code: '', // Will be loaded separately
            language: 'solidity',
          },
          messages: session.chatMessages.reverse(),
          presence: userPresence.get(sessionId) || [],
        });

        // Notify other participants
        socket.to(sessionId).emit('user_joined', {
          user: socket.data.user,
          presence: userPresence.get(sessionId) || [],
        });

      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', 'Failed to join session');
      }
    });

    // Handle code changes
    socket.on('code_change', (data: { sessionId: string; code: string; changes: any }) => {
      if (!socket.data.user || !socket.data.sessionId) return;

      // Broadcast code changes to other participants
      socket.to(data.sessionId).emit('code_updated', {
        code: data.code,
        changes: data.changes,
        userId: socket.data.user.id,
        timestamp: new Date(),
      });
    });

    // Handle cursor position updates
    socket.on('cursor_update', (data: { line: number; column: number }) => {
      if (!socket.data.user || !socket.data.sessionId) return;

      updateUserPresence(socket.data.sessionId, socket.data.user, {
        cursor: data,
      });

      // Broadcast cursor position to other participants
      socket.to(socket.data.sessionId).emit('cursor_updated', {
        userId: socket.data.user.id,
        cursor: data,
      });
    });

    // Handle selection updates
    socket.on('selection_update', (data: { 
      startLine: number; 
      startColumn: number; 
      endLine: number; 
      endColumn: number; 
    }) => {
      if (!socket.data.user || !socket.data.sessionId) return;

      updateUserPresence(socket.data.sessionId, socket.data.user, {
        selection: data,
      });

      // Broadcast selection to other participants
      socket.to(socket.data.sessionId).emit('selection_updated', {
        userId: socket.data.user.id,
        selection: data,
      });
    });

    // Handle chat messages
    socket.on('send_message', async (data: { sessionId: string; content: string; type?: string }) => {
      if (!socket.data.user || !socket.data.sessionId) return;

      try {
        // Save message to database
        const message = await prisma.chatMessage.create({
          data: {
            content: data.content,
            userId: socket.data.user.id,
            collaborationId: data.sessionId,
            type: (data.type as any) || 'TEXT',
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        });

        // Broadcast message to all participants
        io.to(data.sessionId).emit('message_received', message);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', 'Failed to send message');
      }
    });

    // Handle leaving session
    socket.on('leave_session', () => {
      if (socket.data.sessionId && socket.data.user) {
        handleUserLeave(socket);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      if (socket.data.sessionId && socket.data.user) {
        handleUserLeave(socket);
      }
    });
  });

  return io;
};

// Helper functions
async function getUserFromSession(sessionToken: string): Promise<User | null> {
  try {
    // This would typically verify the JWT token and get user data
    // For now, we'll use a simplified approach
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
      },
    });

    return session?.user || null;
  } catch (error) {
    console.error('Error getting user from session:', error);
    return null;
  }
}

function updateUserPresence(sessionId: string, user: User, updates: Partial<UserPresence>) {
  if (!userPresence.has(sessionId)) {
    userPresence.set(sessionId, []);
  }

  const sessionPresence = userPresence.get(sessionId)!;
  const existingIndex = sessionPresence.findIndex(p => p.userId === user.id);

  const presence: UserPresence = {
    userId: user.id,
    user,
    sessionId,
    lastSeen: new Date(),
    ...updates,
  };

  if (existingIndex >= 0) {
    sessionPresence[existingIndex] = { ...sessionPresence[existingIndex], ...presence };
  } else {
    sessionPresence.push(presence);
  }
}

function handleUserLeave(socket: any) {
  const sessionId = socket.data.sessionId;
  const user = socket.data.user;

  // Remove from session participants
  if (sessionParticipants.has(sessionId)) {
    sessionParticipants.get(sessionId)!.delete(user.id);
  }

  // Remove from presence
  if (userPresence.has(sessionId)) {
    const sessionPresence = userPresence.get(sessionId)!;
    const index = sessionPresence.findIndex(p => p.userId === user.id);
    if (index >= 0) {
      sessionPresence.splice(index, 1);
    }
  }

  // Leave socket room
  socket.leave(sessionId);

  // Notify other participants
  socket.to(sessionId).emit('user_left', {
    userId: user.id,
    presence: userPresence.get(sessionId) || [],
  });
}
