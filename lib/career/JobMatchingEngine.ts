/**
 * AI Job Matching Engine
 * Intelligent job matching system analyzing code quality, security scores, 
 * gas optimization skills, and project portfolios
 */

import { adaptiveLearningEngine } from '@/lib/learning/AdaptiveLearningEngine';
import { enhancedTutor } from '@/lib/ai/EnhancedTutorSystem';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: JobRequirement[];
  skillsRequired: SkillRequirement[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead';
  salaryRange: { min: number; max: number; currency: string };
  location: string;
  remote: boolean;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  category: 'defi' | 'nft' | 'infrastructure' | 'security' | 'tooling' | 'research';
  postedDate: Date;
  applicationDeadline?: Date;
  benefits: string[];
  companyInfo: CompanyInfo;
}

export interface JobRequirement {
  type: 'skill' | 'experience' | 'education' | 'certification';
  description: string;
  required: boolean;
  weight: number; // 0-100 importance
}

export interface SkillRequirement {
  skill: string;
  level: number; // 0-100 required proficiency
  weight: number; // 0-100 importance
  category: 'technical' | 'soft' | 'domain';
}

export interface CompanyInfo {
  name: string;
  size: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  description: string;
  website: string;
  culture: string[];
  techStack: string[];
  fundingStage?: string;
}

export interface JobMatch {
  jobId: string;
  userId: string;
  matchScore: number; // 0-100
  skillAlignment: SkillAlignment[];
  strengthsMatch: string[];
  skillGaps: SkillGap[];
  recommendations: string[];
  applicationReadiness: number; // 0-100
  estimatedInterviewSuccess: number; // 0-100
  careerGrowthPotential: number; // 0-100
  salaryFit: 'below' | 'within' | 'above';
  cultureFit: number; // 0-100
  matchReasons: string[];
  improvementPlan: ImprovementPlan;
}

export interface SkillAlignment {
  skill: string;
  required: number;
  current: number;
  gap: number;
  importance: number;
  evidence: string[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  timeToClose: number; // estimated weeks
  learningResources: string[];
  projects: string[];
}

export interface ImprovementPlan {
  timeframe: number; // weeks
  focusAreas: string[];
  recommendedProjects: string[];
  skillDevelopment: SkillDevelopmentPlan[];
  certifications: string[];
  networking: string[];
}

export interface SkillDevelopmentPlan {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  estimatedTime: number; // weeks
  learningPath: string[];
  practiceProjects: string[];
  milestones: string[];
}

export class JobMatchingEngine {
  private jobListings: Map<string, JobListing> = new Map();
  private userMatches: Map<string, JobMatch[]> = new Map();

  constructor() {
    this.initializeJobListings();
  }

  async findMatches(userId: string, preferences?: JobPreferences): Promise<JobMatch[]> {
    console.log(`🎯 Finding job matches for user ${userId}`);
    
    try {
      // Get user's comprehensive profile
      const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
      const portfolio = await this.getUserPortfolio(userId);
      const skillAssessment = await this.getSkillAssessment(userId);
      
      // Get relevant job listings
      const relevantJobs = this.filterJobsByPreferences(preferences);
      
      // Calculate matches for each job
      const matches: JobMatch[] = [];
      
      for (const job of relevantJobs) {
        const match = await this.calculateJobMatch(
          userId,
          job,
          profile,
          portfolio,
          skillAssessment
        );
        
        if (match.matchScore >= 30) { // Minimum threshold
          matches.push(match);
        }
      }
      
      // Sort by match score and relevance
      const sortedMatches = matches.sort((a, b) => b.matchScore - a.matchScore);
      
      // Cache results
      this.userMatches.set(userId, sortedMatches);
      
      console.log(`✅ Found ${sortedMatches.length} job matches`);
      return sortedMatches.slice(0, 20); // Top 20 matches
      
    } catch (error) {
      console.error('Job matching failed:', error);
      throw error;
    }
  }

  async generateCareerRecommendations(userId: string): Promise<CareerRecommendation[]> {
    const profile = await adaptiveLearningEngine.analyzeUserPerformance(userId);
    const matches = await this.findMatches(userId);
    
    const recommendations: CareerRecommendation[] = [];
    
    // Analyze career progression opportunities
    const currentLevel = this.assessCurrentLevel(profile);
    const growthAreas = this.identifyGrowthAreas(matches);
    
    // Generate specific recommendations
    for (const area of growthAreas) {
      const recommendation = await this.generateAreaRecommendation(userId, area, currentLevel);
      recommendations.push(recommendation);
    }
    
    return recommendations;
  }

  async trackApplicationSuccess(
    userId: string,
    jobId: string,
    outcome: 'applied' | 'interview' | 'offer' | 'hired' | 'rejected'
  ): Promise<void> {
    // Track application outcomes to improve matching algorithm
    const match = await this.getJobMatch(userId, jobId);
    if (match) {
      await this.updateMatchingAlgorithm(match, outcome);
    }
  }

