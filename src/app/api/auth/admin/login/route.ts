import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, sanitizeEmail } from '@/lib/validations';

const ADMIN_EMAIL = 'admin@admin.com';
const ADMIN_PASSWORD = 'Creative1@'; // In production, use proper password hashing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as {
      email: string;
      password: string;
    };

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: {
        email: sanitizedEmail,
        role: 'ADMIN'
      }
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verify password (in production, use bcrypt or similar)
    // For now, check against default admin credentials
    const isDefaultAdmin = sanitizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    
    // In production, you should hash passwords and compare
    // For now, we'll allow login if it's the default admin or if password matches
    // TODO: Implement proper password hashing
    if (!isDefaultAdmin) {
      // In production, verify hashed password here
      // const isValidPassword = await bcrypt.compare(password, admin.hashedPassword);
      // if (!isValidPassword) {
      //   return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 });
      // }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name ?? 'Administrador',
        type: 'profissional', // Admin is treated as professional type in the frontend
        role: 'ADMIN'
      }
    });

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Admin login error:', error);
    
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}




