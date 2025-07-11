/**
 * Smart Contract Template System
 * 
 * Create graduated complexity template system with best practice enforcement
 * using our security scanner and adaptive learning integration.
 */

import { SecurityScanner } from '@/lib/security/SecurityScanner';
import { adaptiveLearningEngine, LearningProfile } from '@/lib/learning/AdaptiveLearningEngine';
import { enhancedTutor } from '@/lib/ai/EnhancedTutorSystem';

export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: 'basic' | 'defi' | 'nft' | 'dao' | 'infrastructure' | 'advanced';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  complexity: number; // 1-10 scale
  estimatedTime: number; // minutes
  prerequisites: string[];
  learningObjectives: string[];
  concepts: string[];
  template: string;
  placeholders: TemplatePlaceholder[];
  bestPractices: BestPractice[];
  securityChecks: SecurityCheck[];
  gasOptimizations: GasOptimization[];
  testCases: TemplateTestCase[];
  documentation: TemplateDocumentation;
  realWorldExamples: string[];
  nextTemplates: string[];
  customizationOptions: CustomizationOption[];
}

export interface TemplatePlaceholder {
  id: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'address' | 'bool' | 'array' | 'custom';
  required: boolean;
  defaultValue?: any;
  validation: ValidationRule[];
  examples: string[];
  hint: string;
}

export interface ValidationRule {
  type: 'length' | 'range' | 'pattern' | 'custom';
  value: any;
  message: string;
}

export interface BestPractice {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'gas' | 'style' | 'maintainability';
  importance: 'low' | 'medium' | 'high' | 'critical';
  codeExample: string;
  explanation: string;
  resources: string[];
  enforcementLevel: 'suggestion' | 'warning' | 'error';
}

export interface SecurityCheck {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  fix: string;
  autoFixable: boolean;
  category: 'access-control' | 'reentrancy' | 'overflow' | 'visibility' | 'general';
}

export interface GasOptimization {
  id: string;
  name: string;
  description: string;
  pattern: RegExp;
  optimization: string;
  gasSavings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tradeoffs: string[];
}

export interface TemplateTestCase {
  id: string;
  name: string;
  description: string;
  testCode: string;
  expectedBehavior: string;
  category: 'functionality' | 'security' | 'gas' | 'edge-case';
}

export interface TemplateDocumentation {
  overview: string;
  usage: string;
  parameters: string;
  examples: string;
  troubleshooting: string;
  references: string[];
}

export interface CustomizationOption {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'modifier' | 'extension';
  code: string;
  dependencies: string[];
  complexity: number;
}

export interface TemplateCustomization {
  templateId: string;
  userId: string;
  placeholderValues: Record<string, any>;
  selectedOptions: string[];
  customCode?: string;
  userNotes?: string;
  timestamp: Date;
}

export interface GeneratedContract {
  id: string;
  templateId: string;
  userId: string;
  code: string;
  customization: TemplateCustomization;
  securityAnalysis: any;
  gasAnalysis: any;
  qualityScore: number;
  suggestions: string[];
  warnings: string[];
  errors: string[];
  deploymentReady: boolean;
  generatedAt: Date;
}

export class SmartContractTemplates {
  private securityScanner: SecurityScanner;
  private templates: Map<string, ContractTemplate> = new Map();
  private userCustomizations: Map<string, TemplateCustomization[]> = new Map();

  constructor(securityScanner: SecurityScanner) {
    this.securityScanner = securityScanner;
    this.initializeTemplates();
  }

  // Get personalized template recommendations
  async getRecommendedTemplates(userId: string): Promise<ContractTemplate[]> {
    console.log(`🎯 Getting template recommendations for user ${userId}`);
    
    try {
      // Get user's learning profile
      const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
      
      // Calculate user's overall skill level
      const skillLevel = this.calculateOverallSkillLevel(profile);
      
      // Get templates matching user's level and interests
      const allTemplates = Array.from(this.templates.values());
      const recommendations = allTemplates
        .filter(template => this.isTemplateAppropriate(template, profile, skillLevel))
        .sort((a, b) => this.calculateRelevanceScore(b, profile) - this.calculateRelevanceScore(a, profile))
        .slice(0, 8);
      
      console.log(`✅ Found ${recommendations.length} recommended templates`);
      return recommendations;
      
    } catch (error) {
      console.error('Template recommendation failed:', error);
      return this.getDefaultTemplates();
    }
  }

