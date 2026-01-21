# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Psicoasis (OASIS da Superdotação) is a mental health platform connecting patients with licensed psychologists. Built with Next.js 15 (App Router) using Turbopack, React 19, TypeScript, Prisma ORM, and Tailwind CSS 4.

## Commands

```bash
# Development
pnpm dev                 # Start dev server with Turbopack

# Build & Production
pnpm build              # Build for production
pnpm start              # Start production server

# Linting
pnpm lint               # Run ESLint

# Database (Prisma with SQLite)
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema to database (no migrations)
pnpm db:migrate         # Run migrations
pnpm db:studio          # Open Prisma Studio GUI

# Docker (PostgreSQL for alternative setup)
docker-compose up -d    # Start PostgreSQL container
```

## Architecture

### Directory Structure
- `src/app/` - Next.js App Router pages and API routes
- `src/app/api/` - REST API endpoints using Route Handlers
- `src/components/` - Reusable React components
- `src/contexts/` - React Context providers (AuthContext)
- `src/lib/` - Shared utilities (db, validations, json-utils)
- `prisma/` - Database schema and migrations

### Key Patterns

**Database Access**: Use singleton Prisma client from `@/lib/db`:
```typescript
import { prisma, handlePrismaError } from '@/lib/db';
```

**Path Alias**: `@/*` maps to `./src/*`

**API Routes**: Follow Next.js Route Handler pattern in `src/app/api/[endpoint]/route.ts`. All APIs validate input using utilities from `@/lib/validations.ts`.

**Authentication**: Client-side via `AuthContext` with localStorage persistence. Two user types: `paciente` (User model) and `profissional` (Therapist model).

**JSON in SQLite**: Profile data stored as JSON strings. Use `@/lib/json-utils` for serialization.

### Data Models (Prisma)
- **User**: Patients with email, name, role (USER/ADMIN), profile JSON
- **Therapist**: Professionals with license, specialties, approval status, blog permissions
- **Session**: Therapy sessions linking users and therapists
- **Post/Blog**: Blog content with SEO fields, authored by users or therapists

### User Roles & Flows
- **Paciente**: Patient registration → login → dashboard
- **Profissional**: Therapist registration → admin approval → can post to blog if authorized
- **Admin**: Hardcoded credentials (admin@admin.com / Creative1@), manages therapist approvals and blog

## Language

The application UI and documentation is in Brazilian Portuguese. Code comments and variable names use a mix of English and Portuguese.
