import { prisma } from './db';
import { toJsonString } from './json-utils';

const ADMIN_EMAIL = 'admin@admin.com';

/**
 * Initialize the database with default admin user
 * Call this function on application startup or as a migration script
 */
export async function initializeDatabase() {
  try {
    // Check if default admin exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        email: ADMIN_EMAIL,
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('✅ Default admin already exists');
      return { success: true, admin: existingAdmin };
    }

    // Create default admin
    const admin = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Admin OASIS da Superdotação',
        role: 'ADMIN',
        profile: toJsonString({
          isAdmin: true,
          isDefault: true,
          createdAt: new Date().toISOString()
        })
      }
    });

    console.log('✅ Default admin created successfully');
    return { success: true, admin, created: true };
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return { success: false, error };
  }
}

/**
 * Initialize default blog if it doesn't exist
 */
export async function initializeBlog() {
  try {
    let blog = await prisma.blog.findFirst();

    if (!blog) {
      blog = await prisma.blog.create({
        data: {
          title: 'Estudos do OASIS',
          description: 'Blog do OASIS da Superdotação'
        }
      });
      console.log('✅ Default blog created successfully');
      return { success: true, blog, created: true };
    }

    console.log('✅ Default blog already exists');
    return { success: true, blog };
  } catch (error) {
    console.error('❌ Error initializing blog:', error);
    return { success: false, error };
  }
}

/**
 * Initialize all default data
 */
export async function initializeAll() {
  const results = {
    admin: await initializeDatabase(),
    blog: await initializeBlog()
  };

  return results;
}

