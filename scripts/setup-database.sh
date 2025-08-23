#!/bin/bash

echo "🚀 Configurando base de datos para Amestica..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm no está instalado. Instalando pnpm..."
    npm install -g pnpm
fi

echo "📦 Instalando dependencias..."
pnpm install

echo "🗄️ Generando cliente de Prisma..."
npx prisma generate

echo "🔄 Ejecutando migraciones..."
npx prisma migrate deploy

echo "🌱 Ejecutando seed de la base de datos..."
npx prisma db seed

echo "✅ Base de datos configurada exitosamente!"
echo ""
echo "📋 Credenciales de prueba:"
echo "👨‍💼 Admin: admin@amestica.cl / admin123"
echo "👩‍💼 Secretaria: secretaria@amestica.cl / secretaria123"
echo "🔧 Técnico: tecnico@amestica.cl / tecnico123"
echo ""
echo "🔍 Para verificar la base de datos, ejecuta:"
echo "node scripts/check-database.js"
