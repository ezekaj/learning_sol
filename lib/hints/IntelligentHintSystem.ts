/**
 * Intelligent Hint System
 * 
 * Create progressive hint system that guides users without revealing solutions,
 * integrated with real-time analysis and adaptive learning.
 */

import { enhancedTutor } from '@/lib/ai/EnhancedTutorSystem';
import { SecurityScanner, SecurityScanResult } from '@/lib/security/SecurityScanner';
import { GasOptimizationAnalyzer } from '@/lib/gas/GasOptimizationAnalyzer';
import { adaptiveLearningEngine, LearningProfile } from '@/lib/learning/AdaptiveLearningEngine';
import * as monaco from 'monaco-editor';

export interface HintContext {
  userId: string;
  currentCode: string;
  cursorPosition: { line: number; column: number };
  userLevel: number; // 0-100
  currentConcept: string;
  timeStuck: number; // seconds
  previousHints: Hint[];
  learningObjectives: string[];
  sessionContext: {
    attemptsCount: number;
    errorsEncountered: string[];
    lastSuccessfulAction?: string;
    frustrationLevel: number; // 0-10
  };
  codeAnalysis?: {
    securityIssues: number;
    gasOptimizations: number;
    syntaxErrors: string[];
  };
}

export interface Hint {
  id: string;
  level: number; // 1-5, increasing specificity
  type: 'question' | 'suggestion' | 'example' | 'explanation' | 'direction';
  content: string;
  codeHighlight?: {
    startLine: number;
    endLine: number;
    startColumn?: number;
    endColumn?: number;
  };
  followUpQuestions?: string[];
  relatedConcepts?: string[];
  unlockCondition: 'time' | 'request' | 'struggle' | 'immediate';
  estimatedHelpfulness: number; // 0-100
  learningValue: number; // 0-100
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'syntax' | 'logic' | 'security' | 'gas' | 'best-practice' | 'concept';
  interactionType: 'passive' | 'interactive' | 'guided';
  metadata: {
    generatedAt: Date;
    aiConfidence: number;
    userRelevance: number;
    contextualFit: number;
  };
}

export interface HintSequence {
  id: string;
  userId: string;
  concept: string;
  hints: Hint[];
  currentLevel: number;
  maxLevel: number;
  progressionStrategy: 'linear' | 'adaptive' | 'branching';
  completionCriteria: string;
  learningGoal: string;
}

export interface HintEffectiveness {
  hintId: string;
  userId: string;
  wasHelpful: boolean;
  timeToResolution: number;
  userFeedback?: string;
  followUpActions: string[];
  learningOutcome: 'resolved' | 'partial' | 'confused' | 'frustrated';
}

export interface SocraticQuestion {
  question: string;
  expectedThinking: string[];
  followUpQuestions: string[];
  conceptsToExplore: string[];
  difficulty: number;
}

export class IntelligentHintSystem {
  private securityScanner: SecurityScanner;
  private gasAnalyzer: GasOptimizationAnalyzer;
  private hintHistory: Map<string, Hint[]> = new Map();
  private effectivenessData: Map<string, HintEffectiveness[]> = new Map();
  private activeSequences: Map<string, HintSequence> = new Map();

  constructor(
    securityScanner: SecurityScanner,
    gasAnalyzer: GasOptimizationAnalyzer
  ) {
    this.securityScanner = securityScanner;
    this.gasAnalyzer = gasAnalyzer;
  }

