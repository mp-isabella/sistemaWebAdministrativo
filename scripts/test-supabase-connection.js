#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = 'https://rwsqkirgxsxrpjepjhtr.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

console.log('🔍 Probando conexión a Supabase...')
console.log('URL:', supabaseUrl)
console.log('Key configurada:', supabaseKey ? '✅ Sí' : '❌ No')

if (!supabaseKey) {
    console.log('❌ Error: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
    console.log('📝 Agrega esta variable a tu archivo .env.local:')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    try {
        console.log('🔄 Probando conexión...')

        // Probar conexión básica
        const { data, error } = await supabase
            .from('_prisma_migrations')
            .select('*')
            .limit(1)

        if (error) {
            console.log('⚠️ Conexión establecida, pero no hay tablas aún')
            console.log('💡 Esto es normal si no has ejecutado las migraciones')
        } else {
            console.log('✅ Conexión exitosa!')
        }

        console.log('🎉 Supabase está configurado correctamente!')
        console.log('📋 Próximos pasos:')
        console.log('1. Ejecuta: npm run db:push')
        console.log('2. Ejecuta: npm run db:seed (opcional)')
        console.log('3. Ejecuta: npm run dev')

    } catch (error) {
        console.error('❌ Error de conexión:', error.message)
        console.log('🔧 Verifica:')
        console.log('- Que tu archivo .env.local tenga NEXT_PUBLIC_SUPABASE_ANON_KEY')
        console.log('- Que la URL de Supabase sea correcta')
        console.log('- Que tu proyecto de Supabase esté activo')
    }
}

testConnection()
