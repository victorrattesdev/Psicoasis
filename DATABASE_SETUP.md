# Database Setup Guide

Este guia explica como configurar e usar o banco de dados do projeto OASIS da Superdotação.

## 📋 Pré-requisitos

1. PostgreSQL instalado e rodando
2. Node.js e npm instalados
3. Arquivo `.env` configurado com `DATABASE_URL`

## 🔧 Configuração Inicial

### 1. Configurar DATABASE_URL

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_do_banco"
```

Exemplo:
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/psicoasis"
```

### 2. Executar Migrações

```bash
# Gerar o Prisma Client
npx prisma generate

# Aplicar as migrações ao banco de dados
npx prisma migrate dev

# OU, se preferir sincronizar sem criar migrações
npx prisma db push
```

### 3. Inicializar Dados Padrão

O sistema criará automaticamente:
- **Admin padrão**: `admin@admin.com` (senha: `Creative1@`)
- **Blog padrão**: "Estudos do OASIS"

Você também pode inicializar manualmente fazendo uma requisição GET para:
```
GET /api/auth/admin/register
```

## 📚 Estrutura do Banco de Dados

### Modelos Principais

#### User (Usuários/Pacientes)
- `id`: ID único
- `email`: Email único
- `name`: Nome do usuário
- `role`: USER ou ADMIN
- `profile`: Dados adicionais em JSON

#### Therapist (Psicólogos)
- `id`: ID único
- `email`: Email único
- `name`: Nome do psicólogo
- `license`: Licença profissional (CRP)
- `specialties`: Especialidades (JSON array)
- `approved`: Se está aprovado pelo admin
- `canPostBlog`: Se pode criar posts no blog

#### Post (Posts do Blog)
- `id`: ID único
- `title`: Título do post
- `slug`: URL amigável (único)
- `content`: Conteúdo do post
- `published`: Se está publicado
- `publishedAt`: Data de publicação

## 🔐 Autenticação

### Registro de Paciente

```typescript
POST /api/auth/register
{
  "email": "paciente@email.com",
  "name": "Nome do Paciente",
  "type": "paciente",
  "profile": {
    "telefone": "(11) 99999-9999",
    "dataNascimento": "1990-01-01"
  }
}
```

### Registro de Psicólogo

```typescript
POST /api/auth/register
{
  "email": "psicologo@email.com",
  "name": "Dr. João Silva",
  "type": "profissional",
  "profile": {
    "crp": "CRP 06/123456",
    "especialidades": ["Ansiedade", "Depressão"],
    "formacao": "Psicologia - USP",
    "bio": "Descrição do profissional"
  }
}
```

### Login

```typescript
POST /api/auth/login
{
  "email": "usuario@email.com",
  "type": "paciente" // ou "profissional"
}
```

### Login Admin

```typescript
POST /api/auth/admin/login
{
  "email": "admin@admin.com",
  "password": "Creative1@"
}
```

## ✅ Validações Implementadas

### Email
- Formato válido de email
- Normalização (lowercase, trim)
- Verificação de duplicatas

### Nome
- Mínimo 2 caracteres
- Máximo 100 caracteres
- Trim de espaços

### CRP (para psicólogos)
- Formato: `CRP XX/XXXXXX`
- Validação de padrão

## 🛠️ Melhores Práticas Implementadas

1. **Validação de Entrada**: Todas as APIs validam dados de entrada
2. **Sanitização**: Dados são sanitizados antes de salvar
3. **Tratamento de Erros**: Erros do Prisma são tratados adequadamente
4. **Índices**: Campos frequentemente consultados têm índices
5. **Cascata**: Relacionamentos configurados com onDelete apropriado
6. **Type Safety**: TypeScript em todo o código
7. **Logging**: Logs apropriados para desenvolvimento e produção

## 🔍 Consultas Comuns

### Buscar todos os usuários
```typescript
const users = await prisma.user.findMany();
```

### Buscar psicólogos aprovados
```typescript
const therapists = await prisma.therapist.findMany({
  where: { approved: true }
});
```

### Buscar posts publicados
```typescript
const posts = await prisma.post.findMany({
  where: {
    published: true,
    publishedAt: { not: null }
  },
  orderBy: { publishedAt: 'desc' }
});
```

## 🚨 Troubleshooting

### Erro: "DATABASE_URL must start with postgresql://"
- Verifique se a URL no `.env` está correta
- Certifique-se de que começa com `postgresql://` ou `postgres://`

### Erro: "Unique constraint violation"
- O email já está cadastrado
- Verifique se não está tentando criar duplicatas

### Erro: "Record not found"
- O registro que você está tentando acessar não existe
- Verifique o ID ou email usado na consulta

## 📝 Notas Importantes

- **Senhas**: Atualmente não há hash de senhas. Em produção, implemente bcrypt ou similar.
- **Admin padrão**: Criado automaticamente com email `admin@admin.com`
- **Aprovação de psicólogos**: Psicólogos precisam ser aprovados por um admin antes de aparecerem publicamente