  // Generate contract from template
  async generateContract(
    templateId: string,
    userId: string,
    customization: Omit<TemplateCustomization, 'templateId' | 'userId' | 'timestamp'>
  ): Promise<GeneratedContract> {
    console.log(`🏗️ Generating contract from template ${templateId}`);
    
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }
      
      // Validate customization
      this.validateCustomization(template, customization);
      
      // Generate code from template
      const code = this.processTemplate(template, customization);
      
      // Run security and gas analysis
      const [securityAnalysis, gasAnalysis] = await Promise.all([
        this.analyzeContractSecurity(code, userId),
        this.analyzeContractGas(code, userId)
      ]);
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(securityAnalysis, gasAnalysis, template);
      
      // Generate suggestions and warnings
      const { suggestions, warnings, errors } = this.generateFeedback(
        template,
        securityAnalysis,
        gasAnalysis,
        customization
      );
      
      const generatedContract: GeneratedContract = {
        id: `contract-${Date.now()}-${userId}`,
        templateId,
        userId,
        code,
        customization: {
          ...customization,
          templateId,
          userId,
          timestamp: new Date()
        },
        securityAnalysis,
        gasAnalysis,
        qualityScore,
        suggestions,
        warnings,
        errors,
        deploymentReady: errors.length === 0 && qualityScore >= 70,
        generatedAt: new Date()
      };
      
      // Save customization for future reference
      await this.saveCustomization(generatedContract.customization);
      
