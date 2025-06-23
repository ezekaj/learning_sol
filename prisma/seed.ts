import { PrismaClient } from '@prisma/client';

// Define enums locally since they might not be exported from Prisma client
enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

enum LessonType {
  THEORY = 'THEORY',
  PRACTICE = 'PRACTICE',
  PROJECT = 'PROJECT',
  QUIZ = 'QUIZ',
  CODING = 'CODING'
}

enum AchievementCategory {
  LEARNING = 'LEARNING',
  CODING = 'CODING',
  COLLABORATION = 'COLLABORATION',
  MILESTONE = 'MILESTONE',
  STREAK = 'STREAK',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL'
}
import { LEARNING_MODULES } from '../constants';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default achievements
  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first lesson',
      icon: '🎯',
      category: AchievementCategory.LEARNING,
      requirement: { type: 'lessons_completed', count: 1 },
      xpReward: 50,
    },
    {
      title: 'Code Warrior',
      description: 'Successfully compile 10 contracts',
      icon: '⚔️',
      category: AchievementCategory.CODING,
      requirement: { type: 'contracts_compiled', count: 10 },
      xpReward: 200,
    },
    {
      title: 'Streak Master',
      description: 'Maintain a 7-day learning streak',
      icon: '🔥',
      category: AchievementCategory.STREAK,
      requirement: { type: 'streak_days', count: 7 },
      xpReward: 300,
    },
    {
      title: 'Social Butterfly',
      description: 'Participate in 5 collaboration sessions',
      icon: '🦋',
      category: AchievementCategory.SOCIAL,
      requirement: { type: 'collaborations', count: 5 },
      xpReward: 150,
    },
    {
      title: 'Solidity Expert',
      description: 'Complete all advanced modules',
      icon: '🏆',
      category: AchievementCategory.SPECIAL,
      requirement: { type: 'advanced_modules_completed', count: 3 },
      xpReward: 500,
    },
  ];

  console.log('📊 Creating achievements...');
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { title: achievement.title },
      update: achievement,
      create: achievement,
    });
  }

  // Create courses and modules from static data
  console.log('📚 Creating courses and modules from static data...');
  
  // Group modules by category to create courses
  const courseCategories = [...new Set(LEARNING_MODULES.map(module => module.category))];
  
  for (const categoryName of courseCategories) {
    const categoryModules = LEARNING_MODULES.filter(module => module.category === categoryName);
    
    // Determine course difficulty based on modules
    const difficulties = categoryModules.map(module => {
      switch (module.level) {
        case 'Beginner': return SkillLevel.BEGINNER;
        case 'Intermediate': return SkillLevel.INTERMEDIATE;
        case 'Advanced': return SkillLevel.ADVANCED;
        default: return SkillLevel.BEGINNER;
      }
    });
    
    const courseDifficulty = difficulties.includes(SkillLevel.ADVANCED) 
      ? SkillLevel.ADVANCED 
      : difficulties.includes(SkillLevel.INTERMEDIATE) 
        ? SkillLevel.INTERMEDIATE 
        : SkillLevel.BEGINNER;

    // Create course
    const course = await prisma.course.upsert({
      where: { title: categoryName },
      update: {
        description: `Comprehensive ${categoryName.toLowerCase()} course covering essential concepts and practical applications`,
        difficulty: courseDifficulty,
        estimatedHours: categoryModules.length * 2, // Estimate 2 hours per module
        isPublished: true,
      },
      create: {
        title: categoryName,
        description: `Comprehensive ${categoryName.toLowerCase()} course covering essential concepts and practical applications`,
        difficulty: courseDifficulty,
        estimatedHours: categoryModules.length * 2,
        isPublished: true,
        order: courseCategories.indexOf(categoryName) + 1,
      },
    });

    console.log(`📖 Created course: ${course.title}`);

    // Create modules for this course
    for (let i = 0; i < categoryModules.length; i++) {
      const moduleData = categoryModules[i];
      
      const module = await prisma.module.upsert({
        where: { 
          courseId_title: {
            courseId: course.id,
            title: moduleData.title
          }
        },
        update: {
          description: moduleData.summary,
          content: {
            text: moduleData.content,
            keywords: moduleData.keywords,
            geminiPromptSeed: moduleData.geminiPromptSeed,
            videoEmbedUrl: moduleData.videoEmbedUrl,
          },
          order: i + 1,
          xpReward: 100,
        },
        create: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.summary,
          content: {
            text: moduleData.content,
            keywords: moduleData.keywords,
            geminiPromptSeed: moduleData.geminiPromptSeed,
            videoEmbedUrl: moduleData.videoEmbedUrl,
          },
          order: i + 1,
          xpReward: 100,
        },
      });

      console.log(`  📝 Created module: ${module.title}`);

      // Create lessons from quiz data
      if (moduleData.quiz) {
        const lesson = await prisma.lesson.upsert({
          where: {
            moduleId_title: {
              moduleId: module.id,
              title: `${moduleData.title} - Quiz`
            }
          },
          update: {
            description: `Interactive quiz for ${moduleData.title}`,
            content: {
              quiz: moduleData.quiz,
              type: 'quiz'
            },
            type: LessonType.QUIZ,
            order: 1,
            xpReward: 50,
          },
          create: {
            moduleId: module.id,
            title: `${moduleData.title} - Quiz`,
            description: `Interactive quiz for ${moduleData.title}`,
            content: {
              quiz: moduleData.quiz,
              type: 'quiz'
            },
            type: LessonType.QUIZ,
            order: 1,
            xpReward: 50,
          },
        });

        console.log(`    🧩 Created lesson: ${lesson.title}`);
      }

      // Create a coding lesson for each module
      const codingLesson = await prisma.lesson.upsert({
        where: {
          moduleId_title: {
            moduleId: module.id,
            title: `${moduleData.title} - Practice`
          }
        },
        update: {
          description: `Hands-on coding practice for ${moduleData.title}`,
          content: {
            type: 'coding',
            starterCode: getStarterCodeForModule(moduleData.id),
            instructions: `Practice the concepts learned in ${moduleData.title}`,
          },
          type: LessonType.CODING,
          order: 2,
          xpReward: 75,
        },
        create: {
          moduleId: module.id,
          title: `${moduleData.title} - Practice`,
          description: `Hands-on coding practice for ${moduleData.title}`,
          content: {
            type: 'coding',
            starterCode: getStarterCodeForModule(moduleData.id),
            instructions: `Practice the concepts learned in ${moduleData.title}`,
          },
          type: LessonType.CODING,
          order: 2,
          xpReward: 75,
        },
      });

      console.log(`    💻 Created coding lesson: ${codingLesson.title}`);
    }
  }

  console.log('✅ Database seeding completed successfully!');
}

function getStarterCodeForModule(moduleId: string): string {
  const starterCodes: Record<string, string> = {
    'solidity-intro': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    string public greet = "Hello, Solidity learners!";
    
    function updateGreeting(string memory _newGreeting) public {
        greet = _newGreeting;
    }
    
    function getGreeting() public view returns (string memory) {
        return greet;
    }
}`,
    'contract-structure': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract StructuredContract {
    // Add your state variables here
    
    // Add your constructor here
    
    // Add your functions here
}`,
    'dev-tools': `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Practice using development tools with this contract
contract DevToolsPractice {
    uint256 public value;
    
    constructor(uint256 _initialValue) {
        value = _initialValue;
    }
    
    function setValue(uint256 _newValue) public {
        value = _newValue;
    }
}`,
  };

  return starterCodes[moduleId] || `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Practice {
    // Your code here
}`;
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
