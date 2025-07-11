/**
 * Adaptive Learning Algorithm Engine
 * 
 * ML-powered system that analyzes user performance patterns, adjusts difficulty,
 * and personalizes learning paths using our Smart Request Router infrastructure.
 */

import { enhancedTutor } from '@/lib/ai/EnhancedTutorSystem';
import { prisma } from '@/lib/prisma';
import { performanceOptimizer } from '@/lib/performance/PerformanceOptimizer';

export interface LearningProfile {
  userId: string;
  skillLevels: Record<string, number>; // concept -> proficiency (0-100)
  learningVelocity: number; // 0.1-2.0 multiplier
  preferredDifficulty: 'gradual' | 'challenge' | 'adaptive';
  weaknessPatterns: string[];
  strengthAreas: string[];
  lastAnalysisScores: {
    security: number;
    gasOptimization: number;
    codeQuality: number;
  };
  personalityType: 'visual' | 'analytical' | 'practical' | 'social';
  attentionSpan: number; // minutes
  optimalSessionLength: number; // minutes
  createdAt: Date;
  updatedAt: Date;
}

export interface LearningPath {
  userId: string;
  currentLevel: number;
  nextConcepts: ConceptNode[];
  recommendedDifficulty: number;
  estimatedTimeToCompletion: number;
  personalizedExercises: Exercise[];
  milestones: Milestone[];
  adaptationHistory: AdaptationRecord[];
}

export interface ConceptNode {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  difficulty: number;
  estimatedTime: number;
  masteryThreshold: number;
  resources: LearningResource[];
}

export interface Exercise {
  id: string;
  type: 'coding' | 'quiz' | 'challenge' | 'project';
  concept: string;
  difficulty: number;
  estimatedTime: number;
  content: string;
  solution?: string;
  hints: string[];
  testCases?: TestCase[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  requiredConcepts: string[];
  reward: string;
  estimatedCompletion: Date;
}

export interface AdaptationRecord {
  timestamp: Date;
  trigger: string;
  oldDifficulty: number;
  newDifficulty: number;
  reason: string;
  performance: number;
}

export interface LearningSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  conceptsCovered: string[];
  exercisesCompleted: number;
  averageScore: number;
  difficultyAdjustments: number;
  hintsUsed: number;
  timeSpent: number;
  frustrationLevel: number; // 0-10
  engagementLevel: number; // 0-10
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  improvement: number;
  retention: number;
}

export class AdaptiveLearningEngine {
  private readonly PERFORMANCE_WINDOW = 10; // Last 10 sessions
  private readonly MIN_SESSIONS_FOR_ADAPTATION = 3;
  private readonly DIFFICULTY_ADJUSTMENT_FACTOR = 0.15;
  private readonly MASTERY_THRESHOLD = 0.8;

  constructor() {
    this.initializeConceptGraph();
  }

