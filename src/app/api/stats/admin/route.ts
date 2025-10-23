import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const [users, therapists, posts, sessions, sessionsCompleted, sessionsScheduled] = await Promise.all([
      prisma.user.count(),
      prisma.therapist.count(),
      prisma.post.count(),
      prisma.session.count(),
      prisma.session.count({ where: { status: 'COMPLETED' } }),
      prisma.session.count({ where: { status: 'SCHEDULED' } }),
    ]);

    return NextResponse.json({ users, therapists, posts, sessions, sessionsCompleted, sessionsScheduled });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}






