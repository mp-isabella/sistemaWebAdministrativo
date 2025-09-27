import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientId = searchParams.get("clientId")
    const technicianId = searchParams.get("technicianId")
    const companyId = searchParams.get("companyId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {}

    // Filtros por rol
    if ((session.user as any).role.toLowerCase() === "tecnico") {
      where.technicianId = session.user.id
    }

    if (status && status !== "all") {
      where.status = status
    }

    if (clientId) {
      where.clientId = clientId
    }

    if (technicianId) {
      where.technicianId = technicianId
    }

    if (companyId) {
      where.companyId = companyId
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    const workOrders = await prisma.job.findMany({
      where,
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true,
        company: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(workOrders)
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Permitir que admin, secretaria y técnicos creen órdenes de trabajo
    if (!["admin", "secretaria", "tecnico"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    const body = await request.json()

    const {
      title,
      description,
      clientId,
      serviceId,
      companyId,
      technicianId,
      scheduledAt,
      startTime,
      endTime,
      priority,
      address,
      notes,
      items
    } = body

    // Validar datos requeridos
    if (!title || !clientId || !serviceId || !companyId) {
      return NextResponse.json({ error: "Datos requeridos faltantes" }, { status: 400 })
    }

    // Generar número único de orden de trabajo
    const workOrderNumber = `OT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`

    // Calcular totales si hay items
    let subtotal = 0
    let tax = 0
    let total = 0
    const taxRate = 19 // IVA chileno

    if (items && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      tax = subtotal * (taxRate / 100)
      total = subtotal + tax
    }

    // Crear la orden de trabajo
    const workOrder = await (prisma as any).workOrder.create({
      data: {
        workOrderNumber,
        title,
        description,
        clientId,
        serviceId,
        companyId,
        technicianId: technicianId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        startTime,
        endTime,
        priority: priority || "MEDIUM",
        address,
        notes,
        subtotal,
        tax,
        total,
        taxRate,
        createdById: session.user.id
      },
      include: {
        client: true,
        service: true,
        technician: true,
        company: true,
        items: true
      }
    })

    // Crear los items si existen
    if (items && items.length > 0) {
      await Promise.all(
        items.map((item: any) =>
          (prisma as any).workOrderItem.create({
            data: {
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
              notes: item.notes,
              workOrderId: workOrder.id
            }
          })
        )
      )
    }

    return NextResponse.json(workOrder, { status: 201 })
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