  private async calculateJobMatch(
    userId: string,
    job: JobListing,
    profile: any,
    portfolio: any,
    skillAssessment: any
  ): Promise<JobMatch> {
    // Calculate skill alignment
    const skillAlignment = this.calculateSkillAlignment(job.skillsRequired, skillAssessment);
    
    // Identify skill gaps
    const skillGaps = this.identifySkillGaps(job.skillsRequired, skillAssessment);
    
    // Calculate various match components
    const skillScore = this.calculateSkillScore(skillAlignment);
    const experienceScore = this.calculateExperienceScore(job, portfolio);
    const projectScore = this.calculateProjectScore(job, portfolio);
    const cultureScore = this.calculateCultureScore(job, profile);
    
    // Overall match score (weighted average)
    const matchScore = Math.round(
      skillScore * 0.4 +
      experienceScore * 0.25 +
      projectScore * 0.25 +
      cultureScore * 0.1
    );
    
    // Generate improvement plan
    const improvementPlan = await this.generateImprovementPlan(skillGaps, job);
    
    return {
      jobId: job.id,
      userId,
      matchScore,
      skillAlignment,
      strengthsMatch: this.identifyStrengths(skillAlignment),
      skillGaps,
      recommendations: await this.generateRecommendations(userId, job, skillGaps),
      applicationReadiness: this.calculateApplicationReadiness(skillGaps, portfolio),
      estimatedInterviewSuccess: this.estimateInterviewSuccess(skillAlignment, portfolio),
      careerGrowthPotential: this.calculateGrowthPotential(job, profile),
      salaryFit: this.assessSalaryFit(job.salaryRange, profile),
      cultureFit: cultureScore,
      matchReasons: this.generateMatchReasons(skillAlignment, job),
      improvementPlan
    };
  }

  private calculateSkillAlignment(
    required: SkillRequirement[],
    current: any
  ): SkillAlignment[] {
    return required.map(req => {
      const currentLevel = current.skills[req.skill] || 0;
      const gap = Math.max(0, req.level - currentLevel);
      
      return {
        skill: req.skill,
        required: req.level,
        current: currentLevel,
        gap,
        importance: req.weight,
        evidence: this.getSkillEvidence(req.skill, current)
      };
    });
  }

  private identifySkillGaps(
    required: SkillRequirement[],
    current: any
  ): SkillGap[] {
    return required
      .filter(req => (current.skills[req.skill] || 0) < req.level)
      .map(req => {
        const currentLevel = current.skills[req.skill] || 0;
        const gap = req.level - currentLevel;
        
        return {
          skill: req.skill,
          currentLevel,
          requiredLevel: req.level,
          gap,
          priority: this.calculateGapPriority(gap, req.weight),
          timeToClose: this.estimateTimeToClose(gap),
          learningResources: this.getLearningResources(req.skill),
          projects: this.getRelevantProjects(req.skill)
        };
      });
  }

  private async generateImprovementPlan(
    skillGaps: SkillGap[],
    job: JobListing
  ): Promise<ImprovementPlan> {
    const criticalGaps = skillGaps.filter(gap => gap.priority === 'critical' || gap.priority === 'high');
    const totalTime = criticalGaps.reduce((sum, gap) => sum + gap.timeToClose, 0);
    
    return {
      timeframe: Math.max(4, totalTime), // Minimum 4 weeks
      focusAreas: criticalGaps.map(gap => gap.skill),
      recommendedProjects: this.getProjectsForSkills(criticalGaps.map(g => g.skill)),
      skillDevelopment: criticalGaps.map(gap => ({
        skill: gap.skill,
        currentLevel: gap.currentLevel,
        targetLevel: gap.requiredLevel,
        estimatedTime: gap.timeToClose,
        learningPath: gap.learningResources,
        practiceProjects: gap.projects,
        milestones: this.generateMilestones(gap)
      })),
      certifications: this.getRelevantCertifications(job.category),
      networking: this.getNetworkingOpportunities(job.company)
    };
  }

  private initializeJobListings(): void {
    // Sample job listings for demonstration
    const sampleJobs: JobListing[] = [
      {
        id: 'job-1',
        title: 'Senior Solidity Developer',
        company: 'DeFi Protocol Inc',
        description: 'Build next-generation DeFi protocols',
        requirements: [
          { type: 'experience', description: '3+ years Solidity development', required: true, weight: 80 },
          { type: 'skill', description: 'Smart contract security expertise', required: true, weight: 90 }
        ],
        skillsRequired: [
          { skill: 'solidity', level: 85, weight: 90, category: 'technical' },
          { skill: 'defi', level: 80, weight: 85, category: 'domain' },
          { skill: 'security', level: 75, weight: 80, category: 'technical' }
        ],
        experienceLevel: 'senior',
        salaryRange: { min: 120000, max: 180000, currency: 'USD' },
        location: 'Remote',
        remote: true,
        type: 'full-time',
        category: 'defi',
        postedDate: new Date(),
        benefits: ['Health insurance', 'Token allocation', 'Remote work'],
        companyInfo: {
          name: 'DeFi Protocol Inc',
          size: 'medium',
          industry: 'DeFi',
          description: 'Leading DeFi protocol with $1B+ TVL',
          website: 'https://defiprotocol.com',
          culture: ['Innovation', 'Decentralization', 'Transparency'],
          techStack: ['Solidity', 'Hardhat', 'React', 'Node.js']
        }
      }
    ];

    sampleJobs.forEach(job => this.jobListings.set(job.id, job));
  }

  private calculateGapPriority(gap: number, weight: number): 'low' | 'medium' | 'high' | 'critical' {
    const score = gap * weight / 100;
    if (score > 60) return 'critical';
    if (score > 40) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }

  private estimateTimeToClose(gap: number): number {
    // Estimate weeks needed to close skill gap
    return Math.ceil(gap / 10) * 2; // 2 weeks per 10 skill points
  }
}

interface JobPreferences {
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  experienceLevel?: string[];
  categories?: string[];
  companySize?: string[];
}

interface CareerRecommendation {
  type: 'skill' | 'project' | 'certification' | 'networking';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  timeframe: string;
  resources: string[];
}

export const jobMatchingEngine = new JobMatchingEngine();
