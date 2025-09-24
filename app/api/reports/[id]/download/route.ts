import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from 'next/server'
// import { generatePDF } from '@/lib/pdf-generator'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params

    // Obtener el reporte
    const report = await (prisma as any).report.findUnique({
      where: { id },
      include: {
        company: true,
        createdBy: true,
        metrics: true
      }
    })

    if (!report) {
      return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 })
    }

    // Verificar permisos
    const userRole = (session.user as any).role?.toLowerCase()
    if (userRole === 'tecnico') {
      return NextResponse.json({ error: 'Sin permisos para descargar reportes' }, { status: 403 })
    }

    // Si el reporte ya tiene un PDF generado, devolverlo
    if (report.filePath && report.status === 'COMPLETED') {
      // Incrementar contador de descargas
      await (prisma as any).report.update({
        where: { id },
        data: { downloadCount: { increment: 1 } }
      })

      // Devolver el archivo existente
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.title}.pdf"`
        }
      })
    }

    // Generar PDF si no existe
    if (report.status !== 'COMPLETED' || !report.data) {
      return NextResponse.json({ error: 'Reporte no está listo para descarga' }, { status: 400 })
    }

    JSON.parse(report.data)

    // Generar PDF con el estilo de la empresa
    // const pdfBuffer = await generatePDF({
    //   report,
    //   data: reportData,
    //   company: report.company
    // })

    // Por ahora, crear un PDF simple
    const pdfBuffer = Buffer.from('PDF placeholder - implementar generación real')

    // Guardar el PDF
    const fileName = `${report.title}_${report.year}_${report.month || 'anual'}.pdf`
    const filePath = `/reports/${fileName}`

    // En un entorno real, aquí guardarías el archivo en el sistema de archivos o S3
    // Por ahora, solo actualizamos la base de datos
    await (prisma as any).report.update({
      where: { id },
      data: {
        filePath,
        fileSize: pdfBuffer.length,
        downloadCount: { increment: 1 }
      }
    })

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}