import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Get counts in parallel for better performance
    const [
      usersCount,
      therapistsCount,
      postsCount,
      sessionsCount,
      sessionsCompleted,
      sessionsScheduled
    ] = await Promise.all([
      // Count users (excluding admins or including them - adjust as needed)
      prisma.user.count({
        where: {
          role: { not: 'ADMIN' }
        }
      }),
      // Count therapists
      prisma.therapist.count(),
      // Count all posts
      prisma.post.count(),
      // Count all sessions
      prisma.session.count(),
      // Count completed sessions
      prisma.session.count({
        where: {
          status: 'COMPLETED'
        }
      }),
      // Count scheduled sessions
      prisma.session.count({
        where: {
          status: 'SCHEDULED'
        }
      })
    ]);

    return NextResponse.json({
      users: usersCount,
      therapists: therapistsCount,
      posts: postsCount,
      sessions: sessionsCount,
      sessionsCompleted,
      sessionsScheduled
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to load statistics' },
      { status: 500 }
    );
  }
}




