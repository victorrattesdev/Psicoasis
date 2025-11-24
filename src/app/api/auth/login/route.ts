import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type } = body as { email: string; type: 'paciente' | 'profissional' };
    if (!email || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    if (type === 'paciente') {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return NextResponse.json({ success: false }, { status: 401 });
      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name ?? '', type: 'paciente', role: user.role } });
    } else {
      const therapist = await prisma.therapist.findUnique({ where: { email } });
      if (!therapist) return NextResponse.json({ success: false }, { status: 401 });
      return NextResponse.json({ success: true, user: { id: therapist.id, email: therapist.email, name: therapist.name, type: 'profissional', role: 'USER' } });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}







