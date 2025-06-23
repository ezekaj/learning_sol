import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PasswordUtils, registrationSchema } from '@/lib/auth/password';
import { logger } from '@/lib/monitoring/logger';
import { rateLimiter, rateLimitConfigs } from '@/lib/security/rateLimiting';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitMiddleware = rateLimiter.createMiddleware(rateLimitConfigs.registration);
    const rateLimitResult = await rateLimitMiddleware(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json();
    
    // Validate input data
    const validationResult = registrationSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('Registration validation failed', {
        metadata: {
          errors: validationResult.error.errors,
          email: body.email
        }
      });
      
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      logger.warn('Registration attempt with existing email', {
        metadata: { email }
      });
      
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(password);

    // Create user first
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    });

    // Create user profile
    await prisma.userProfile.create({
      data: {
        userId: user.id,
        skillLevel: 'BEGINNER',
        totalXP: 0,
        currentLevel: 1,
        streak: 0,
        preferences: {
          theme: 'auto',
          notifications: true,
          language: 'en'
        }
      }
    });

    const result = user;

    logger.info('User registered successfully', {
      metadata: {
        userId: result.id,
        email: result.email,
        name: result.name
      }
    });

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        createdAt: result.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    logger.error('Registration error', error instanceof Error ? error : new Error('Unknown error'));

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
