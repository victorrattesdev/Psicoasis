import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Helper function to handle Prisma errors
export function handlePrismaError(error: unknown): { message: string; code?: string } {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any; message: string }
    
    switch (prismaError.code) {
      case 'P2002':
        return { 
          message: 'Este email já está cadastrado no sistema',
          code: 'UNIQUE_CONSTRAINT_VIOLATION'
        }
      case 'P2025':
        return { 
          message: 'Registro não encontrado',
          code: 'RECORD_NOT_FOUND'
        }
      case 'P2003':
        return { 
          message: 'Erro de referência: registro relacionado não encontrado',
          code: 'FOREIGN_KEY_CONSTRAINT'
        }
      default:
        return { 
          message: prismaError.message || 'Erro ao acessar o banco de dados',
          code: prismaError.code
        }
    }
  }
  
  if (error instanceof Error) {
    return { message: error.message }
  }
  
  return { message: 'Erro desconhecido ao acessar o banco de dados' }
}
