import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, validateName, sanitizeEmail, sanitizeString } from '@/lib/validations';
import { toJsonString } from '@/lib/json-utils';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'Creative1@'; // In production, this should be hashed

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body as {
      email: string;
      password: string;
      name?: string;
    };

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate password (basic check - in production use proper validation)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Administrador com este email já existe' },
        { status: 409 }
      );
    }

    // Check if email exists as regular user
    const existingUser = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado como usuário regular' },
        { status: 409 }
      );
    }

    // Validate name if provided
    if (name) {
      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name: sanitizeString(name) || 'Administrador',
        role: 'ADMIN',
        profile: toJsonString({
          isAdmin: true,
          createdAt: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      name: admin.name ?? '',
      role: admin.role,
      message: 'Administrador criado com sucesso'
    }, { status: 201 });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Admin registration error:', error);

    if (prismaError.code === 'UNIQUE_CONSTRAINT_VIOLATION') {
      return NextResponse.json(
        { error: prismaError.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: prismaError.message || 'Erro ao criar administrador. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Initialize default admin if it doesn't exist
export async function GET() {
  try {
    const defaultAdmin = await prisma.user.findFirst({
      where: {
        email: ADMIN_EMAIL,
        role: 'ADMIN'
      }
    });

    if (defaultAdmin) {
      return NextResponse.json({
        exists: true,
        message: 'Administrador padrão já existe'
      });
    }

    // Create default admin
    const admin = await prisma.user.create({
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

    return NextResponse.json({
      exists: false,
      created: true,
      message: 'Administrador padrão criado com sucesso',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name
      }
    }, { status: 201 });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Default admin initialization error:', error);
    
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao inicializar administrador padrão' },
      { status: 500 }
    );
  }
}

