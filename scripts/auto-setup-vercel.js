#!/usr/bin/env node

const { execSync } = require('child_process');
const https = require('https');

console.log('🚀 Auto-setup para Vercel...');

// Función para hacer POST request
function makePostRequest(url, data) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(data);

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(url, options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    resolve(result);
                } catch (e) {
                    resolve({ success: false, error: 'Invalid JSON response' });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function setupDatabase() {
    try {
        console.log('📡 Intentando configurar base de datos...');

        // Obtener URL de Vercel
        const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://sistemawebadministrativo.vercel.app';
        const setupUrl = `${vercelUrl}/api/setup-database`;

        console.log('🔗 URL de setup:', setupUrl);

        const result = await makePostRequest(setupUrl, {});

        if (result.success) {
            console.log('✅ Base de datos configurada exitosamente');
            console.log('👤 Credenciales disponibles:');
            console.log('   Admin:', result.credentials?.admin);
            console.log('   Secretaria:', result.credentials?.secretaria);
            console.log('   Técnico:', result.credentials?.tecnico);
        } else {
            console.log('❌ Error configurando base de datos:', result.error);
        }

    } catch (error) {
        console.log('⚠️ No se pudo configurar automáticamente:', error.message);
        console.log('💡 Configuración manual requerida');
    }
}

// Solo ejecutar en Vercel
if (process.env.VERCEL === '1') {
    setupDatabase();
} else {
    console.log('ℹ️ No es Vercel, saltando auto-setup');
}
