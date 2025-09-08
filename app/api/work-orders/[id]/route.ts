import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const workOrder = await prisma.workOrder.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        service: true,
        technician: true,
        createdBy: true,
        company: true,
        items: true,
        relatedJob: true
      }
    })

    if (!workOrder) {
      return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
    }

    // Verificar permisos para técnicos
    if ((session.user as any).role.toLowerCase() === "tecnico" && workOrder.technicianId !== session.user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error("Error fetching work order:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Permitir que admin, secretaria y técnicos asignados actualicen órdenes de trabajo
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
      status,
      items 
    } = body

    // Verificar que la orden de trabajo existe
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: params.id },
      include: { items: true }
    })

    if (!existingWorkOrder) {
      return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
    }

    // Verificar permisos para técnicos
    if ((session.user as any).role.toLowerCase() === "tecnico" && existingWorkOrder.technicianId !== session.user.id) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    // Calcular totales si hay items
    let subtotal = 0
    let tax = 0
    let total = 0
    const taxRate = existingWorkOrder.taxRate

    if (items && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0)
      tax = subtotal * (taxRate / 100)
      total = subtotal + tax
    }

    // Actualizar la orden de trabajo
    const workOrder = await prisma.workOrder.update({
      where: { id: params.id },
      data: {
        title,
        description,
        clientId,
        serviceId,
        companyId,
        technicianId: technicianId || null,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        startTime,
        endTime,
        priority,
        address,
        notes,
        status,
        subtotal,
        tax,
        total
      },
      include: {
        client: true,
        service: true,
        technician: true,
        company: true,
        items: true
      }
    })

    // Actualizar items si se proporcionaron
    if (items) {
      // Eliminar items existentes
      await prisma.workOrderItem.deleteMany({
        where: { workOrderId: params.id }
      })

      // Crear nuevos items
      if (items.length > 0) {
        await Promise.all(
          items.map((item: any) =>
            prisma.workOrderItem.create({
              data: {
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
                notes: item.notes,
                workOrderId: params.id
              }
            })
          )
        )
      }
    }

    return NextResponse.json(workOrder)
  } catch (error) {
    console.error("Error updating work order:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Solo admin y secretaria pueden eliminar órdenes de trabajo
    if (!["admin", "secretaria"].includes((session.user as any).role.toLowerCase())) {
      return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
    }

    // Verificar que la orden de trabajo existe
    const existingWorkOrder = await prisma.workOrder.findUnique({
      where: { id: params.id }
    })

    if (!existingWorkOrder) {
      return NextResponse.json({ error: "Orden de trabajo no encontrada" }, { status: 404 })
    }

    // Eliminar la orden de trabajo (los items se eliminan automáticamente por CASCADE)
    await prisma.workOrder.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: "Orden de trabajo eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting work order:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
