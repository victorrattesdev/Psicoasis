import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const therapistId = req.nextUrl.searchParams.get('therapistId');
    if (!therapistId) return NextResponse.json({ error: 'Missing therapistId' }, { status: 400 });

    const [todayCount, patientsCount, monthlyRevenue] = await Promise.all([
      prisma.session.count({
        where: {
          therapistId,
          scheduledAt: {
            gte: new Date(new Date().setHours(0,0,0,0)),
            lt: new Date(new Date().setHours(24,0,0,0))
          }
        }
      }),
      prisma.session.findMany({
        where: { therapistId },
        select: { userId: true },
        distinct: ['userId']
      }).then(list => list.length),
      Promise.resolve(0), // no billing model yet
    ]);

    return NextResponse.json({ todayCount, patientsCount, monthlyRevenue });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}








