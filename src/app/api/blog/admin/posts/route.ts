import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    let whereClause: any = {};

    if (auth.role === "ADMIN") {
      whereClause = {}; // admin vê todos
    } else if (auth.type === "profissional") {
      const therapist = await prisma.therapist.findUnique({
        where: { id: auth.sub },
        select: { canPostBlog: true },
      });
      if (!therapist?.canPostBlog) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
      whereClause = { authorTherapistId: auth.sub };
    } else {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        published: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        authorUser: {
          select: { name: true, email: true },
        },
        authorTherapist: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      category: p.category,
      published: p.published,
      publishedAt: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : null,
      createdAt: p.createdAt.toISOString().split('T')[0],
      updatedAt: p.updatedAt.toISOString().split('T')[0],
      author: p.authorUser?.name || p.authorTherapist?.name || "Autor",
      status: p.published ? "published" : "draft",
    }));

    return NextResponse.json({ posts: formatted });
  } catch (error) {
    console.error("Error loading admin posts:", error);
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}




