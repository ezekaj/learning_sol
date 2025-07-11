/**
 * AI Practice Problem Generator
 * 
 * Develop system that generates targeted practice problems based on user weaknesses
 * identified through security and gas analysis, with adaptive difficulty scaling.
 */

import { enhancedTutor } from './EnhancedTutorSystem';
import { adaptiveLearningEngine, LearningProfile } from '@/lib/learning/AdaptiveLearningEngine';
import { SecurityScanner } from '@/lib/security/SecurityScanner';
import { GasOptimizationAnalyzer } from '@/lib/gas/GasOptimizationAnalyzer';

export interface PracticeProblem {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'security' | 'gas-optimization' | 'syntax' | 'logic' | 'best-practices';
  targetConcepts: string[];
  weaknessesAddressed: string[];
  estimatedTime: number; // minutes
  problemStatement: string;
  starterCode?: string;
  expectedSolution: string;
  testCases: TestCase[];
  hints: ProblemHint[];
  learningObjectives: string[];
  realWorldContext: string;
  prerequisites: string[];
  followUpProblems: string[];
  adaptiveParameters: AdaptiveParameters;
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  inputs: any[];
  expectedOutput: any;
  isHidden: boolean; // Hidden test cases for validation
  weight: number; // Importance weight for scoring
  category: 'functionality' | 'security' | 'gas' | 'edge-case';
}

export interface ProblemHint {
  level: number; // 1-5
  content: string;
  type: 'conceptual' | 'implementation' | 'debugging' | 'optimization';
  unlockCondition: 'time' | 'attempts' | 'request';
  codeSnippet?: string;
  relatedConcepts: string[];
}

export interface AdaptiveParameters {
  difficultyScore: number; // 0-100
  conceptComplexity: number; // 0-100
  cognitiveLoad: number; // 0-100
  prerequisiteDepth: number; // 0-10
  scaffoldingLevel: number; // 0-5
  personalizedElements: string[];
}

export interface ProblemSolution {
  problemId: string;
  userId: string;
  submittedCode: string;
  isCorrect: boolean;
  score: number;
  testResults: TestResult[];
  timeSpent: number;
  hintsUsed: number;
  attempts: number;
  feedback: SolutionFeedback;
  conceptsMastered: string[];
  areasForImprovement: string[];
  nextRecommendations: string[];
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: any;
  executionTime: number;
  gasUsed?: number;
  errorMessage?: string;
}

export interface SolutionFeedback {
  overall: string;
  strengths: string[];
  improvements: string[];
  conceptualUnderstanding: number; // 0-100
  implementationQuality: number; // 0-100
  codeStyle: number; // 0-100
  efficiency: number; // 0-100
  nextSteps: string[];
}

export interface ProblemSet {
  id: string;
  name: string;
  description: string;
  userId: string;
  problems: PracticeProblem[];
  targetWeaknesses: string[];
  estimatedDuration: number;
  adaptivePath: boolean;
  progressTracking: ProgressMetrics;
}

export interface ProgressMetrics {
  problemsCompleted: number;
  totalProblems: number;
  averageScore: number;
  conceptsMastered: string[];
  timeSpent: number;
  difficultyProgression: number[];
  weaknessesAddressed: string[];
}

export class AIPracticeGenerator {
  private securityScanner: SecurityScanner;
  private gasAnalyzer: GasOptimizationAnalyzer;
  private problemTemplates: Map<string, any> = new Map();
  private userSolutions: Map<string, ProblemSolution[]> = new Map();

  constructor(
    securityScanner: SecurityScanner,
    gasAnalyzer: GasOptimizationAnalyzer
  ) {
    this.securityScanner = securityScanner;
    this.gasAnalyzer = gasAnalyzer;
    this.initializeProblemTemplates();
  }

