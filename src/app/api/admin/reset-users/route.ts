import { NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { toJsonString } from '@/lib/json-utils';

const ADMIN_EMAIL = 'admin@admin.com';

export async function POST() {
  try {
    // Delete all non-admin users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: { not: ADMIN_EMAIL },
        role: { not: 'ADMIN' }
      }
    });

    // Delete all non-admin therapists
    const deletedTherapists = await prisma.therapist.deleteMany({
      where: {
        email: { not: ADMIN_EMAIL }
      }
    });

    // Ensure admin exists as a User with ADMIN role
    let admin = await prisma.user.findFirst({
      where: {
        email: ADMIN_EMAIL,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: 'Admin OASIS da Superdotação',
          role: 'ADMIN',
          profile: toJsonString({
            isAdmin: true,
            isDefault: true,
            createdAt: new Date().toISOString()
          })
        }
      });
    } else {
      // Update admin to ensure it has ADMIN role
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          role: 'ADMIN',
          profile: toJsonString({
            isAdmin: true,
            isDefault: true,
            updatedAt: new Date().toISOString()
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      deletedUsers: deletedUsers.count,
      deletedTherapists: deletedTherapists.count,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Reset users error:', error);
    
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao resetar usuários' },
      { status: 500 }
    );
  }
}
