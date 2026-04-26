import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type ActivityItem = {
  id: string;
  type: 'user' | 'therapist' | 'post';
  title: string;
  description: string;
  createdAt: string;
};

export async function GET(req: NextRequest) {
  try {
    const unauthorized = await requireAdmin(req);
    if (unauthorized) return unauthorized;

    const [users, therapists, posts] = await Promise.all([
      prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 6
      }),
      prisma.therapist.findMany({
        select: { id: true, name: true, approved: true, createdAt: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 6
      }),
      prisma.post.findMany({
        where: { published: true },
        select: { id: true, title: true, publishedAt: true, createdAt: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: 6
      })
    ]);

    const activities: ActivityItem[] = [
      ...users
        .filter((user) => user.role !== 'ADMIN')
        .map((user) => {
          const displayName = user.name?.trim() || user.email || 'Paciente';
          return {
            id: user.id,
            type: 'user',
            title: 'Novo paciente cadastrado',
            description: `${displayName} se registrou como paciente.`,
            createdAt: user.createdAt.toISOString()
          };
        }),
      ...users
        .filter((user) => user.updatedAt.getTime() > user.createdAt.getTime())
        .map((user) => {
          const displayName = user.name?.trim() || user.email || 'Usuário';
          const title = user.role === 'ADMIN'
            ? 'Permissão de admin atualizada'
            : 'Cadastro de paciente atualizado';
          const description = user.role === 'ADMIN'
            ? `${displayName} está com perfil de administrador.`
            : `${displayName} teve o cadastro atualizado.`;
          return {
            id: `${user.id}-update`,
            type: 'user',
            title,
            description,
            createdAt: user.updatedAt.toISOString()
          };
        }),
      ...therapists.map((therapist) => {
        const displayName = therapist.name?.trim() || 'Profissional';
        return {
          id: therapist.id,
          type: 'therapist',
          title: 'Novo psicólogo cadastrado',
          description: `${displayName} se registrou como psicólogo.`,
          createdAt: therapist.createdAt.toISOString()
        };
      }),
      ...therapists
        .filter((therapist) => therapist.updatedAt.getTime() > therapist.createdAt.getTime())
        .map((therapist) => {
          const displayName = therapist.name?.trim() || 'Profissional';
          const statusText = therapist.approved ? 'aprovado' : 'pendente';
          return {
            id: `${therapist.id}-update`,
            type: 'therapist',
            title: 'Status de psicólogo atualizado',
            description: `${displayName} está com status ${statusText}.`,
            createdAt: therapist.updatedAt.toISOString()
          };
        }),
      ...posts.map((post) => {
        const publishedAt = post.publishedAt ?? post.createdAt;
        return {
          id: post.id,
          type: 'post',
          title: 'Novo post publicado',
          description: `"${post.title}" foi publicado.`,
          createdAt: publishedAt.toISOString()
        };
      })
    ];

    const sorted = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);

    return NextResponse.json({ activities: sorted });
  } catch (error) {
    console.error('Error fetching admin activity:', error);
    return NextResponse.json({ error: 'Failed to load recent activity' }, { status: 500 });
  }
}
