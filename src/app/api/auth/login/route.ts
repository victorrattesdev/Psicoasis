import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, sanitizeEmail } from '@/lib/validations';
import { signUserToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { id: 'auth-login', limit: 10, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { email, password, type } = body as {
      email: string;
      password: string;
      type: 'paciente' | 'profissional'
    };

    if (!email || !password || !type) {
      return NextResponse.json(
        { error: 'Email, senha e tipo de usuário são obrigatórios' },
        { status: 400 }
      );
    }

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

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      const token = await signUserToken({
        sub: user.id,
        email: user.email,
        name: user.name ?? '',
        type: 'paciente',
        role: user.role
      });

      return NextResponse.json({
        success: true,
        token,
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

      if (!therapist || !therapist.password) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      const valid = await bcrypt.compare(password, therapist.password);
      if (!valid) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        );
      }

      const token = await signUserToken({
        sub: therapist.id,
        email: therapist.email,
        name: therapist.name,
        type: 'profissional',
        role: 'USER'
      });

      return NextResponse.json({
        success: true,
        token,
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
