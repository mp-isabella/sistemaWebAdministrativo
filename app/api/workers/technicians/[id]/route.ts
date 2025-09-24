import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true }
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar el usuario
    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `Usuario ${user.name} eliminado exitosamente`,
      success: true
    })
  } catch (error) {

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

    const { id } = params
    const body = await request.json()

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, company: true }
    })

    if (!existingUser) {

      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Mapear roles de display a roles de base de datos
    let dbRole = body.role;
    switch (body.role) {
      case 'Técnico':
        dbRole = 'TECNICO';
        break;
      case 'Secretaria':
        dbRole = 'SECRETARIA';
        break;
      case 'Administrador':
        dbRole = 'ADMIN';
        break;
      case 'TECNICO':
        dbRole = 'TECNICO';
        break;
      case 'SECRETARIA':
        dbRole = 'SECRETARIA';
        break;
      case 'ADMIN':
        dbRole = 'ADMIN';
        break;
    }

    // Obtener el ID del rol
    const role = await prisma.role.findUnique({
      where: { name: dbRole }
    })

    if (!role) {

      return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Obtener el ID de la empresa si se proporciona
    let companyId = existingUser.company?.id
    if (body.company && body.company !== existingUser.company?.name) {
      const company = await prisma.company.findFirst({
        where: { name: body.company }
      })

      if (!company) {
        return NextResponse.json({ error: "Empresa no encontrada" }, { status: 400 })
      }
      companyId = company.id
    }

    // Preparar datos de actualización
    const updateData: any = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      isActive: body.isActive,
      roleId: role.id,
      ...(companyId && { companyId })
    }

    // Solo actualizar contraseña si se proporciona
    if (body.password && body.password.trim() !== "") {
      updateData.password = await bcrypt.hash(body.password, 12)
    }

    // Actualizar el usuario

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        role: {
          select: {
            name: true
          }
        },
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Mapear el rol de vuelta para la respuesta
    let displayRole = updatedUser.role.name;
    switch (updatedUser.role.name) {
      case 'TECNICO':
        displayRole = 'Técnico';
        break;
      case 'SECRETARIA':
        displayRole = 'Secretaria';
        break;
      case 'ADMIN':
        displayRole = 'Administrador';
        break;
    }

    const response = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: displayRole,
      company: updatedUser.company?.name || "Améstica Ltda",
      companyId: updatedUser.company?.id || null,
      isActive: updatedUser.isActive,
      totalJobs: 0,
      success: true
    }

    return NextResponse.json(response)
  } catch (error) {

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
