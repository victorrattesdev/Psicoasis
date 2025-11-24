import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const ADMIN_EMAIL = 'admin@admin.com';

export async function POST() {
  try {
    // Delete all non-admin users/therapists
    const [deletedUsers, deletedTherapists] = await Promise.all([
      prisma.user.deleteMany({ where: { email: { not: ADMIN_EMAIL } } }),
      prisma.therapist.deleteMany({ where: { email: { not: ADMIN_EMAIL } } })
    ]);

    // Ensure admin exists as a User with ADMIN role
    const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'Admin OASIS da Superdotação',
          role: 'ADMIN'
        }
      });
    }

    return NextResponse.json({ ok: true, deletedUsers: deletedUsers.count, deletedTherapists: deletedTherapists.count });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset users' }, { status: 500 });
  }
}







