#!/usr/bin/env node

/**
 * Script para configurar o banco de dados automaticamente
 * Uso: node scripts/setup-database.js [sqlite|postgres]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const dbType = args[0] || 'sqlite'; // default to sqlite

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
const sqliteSchemaPath = path.join(rootDir, 'prisma', 'schema.sqlite.prisma');
const postgresSchemaPath = path.join(rootDir, 'prisma', 'schema.postgres.prisma');

console.log('🗄️  Configurando banco de dados...\n');

// Backup do schema atual se existir
if (fs.existsSync(schemaPath) && !fs.existsSync(postgresSchemaPath)) {
  fs.copyFileSync(schemaPath, postgresSchemaPath);
  console.log('✅ Schema PostgreSQL salvo como backup');
}

if (dbType === 'sqlite') {
  console.log('📦 Configurando SQLite...\n');
  
  // Criar .env com SQLite
  const envContent = 'DATABASE_URL="file:./prisma/dev.db"\n';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado com SQLite');
  
  // Usar schema SQLite
  if (fs.existsSync(sqliteSchemaPath)) {
    fs.copyFileSync(sqliteSchemaPath, schemaPath);
    console.log('✅ Schema SQLite aplicado');
  }
  
  console.log('\n📝 Próximos passos:');
  console.log('1. Execute: npx prisma generate');
  console.log('2. Execute: npx prisma db push');
  console.log('3. Reinicie o servidor: npm run dev\n');
  
} else if (dbType === 'postgres') {
  console.log('🐘 Configurando PostgreSQL...\n');
  
  // Verificar se Docker está disponível
  try {
    execSync('docker --version', { stdio: 'ignore' });
    console.log('✅ Docker encontrado');
    console.log('\n📝 Para iniciar PostgreSQL com Docker:');
    console.log('   docker-compose up -d\n');
  } catch (e) {
    console.log('⚠️  Docker não encontrado. Certifique-se de ter PostgreSQL instalado.\n');
  }
  
  // Criar .env com PostgreSQL
  const envContent = 'DATABASE_URL="postgresql://psicoasis:psicoasis@localhost:5432/psicoasis"\n';
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Arquivo .env criado com PostgreSQL');
  
  // Usar schema PostgreSQL
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
    console.log('✅ Schema PostgreSQL aplicado');
  }
  
  console.log('\n📝 Próximos passos:');
  console.log('1. Inicie o PostgreSQL (docker-compose up -d ou servidor local)');
  console.log('2. Execute: npx prisma generate');
  console.log('3. Execute: npx prisma migrate dev');
  console.log('4. Reinicie o servidor: npm run dev\n');
  
} else {
  console.error('❌ Tipo de banco inválido. Use: sqlite ou postgres');
  process.exit(1);
}

console.log('✨ Configuração concluída!\n');






