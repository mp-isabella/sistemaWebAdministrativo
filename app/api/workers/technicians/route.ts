import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth/next"
import { NextRequest, NextResponse } from "next/server"

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener todos los trabajadores (técnicos, secretarias, administradores) activos
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: ["TECNICO", "SECRETARIA", "ADMINISTRADOR"]
          }
        },
        isActive: true,
        name: {
          not: ""
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
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
        },
        assignedJobs: {
          select: {
            updatedAt: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Mapear técnicos con información adicional
    const mappedTechnicians = technicians.map(tech => {
      // Mapear roles de la base de datos a roles de display
      let displayRole = tech.role.name;
      switch (tech.role.name) {
        case 'TECNICO':
          displayRole = 'TECNICO';
          break;
        case 'SECRETARIA':
          displayRole = 'SECRETARIA';
          break;
        case 'ADMINISTRADOR':
          displayRole = 'ADMINISTRADOR';
          break;
        default:
          displayRole = tech.role.name;
      }

      return {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        phone: tech.phone,
        role: displayRole,
        company: tech.company?.name || "Améstica Ltda", // Usar empresa real o fallback
        companyId: tech.company?.id || null,
        fechaIngreso: tech.createdAt,
        ultimaActividad: tech.assignedJobs[0]?.updatedAt || tech.updatedAt,
        isActive: tech.isActive,
        totalJobs: 0 // Valor por defecto
      };
    })

    return NextResponse.json(mappedTechnicians)
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

    const body = await request.json()

    // Validar datos requeridos
    if (!body.name || !body.email || !body.role || !body.company) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Mapear roles de display a roles de base de datos
    let dbRole = body.role;
    switch (body.role) {
      case 'TECNICO':
        dbRole = 'TECNICO';
        break;
      case 'SECRETARIA':
        dbRole = 'SECRETARIA';
        break;
      case 'ADMINISTRADOR':
        dbRole = 'ADMINISTRADOR';
        break;
      default:
        return NextResponse.json({ error: "Rol no válido" }, { status: 400 })
    }

    // Obtener el ID del rol
    const role = await prisma.role.findUnique({
      where: { name: dbRole }
    })

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 400 })
    }

    // Obtener el ID de la empresa
    const company = await prisma.company.findFirst({
      where: { name: body.company }
    })

    if (!company) {
      return NextResponse.json({ error: "Empresa no encontrada" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    })

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 })
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        roleId: role.id,
        companyId: company.id,
        password: hashedPassword
      },
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
    let displayRole = newUser.role.name;
    switch (newUser.role.name) {
      case 'TECNICO':
        displayRole = 'TECNICO';
        break;
      case 'SECRETARIA':
        displayRole = 'SECRETARIA';
        break;
      case 'ADMINISTRADOR':
        displayRole = 'ADMINISTRADOR';
        break;
    }

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: displayRole,
      company: newUser.company?.name || "Améstica Ltda",
      companyId: newUser.company?.id || null,
      isActive: newUser.isActive,
      totalJobs: 0,
      success: true
    }, { status: 201 })
  } catch (error) {
    
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
