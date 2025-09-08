import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions as any)
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Solo admin y secretaria pueden descargar reportes
    const userRole = (session as any).user?.role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para descargar reportes' }, { status: 403 })
    }

    const reportId = params.id

    if (!reportId) {
      return NextResponse.json({ error: 'ID de reporte requerido' }, { status: 400 })
    }

    // Por ahora, generar un PDF simulado
    // En una implementación real, obtendrías el reporte de la base de datos
    // y generarías el PDF real

    // Simular contenido del reporte
    const reportContent = `
      <html>
        <head>
          <title>Reporte ${reportId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 30px; }
            .content { margin-bottom: 20px; }
            .footer { text-align: center; margin-top: 40px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Reporte del Sistema</h1>
            <p>Generado el: ${new Date().toLocaleDateString('es-CL')}</p>
          </div>
          <div class="content">
            <h2>Información del Reporte</h2>
            <p><strong>ID:</strong> ${reportId}</p>
            <p><strong>Generado por:</strong> ${(session as any).user?.name || 'Sistema'}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
            <p><strong>Hora:</strong> ${new Date().toLocaleTimeString('es-CL')}</p>
          </div>
          <div class="footer">
            <p>Este es un reporte generado por el Sistema Web Administrativo de Améstica</p>
          </div>
        </body>
      </html>
    `

    // Convertir HTML a PDF (simulado)
    // En una implementación real, usarías una librería como puppeteer o jsPDF
    const pdfBuffer = Buffer.from(reportContent, 'utf-8')

    // Devolver como descarga
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="reporte-${reportId}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('Error downloading report:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
