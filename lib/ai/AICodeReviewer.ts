/**
 * AI Code Review System
 * 
 * Build contextual code review system that provides curriculum-aligned feedback
 * using Enhanced Tutor System's AI capabilities.
 */

import { enhancedTutor } from './EnhancedTutorSystem';
import { SecurityScanner, SecurityScanResult } from '@/lib/security/SecurityScanner';
import { GasOptimizationAnalyzer, GasAnalysisResult } from '@/lib/gas/GasOptimizationAnalyzer';
import { adaptiveLearningEngine, LearningProfile } from '@/lib/learning/AdaptiveLearningEngine';

export interface CodeReviewContext {
  userId: string;
  currentLesson: string;
  userSkillLevel: number; // 0-100
  learningObjectives: string[];
  previousReviews: CodeReview[];
  codeHistory: string[];
  sessionContext: {
    timeSpent: number;
    attemptsCount: number;
    hintsUsed: number;
    lastError?: string;
  };
}

export interface EducationalCodeReview {
  id: string;
  userId: string;
  code: string;
  timestamp: Date;
  overallScore: number;
  feedback: ReviewFeedback[];
  learningPoints: LearningPoint[];
  nextSteps: string[];
  improvementSuggestions: ImprovementSuggestion[];
  conceptsReinforced: string[];
  conceptsIntroduced: string[];
  skillProgression: SkillProgression;
  encouragement: EncouragementMessage;
  codeQualityMetrics: CodeQualityMetrics;
}

export interface ReviewFeedback {
  id: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  type: 'positive' | 'improvement' | 'critical' | 'suggestion';
  category: 'security' | 'gas' | 'style' | 'logic' | 'best-practice' | 'learning';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  explanation: string;
  learningResource?: string;
  codeExample?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relatedConcepts: string[];
  actionable: boolean;
}

export interface LearningPoint {
  concept: string;
  description: string;
  importance: 'low' | 'medium' | 'high';
  masteryLevel: number; // 0-100
  examples: string[];
  practiceExercises: string[];
  relatedTopics: string[];
}

export interface ImprovementSuggestion {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  beforeCode: string;
  afterCode: string;
  explanation: string;
  learningValue: number; // 0-100
  autoFixAvailable: boolean;
}

export interface SkillProgression {
  currentLevel: number;
  previousLevel: number;
  improvement: number;
  strengthsIdentified: string[];
  weaknessesAddressed: string[];
  newSkillsUnlocked: string[];
  nextMilestone: string;
  progressToNextLevel: number; // 0-100
}

export interface EncouragementMessage {
  tone: 'supportive' | 'challenging' | 'celebratory' | 'motivational';
  message: string;
  achievements: string[];
  personalizedNote: string;
}

export interface CodeQualityMetrics {
  readability: number; // 0-100
  maintainability: number; // 0-100
  efficiency: number; // 0-100
  security: number; // 0-100
  bestPractices: number; // 0-100
  overall: number; // 0-100
  comparison: {
    previousReview?: number;
    classAverage?: number;
    industryStandard?: number;
  };
}

export interface CodeReview {
  id: string;
  timestamp: Date;
  score: number;
  mainIssues: string[];
  improvements: string[];
}

export class AICodeReviewer {
  private securityScanner: SecurityScanner;
  private gasAnalyzer: GasOptimizationAnalyzer;
  private reviewHistory: Map<string, CodeReview[]> = new Map();

  constructor(
    securityScanner: SecurityScanner,
    gasAnalyzer: GasOptimizationAnalyzer
  ) {
    this.securityScanner = securityScanner;
    this.gasAnalyzer = gasAnalyzer;
  }

  // Main code review method
  async reviewCode(
    code: string,
    context: CodeReviewContext
  ): Promise<EducationalCodeReview> {
    console.log(`🔍 Starting AI code review for user ${context.userId}`);
    
    const startTime = Date.now();
    const reviewId = `review-${Date.now()}-${context.userId}`;
    
    try {
      // Get user's learning profile
      const learningProfile = await adaptiveLearningEngine.analyzeUserPerformance(context.userId);
      
      // Perform technical analysis
      const [securityAnalysis, gasAnalysis] = await Promise.all([
        this.performSecurityAnalysis(code),
        this.performGasAnalysis(code, context.userId)
      ]);
      
      // Generate AI-powered educational review
      const aiReview = await this.generateAIReview(code, context, learningProfile, securityAnalysis, gasAnalysis);
      
      // Synthesize comprehensive review
      const review = await this.synthesizeReview(
        reviewId,
        code,
        context,
        learningProfile,
        securityAnalysis,
        gasAnalysis,
        aiReview
      );
      
      // Save review and update user progress
      await this.saveReview(review);
      await this.updateUserProgress(context.userId, review);
      
      const reviewTime = Date.now() - startTime;
      console.log(`✅ Code review completed in ${reviewTime}ms`);
      
      return review;
      
    } catch (error) {
      console.error('Code review failed:', error);
      throw error;
    }
  }

