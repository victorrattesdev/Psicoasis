-- Add new nullable columns to posts
ALTER TABLE "posts" ADD COLUMN "slug" TEXT;
ALTER TABLE "posts" ADD COLUMN "coverImage" TEXT;
ALTER TABLE "posts" ADD COLUMN "metaTitle" TEXT;
ALTER TABLE "posts" ADD COLUMN "metaDescription" TEXT;
ALTER TABLE "posts" ADD COLUMN "keywords" TEXT;
ALTER TABLE "posts" ADD COLUMN "category" TEXT;
ALTER TABLE "posts" ADD COLUMN "authorTherapistId" TEXT;
ALTER TABLE "posts" ADD COLUMN "authorUserId" TEXT;

-- Copy existing authorId into authorUserId
UPDATE "posts" SET "authorUserId" = "authorId";

-- Generate slug from id for any existing rows
UPDATE "posts" SET "slug" = "id" WHERE "slug" IS NULL;

-- Make slug NOT NULL
ALTER TABLE "posts" ALTER COLUMN "slug" SET NOT NULL;

-- Drop old FK and column authorId
ALTER TABLE "posts" DROP CONSTRAINT "posts_authorId_fkey";
ALTER TABLE "posts" DROP COLUMN "authorId";

-- Add new FKs
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorTherapistId_fkey" FOREIGN KEY ("authorTherapistId") REFERENCES "therapists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Update blogId FK to CASCADE
ALTER TABLE "posts" DROP CONSTRAINT "posts_blogId_fkey";
ALTER TABLE "posts" ADD CONSTRAINT "posts_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update sessions/messages FKs to CASCADE
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" DROP CONSTRAINT "messages_sessionId_fkey";
ALTER TABLE "messages" ADD CONSTRAINT "messages_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" DROP CONSTRAINT "messages_userId_fkey";
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Unique index on slug
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");

-- Indexes
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "therapists_email_idx" ON "therapists"("email");
CREATE INDEX "therapists_approved_idx" ON "therapists"("approved");
CREATE INDEX "therapists_canPost_idx" ON "therapists"("canPost");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "sessions_therapistId_idx" ON "sessions"("therapistId");
CREATE INDEX "sessions_status_idx" ON "sessions"("status");
CREATE INDEX "sessions_scheduledAt_idx" ON "sessions"("scheduledAt");
CREATE INDEX "messages_sessionId_idx" ON "messages"("sessionId");
CREATE INDEX "messages_userId_idx" ON "messages"("userId");
CREATE INDEX "messages_createdAt_idx" ON "messages"("createdAt");
CREATE INDEX "posts_slug_idx" ON "posts"("slug");
CREATE INDEX "posts_published_idx" ON "posts"("published");
CREATE INDEX "posts_publishedAt_idx" ON "posts"("publishedAt");
CREATE INDEX "posts_category_idx" ON "posts"("category");
CREATE INDEX "posts_authorUserId_idx" ON "posts"("authorUserId");
CREATE INDEX "posts_authorTherapistId_idx" ON "posts"("authorTherapistId");
CREATE INDEX "posts_blogId_idx" ON "posts"("blogId");

-- CreateTable course_contents
CREATE TABLE "course_contents" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "course_contents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "course_contents_key_key" ON "course_contents"("key");
