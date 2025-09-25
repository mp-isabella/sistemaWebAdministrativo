#!/usr/bin/env node

const https = require('https');

console.log('🔍 Verificando estado de Supabase...');
console.log('');

// Verificar si el proyecto de Supabase está activo
const supabaseUrl = 'https://rwsqkirgxsxrpjepjhtr.supabase.co';
const projectId = 'rwsqkirgxsxrpjepjhtr';

console.log('📊 Información del proyecto:');
console.log('   Project ID:', projectId);
console.log('   Supabase URL:', supabaseUrl);
console.log('');

// Probar conexión HTTP a Supabase
console.log('🔗 Probando conexión HTTP a Supabase...');
const options = {
    hostname: 'rwsqkirgxsxrpjepjhtr.supabase.co',
    port: 443,
    path: '/',
    method: 'GET',
    timeout: 10000
};

const req = https.request(options, (res) => {
    console.log('   ✅ Conexión HTTP exitosa');
    console.log('   Status:', res.statusCode);
    console.log('   Headers:', res.headers);
});

req.on('error', (error) => {
    console.log('   ❌ Error de conexión HTTP:', error.message);
    console.log('   💡 Posibles causas:');
    console.log('   1. El proyecto de Supabase está pausado');
    console.log('   2. El proyecto no existe o fue eliminado');
    console.log('   3. Problema de red desde Vercel');
});

req.on('timeout', () => {
    console.log('   ⏰ Timeout de conexión');
    console.log('   💡 El servidor de Supabase no responde');
});

req.setTimeout(10000);
req.end();

console.log('');
console.log('🔧 Soluciones posibles:');
console.log('   1. Verificar que el proyecto de Supabase esté activo');
console.log('   2. Verificar que la contraseña sea correcta');
console.log('   3. Probar con una nueva contraseña en Supabase');
console.log('   4. Verificar que no haya límites de conexión');
