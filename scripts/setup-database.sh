Write-Host "🚀 Configurando base de datos PostgreSQL para amestica..."

# Verificar si psql está disponible
if (-not (Get-Command "psql.exe" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ PostgreSQL no está instalado. Por favor instálalo primero."
    Write-Host "Windows: Descargar desde https://www.postgresql.org/download/"
    Exit 1
}

# Verificar si PostgreSQL está corriendo
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgService -eq $null -or $pgService.Status -ne "Running") {
    Write-Host "❌ PostgreSQL no está corriendo. Intentando iniciar el servicio..."
    try {
        Start-Service -Name $pgService.Name
        Start-Sleep -Seconds 3
    } catch {
        Write-Host "❌ No se pudo iniciar el servicio PostgreSQL. Por favor inícialo manualmente."
        Exit 1
    }
}

Write-Host "✅ PostgreSQL está corriendo"

# Crear base de datos y usuario
Write-Host "📝 Creando base de datos y usuario..."
& "psql" -U postgres -f "scripts\create-database.sql"

# Configurar Prisma
Write-Host "🔧 Configurando Prisma..."
npx prisma generate
npx prisma db push

# Ejecutar seed
Write-Host "🌱 Ejecutando seed de datos..."
npm run db:seed

# Información final
Write-Host "`n✅ ¡Configuración completada!"
Write-Host "`n📋 Información de la base de datos:"
Write-Host "🔗 URL: postgresql://postgres:0513@localhost:5432/db_amestica"
Write-Host "`n👥 Usuarios creados:"
Write-Host "👨‍💼 Admin: admin@amestica.cl / admin123"
Write-Host "👩‍💼 Secretaria: secretaria@amestica.cl / secretaria123"
Write-Host "🔧 Operador: operador@amestica.cl / operador123"
Write-Host "`n🚀 Para iniciar el proyecto:"
Write-Host "npm run dev"
Write-Host "`n🎯 Para abrir Prisma Studio:"
Write-Host "npm run db:studio"
