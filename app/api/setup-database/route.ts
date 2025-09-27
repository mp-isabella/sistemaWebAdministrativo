import { execSync } from 'child_process';
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
    try {
        console.log('🚀 Iniciando configuración de base de datos...');

        // Ejecutar script de configuración
        execSync('node scripts/setup-database-simple.js', {
            stdio: 'inherit',
            env: {
                ...process.env,
                DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Base de datos configurada exitosamente',
            credentials: {
                admin: 'admin@amestica.cl / admin123',
                secretaria: 'secretaria@amestica.cl / secretaria123',
                tecnico: 'tecnico@amestica.cl / tecnico123'
            }
        });
    } catch (error) {
        console.error('❌ Error configurando base de datos:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, { status: 500 });
    }
}
