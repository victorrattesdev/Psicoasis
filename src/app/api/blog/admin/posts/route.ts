import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromJsonString } from "@/lib/json-utils";

export async function GET(req: NextRequest) {
  try {
    // Get user from headers or session to verify admin access
    // For now, we'll allow access - in production, add proper auth check
    
    const posts = await prisma.post.findMany({
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