  // Generate personalized practice problem
  async generatePersonalizedProblem(
    userId: string,
    targetWeakness?: string,
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<PracticeProblem> {
    console.log(`🎯 Generating personalized practice problem for user ${userId}`);
    
    try {
      // Get user's learning profile and analysis history
      const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
      const analysisHistory = await this.getUserAnalysisHistory(userId);
      
      // Determine target weakness and difficulty
      const weakness = targetWeakness || this.selectPriorityWeakness(profile.weaknessPatterns);
      const targetDifficulty = difficulty || this.calculateOptimalDifficulty(profile);
      
      // Generate AI-powered problem
      const problem = await this.generateAIProblem(userId, weakness, targetDifficulty, profile);
      
      // Enhance with adaptive parameters
      problem.adaptiveParameters = this.calculateAdaptiveParameters(profile, weakness);
      
      // Generate test cases and validation
      problem.testCases = await this.generateTestCases(problem);
      problem.hints = await this.generateProgressiveHints(problem, profile);
      
      console.log(`✅ Generated problem: ${problem.title}`);
      return problem;
      
    } catch (error) {
      console.error('Problem generation failed:', error);
      throw error;
    }
  }

  // Generate adaptive problem set
  async generateProblemSet(
    userId: string,
    targetConcepts: string[],
    sessionDuration: number // minutes
  ): Promise<ProblemSet> {
    const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
    const problems: PracticeProblem[] = [];
    
    // Calculate number of problems based on duration and user velocity
    const problemCount = Math.ceil(sessionDuration / (20 / profile.learningVelocity));
    
    // Generate problems with increasing difficulty
    for (let i = 0; i < problemCount; i++) {
      const concept = targetConcepts[i % targetConcepts.length];
      const difficulty = this.calculateProgressiveDifficulty(i, problemCount, profile);
      
      const problem = await this.generatePersonalizedProblem(userId, concept, difficulty);
      problems.push(problem);
    }
    
    return {
      id: `set-${Date.now()}-${userId}`,
      name: `Personalized Practice Set`,
      description: `Adaptive practice problems targeting: ${targetConcepts.join(', ')}`,
      userId,
      problems,
      targetWeaknesses: profile.weaknessPatterns,
      estimatedDuration: sessionDuration,
      adaptivePath: true,
      progressTracking: {
        problemsCompleted: 0,
        totalProblems: problems.length,
        averageScore: 0,
        conceptsMastered: [],
        timeSpent: 0,
        difficultyProgression: problems.map(p => p.adaptiveParameters.difficultyScore),
        weaknessesAddressed: []
      }
    };
  }

  // Evaluate problem solution
  async evaluateSolution(
    problemId: string,
    userId: string,
    submittedCode: string,
    timeSpent: number,
    hintsUsed: number,
    attempts: number
  ): Promise<ProblemSolution> {
    console.log(`🔍 Evaluating solution for problem ${problemId}`);
    
    try {
      const problem = await this.getProblem(problemId);
      
      // Run test cases
      const testResults = await this.runTestCases(submittedCode, problem.testCases);
      
      // Analyze code quality
      const codeAnalysis = await this.analyzeSubmittedCode(submittedCode, userId);
      
      // Calculate score
      const score = this.calculateSolutionScore(testResults, timeSpent, hintsUsed, attempts, problem);
      
      // Generate feedback
      const feedback = await this.generateSolutionFeedback(
        problem,
        submittedCode,
        testResults,
        codeAnalysis
      );
      
      // Assess concept mastery
      const conceptsMastered = await this.assessConceptMastery(
        userId,
        problem,
        testResults,
        score
      );
      
      // Generate next recommendations
      const nextRecommendations = await this.generateNextRecommendations(
        userId,
        problem,
        feedback,
        conceptsMastered
      );
      
      const solution: ProblemSolution = {
        problemId,
        userId,
        submittedCode,
        isCorrect: testResults.every(t => t.passed),
        score,
        testResults,
        timeSpent,
        hintsUsed,
        attempts,
        feedback,
        conceptsMastered,
        areasForImprovement: this.identifyImprovementAreas(feedback, testResults),
        nextRecommendations
      };
      
      // Save solution and update user progress
      await this.saveSolution(solution);
      await this.updateUserProgress(userId, solution);
      
      console.log(`✅ Solution evaluated: ${solution.isCorrect ? 'CORRECT' : 'INCORRECT'} (Score: ${score})`);
      return solution;
      
    } catch (error) {
      console.error('Solution evaluation failed:', error);
      throw error;
    }
  }

  // Generate follow-up problems based on performance
  async generateFollowUpProblems(
    userId: string,
    completedProblemId: string,
    performance: ProblemSolution
  ): Promise<PracticeProblem[]> {
    const followUps: PracticeProblem[] = [];
    
    if (performance.score >= 80) {
      // High performance: increase difficulty or introduce new concepts
      const advancedProblem = await this.generatePersonalizedProblem(
        userId,
        undefined,
        this.getNextDifficultyLevel(performance.problemId)
      );
      followUps.push(advancedProblem);
    } else if (performance.score < 60) {
      // Low performance: reinforce concepts with easier problems
      const reinforcementProblem = await this.generateReinforcementProblem(
        userId,
        performance.areasForImprovement
      );
      followUps.push(reinforcementProblem);
    }
    
    // Generate problems targeting specific improvement areas
    for (const area of performance.areasForImprovement.slice(0, 2)) {
      const targetedProblem = await this.generatePersonalizedProblem(userId, area);
      followUps.push(targetedProblem);
    }
    
    return followUps;
  }

  // Private helper methods
  private async generateAIProblem(
    userId: string,
    weakness: string,
    difficulty: string,
    profile: LearningProfile
  ): Promise<PracticeProblem> {
    const prompt = this.buildProblemPrompt(weakness, difficulty, profile);
    
    const response = await enhancedTutor.getAIResponse(
      prompt,
      { userId },
      'code'
    );
    
    return this.parseProblemFromAI(response.content, weakness, difficulty);
  }

  private buildProblemPrompt(
    weakness: string,
    difficulty: string,
    profile: LearningProfile
  ): string {
    return `
      Generate a Solidity practice problem targeting weakness: ${weakness}
      
      Requirements:
      - Difficulty: ${difficulty}
      - User Learning Velocity: ${profile.learningVelocity}
      - User Strengths: ${profile.strengthAreas.join(', ')}
      - Weakness Patterns: ${profile.weaknessPatterns.join(', ')}
      
      Create a problem that:
      1. Specifically addresses the ${weakness} weakness
      2. Is appropriate for ${difficulty} level
      3. Includes real-world context (DeFi, NFT, DAO, etc.)
      4. Has clear learning objectives
      5. Provides starter code if helpful
      6. Includes expected solution approach
      7. Has 3-5 test cases covering different scenarios
      8. Builds on user's existing strengths
      
      Problem should be:
      - Engaging and practical
      - Educational, not just challenging
      - Solvable in 15-30 minutes
      - Connected to broader Solidity concepts
      
      Provide response in structured format with all required fields.
    `;
  }

  private selectPriorityWeakness(weaknessPatterns: string[]): string {
    // Priority order for addressing weaknesses
    const priorityOrder = [
      'reentrancy',
      'access-control',
      'overflow',
      'gas-storage',
      'gas-computation',
      'visibility',
      'best-practices'
    ];
    
    for (const priority of priorityOrder) {
      if (weaknessPatterns.some(w => w.includes(priority))) {
        return priority;
      }
    }
    
    return weaknessPatterns[0] || 'general';
  }

  private calculateOptimalDifficulty(profile: LearningProfile): 'beginner' | 'intermediate' | 'advanced' {
    const averageSkill = Object.values(profile.skillLevels).reduce((sum, level) => sum + level, 0) / 
                         Object.values(profile.skillLevels).length;
    
    if (averageSkill < 40) return 'beginner';
    if (averageSkill < 70) return 'intermediate';
    return 'advanced';
  }

  private calculateAdaptiveParameters(
    profile: LearningProfile,
    weakness: string
  ): AdaptiveParameters {
    const skillLevel = profile.skillLevels[weakness] || 50;
    
    return {
      difficultyScore: Math.max(10, Math.min(90, skillLevel + 10)),
      conceptComplexity: this.getConceptComplexity(weakness),
      cognitiveLoad: this.calculateCognitiveLoad(profile, weakness),
      prerequisiteDepth: this.getPrerequisiteDepth(weakness),
      scaffoldingLevel: Math.max(1, 6 - Math.floor(skillLevel / 20)),
      personalizedElements: this.getPersonalizedElements(profile, weakness)
    };
  }

  private async runTestCases(code: string, testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of testCases) {
      try {
        // Simulate test execution (in real implementation, would compile and run)
        const result: TestResult = {
          testCaseId: testCase.id,
          passed: true, // Simplified for demo
          actualOutput: testCase.expectedOutput,
          executionTime: Math.random() * 100,
          gasUsed: Math.floor(Math.random() * 50000)
        };
        
        results.push(result);
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          passed: false,
          actualOutput: null,
          executionTime: 0,
          errorMessage: error instanceof Error ? error.message : 'Test failed'
        });
      }
    }
    
    return results;
  }

  private calculateSolutionScore(
    testResults: TestResult[],
    timeSpent: number,
    hintsUsed: number,
    attempts: number,
    problem: PracticeProblem
  ): number {
    // Base score from test results
    const passedTests = testResults.filter(t => t.passed).length;
    const testScore = (passedTests / testResults.length) * 100;
    
    // Time bonus/penalty
    const expectedTime = problem.estimatedTime;
    const timeMultiplier = timeSpent <= expectedTime ? 1.1 : Math.max(0.8, expectedTime / timeSpent);
    
    // Hint penalty
    const hintPenalty = Math.max(0, 1 - (hintsUsed * 0.1));
    
    // Attempt penalty
    const attemptPenalty = Math.max(0.5, 1 - ((attempts - 1) * 0.15));
    
    const finalScore = testScore * timeMultiplier * hintPenalty * attemptPenalty;
    return Math.round(Math.max(0, Math.min(100, finalScore)));
  }

  private initializeProblemTemplates(): void {
    console.log('🔄 Initializing practice problem templates...');
    // Initialize predefined problem templates for different concepts
  }
}

// Export factory function
export function createAIPracticeGenerator(
  securityScanner: SecurityScanner,
  gasAnalyzer: GasOptimizationAnalyzer
): AIPracticeGenerator {
  return new AIPracticeGenerator(securityScanner, gasAnalyzer);
}
