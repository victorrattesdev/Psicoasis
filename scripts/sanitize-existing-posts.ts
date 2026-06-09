/**
 * Backfill: sanitiza o HTML de posts já existentes no banco.
 *
 * A sanitização passou a ocorrer na escrita e na renderização, mas posts
 * salvos antes disso podem conter HTML não sanitizado. Rode uma vez:
 *
 *   npx tsx scripts/sanitize-existing-posts.ts
 *
 * Requer DATABASE_URL configurado (lê do .env como o app).
 */
import { prisma } from "../src/lib/db";
import { sanitizeHtml } from "../src/lib/security";

async function main() {
  const posts = await prisma.post.findMany({ select: { id: true, content: true } });
  let changed = 0;

  for (const post of posts) {
    const clean = sanitizeHtml(post.content);
    if (clean !== post.content) {
      await prisma.post.update({ where: { id: post.id }, data: { content: clean } });
      changed += 1;
      console.log(`✓ sanitizado: ${post.id}`);
    }
  }

  console.log(`\nConcluído: ${changed}/${posts.length} posts sanitizados.`);
}

main()
  .catch((err) => {
    console.error("Erro no backfill:", err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