  // Main hint generation method
  async generateHint(context: HintContext): Promise<Hint> {
    console.log(`💡 Generating hint for user ${context.userId} at level ${context.userLevel}`);
    
    try {
      // Get user's learning profile
      const profile = await adaptiveLearningEngine.analyzeUserPerformance(context.userId);
      
      // Analyze current code state
      const codeAnalysis = await this.analyzeCodeState(context.currentCode, context.userId);
      
      // Determine appropriate hint level and type
      const hintLevel = this.calculateOptimalHintLevel(context, profile);
      const hintType = this.determineHintType(context, codeAnalysis);
      
      // Generate contextual hint using AI
      const hint = await this.generateContextualHint(context, profile, codeAnalysis, hintLevel, hintType);
      
      // Record hint in history
      this.recordHint(context.userId, hint);
      
      console.log(`✅ Generated ${hint.type} hint at level ${hint.level}`);
      return hint;
      
    } catch (error) {
      console.error('Hint generation failed:', error);
      return this.generateFallbackHint(context);
    }
  }

  // Generate Socratic questioning sequence
  async generateSocraticSequence(
    context: HintContext,
    targetConcept: string
  ): Promise<SocraticQuestion[]> {
    const prompt = `
      Generate a Socratic questioning sequence to guide a student toward understanding: ${targetConcept}
      
      Student Context:
      - Skill Level: ${context.userLevel}/100
      - Current Code: ${context.currentCode.substring(0, 200)}...
      - Time Stuck: ${context.timeStuck} seconds
      - Previous Hints: ${context.previousHints.length}
      
      Create 3-5 progressive questions that:
      1. Start with their current understanding
      2. Guide them to discover the concept themselves
      3. Build on each previous answer
      4. Lead to the "aha!" moment
      5. Connect to practical application
      
      Each question should encourage thinking, not provide answers.
    `;
    
    const response = await enhancedTutor.getAIResponse(
      prompt,
      { userId: context.userId },
      'explanation'
    );
    
    return this.parseSocraticQuestions(response.content, targetConcept);
  }

  // Create interactive hint with guided exploration
  async createInteractiveHint(
    context: HintContext,
    focusArea: 'security' | 'gas' | 'syntax' | 'logic'
  ): Promise<Hint> {
    const interactiveContent = await this.generateInteractiveContent(context, focusArea);
    
    return {
      id: `interactive-${Date.now()}`,
      level: this.calculateOptimalHintLevel(context),
      type: 'explanation',
      content: interactiveContent,
      codeHighlight: this.identifyRelevantCodeSection(context, focusArea),
      followUpQuestions: await this.generateFollowUpQuestions(context, focusArea),
      relatedConcepts: this.getRelatedConcepts(focusArea),
      unlockCondition: 'immediate',
      estimatedHelpfulness: 85,
      learningValue: 90,
      difficulty: this.mapUserLevelToDifficulty(context.userLevel),
      category: focusArea,
      interactionType: 'interactive',
      metadata: {
        generatedAt: new Date(),
        aiConfidence: 0.9,
        userRelevance: this.calculateUserRelevance(context, focusArea),
        contextualFit: 0.95
      }
    };
  }

  // Adaptive hint progression based on user response
  async progressHintSequence(
    userId: string,
    currentHintId: string,
    userResponse: 'helpful' | 'confusing' | 'too-easy' | 'too-hard'
  ): Promise<Hint | null> {
    const sequence = this.activeSequences.get(userId);
    if (!sequence) return null;
    
    // Adjust progression based on user feedback
    let nextLevel = sequence.currentLevel;
    
    switch (userResponse) {
      case 'helpful':
        nextLevel = Math.min(sequence.maxLevel, sequence.currentLevel + 1);
        break;
      case 'too-easy':
        nextLevel = Math.min(sequence.maxLevel, sequence.currentLevel + 2);
        break;
      case 'too-hard':
        nextLevel = Math.max(1, sequence.currentLevel - 1);
        break;
      case 'confusing':
        // Generate alternative hint at same level
        nextLevel = sequence.currentLevel;
        break;
    }
    
    // Update sequence
    sequence.currentLevel = nextLevel;
    this.activeSequences.set(userId, sequence);
    
    // Generate next hint in sequence
    return this.generateSequenceHint(sequence, nextLevel);
  }

