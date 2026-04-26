import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { fromJsonString } from "@/lib/json-utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const therapistId = searchParams.get("therapistId");
    const adminEmail = searchParams.get("adminEmail");

    let canViewAll = false;
    let whereClause: any = {};

    if (userId) {
      const user = await prisma.user.findFirst({ where: { id: userId }, select: { role: true } });
      if (user?.role === "ADMIN") {
        canViewAll = true;
      }
    }

    if (!canViewAll && adminEmail) {
      const adminUser = await prisma.user.findFirst({ where: { email: adminEmail }, select: { role: true } });
      if (adminUser?.role === "ADMIN" || adminEmail === "admin@admin.com") {
        canViewAll = true;
      }
    }

    if (!canViewAll && therapistId) {
      const therapist = await prisma.therapist.findFirst({ where: { id: therapistId }, select: { canPostBlog: true } });
      if (therapist?.canPostBlog) {
        whereClause = { authorTherapistId: therapistId };
      } else {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    if (!canViewAll && !therapistId) {
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