  // Generate improvement suggestions
  async generateImprovementSuggestions(
    review: EducationalCodeReview
  ): Promise<ImprovementSuggestion[]> {
    const suggestions: ImprovementSuggestion[] = [];
    
    // Convert feedback to actionable suggestions
    for (const feedback of review.feedback) {
      if (feedback.actionable && feedback.type !== 'positive') {
        const suggestion = await this.createImprovementSuggestion(feedback, review.code);
        suggestions.push(suggestion);
      }
    }
    
    // Sort by learning value and priority
    return suggestions.sort((a, b) => {
      if (a.priority !== b.priority) {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.learningValue - a.learningValue;
    });
  }

  // Track learning progress from reviews
  async trackLearningProgress(
    userId: string,
    review: EducationalCodeReview
  ): Promise<void> {
    // Update concept mastery based on review
    for (const concept of review.conceptsReinforced) {
      const performance = this.calculateConceptPerformance(review, concept);
      await adaptiveLearningEngine.assessConceptMastery(userId, concept, performance);
    }
    
    // Record review in history
    const userHistory = this.reviewHistory.get(userId) || [];
    userHistory.push({
      id: review.id,
      timestamp: review.timestamp,
      score: review.overallScore,
      mainIssues: review.feedback.filter(f => f.type === 'critical').map(f => f.title),
      improvements: review.improvementSuggestions.map(s => s.title)
    });
    
    this.reviewHistory.set(userId, userHistory.slice(-10)); // Keep last 10 reviews
  }

  // Private helper methods
  private async performSecurityAnalysis(code: string): Promise<SecurityScanResult | null> {
    try {
      return await this.securityScanner.performAnalysis();
    } catch (error) {
      console.warn('Security analysis failed:', error);
      return null;
    }
  }

  private async performGasAnalysis(code: string, userId: string): Promise<GasAnalysisResult | null> {
    try {
      return await this.gasAnalyzer.analyzeGasUsage(userId);
    } catch (error) {
      console.warn('Gas analysis failed:', error);
      return null;
    }
  }

  private async generateAIReview(
    code: string,
    context: CodeReviewContext,
    profile: LearningProfile,
    securityAnalysis: SecurityScanResult | null,
    gasAnalysis: GasAnalysisResult | null
  ): Promise<any> {
    const prompt = this.buildReviewPrompt(code, context, profile, securityAnalysis, gasAnalysis);
    
    return await enhancedTutor.getAIResponse(
      prompt,
      { userId: context.userId },
      'explanation'
    );
  }

  private buildReviewPrompt(
    code: string,
    context: CodeReviewContext,
    profile: LearningProfile,
    securityAnalysis: SecurityScanResult | null,
    gasAnalysis: GasAnalysisResult | null
  ): string {
    return `
      Provide a comprehensive educational code review for a Solidity student.
      
      Student Profile:
      - Skill Level: ${context.userSkillLevel}/100
      - Learning Velocity: ${profile.learningVelocity}
      - Current Lesson: ${context.currentLesson}
      - Learning Objectives: ${context.learningObjectives.join(', ')}
      - Weakness Patterns: ${profile.weaknessPatterns.join(', ')}
      - Strength Areas: ${profile.strengthAreas.join(', ')}
      
      Session Context:
      - Time Spent: ${context.sessionContext.timeSpent} minutes
      - Attempts: ${context.sessionContext.attemptsCount}
      - Hints Used: ${context.sessionContext.hintsUsed}
      
      Code to Review:
      \`\`\`solidity
      ${code}
      \`\`\`
      
      Technical Analysis Results:
      - Security Issues: ${securityAnalysis?.issues?.length || 0}
      - Security Score: ${securityAnalysis?.overallScore || 'N/A'}
      - Gas Optimizations: ${gasAnalysis?.optimizations?.length || 0}
      - Total Gas Cost: ${gasAnalysis?.totalGasCost || 'N/A'}
      
      Previous Reviews: ${context.previousReviews.length} reviews completed
      
      Provide a review that:
      1. Celebrates what they did well (be specific and encouraging)
      2. Identifies learning opportunities aligned with their objectives
      3. Explains issues in terms they can understand at their level
      4. Connects feedback to broader Solidity concepts
      5. Suggests specific, actionable improvements
      6. Recommends next learning steps
      7. Maintains a supportive, growth-oriented tone
      
      Focus on education over criticism. Help them learn and improve.
      Tailor complexity to their skill level: ${context.userSkillLevel}/100.
    `;
  }

  private async synthesizeReview(
    reviewId: string,
    code: string,
    context: CodeReviewContext,
    profile: LearningProfile,
    securityAnalysis: SecurityScanResult | null,
    gasAnalysis: GasAnalysisResult | null,
    aiReview: any
  ): Promise<EducationalCodeReview> {
    // Combine technical analysis with AI insights
    const feedback = this.generateFeedback(securityAnalysis, gasAnalysis, aiReview, context);
    const learningPoints = this.extractLearningPoints(aiReview, context);
    const improvementSuggestions = await this.generateImprovementSuggestions({ feedback } as any);
    
    // Calculate skill progression
    const skillProgression = this.calculateSkillProgression(context.userId, feedback, profile);
    
    // Generate encouragement message
    const encouragement = this.generateEncouragement(feedback, skillProgression, context);
    
    // Calculate code quality metrics
    const codeQualityMetrics = this.calculateCodeQualityMetrics(
      securityAnalysis,
      gasAnalysis,
      feedback
    );
    
    return {
      id: reviewId,
      userId: context.userId,
      code,
      timestamp: new Date(),
      overallScore: this.calculateOverallScore(feedback, codeQualityMetrics),
      feedback,
      learningPoints,
      nextSteps: this.generateNextSteps(learningPoints, context),
      improvementSuggestions,
      conceptsReinforced: this.extractReinforcedConcepts(feedback, context),
      conceptsIntroduced: this.extractIntroducedConcepts(aiReview),
      skillProgression,
      encouragement,
      codeQualityMetrics
    };
  }

  private generateFeedback(
    securityAnalysis: SecurityScanResult | null,
    gasAnalysis: GasAnalysisResult | null,
    aiReview: any,
    context: CodeReviewContext
  ): ReviewFeedback[] {
    const feedback: ReviewFeedback[] = [];
    
    // Convert security issues to educational feedback
    if (securityAnalysis?.issues) {
      securityAnalysis.issues.forEach((issue, index) => {
        feedback.push({
          id: `security-${index}`,
          line: issue.line,
          type: issue.severity === 'critical' ? 'critical' : 'improvement',
          category: 'security',
          severity: issue.severity as any,
          title: issue.title,
          message: issue.message,
          explanation: `Security issue: ${issue.message}. ${issue.suggestion}`,
          difficulty: this.mapSeverityToDifficulty(issue.severity),
          relatedConcepts: [issue.category],
          actionable: true
        });
      });
    }
    
    // Convert gas optimizations to educational feedback
    if (gasAnalysis?.optimizations) {
      gasAnalysis.optimizations.forEach((opt, index) => {
        feedback.push({
          id: `gas-${index}`,
          line: opt.line,
          type: 'suggestion',
          category: 'gas',
          severity: opt.impact === 'high' ? 'high' : 'medium',
          title: opt.title,
          message: opt.description,
          explanation: `Gas optimization opportunity: ${opt.explanation}`,
          difficulty: opt.difficulty as any,
          relatedConcepts: [opt.category],
          actionable: opt.autoFixAvailable
        });
      });
    }
    
    return feedback;
  }

  private calculateOverallScore(
    feedback: ReviewFeedback[],
    metrics: CodeQualityMetrics
  ): number {
    // Weighted average of different aspects
    const securityWeight = 0.3;
    const gasWeight = 0.2;
    const styleWeight = 0.2;
    const logicWeight = 0.3;
    
    return Math.round(
      metrics.security * securityWeight +
      metrics.efficiency * gasWeight +
      metrics.bestPractices * styleWeight +
      metrics.readability * logicWeight
    );
  }

  private mapSeverityToDifficulty(severity: string): 'beginner' | 'intermediate' | 'advanced' {
    switch (severity) {
      case 'low': return 'beginner';
      case 'medium': return 'intermediate';
      case 'high':
      case 'critical': return 'advanced';
      default: return 'intermediate';
    }
  }
}

// Export factory function
export function createAICodeReviewer(
  securityScanner: SecurityScanner,
  gasAnalyzer: GasOptimizationAnalyzer
): AICodeReviewer {
  return new AICodeReviewer(securityScanner, gasAnalyzer);
}