  // Track hint effectiveness
  async trackHintEffectiveness(
    hintId: string,
    userId: string,
    outcome: HintEffectiveness
  ): Promise<void> {
    const userEffectiveness = this.effectivenessData.get(userId) || [];
    userEffectiveness.push(outcome);
    this.effectivenessData.set(userId, userEffectiveness);
    
    // Use effectiveness data to improve future hints
    await this.updateHintStrategy(userId, outcome);
  }

  // Generate contextual code examples
  async generateCodeExample(
    context: HintContext,
    concept: string
  ): Promise<string> {
    const prompt = `
      Generate a simple, clear code example for concept: ${concept}
      
      Context:
      - User Level: ${context.userLevel}/100
      - Current Code Context: ${context.currentCode.substring(0, 150)}...
      - Learning Objectives: ${context.learningObjectives.join(', ')}
      
      Create a minimal example that:
      1. Demonstrates the concept clearly
      2. Relates to their current code
      3. Is appropriate for their skill level
      4. Shows both incorrect and correct approaches
      5. Includes brief comments explaining key points
      
      Keep it under 20 lines and focus on clarity over complexity.
    `;
    
    const response = await enhancedTutor.getAIResponse(
      prompt,
      { userId: context.userId },
      'code'
    );
    
    return this.extractCodeFromResponse(response.content);
  }

  // Private helper methods
  private calculateOptimalHintLevel(
    context: HintContext,
    profile?: LearningProfile
  ): number {
    let level = 1;
    
    // Increase level based on time stuck
    if (context.timeStuck > 60) level++; // 1 minute
    if (context.timeStuck > 180) level++; // 3 minutes
    if (context.timeStuck > 300) level++; // 5 minutes
    if (context.timeStuck > 600) level++; // 10 minutes
    
    // Adjust based on previous hints
    level += Math.min(2, context.previousHints.length);
    
    // Adjust based on frustration level
    if (context.sessionContext.frustrationLevel > 7) {
      level = Math.min(5, level + 1); // More direct help when frustrated
    }
    
    // Adjust based on user skill level
    if (context.userLevel < 30) {
      level = Math.min(level + 1, 5); // More help for beginners
    } else if (context.userLevel > 70) {
      level = Math.max(level - 1, 1); // Less direct help for advanced users
    }
    
    // Consider learning velocity from profile
    if (profile && profile.learningVelocity > 1.5) {
      level = Math.max(level - 1, 1); // Fast learners get less direct hints
    }
    
    return Math.max(1, Math.min(5, level));
  }

  private determineHintType(
    context: HintContext,
    codeAnalysis: any
  ): 'question' | 'suggestion' | 'example' | 'explanation' | 'direction' {
    // Determine best hint type based on context
    if (context.sessionContext.frustrationLevel > 8) {
      return 'explanation'; // Direct help when very frustrated
    }
    
    if (context.userLevel < 40) {
      return 'example'; // Examples work well for beginners
    }
    
    if (context.timeStuck < 120) {
      return 'question'; // Socratic method for initial guidance
    }
    
    if (codeAnalysis.syntaxErrors.length > 0) {
      return 'direction'; // Direct guidance for syntax issues
    }
    
    return 'suggestion'; // Default to suggestions
  }

  private async generateContextualHint(
    context: HintContext,
    profile: LearningProfile,
    codeAnalysis: any,
    hintLevel: number,
    hintType: string
  ): Promise<Hint> {
    const prompt = this.buildHintPrompt(context, profile, codeAnalysis, hintLevel, hintType);
    
    const response = await enhancedTutor.getAIResponse(
      prompt,
      { userId: context.userId },
      'explanation'
    );
    
    return this.parseHintResponse(response.content, hintLevel, hintType, context);
  }

