# ✅ Configuração SQLite Concluída!

O banco de dados foi configurado para usar **SQLite** para desenvolvimento local.

## 📋 O que foi feito:

1. ✅ Schema Prisma atualizado para SQLite
2. ✅ Arquivo `.env` configurado com `DATABASE_URL="file:./prisma/dev.db"`
3. ✅ Banco de dados criado em `prisma/dev.db`
4. ✅ Todas as APIs atualizadas para lidar com campos JSON (convertidos para String no SQLite)
5. ✅ Funções helper criadas em `src/lib/json-utils.ts` para conversão JSON ↔ String

## 🔧 Mudanças Técnicas:

### Schema Prisma
- Provider alterado de `postgresql` para `sqlite`
- Campos `Json` alterados para `String` (SQLite não tem tipo JSON nativo)

### APIs Atualizadas
Todas as APIs que usam campos `profile` ou `specialties` foram atualizadas:
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/admin/register/route.ts`
- `src/app/api/admin/users/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/admin/reset-users/route.ts`
- `src/app/api/therapists/public/route.ts`
- `src/app/api/therapists/[id]/route.ts`
- `src/app/api/blog/create/route.ts`
- `src/lib/init-db.ts`

### Funções Helper
- `toJsonString(value)`: Converte objeto/array para string JSON
- `fromJsonString(value)`: Converte string JSON para objeto/array
- `parseJsonField(value)`: Parse seguro de campos JSON

## 🚀 Próximos Passos:

1. **Reinicie o servidor** (se estiver rodando):
   ```bash
   # Pare o servidor (Ctrl+C) e reinicie:
   npm run dev
   ```

2. **Teste criar uma conta**:
   - Acesse `/registro/paciente` ou `/registro/profissional`
   - Tente criar uma conta
   - Deve funcionar agora! ✅

3. **Inicializar admin padrão** (opcional):
   - Acesse: `GET http://localhost:3000/api/auth/admin/register`
   - Ou o sistema criará automaticamente na primeira execução

## 📝 Notas:

- **SQLite** é perfeito para desenvolvimento local - não precisa de servidor de banco
- O arquivo `prisma/dev.db` contém todos os dados
- Para produção, você pode voltar para PostgreSQL alterando o schema e DATABASE_URL
- Todos os dados JSON são armazenados como strings e convertidos automaticamente

## 🔄 Voltar para PostgreSQL (se necessário):

1. Altere `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Altere os campos `String` de volta para `Json`:
   ```prisma
   profile   Json?
   specialties Json @default("[]")
   ```

3. Atualize `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/psicoasis"
   ```

4. Execute:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

---

✨ **Tudo pronto! O sistema está funcionando com SQLite!**






