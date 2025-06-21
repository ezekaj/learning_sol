import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code, name, language = 'solidity' } = await request.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and name are required' }, { status: 400 });
    }

    // For free tier, we'll just return success
    // In production, you would save to database
    const savedCode = {
      id: Date.now().toString(),
      name,
      code,
      language,
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json({ 
      success: true, 
      savedCode: {
        id: savedCode.id,
        name: savedCode.name,
        language: savedCode.language,
        createdAt: savedCode.createdAt,
      }
    });

  } catch (error) {
    console.error('Error saving code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For free tier, return empty array
    // In production, you would fetch from database
    return NextResponse.json({ savedCodes: [] });

  } catch (error) {
    console.error('Error fetching saved codes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
