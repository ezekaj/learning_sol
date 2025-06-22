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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status') || 'ACTIVE';

    // Get user's collaborations
    const collaborations = await prisma.collaboration.findMany({
      where: {
        participants: {
          some: {
            id: session.user.id,
          },
        },
        ...(type && { type: type as any }),
        status: status as any,
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        chatMessages: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ collaborations });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, type, maxParticipants = 2 } = await request.json();

    if (!title || !type) {
      return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
    }

    // Create new collaboration session
    const collaboration = await prisma.collaboration.create({
      data: {
        title,
        description,
        type,
        maxParticipants,
        participants: {
          connect: { id: session.user.id },
        },
      },
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ collaboration });
  } catch (error) {
    console.error('Error creating collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collaborationId, action, userId } = await request.json();

    if (!collaborationId || !action) {
      return NextResponse.json({ error: 'Collaboration ID and action are required' }, { status: 400 });
    }

    // Get collaboration to check permissions
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        participants: true,
      },
    });

    if (!collaboration) {
      return NextResponse.json({ error: 'Collaboration not found' }, { status: 404 });
    }

    const isParticipant = collaboration.participants.some(p => p.id === session.user.id);
    
    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized to modify this collaboration' }, { status: 403 });
    }

    let updatedCollaboration;

    switch (action) {
      case 'join':
        if (userId && collaboration.participants.length < collaboration.maxParticipants) {
          updatedCollaboration = await prisma.collaboration.update({
            where: { id: collaborationId },
            data: {
              participants: {
                connect: { id: userId },
              },
            },
            include: {
              participants: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          });
        } else {
          return NextResponse.json({ error: 'Cannot join collaboration' }, { status: 400 });
        }
        break;

      case 'leave':
        updatedCollaboration = await prisma.collaboration.update({
          where: { id: collaborationId },
          data: {
            participants: {
              disconnect: { id: session.user.id },
            },
          },
          include: {
            participants: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        });
        break;

      case 'complete':
        updatedCollaboration = await prisma.collaboration.update({
          where: { id: collaborationId },
          data: {
            status: 'COMPLETED',
          },
          include: {
            participants: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ collaboration: updatedCollaboration });
  } catch (error) {
    console.error('Error updating collaboration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
