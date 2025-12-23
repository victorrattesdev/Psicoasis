import { NextRequest, NextResponse } from 'next/server';
import { prisma, handlePrismaError } from '@/lib/db';
import { validateEmail, validateName, sanitizeEmail, sanitizeString } from '@/lib/validations';
import { toJsonString, fromJsonString } from '@/lib/json-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, type, profile } = body as { 
      email: string; 
      name?: string; 
      type: 'paciente' | 'profissional'; 
      profile?: any 
    };

    console.log('Registration attempt:', { email, type, hasName: !!name });

    // Validate required fields
    if (!email || !type) {
      return NextResponse.json(
        { error: 'Email e tipo de usuário são obrigatórios' },
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

    const sanitizedEmail = sanitizeEmail(email);

    // Check if email already exists in either table
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

    if (type === 'paciente') {
      // Validate name for patients
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
          profile: profile ? JSON.stringify(profile) : null,
          role: 'USER'
        }
      });

      return NextResponse.json({
        id: created.id,
        email: created.email,
        name: created.name ?? '',
        type: 'paciente',
        role: created.role,
        profile: created.profile ?? {}
      }, { status: 201 });
    }

    // Professional registration
    if (type === 'profissional') {
      // Validate name for professionals
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
          specialties: toJsonString(Array.isArray(profile?.especialidades) ? profile.especialidades : []),
          profile: toJsonString(profile),
          photoUrl: profile?.photoUrl ? sanitizeString(profile.photoUrl) : null,
          license: profile?.crp ? sanitizeString(profile.crp) : null,
          bio: profile?.bio ? sanitizeString(profile.bio) : null,
          approved: false,
          canPostBlog: false
        }
      });

      return NextResponse.json({
        id: created.id,
        email: created.email,
        name: created.name,
        type: 'profissional',
        role: 'USER',
        profile: fromJsonString(created.profile as string) ?? {}
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Tipo de usuário inválido' },
      { status: 400 }
    );

  } catch (error: unknown) {
    console.error('Registration error:', error);
    
    // Check if it's a JSON parsing error
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

    // Check for database connection errors
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
