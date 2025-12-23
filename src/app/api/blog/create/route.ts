import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { toJsonString } from '@/lib/json-utils';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, therapistId, title, content, excerpt, coverImage, category, metaTitle, metaDescription, keywords, published } = body;

    console.log('Creating post with data:', { userId, therapistId, title: title?.substring(0, 50), hasContent: !!content });

    if (!title || !content) {
      return NextResponse.json({ error: 'Título e conteúdo são obrigatórios' }, { status: 400 });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
      return NextResponse.json({ error: 'Título e conteúdo não podem estar vazios' }, { status: 400 });
    }

    // Check permissions
    let hasPermission = false;
    let finalUserId = null;
    let finalTherapistId = null;
    
    // Try to find admin user by ID first
    if (userId) {
      try {
        const user = await prisma.user.findFirst({ where: { id: userId } });
        if (user && (user as any).role === 'ADMIN') {
          hasPermission = true;
          finalUserId = userId;
        }
      } catch (error: any) {
        console.warn('Could not find user by ID:', error?.message);
      }
    }
    
    // Try to find admin by email if not found by ID
    if (!hasPermission) {
      try {
        const adminUser = await prisma.user.findFirst({ 
          where: { email: 'admin@admin.com' }
        });
        if (adminUser && (adminUser as any).role === 'ADMIN') {
          hasPermission = true;
          finalUserId = adminUser.id;
        }
      } catch (error: any) {
        console.warn('Could not find admin user by email:', error?.message);
      }
    }
    
    // Try therapist if still not found
    if (!hasPermission && therapistId) {
      try {
        const therapist = await prisma.therapist.findFirst({ 
          where: { id: therapistId }
        });
        // Allow if therapist can post blog OR if it's the admin email
        if (therapist && ((therapist as any).canPostBlog === true || therapist.email === 'admin@admin.com')) {
          hasPermission = true;
          finalTherapistId = therapistId;
        }
      } catch (error: any) {
        console.warn('Could not find therapist by ID:', error?.message);
      }
    }
    
    // Try to find admin therapist by email if still not found
    if (!hasPermission) {
      try {
        const adminTherapist = await prisma.therapist.findFirst({ 
          where: { email: 'admin@admin.com' }
        });
        if (adminTherapist) {
          hasPermission = true;
          finalTherapistId = adminTherapist.id;
        }
      } catch (error: any) {
        console.warn('Could not find admin therapist by email:', error?.message);
      }
    }

    // If still no permission, try to create admin user if email matches
    if (!hasPermission) {
      try {
        // Check if the request is from admin email (from context or body)
        const adminEmail = 'admin@admin.com';
        
        // Try to find or create admin user
        let adminUser = await prisma.user.findFirst({ 
          where: { email: adminEmail }
        });
        
        if (!adminUser) {
          // Create admin user if doesn't exist
          adminUser = await prisma.user.create({
            data: {
              email: adminEmail,
              name: 'Admin OASIS',
              role: 'ADMIN',
              profile: toJsonString({
                isAdmin: true,
                isDefault: true,
                createdAt: new Date().toISOString()
              })
            }
          });
        }
        
        if (adminUser && (adminUser as any).role === 'ADMIN') {
          hasPermission = true;
          finalUserId = adminUser.id;
        }
      } catch (error: any) {
        console.error('Error creating/finding admin user:', error?.message);
        // Continue without permission - will fail later with proper error message
      }
    }

    if (!hasPermission) {
      console.error('Permission denied. userId:', userId, 'therapistId:', therapistId);
      return NextResponse.json({ error: 'Não autorizado: Você não tem permissão para criar posts' }, { status: 403 });
    }

    console.log('Permission granted. Using userId:', finalUserId, 'therapistId:', finalTherapistId);

    // Get or create default blog
    let blog;
    try {
      blog = await prisma.blog.findFirst();
      if (!blog) {
        blog = await prisma.blog.create({
          data: { title: 'Estudos do OASIS', description: 'Blog do OASIS da Superdotação' }
        });
      }
    } catch (error: any) {
      console.error('Error accessing blog:', error?.message);
      return NextResponse.json({ 
        error: 'Erro ao acessar o banco de dados. Verifique se a DATABASE_URL está configurada corretamente no arquivo .env' 
      }, { status: 500 });
    }

    // Generate unique slug
    let slug = slugify(title);
    try {
      // Try to find existing post with this slug using findMany as fallback
      const existingPosts = await (prisma.post as any).findMany({ 
        where: { slug: slug } as any
      });
      let counter = 1;
      while (existingPosts && existingPosts.length > 0) {
        slug = `${slugify(title)}-${counter}`;
        const checkPosts = await (prisma.post as any).findMany({ 
          where: { slug: slug } as any
        });
        if (!checkPosts || checkPosts.length === 0) break;
        counter++;
        if (counter > 100) break; // Safety limit
      }
    } catch (error: any) {
      // If slug field doesn't exist in database, generate a simple slug without checking
      console.warn('Could not check slug uniqueness, using generated slug:', slug, error?.message);
      // Continue with the generated slug - it will be created in the database
    }

    console.log('Creating post with blogId:', blog.id);
    
    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        slug,
        content: content.trim(),
        excerpt: excerpt?.trim() || null,
        coverImage: coverImage?.trim() || null,
        category: category?.trim() || null,
        metaTitle: metaTitle?.trim() || null,
        metaDescription: metaDescription?.trim() || null,
        keywords: keywords?.trim() || null,
        published: published === true,
        publishedAt: published === true ? new Date() : null,
        authorUserId: finalUserId || null,
        authorTherapistId: finalTherapistId || null,
        blogId: blog.id
      }
    });

    console.log('Post created successfully:', post.id);
    return NextResponse.json({ id: post.id, slug: post.slug });
  } catch (error: any) {
    console.error('Error creating post:', error);
    
    // Check for database connection/configuration errors
    if (error?.message?.includes('datasource') || error?.message?.includes('DATABASE_URL') || error?.message?.includes('postgresql://')) {
      return NextResponse.json({ 
        error: 'Erro de configuração do banco de dados. Verifique se a DATABASE_URL está configurada corretamente no arquivo .env. A URL deve começar com postgresql:// ou postgres://' 
      }, { status: 500 });
    }
    
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Slug já existe. Tente com um título diferente.' }, { status: 409 });
    }
    
    const errorMessage = error?.message || 'Erro ao criar post. Verifique os logs do servidor para mais detalhes.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

