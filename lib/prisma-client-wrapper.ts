import { PrismaClient } from '@prisma/client';

// Define interfaces for the mock models
interface FeedbackModel {
  create: (args: any) => Promise<any>;
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any | null>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

interface UATSessionModel {
  findMany: (args?: any) => Promise<any[]>;
  findFirst: (args?: any) => Promise<any | null>;
  update: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
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
      return [];
    },

    async findFirst(args?: any) {
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

    async create(args: any) {
      return {
        id: `uat_session_${Date.now()}`,
        ...args.data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
