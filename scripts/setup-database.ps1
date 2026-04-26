# Script PowerShell para configurar o banco de dados
# Uso: .\scripts\setup-database.ps1 [sqlite|postgres]

param(
    [string]$dbType = "sqlite"
)

$rootDir = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $rootDir ".env"
$schemaPath = Join-Path $rootDir "prisma\schema.prisma"
$sqliteSchemaPath = Join-Path $rootDir "prisma\schema.sqlite.prisma"
$postgresSchemaPath = Join-Path $rootDir "prisma\schema.postgres.prisma"

Write-Host "🗄️  Configurando banco de dados...`n" -ForegroundColor Cyan

# Backup do schema atual
if (Test-Path $schemaPath) {
    if (-not (Test-Path $postgresSchemaPath)) {
        Copy-Item $schemaPath $postgresSchemaPath
        Write-Host "✅ Schema PostgreSQL salvo como backup" -ForegroundColor Green
    }
}

if ($dbType -eq "sqlite") {
    Write-Host "📦 Configurando SQLite...`n" -ForegroundColor Yellow
    
    # Criar .env com SQLite
    $envContent = 'DATABASE_URL="file:./prisma/dev.db"'
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ Arquivo .env criado com SQLite" -ForegroundColor Green
    
    # Usar schema SQLite
    if (Test-Path $sqliteSchemaPath) {
        Copy-Item $sqliteSchemaPath $schemaPath -Force
        Write-Host "✅ Schema SQLite aplicado" -ForegroundColor Green
    }
    
    Write-Host "`n📝 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Execute: npx prisma generate"
    Write-Host "2. Execute: npx prisma db push"
    Write-Host "3. Reinicie o servidor: npm run dev`n"
    
} elseif ($dbType -eq "postgres") {
    Write-Host "🐘 Configurando PostgreSQL...`n" -ForegroundColor Yellow
    
    # Verificar Docker
    try {
        docker --version | Out-Null
        Write-Host "✅ Docker encontrado" -ForegroundColor Green
        Write-Host "`n📝 Para iniciar PostgreSQL com Docker:" -ForegroundColor Cyan
        Write-Host "   docker-compose up -d`n"
    } catch {
        Write-Host "⚠️  Docker não encontrado. Certifique-se de ter PostgreSQL instalado.`n" -ForegroundColor Yellow
    }
    
    # Criar .env com PostgreSQL
    $envContent = 'DATABASE_URL="postgresql://psicoasis:psicoasis@localhost:5432/psicoasis"'
    Set-Content -Path $envPath -Value $envContent
    Write-Host "✅ Arquivo .env criado com PostgreSQL" -ForegroundColor Green
    
    # Usar schema PostgreSQL
    if (Test-Path $postgresSchemaPath) {
        Copy-Item $postgresSchemaPath $schemaPath -Force
        Write-Host "✅ Schema PostgreSQL aplicado" -ForegroundColor Green
    }
    
    Write-Host "`n📝 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Inicie o PostgreSQL (docker-compose up -d ou servidor local)"
    Write-Host "2. Execute: npx prisma generate"
    Write-Host "3. Execute: npx prisma migrate dev"
    Write-Host "4. Reinicie o servidor: npm run dev`n"
    
} else {
    Write-Host "❌ Tipo de banco inválido. Use: sqlite ou postgres" -ForegroundColor Red
    exit 1
}

Write-Host "✨ Configuração concluída!`n" -ForegroundColor Green






