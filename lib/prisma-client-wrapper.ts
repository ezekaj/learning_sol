import { PrismaClient } from '@prisma/client';

// Define interfaces for the enhanced models with proper typing
interface FeedbackModel {
  create: (args: {
    data: {
      type: string;
      category: string;
      title: string;
      description: string;
      rating?: number;
      severity?: string;
      priority?: string;
      steps?: string[];
      expectedBehavior?: string;
      actualBehavior?: string;
      browserInfo?: string;
      screenRecording?: boolean;
      contactEmail?: string;
      allowFollowUp?: boolean;
      page?: string;
      sessionId?: string;
      userId?: string;
    };
  }) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any | null>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

interface UATSessionModel {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any | null>;
  update: (args: any) => Promise<any>;
  create: (args: {
    data: {
      testerId: string;
      assignedTasks: string[];
      status?: string;
      startTime?: Date;
      endTime?: Date;
      taskResults?: any[];
      errorsEncountered?: number;
    };
  }) => Promise<any>;
}

// Create a simple wrapper that adds missing models as mock implementations
class ExtendedPrismaClient extends PrismaClient {
  declare feedback: FeedbackModel;
  declare uATSession: UATSessionModel;

  constructor() {
    super();
    this.feedback = {
    async create(args: any) {
      // Mock implementation for feedback creation
      return {
        id: `feedback_${Date.now()}`,
        type: args.data.type,
        category: args.data.category,
        title: args.data.title,
        description: args.data.description,
        rating: args.data.rating,
        severity: args.data.severity,
        priority: args.data.priority,
        steps: args.data.steps || [],
        expectedBehavior: args.data.expectedBehavior,
        actualBehavior: args.data.actualBehavior,
        browserInfo: args.data.browserInfo,
        screenRecording: args.data.screenRecording || false,
        contactEmail: args.data.contactEmail,
        allowFollowUp: args.data.allowFollowUp || false,
        page: args.data.page,
        sessionId: args.data.sessionId,
        userId: args.data.userId,
        timestamp: args.data.timestamp || new Date(),
        ipAddress: args.data.ipAddress,
        userAgent: args.data.userAgent,
        assignedTeam: args.data.assignedTeam,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    },

    async findMany(args?: any) {
      // Enhanced findMany with localStorage persistence
      if (typeof window !== 'undefined') {
        const storedFeedback = JSON.parse(localStorage.getItem('uat_feedback') || '[]');

        // Apply basic filtering if provided
        if (args?.where) {
          return storedFeedback.filter((feedback: any) => {
            if (args.where.category && feedback.category !== args.where.category) return false;
            if (args.where.priority && feedback.priority !== args.where.priority) return false;
            if (args.where.userId && feedback.userId !== args.where.userId) return false;
            return true;
          });
        }

        return storedFeedback;
      }
      return [];
    },

    async findFirst(args?: any) {
      if (typeof window !== 'undefined') {
        const storedFeedback = JSON.parse(localStorage.getItem('uat_feedback') || '[]');

        if (args?.where?.id) {
          return storedFeedback.find((feedback: any) => feedback.id === args.where.id) || null;
        }

        return storedFeedback[0] || null;
      }
      return null;
    },

    async update(args: any) {
      return {
        id: args.where.id,
        assignedTeam: args.data.assignedTeam,
        updatedAt: new Date(),
      };
    },

    async delete(args: any) {
      return { id: args.where.id };
    }
    };

    this.uATSession = {
    async findMany(args?: any) {
      // Enhanced UAT session management with localStorage
      if (typeof window !== 'undefined') {
        const storedSessions = JSON.parse(localStorage.getItem('uat_sessions') || '[]');

        // Apply filtering if provided
        if (args?.where) {
          return storedSessions.filter((session: any) => {
            if (args.where.testerId && session.testerId !== args.where.testerId) return false;
            if (args.where.status && session.status !== args.where.status) return false;
            return true;
          });
        }

        return storedSessions;
      }
      return [];
    },

    async findFirst(args?: any) {
      // Return a mock session if one is requested
      if (args?.where?.id) {
        return {
          id: args.where.id,
          testerId: 'mock-tester',
          feedbackCount: 0,
          lastFeedbackAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    },

    async update(args: any) {
      return {
        id: args.where.id,
        feedbackCount: 1,
        lastFeedbackAt: new Date(),
        updatedAt: new Date(),
      };
    },

    async create(args: {
      data: {
        testerId: string;
        assignedTasks: string[];
        status?: string;
        startTime?: Date;
        endTime?: Date;
        taskResults?: any[];
        errorsEncountered?: number;
      };
    }) {
      const sessionData = {
        id: `uat_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testerId: args.data.testerId,
        assignedTasks: args.data.assignedTasks,
        status: args.data.status || 'in_progress',
        startTime: args.data.startTime || new Date(),
        endTime: args.data.endTime || null,
        taskResults: args.data.taskResults || [],
        errorsEncountered: args.data.errorsEncountered || 0,
        feedbackCount: 0,
        lastFeedbackAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        const existingSessions = JSON.parse(localStorage.getItem('uat_sessions') || '[]');
        existingSessions.push(sessionData);
        localStorage.setItem('uat_sessions', JSON.stringify(existingSessions));
      }

      return sessionData;
    }
    };
  }
}

// Export a singleton instance with explicit typing
export const prisma = new ExtendedPrismaClient() as ExtendedPrismaClient & {
  feedback: FeedbackModel;
  uATSession: UATSessionModel;
};
export default prisma;