  private buildHintPrompt(
    context: HintContext,
    profile: LearningProfile,
    codeAnalysis: any,
    hintLevel: number,
    hintType: string
  ): string {
    const hintStrategies = {
      1: 'Ask a thought-provoking question that guides them to think about the problem',
      2: 'Provide a gentle suggestion about the general approach or direction',
      3: 'Give a more specific hint about what to look for or consider',
      4: 'Show a relevant example or pattern that applies to their situation',
      5: 'Provide clear guidance toward the solution with explanation'
    };
    
    return `
      Generate a level ${hintLevel} ${hintType} hint for a Solidity student.
      
      Strategy: ${hintStrategies[hintLevel]}
      
      Student Profile:
      - Skill Level: ${context.userLevel}/100
      - Learning Velocity: ${profile.learningVelocity}
      - Current Concept: ${context.currentConcept}
      - Time Stuck: ${context.timeStuck} seconds
      - Frustration Level: ${context.sessionContext.frustrationLevel}/10
      - Weakness Patterns: ${profile.weaknessPatterns.join(', ')}
      
      Current Code Context:
      \`\`\`solidity
      ${context.currentCode}
      \`\`\`
      
      Cursor Position: Line ${context.cursorPosition.line}, Column ${context.cursorPosition.column}
      
      Code Analysis:
      - Security Issues: ${codeAnalysis.securityIssues}
      - Gas Optimizations: ${codeAnalysis.gasOptimizations}
      - Syntax Errors: ${codeAnalysis.syntaxErrors.join(', ')}
      
      Previous Hints: ${context.previousHints.map(h => h.content).join('; ')}
      
      Learning Objectives: ${context.learningObjectives.join(', ')}
      
      Generate a ${hintType} that:
      1. ${hintStrategies[hintLevel]}
      2. Builds on their current understanding
      3. Addresses their specific situation
      4. Maintains appropriate difficulty for level ${hintLevel}
      5. Encourages learning and discovery
      6. Relates to their learning objectives
      
      Keep it concise, encouraging, and educational.
      Focus on guiding them to the answer rather than giving it away.
    `;
  }

  private async analyzeCodeState(code: string, userId: string): Promise<any> {
    // Analyze current code for context
    const securityResult = await this.securityScanner.getLastResult();
    const gasResult = await this.gasAnalyzer.getLastAnalysis();
    
    return {
      securityIssues: securityResult?.issues.length || 0,
      gasOptimizations: gasResult?.optimizations.length || 0,
      syntaxErrors: this.detectSyntaxErrors(code),
      codeComplexity: this.calculateCodeComplexity(code),
      conceptsUsed: this.identifyConceptsInCode(code)
    };
  }

  private detectSyntaxErrors(code: string): string[] {
    // Simple syntax error detection
    const errors = [];
    
    if (!code.includes('pragma solidity')) {
      errors.push('Missing pragma directive');
    }
    
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Mismatched braces');
    }
    
    return errors;
  }

  private generateFallbackHint(context: HintContext): Hint {
    return {
      id: `fallback-${Date.now()}`,
      level: 2,
      type: 'suggestion',
      content: `Consider reviewing the ${context.currentConcept} concept. Take a step back and think about what you're trying to achieve.`,
      unlockCondition: 'immediate',
      estimatedHelpfulness: 50,
      learningValue: 40,
      difficulty: 'beginner',
      category: 'concept',
      interactionType: 'passive',
      metadata: {
        generatedAt: new Date(),
        aiConfidence: 0.5,
        userRelevance: 0.6,
        contextualFit: 0.5
      }
    };
  }

  private recordHint(userId: string, hint: Hint): void {
    const userHints = this.hintHistory.get(userId) || [];
    userHints.push(hint);
    this.hintHistory.set(userId, userHints.slice(-20)); // Keep last 20 hints
  }
}

// Export factory function
export function createIntelligentHintSystem(
  securityScanner: SecurityScanner,
  gasAnalyzer: GasOptimizationAnalyzer
): IntelligentHintSystem {
  return new IntelligentHintSystem(securityScanner, gasAnalyzer);
}
