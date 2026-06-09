import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma, handlePrismaError } from '@/lib/db';
import {
  validateEmail,
  validateName,
  validatePassword,
  sanitizeEmail,
  sanitizeString
} from '@/lib/validations';
import { signUserToken } from '@/lib/jwt';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { id: 'auth-register', limit: 5, windowMs: 60_000 });
  if (limited) return limited;

  try {
    const body = await req.json();
    const { email, password, name, type, profile } = body as {
      email: string;
      password: string;
      name?: string;
      type: 'paciente' | 'profissional';
      profile?: any
    };

    if (!email || !type || !password) {
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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    const [existingUser, existingTherapist] = await Promise.all([
      prisma.user.findFirst({ where: { email: sanitizedEmail } }),
      prisma.therapist.findFirst({ where: { email: sanitizedEmail } })
    ]);

    if (existingUser || existingTherapist) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado no sistema' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (type === 'paciente') {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Nome é obrigatório' },
          { status: 400 }
        );
      }

      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }

      const created = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: sanitizeString(name) || null,
          password: passwordHash,
          profile: profile ?? null,
          role: 'USER'
        }
      });

      const token = await signUserToken({
        sub: created.id,
        email: created.email,
        name: created.name ?? '',
        type: 'paciente',
        role: created.role
      });

      return NextResponse.json({
        id: created.id,
        email: created.email,
        name: created.name ?? '',
        type: 'paciente',
        role: created.role,
        profile: (created.profile as any) ?? {},
        token
      }, { status: 201 });
    }

    if (type === 'profissional') {
      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Nome é obrigatório' },
          { status: 400 }
        );
      }

      const nameValidation = validateName(name);
      if (!nameValidation.valid) {
        return NextResponse.json(
          { error: nameValidation.error },
          { status: 400 }
        );
      }

      const created = await prisma.therapist.create({
        data: {
          email: sanitizedEmail,
          name: sanitizeString(name) || sanitizedEmail.split('@')[0],
          password: passwordHash,
          specialties: Array.isArray(profile?.especialidades) ? profile.especialidades : [],
          profile: profile ?? null,
          photoUrl: profile?.photoUrl ? sanitizeString(profile.photoUrl) : null,
          license: profile?.crp ? sanitizeString(profile.crp) : null,
          bio: profile?.bio ? sanitizeString(profile.bio) : null,
          approved: false,
          canPostBlog: false
        }
      });

      const token = await signUserToken({
        sub: created.id,
        email: created.email,
        name: created.name,
        type: 'profissional',
        role: 'USER'
      });

      return NextResponse.json({
        id: created.id,
        email: created.email,
        name: created.name,
        type: 'profissional',
        role: 'USER',
        profile: (created.profile as any) ?? {},
        token
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Tipo de usuário inválido' },
      { status: 400 }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Erro ao processar os dados. Verifique o formato da requisição.' },
        { status: 400 }
      );
    }

    const prismaError = handlePrismaError(error);

    if (prismaError.code === 'UNIQUE_CONSTRAINT_VIOLATION') {
      return NextResponse.json(
        { error: prismaError.message },
        { status: 409 }
      );
    }

    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('datasource') || errorMessage.includes('DATABASE_URL')) {
        return NextResponse.json(
          { error: 'Erro de conexão com o banco de dados. Verifique se a DATABASE_URL está configurada corretamente.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: prismaError.message || 'Erro ao realizar cadastro. Tente novamente.' },
      { status: 500 }
    );
  }
}
