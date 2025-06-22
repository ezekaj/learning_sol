import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// Configure for dynamic API routes
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all courses (learning paths) with modules and lessons
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: {
              include: {
                userProgress: {
                  where: {
                    userId: session.user.id,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        enrollments: {
          where: {
            userId: session.user.id,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform courses to learning paths format
    const learningPaths = courses.map((course: any) => {
      const userEnrollment = course.enrollments[0];
      const isEnrolled = !!userEnrollment;
      
      // Calculate course progress
      const totalLessons = course.modules.reduce((total: number, module: any) => 
        total + module.lessons.length, 0);
      const completedLessons = course.modules.reduce((total: number, module: any) => 
        total + module.lessons.filter((lesson: any) => 
          lesson.userProgress.some((progress: any) => progress.status === 'COMPLETED')
        ).length, 0);
      
      const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      // Transform modules
      const transformedModules = course.modules.map((module: any) => {
        const moduleLessons = module.lessons.length;
        const moduleCompletedLessons = module.lessons.filter((lesson: any) => 
          lesson.userProgress.some((progress: any) => progress.status === 'COMPLETED')
        ).length;
        const moduleProgress = moduleLessons > 0 ? Math.round((moduleCompletedLessons / moduleLessons) * 100) : 0;

        // Transform lessons
        const transformedLessons = module.lessons.map((lesson: any) => {
          const userProgress = lesson.userProgress[0];
          const isCompleted = userProgress?.status === 'COMPLETED';
          
          return {
            id: lesson.id,
            title: lesson.title,
            description: lesson.description || '',
            duration: lesson.estimatedDuration || 30,
            difficulty: lesson.difficulty?.toLowerCase() || 'beginner',
            type: lesson.type?.toLowerCase() || 'text',
            completed: isCompleted,
            locked: false, // TODO: Implement lesson locking logic
            xpReward: lesson.xpReward || 50,
          };
        });

        return {
          id: module.id,
          title: module.title,
          description: module.description || '',
          category: 'fundamentals',
          difficulty: module.difficulty?.toLowerCase() || 'beginner',
          estimatedHours: module.estimatedHours || 2,
          lessons: transformedLessons,
          completed: moduleProgress === 100,
          progress: moduleProgress,
          unlocked: true, // TODO: Implement module unlocking logic
        };
      });

      return {
        id: course.id,
        title: course.title,
        description: course.description || '',
        modules: transformedModules,
        totalHours: course.estimatedHours || 40,
        completionRate,
        studentsEnrolled: course._count.enrollments,
        rating: 4.8, // TODO: Implement course rating system
        isEnrolled,
        enrolledAt: userEnrollment?.enrolledAt,
      };
    });

    return NextResponse.json({ learningPaths });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, courseId, moduleId, lessonId } = await request.json();

    switch (action) {
      case 'enroll':
        if (!courseId) {
          return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.courseEnrollment.findUnique({
          where: {
            userId_courseId: {
              userId: session.user.id,
              courseId,
            },
          },
        });

        if (existingEnrollment) {
          return NextResponse.json({ error: 'Already enrolled' }, { status: 400 });
        }

        // Create enrollment
        const enrollment = await prisma.courseEnrollment.create({
          data: {
            userId: session.user.id,
            courseId,
          },
        });

        return NextResponse.json({ success: true, enrollment });

      case 'start_lesson':
        if (!lessonId) {
          return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
        }

        // Create or update lesson progress
        const lessonProgress = await prisma.userProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId,
            },
          },
          update: {
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
          create: {
            userId: session.user.id,
            lessonId,
            status: 'IN_PROGRESS',
            startedAt: new Date(),
          },
        });

        return NextResponse.json({ success: true, progress: lessonProgress });

      case 'complete_lesson':
        if (!lessonId) {
          return NextResponse.json({ error: 'Lesson ID required' }, { status: 400 });
        }

        // Get lesson details for XP reward
        const lesson = await prisma.lesson.findUnique({
          where: { id: lessonId },
        });

        if (!lesson) {
          return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        // Update lesson progress
        const completedProgress = await prisma.userProgress.upsert({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId,
            },
          },
          update: {
            status: 'COMPLETED',
            completedAt: new Date(),
            progress: 100,
          },
          create: {
            userId: session.user.id,
            lessonId,
            status: 'COMPLETED',
            completedAt: new Date(),
            progress: 100,
          },
        });

        // Award XP
        const xpReward = lesson.xpReward || 50;
        await prisma.userProfile.upsert({
          where: { userId: session.user.id },
          update: {
            totalXP: {
              increment: xpReward,
            },
          },
          create: {
            userId: session.user.id,
            totalXP: xpReward,
          },
        });

        return NextResponse.json({ 
          success: true, 
          progress: completedProgress,
          xpAwarded: xpReward 
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing learning path action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
