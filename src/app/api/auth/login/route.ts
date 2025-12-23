import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, sanitizeEmail } from '@/lib/validations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type } = body as { 
      email: string; 
      type: 'paciente' | 'profissional' 
    };

    // Validate required fields
    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email e tipo de usuário são obrigatórios' },
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

    if (type === 'paciente') {
      const user = await prisma.user.findFirst({ 
        where: { email: sanitizedEmail }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name ?? '',
          type: 'paciente',
          role: user.role
        }
      });
    }

    if (type === 'profissional') {
      const therapist = await prisma.therapist.findFirst({ 
        where: { email: sanitizedEmail }
      });

      if (!therapist) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: therapist.id,
          email: therapist.email,
          name: therapist.name,
          type: 'profissional',
          role: 'USER',
          approved: therapist.approved,
          canPostBlog: therapist.canPostBlog
        }
      });
    }

    return NextResponse.json(
      { error: 'Tipo de usuário inválido' },
      { status: 400 }
    );

  } catch (error: unknown) {
    const prismaError = handlePrismaError(error);
    console.error('Login error:', error);
    
    return NextResponse.json(
      { error: prismaError.message || 'Erro ao fazer login. Tente novamente.' },
      { status: 500 }
    );
  }
}