  // Main analysis method
  async analyzeUserPerformance(userId: string): Promise<LearningProfile> {
    console.log(`🧠 Analyzing performance for user ${userId}`);
    
    // Get recent learning sessions
    const recentSessions = await this.getRecentSessions(userId);
    
    // Get security and gas analysis history
    const analysisHistory = await this.getAnalysisHistory(userId);
    
    // Calculate skill levels across concepts
    const skillLevels = await this.calculateSkillLevels(userId, recentSessions);
    
    // Determine learning velocity
    const learningVelocity = this.calculateLearningVelocity(recentSessions);
    
    // Identify patterns
    const weaknessPatterns = this.identifyWeaknessPatterns(analysisHistory);
    const strengthAreas = this.identifyStrengthAreas(analysisHistory);
    
    // Determine learning personality
    const personalityType = this.determineLearningPersonality(recentSessions);
    
    // Calculate optimal session parameters
    const { attentionSpan, optimalSessionLength } = this.calculateSessionParameters(recentSessions);
    
    const profile: LearningProfile = {
      userId,
      skillLevels,
      learningVelocity,
      preferredDifficulty: 'adaptive',
      weaknessPatterns,
      strengthAreas,
      lastAnalysisScores: this.getLatestScores(analysisHistory),
      personalityType,
      attentionSpan,
      optimalSessionLength,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save profile to database
    await this.saveLearningProfile(profile);
    
    console.log(`✅ Learning profile updated for user ${userId}`);
    return profile;
  }

  // Adaptive difficulty adjustment
  async adjustDifficulty(
    userId: string,
    currentDifficulty: number,
    recentPerformance: PerformanceMetrics
  ): Promise<number> {
    const profile = await this.getLearningProfile(userId);
    
    // Calculate target performance based on user preferences
    const targetAccuracy = this.getTargetAccuracy(profile.preferredDifficulty);
    
    // Determine adjustment direction and magnitude
    let adjustment = 0;
    
    if (recentPerformance.accuracy > targetAccuracy + 0.1) {
      // User is performing too well, increase difficulty
      adjustment = this.DIFFICULTY_ADJUSTMENT_FACTOR * profile.learningVelocity;
    } else if (recentPerformance.accuracy < targetAccuracy - 0.1) {
      // User is struggling, decrease difficulty
      adjustment = -this.DIFFICULTY_ADJUSTMENT_FACTOR / profile.learningVelocity;
    }
    
    // Apply consistency and improvement factors
    adjustment *= (recentPerformance.consistency + recentPerformance.improvement) / 2;
    
    const newDifficulty = Math.max(0.1, Math.min(1.0, currentDifficulty + adjustment));
    
    // Record adaptation
    await this.recordAdaptation(userId, currentDifficulty, newDifficulty, recentPerformance);
    
    return newDifficulty;
  }

  // Generate personalized learning path
  async generatePersonalizedPath(userId: string): Promise<LearningPath> {
    const profile = await this.getLearningProfile(userId);
    
    // Use AI to generate personalized path
    const prompt = this.buildLearningPathPrompt(profile);
    const aiResponse = await enhancedTutor.getAIResponse(
      prompt,
      { userId },
      'explanation'
    );
    
    // Parse AI response and create structured path
    const conceptNodes = await this.selectNextConcepts(profile);
    const exercises = await this.generatePersonalizedExercises(profile, conceptNodes);
    const milestones = this.createMilestones(conceptNodes, profile);
    
    const path: LearningPath = {
      userId,
      currentLevel: this.calculateCurrentLevel(profile.skillLevels),
      nextConcepts: conceptNodes,
      recommendedDifficulty: this.calculateRecommendedDifficulty(profile),
      estimatedTimeToCompletion: this.estimateCompletionTime(conceptNodes, profile),
      personalizedExercises: exercises,
      milestones,
      adaptationHistory: await this.getAdaptationHistory(userId)
    };
    
    await this.saveLearningPath(path);
    return path;
  }

  // AI-powered exercise generation
  async generatePersonalizedExercises(
    profile: LearningProfile,
    concepts: ConceptNode[]
  ): Promise<Exercise[]> {
    const exercises: Exercise[] = [];
    
    for (const concept of concepts) {
      const prompt = `
        Generate a personalized coding exercise for concept: ${concept.name}
        
        User Profile:
        - Skill Level: ${profile.skillLevels[concept.name] || 0}/100
        - Learning Velocity: ${profile.learningVelocity}
        - Personality Type: ${profile.personalityType}
        - Weakness Patterns: ${profile.weaknessPatterns.join(', ')}
        - Strength Areas: ${profile.strengthAreas.join(', ')}
        
        Exercise Requirements:
        - Difficulty: ${concept.difficulty}
        - Estimated Time: ${concept.estimatedTime} minutes
        - Focus on addressing weakness patterns
        - Leverage strength areas for engagement
        - Include progressive hints (3-5 levels)
        - Provide test cases for validation
        
        Generate a Solidity coding exercise with:
        1. Clear problem statement
        2. Starter code template
        3. Progressive hints
        4. Test cases
        5. Expected solution approach
      `;
      
      const aiResponse = await enhancedTutor.getAIResponse(prompt, { userId: profile.userId }, 'code');
      const exercise = this.parseExerciseFromAI(aiResponse.content, concept);
      exercises.push(exercise);
    }
    
    return exercises;
  }

  // Performance tracking and analysis
  async trackLearningSession(session: LearningSession): Promise<void> {
    // Save session to database
    await prisma.learningSession.create({
      data: {
        id: session.id,
        userId: session.userId,
        startTime: session.startTime,
        endTime: session.endTime,
        conceptsCovered: session.conceptsCovered,
        exercisesCompleted: session.exercisesCompleted,
        averageScore: session.averageScore,
        difficultyAdjustments: session.difficultyAdjustments,
        hintsUsed: session.hintsUsed,
        timeSpent: session.timeSpent,
        frustrationLevel: session.frustrationLevel,
        engagementLevel: session.engagementLevel
      }
    });
    
    // Trigger adaptive adjustments if needed
    if (session.endTime) {
      await this.evaluateAdaptationTriggers(session.userId);
    }
  }

  // Concept mastery assessment
  async assessConceptMastery(
    userId: string,
    concept: string,
    performance: PerformanceMetrics
  ): Promise<boolean> {
    const currentLevel = await this.getConceptLevel(userId, concept);
    const masteryScore = this.calculateMasteryScore(performance);
    
    // Update concept level
    const newLevel = Math.min(100, currentLevel + masteryScore * 10);
    await this.updateConceptLevel(userId, concept, newLevel);
    
    // Check if mastery threshold is reached
    const isMastered = newLevel >= this.MASTERY_THRESHOLD * 100;
    
    if (isMastered) {
      await this.recordConceptMastery(userId, concept, newLevel);
      console.log(`🎉 User ${userId} mastered concept: ${concept}`);
    }
    
    return isMastered;
  }

  // Private helper methods
  private async getRecentSessions(userId: string): Promise<LearningSession[]> {
    const sessions = await prisma.learningSession.findMany({
      where: { userId },
      orderBy: { startTime: 'desc' },
      take: this.PERFORMANCE_WINDOW
    });
    
    return sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      startTime: session.startTime,
      endTime: session.endTime || undefined,
      conceptsCovered: session.conceptsCovered,
      exercisesCompleted: session.exercisesCompleted,
      averageScore: session.averageScore,
      difficultyAdjustments: session.difficultyAdjustments,
      hintsUsed: session.hintsUsed,
      timeSpent: session.timeSpent,
      frustrationLevel: session.frustrationLevel,
      engagementLevel: session.engagementLevel
    }));
  }

  private calculateLearningVelocity(sessions: LearningSession[]): number {
    if (sessions.length < 2) return 1.0;
    
    // Calculate improvement rate over recent sessions
    const improvements = sessions.slice(1).map((session, index) => {
      const currentScore = session.averageScore;
      const previousScore = sessions[index].averageScore;
      return currentScore - previousScore;
    });
    
    const averageImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    
    // Convert to velocity multiplier (0.1 to 2.0)
    return Math.max(0.1, Math.min(2.0, 1.0 + averageImprovement / 50));
  }

  private identifyWeaknessPatterns(analysisHistory: any[]): string[] {
    const patterns = new Map<string, number>();
    
    analysisHistory.forEach(analysis => {
      // Count security vulnerabilities
      analysis.vulnerabilities?.forEach((vuln: any) => {
        const pattern = vuln.type || 'unknown';
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      });
      
      // Count gas optimization misses
      analysis.gasOptimizations?.forEach((opt: any) => {
        const pattern = `gas-${opt.category || 'general'}`;
        patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
      });
    });
    
    // Return patterns that appear frequently (>= 2 times)
    return Array.from(patterns.entries())
      .filter(([_, count]) => count >= 2)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([pattern, _]) => pattern);
  }

  private determineLearningPersonality(sessions: LearningSession[]): 'visual' | 'analytical' | 'practical' | 'social' {
    if (sessions.length === 0) return 'adaptive';
    
    // Analyze session patterns to determine personality
    const avgHintsUsed = sessions.reduce((sum, s) => sum + s.hintsUsed, 0) / sessions.length;
    const avgTimeSpent = sessions.reduce((sum, s) => sum + s.timeSpent, 0) / sessions.length;
    const avgEngagement = sessions.reduce((sum, s) => sum + s.engagementLevel, 0) / sessions.length;
    
    if (avgHintsUsed < 2 && avgTimeSpent < 15) return 'analytical';
    if (avgEngagement > 8 && avgTimeSpent > 20) return 'visual';
    if (avgHintsUsed > 5) return 'practical';
    return 'social';
  }

  private buildLearningPathPrompt(profile: LearningProfile): string {
    return `
      Generate a personalized learning path for a Solidity student:
      
      Current Profile:
      - Skill Levels: ${JSON.stringify(profile.skillLevels)}
      - Learning Velocity: ${profile.learningVelocity}
      - Personality Type: ${profile.personalityType}
      - Weakness Patterns: ${profile.weaknessPatterns.join(', ')}
      - Strength Areas: ${profile.strengthAreas.join(', ')}
      - Attention Span: ${profile.attentionSpan} minutes
      
      Recent Performance:
      - Security Score: ${profile.lastAnalysisScores.security}
      - Gas Optimization: ${profile.lastAnalysisScores.gasOptimization}
      - Code Quality: ${profile.lastAnalysisScores.codeQuality}
      
      Generate recommendations for:
      1. Next 3-5 concepts to focus on
      2. Optimal difficulty progression
      3. Learning strategies that match their personality
      4. Specific areas to address based on weaknesses
      5. Timeline for concept mastery
    `;
  }

  private async initializeConceptGraph(): Promise<void> {
    // Initialize the concept dependency graph
    // This would typically be loaded from a configuration file
    console.log('🔄 Initializing concept dependency graph...');
  }

  private async saveLearningProfile(profile: LearningProfile): Promise<void> {
    await prisma.userLearningProfile.upsert({
      where: { userId: profile.userId },
      update: {
        skillLevels: profile.skillLevels,
        learningVelocity: profile.learningVelocity,
        preferredDifficulty: profile.preferredDifficulty,
        weaknessPatterns: profile.weaknessPatterns,
        strengthAreas: profile.strengthAreas,
        lastAnalysisScores: profile.lastAnalysisScores,
        personalityType: profile.personalityType,
        attentionSpan: profile.attentionSpan,
        optimalSessionLength: profile.optimalSessionLength,
        updatedAt: new Date()
      },
      create: {
        userId: profile.userId,
        skillLevels: profile.skillLevels,
        learningVelocity: profile.learningVelocity,
        preferredDifficulty: profile.preferredDifficulty,
        weaknessPatterns: profile.weaknessPatterns,
        strengthAreas: profile.strengthAreas,
        lastAnalysisScores: profile.lastAnalysisScores,
        personalityType: profile.personalityType,
        attentionSpan: profile.attentionSpan,
        optimalSessionLength: profile.optimalSessionLength
      }
    });
  }

  // Database methods for concept mastery tracking
  private async getConceptLevel(userId: string, concept: string): Promise<number> {
    return performanceOptimizer.optimizeDBQuery(async () => {
      const aiContext = await prisma.aILearningContext.findUnique({
        where: { userId },
        select: { conceptMastery: true } // Only select needed field
      });

      if (aiContext?.conceptMastery) {
        const conceptMastery = aiContext.conceptMastery as Record<string, number>;
        return conceptMastery[concept] || 0;
      }

      return 0;
    }, `getConceptLevel-${userId}-${concept}`);
  }

  private async updateConceptLevel(userId: string, concept: string, level: number): Promise<void> {
    return performanceOptimizer.optimizeDBQuery(async () => {
      const aiContext = await prisma.aILearningContext.findUnique({
        where: { userId },
        select: { conceptMastery: true }
      });

      let conceptMastery: Record<string, number> = {};
      if (aiContext?.conceptMastery) {
        conceptMastery = aiContext.conceptMastery as Record<string, number>;
      }

      conceptMastery[concept] = level;

      await prisma.aILearningContext.upsert({
        where: { userId },
        update: {
          conceptMastery,
          updatedAt: new Date()
        },
        create: {
          userId,
          conceptMastery,
          skillLevel: 'BEGINNER',
          learningPath: JSON.stringify([concept]),
          recentTopics: JSON.stringify([concept]),
          weakAreas: JSON.stringify([]),
          strongAreas: JSON.stringify([]),
          preferredLearningStyle: 'mixed'
        }
      });

      console.log(`✅ Updated concept level: ${userId}:${concept} = ${level}`);
    }, `updateConceptLevel-${userId}-${concept}`);
  }

  private async recordConceptMastery(userId: string, concept: string, level: number): Promise<void> {
    try {
      // Record in concept mastery table
      await prisma.conceptMastery.upsert({
        where: {
          userId_concept: {
            userId,
            concept
          }
        },
        update: {
          masteryLevel: level,
          masteredAt: new Date(),
          updatedAt: new Date()
        },
        create: {
          userId,
          concept,
          masteryLevel: level,
          masteredAt: new Date()
        }
      });

      // Update user's strong areas in AI context
      const aiContext = await prisma.aILearningContext.findUnique({
        where: { userId }
      });

      if (aiContext) {
        const strongAreas = aiContext.strongAreas ? JSON.parse(aiContext.strongAreas) : [];
        if (!strongAreas.includes(concept)) {
          strongAreas.push(concept);

          await prisma.aILearningContext.update({
            where: { userId },
            data: {
              strongAreas: JSON.stringify(strongAreas),
              updatedAt: new Date()
            }
          });
        }
      }

      console.log(`🎉 Recorded concept mastery: ${userId} mastered ${concept} at level ${level}`);
    } catch (error) {
      console.error(`Error recording concept mastery for ${userId}:${concept}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const adaptiveLearningEngine = new AdaptiveLearningEngine();
