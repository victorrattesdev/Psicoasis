import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    if (auth.role !== 'ADMIN' && auth.sub !== userId) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

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








