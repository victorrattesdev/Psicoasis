import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const where: any = { published: true };
    if (category && category !== "Todos") {
      where.category = category;
    }

    const posts = await prisma.post.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        category: true,
        publishedAt: true,
        metaTitle: true,
        metaDescription: true,
        authorUser: {
          select: { name: true, email: true },
        },
        authorTherapist: {
          select: { name: true, email: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    const formatted = posts.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      coverImage: p.coverImage,
      category: p.category,
      publishedAt: p.publishedAt,
      author: p.authorUser?.name || p.authorTherapist?.name || "Autor",
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
    }));

    return NextResponse.json({ posts: formatted });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load posts" },
      { status: 500 }
    );
  }
}
