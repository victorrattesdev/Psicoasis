import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { sanitizeEmail } from '@/lib/validations';

const isProd = process.env.NODE_ENV === 'production';

export async function POST(req: NextRequest) {
  try {
    const unauthorized = await requireAdmin(req);
    if (unauthorized) return unauthorized;

    // Confirmação explícita para operação destrutiva (apaga todos os não-admins).
    const body = await req.json().catch(() => ({}));
    if (body?.confirm !== 'RESET') {
      return NextResponse.json(
        { error: 'Operação destrutiva: envie { "confirm": "RESET" } para confirmar.' },
        { status: 400 }
      );
    }

    // O e-mail do admin vem do ambiente — nunca hardcoded.
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL ? sanitizeEmail(process.env.ADMIN_EMAIL) : null;
    if (!ADMIN_EMAIL) {
      return NextResponse.json({ error: 'ADMIN_EMAIL não configurado' }, { status: 500 });
    }

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
          name: process.env.ADMIN_NAME || 'Administrador',
          role: 'ADMIN',
          profile: {
            isAdmin: true,
            isDefault: true,
            createdAt: new Date().toISOString()
          }
        }
      });
    } else {
      // Update admin to ensure it has ADMIN role
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          role: 'ADMIN',
          profile: {
            isAdmin: true,
            isDefault: true,
            updatedAt: new Date().toISOString()
          }
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
      { error: isProd ? 'Erro ao resetar usuários' : (prismaError.message || 'Erro ao resetar usuários') },
      { status: 500 }
    );
  }
}
