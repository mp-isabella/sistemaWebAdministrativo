import { setupVercelDatabase } from "@/scripts/setup-vercel-database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Iniciando configuración de base de datos en Vercel...');

        await setupVercelDatabase();

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