      console.log(`✅ Contract generated successfully (Quality: ${qualityScore})`);
      return generatedContract;
      
    } catch (error) {
      console.error('Contract generation failed:', error);
      throw error;
    }
  }

  // Get template by ID with user-specific enhancements
  async getTemplate(templateId: string, userId?: string): Promise<ContractTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;
    
    if (userId) {
      // Enhance template with user-specific information
      const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
      return this.enhanceTemplateForUser(template, profile);
    }
    
    return template;
  }

  // Create custom template from user code
  async createCustomTemplate(
    userId: string,
    name: string,
    description: string,
    code: string,
    category: ContractTemplate['category']
  ): Promise<ContractTemplate> {
    console.log(`🎨 Creating custom template: ${name}`);
    
    try {
      // Analyze the provided code
      const [securityAnalysis, gasAnalysis] = await Promise.all([
        this.analyzeContractSecurity(code, userId),
        this.analyzeContractGas(code, userId)
      ]);
      
      // Extract placeholders from code
      const placeholders = this.extractPlaceholders(code);
      
      // Generate best practices based on analysis
      const bestPractices = this.generateBestPracticesFromAnalysis(securityAnalysis, gasAnalysis);
      
      // Determine difficulty and complexity
      const difficulty = this.determineDifficulty(code, securityAnalysis, gasAnalysis);
      const complexity = this.calculateComplexity(code);
      
      // Generate documentation
      const documentation = await this.generateDocumentation(code, name, description);
      
      const customTemplate: ContractTemplate = {
        id: `custom-${Date.now()}-${userId}`,
        name,
        description,
        category,
        difficulty,
        complexity,
        estimatedTime: this.estimateCompletionTime(complexity, difficulty),
        prerequisites: this.identifyPrerequisites(code),
        learningObjectives: await this.generateLearningObjectives(code, category),
        concepts: this.extractConcepts(code),
        template: code,
        placeholders,
        bestPractices,
        securityChecks: this.generateSecurityChecks(securityAnalysis),
        gasOptimizations: this.generateGasOptimizations(gasAnalysis),
        testCases: await this.generateTestCases(code),
        documentation,
        realWorldExamples: [],
        nextTemplates: [],
        customizationOptions: []
      };
      
      // Save custom template
      this.templates.set(customTemplate.id, customTemplate);
      
      console.log(`✅ Custom template created: ${customTemplate.id}`);
      return customTemplate;
      
    } catch (error) {
      console.error('Custom template creation failed:', error);
      throw error;
    }
  }

  // Validate contract against template best practices
  async validateContract(
    templateId: string,
    code: string,
    userId: string
  ): Promise<ValidationResult> {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }
    
    const violations: ValidationViolation[] = [];
    const suggestions: string[] = [];
    
    // Check best practices
    for (const practice of template.bestPractices) {
      const violation = this.checkBestPractice(code, practice);
      if (violation) {
        violations.push(violation);
      }
    }
    
    // Check security patterns
    for (const check of template.securityChecks) {
      if (check.pattern.test(code)) {
        violations.push({
          type: 'security',
          severity: check.severity,
          message: check.message,
          fix: check.fix,
          autoFixable: check.autoFixable,
          line: this.findPatternLine(code, check.pattern)
        });
      }
    }
    
    // Run full security analysis
    const securityAnalysis = await this.analyzeContractSecurity(code, userId);
    
    // Generate improvement suggestions
    if (securityAnalysis) {
      suggestions.push(...this.generateImprovementSuggestions(securityAnalysis, template));
    }
    
    return {
      isValid: violations.filter(v => v.severity === 'critical' || v.severity === 'high').length === 0,
      score: this.calculateValidationScore(violations, template),
      violations,
      suggestions,
      template: template.name
    };
  }

  // Get template progression path
  getTemplatePath(currentTemplateId: string): ContractTemplate[] {
    const current = this.templates.get(currentTemplateId);
    if (!current) return [];
    
    const path: ContractTemplate[] = [current];
    
    // Add next templates in progression
    for (const nextId of current.nextTemplates) {
      const next = this.templates.get(nextId);
      if (next) {
        path.push(next);
      }
    }
    
    return path;
  }

  // Private helper methods
  private initializeTemplates(): void {
    console.log('🔄 Initializing smart contract templates...');
    
    // Initialize with predefined templates
    this.loadPredefinedTemplates();
  }

  private loadPredefinedTemplates(): void {
    // Basic ERC20 Token Template
    const erc20Template: ContractTemplate = {
      id: 'erc20-basic',
      name: 'Basic ERC20 Token',
      description: 'A simple ERC20 token implementation with basic functionality',
      category: 'basic',
      difficulty: 'beginner',
      complexity: 3,
      estimatedTime: 30,
      prerequisites: ['solidity-basics', 'functions', 'modifiers'],
      learningObjectives: [
        'Understand ERC20 standard',
        'Implement token transfers',
        'Learn about allowances',
        'Practice access control'
      ],
      concepts: ['tokens', 'standards', 'mappings', 'events'],
      template: this.getERC20Template(),
      placeholders: this.getERC20Placeholders(),
      bestPractices: this.getERC20BestPractices(),
      securityChecks: this.getERC20SecurityChecks(),
      gasOptimizations: this.getERC20GasOptimizations(),
      testCases: [],
      documentation: this.getERC20Documentation(),
      realWorldExamples: ['USDC', 'DAI', 'LINK'],
      nextTemplates: ['erc20-advanced', 'erc20-mintable'],
      customizationOptions: []
    };
    
    this.templates.set(erc20Template.id, erc20Template);
    
    // Add more templates...
    this.addNFTTemplates();
    this.addDeFiTemplates();
    this.addDAOTemplates();
  }

  private getERC20Template(): string {
    return `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract {{TOKEN_NAME}} is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply * 10**decimals());
    }
    
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}
    `.trim();
  }

  private calculateOverallSkillLevel(profile: LearningProfile): number {
    const skillValues = Object.values(profile.skillLevels);
    return skillValues.reduce((sum, level) => sum + level, 0) / skillValues.length;
  }

  private isTemplateAppropriate(
    template: ContractTemplate,
    profile: LearningProfile,
    skillLevel: number
  ): boolean {
    // Check if user meets prerequisites
    const hasPrerequisites = template.prerequisites.every(prereq =>
      profile.skillLevels[prereq] >= 60
    );
    
    // Check difficulty appropriateness
    const difficultyMatch = this.isDifficultyAppropriate(template.difficulty, skillLevel);
    
    return hasPrerequisites && difficultyMatch;
  }

  private isDifficultyAppropriate(difficulty: string, skillLevel: number): boolean {
    switch (difficulty) {
      case 'beginner': return skillLevel <= 60;
      case 'intermediate': return skillLevel >= 40 && skillLevel <= 80;
      case 'advanced': return skillLevel >= 70;
      default: return true;
    }
  }
}

interface ValidationResult {
  isValid: boolean;
  score: number;
  violations: ValidationViolation[];
  suggestions: string[];
  template: string;
}

interface ValidationViolation {
  type: 'security' | 'gas' | 'style' | 'best-practice';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  fix: string;
  autoFixable: boolean;
  line?: number;
}

// Export factory function
export function createSmartContractTemplates(
  securityScanner: SecurityScanner
): SmartContractTemplates {
  return new SmartContractTemplates(securityScanner);
}
