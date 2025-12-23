# 🗄️ Configuração do Banco de Dados

Este guia vai te ajudar a configurar o banco de dados rapidamente.

## 🚀 Opção 1: SQLite (Recomendado para Desenvolvimento - Mais Fácil)

SQLite não precisa de instalação ou configuração adicional. É perfeito para desenvolvimento local.

### Passos:

1. **Criar arquivo `.env` na raiz do projeto:**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

2. **Trocar o schema para SQLite:**
   ```bash
   # Backup do schema atual
   copy prisma\schema.prisma prisma\schema.postgres.prisma
   
   # Usar schema SQLite
   copy prisma\schema.sqlite.prisma prisma\schema.prisma
   ```

3. **Gerar Prisma Client e criar banco:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Inicializar dados padrão:**
   ```bash
   # Acesse no navegador ou use curl:
   # GET http://localhost:3000/api/auth/admin/register
   ```

## 🐘 Opção 2: PostgreSQL (Produção)

### Usando Docker (Mais Fácil):

1. **Iniciar PostgreSQL com Docker:**
   ```bash
   docker-compose up -d
   ```

2. **Criar arquivo `.env`:**
   ```env
   DATABASE_URL="postgresql://psicoasis:psicoasis@localhost:5432/psicoasis"
   ```

3. **Aplicar migrações:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

### Instalação Manual do PostgreSQL:

1. **Instalar PostgreSQL** (se ainda não tiver)
2. **Criar banco de dados:**
   ```sql
   CREATE DATABASE psicoasis;
   ```

3. **Criar arquivo `.env`:**
   ```env
   DATABASE_URL="postgresql://seu_usuario:sua_senha@localhost:5432/psicoasis"
   ```

4. **Aplicar migrações:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

## ✅ Verificar se está funcionando:

Após configurar, teste criando uma conta. Se funcionar, o banco está configurado corretamente!

## 🔧 Troubleshooting

### Erro: "DATABASE_URL must start with postgresql://"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Verifique se a URL está correta
- Para SQLite, use: `DATABASE_URL="file:./prisma/dev.db"`

### Erro: "Can't reach database server"
- Se usando PostgreSQL, verifique se o servidor está rodando
- Se usando Docker, execute: `docker-compose up -d`
- Verifique se a porta 5432 está disponível

### Erro: "Migration failed"
- Execute: `npx prisma migrate reset` (cuidado: apaga todos os dados)
- Ou: `npx prisma db push` (sincroniza sem criar migrações)




