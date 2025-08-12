import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import PDFDocument from "pdfkit"

export const dynamic = "force-dynamic" // Esto evita el error de prerenderizado estático

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    if (!["admin", "secretaria"].includes(session.user.role)) {
      return NextResponse.json({ error: "Sin permisos para exportar reportes" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "general"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")

    const jobs = await prisma.job.findMany({
      where: {
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
        ...(clientId && { clientId }),
        ...(technicianId && { assignedToId: technicianId }),
      },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on("data", (chunk: Buffer) => chunks.push(chunk))

    const pdfBufferPromise = new Promise<NextResponse>((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="reporte-${type}-${new Date()
                .toISOString()
                .split("T")[0]}.pdf"`,
            },
          }),
        )
      })
    })

    // Generar contenido del PDF
    doc.fontSize(20).text("Amestica - Reporte de Trabajos", { align: "center" })
    doc.moveDown()
    doc.fontSize(12).text(`Fecha de generación: ${new Date().toLocaleDateString("es-CL")}`)
    doc.text(`Tipo de reporte: ${type}`)
    doc.moveDown()

    jobs.forEach((job, index) => {
      if (index > 0) doc.addPage()

      doc.fontSize(14).text(`Trabajo #${job.id}`, { underline: true })
      doc.moveDown(0.5)

      doc.fontSize(10)
      doc.text(`Cliente: ${job.client.name}`)
      doc.text(`Servicio: ${job.service.name}`)
      doc.text(`Estado: ${job.status}`)
      doc.text(`Técnico: ${job.technician?.name || "No asignado"}`)
      doc.text(
        `Fecha programada: ${
          job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString("es-CL") : "No programada"
        }`,
      )
      doc.text(
        `Fecha completada: ${
          job.completedAt ? new Date(job.completedAt).toLocaleDateString("es-CL") : "No completada"
        }`,
      )
      doc.moveDown()

      if (job.description) {
        doc.text("Descripción:")
        doc.text(job.description, { indent: 20 })
        doc.moveDown()
      }

      if (job.images.length > 0) {
        doc.text(`Evidencias: ${job.images.length} imagen(es)`)
        doc.moveDown()
      }
    })

    doc.end()

    return pdfBufferPromise
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Error generando reporte" }, { status: 500 })
  }
}
