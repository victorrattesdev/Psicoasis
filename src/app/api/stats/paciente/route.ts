import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

    const [upcomingCount, completedCount, favoritesCount] = await Promise.all([
      prisma.session.count({ where: { userId, status: 'SCHEDULED' } }),
      prisma.session.count({ where: { userId, status: 'COMPLETED' } }),
      Promise.resolve(0), // no favorites model yet
    ]);

    return NextResponse.json({ upcomingCount, completedCount, favoritesCount });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}







