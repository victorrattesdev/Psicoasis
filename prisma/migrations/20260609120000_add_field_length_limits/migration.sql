-- Limites de tamanho em campos curtos (defesa em profundidade contra abuso de armazenamento).
-- Campos grandes (content, coverImage, bio, photoUrl) permanecem TEXT; o teto é aplicado na aplicação.

-- users
ALTER TABLE "users" ALTER COLUMN "email" SET DATA TYPE VARCHAR(320);
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(200);

-- therapists
ALTER TABLE "therapists" ALTER COLUMN "email" SET DATA TYPE VARCHAR(320);
ALTER TABLE "therapists" ALTER COLUMN "name" SET DATA TYPE VARCHAR(200);
ALTER TABLE "therapists" ALTER COLUMN "license" SET DATA TYPE VARCHAR(60);

-- posts
ALTER TABLE "posts" ALTER COLUMN "title" SET DATA TYPE VARCHAR(200);
ALTER TABLE "posts" ALTER COLUMN "slug" SET DATA TYPE VARCHAR(250);
ALTER TABLE "posts" ALTER COLUMN "excerpt" SET DATA TYPE VARCHAR(600);
ALTER TABLE "posts" ALTER COLUMN "metaTitle" SET DATA TYPE VARCHAR(200);
ALTER TABLE "posts" ALTER COLUMN "metaDescription" SET DATA TYPE VARCHAR(400);
ALTER TABLE "posts" ALTER COLUMN "keywords" SET DATA TYPE VARCHAR(400);
ALTER TABLE "posts" ALTER COLUMN "category" SET DATA TYPE VARCHAR(120);
