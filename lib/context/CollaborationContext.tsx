'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket/SocketProvider';
import { useSession } from 'next-auth/react';

interface CollaborationSession {
  id: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    image?: string;
    cursor?: { line: number; column: number };
  }>;
  code: string;
  language: string;
  isActive: boolean;
  createdAt: Date;
}

interface CollaborationContextType {
  currentSession: CollaborationSession | null;
  availableSessions: CollaborationSession[];
  isConnected: boolean;
  createSession: (title: string, language?: string) => Promise<string>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => void;
  updateCode: (code: string) => void;
  updateCursor: (line: number, column: number) => void;
  sendChatMessage: (message: string) => void;
  chatMessages: Array<{
    id: string;
    userId: string;
    userName: string;
    message: string;
    timestamp: Date;
  }>;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

export function CollaborationProvider({ children }: { children: React.ReactNode }) {
  const [currentSession, setCurrentSession] = useState<CollaborationSession | null>(null);
  const [availableSessions, setAvailableSessions] = useState<CollaborationSession[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for collaboration events
      socket.on('session-created', (sessionData) => {
        setAvailableSessions(prev => [...prev, sessionData]);
      });

      socket.on('session-joined', (sessionData) => {
        setCurrentSession(sessionData);
      });

      socket.on('session-left', () => {
        setCurrentSession(null);
      });

      socket.on('code-updated', ({ code, userId }) => {
        if (currentSession && userId !== session?.user?.id) {
          setCurrentSession(prev => prev ? { ...prev, code } : null);
        }
      });

      socket.on('cursor-updated', ({ userId, cursor }) => {
        if (currentSession && userId !== session?.user?.id) {
          setCurrentSession(prev => {
            if (!prev) return null;
            return {
              ...prev,
              participants: prev.participants.map(p =>
                p.id === userId ? { ...p, cursor } : p
              ),
            };
          });
        }
      });

      socket.on('participant-joined', ({ participant }) => {
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            participants: [...prev.participants, participant],
          };
        });
      });

      socket.on('participant-left', ({ userId }) => {
        setCurrentSession(prev => {
          if (!prev) return null;
          return {
            ...prev,
            participants: prev.participants.filter(p => p.id !== userId),
          };
        });
      });

      socket.on('chat-message', (message) => {
        setChatMessages(prev => [...prev, message]);
      });

      socket.on('available-sessions', (sessions) => {
        setAvailableSessions(sessions);
      });

      // Request available sessions
      socket.emit('get-available-sessions');

      return () => {
        socket.off('session-created');
        socket.off('session-joined');
        socket.off('session-left');
        socket.off('code-updated');
        socket.off('cursor-updated');
        socket.off('participant-joined');
        socket.off('participant-left');
        socket.off('chat-message');
        socket.off('available-sessions');
      };
    }
  }, [socket, isConnected, currentSession, session]);

  const createSession = async (title: string, language = 'solidity'): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to collaboration server'));
        return;
      }

      socket.emit('create-session', { title, language }, (response: any) => {
        if (response.success) {
          resolve(response.sessionId);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const joinSession = async (sessionId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || !isConnected) {
        reject(new Error('Not connected to collaboration server'));
        return;
      }

      socket.emit('join-session', { sessionId }, (response: any) => {
        if (response.success) {
          setChatMessages([]); // Clear previous chat messages
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  };

  const leaveSession = () => {
    if (socket && isConnected && currentSession) {
      socket.emit('leave-session', { sessionId: currentSession.id });
      setCurrentSession(null);
      setChatMessages([]);
    }
  };

  const updateCode = (code: string) => {
    if (socket && isConnected && currentSession) {
      socket.emit('update-code', {
        sessionId: currentSession.id,
        code,
      });
      
      // Update local state immediately for better UX
      setCurrentSession(prev => prev ? { ...prev, code } : null);
    }
  };

  const updateCursor = (line: number, column: number) => {
    if (socket && isConnected && currentSession) {
      socket.emit('update-cursor', {
        sessionId: currentSession.id,
        cursor: { line, column },
      });
    }
  };

  const sendChatMessage = (message: string) => {
    if (socket && isConnected && currentSession) {
      socket.emit('send-chat-message', {
        sessionId: currentSession.id,
        message,
      });
    }
  };

  return (
    <CollaborationContext.Provider
      value={{
        currentSession,
        availableSessions,
        isConnected,
        createSession,
        joinSession,
        leaveSession,
        updateCode,
        updateCursor,
        sendChatMessage,
        chatMessages,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
}
