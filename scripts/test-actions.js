// Script para probar las acciones del sistema (asignar técnico, editar, eliminar)

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testActions() {
  try {

    // 1. Buscar un trabajo sin técnico asignado
    
    const unassignedJobs = await prisma.job.findMany({
      where: {
        technicianId: null,
        status: 'PENDING'
      },
      include: {
        client: true,
        service: true,
        company: true
      },
      take: 1
    })

    if (unassignedJobs.length === 0) {
      
      return
    }

    const job = unassignedJobs[0]

    .toLocaleDateString('es-ES') : 'Sin fecha'}`)

    // 2. Buscar un técnico disponible
    
    const technicians = await prisma.user.findMany({
      where: {
        role: {
          name: 'TECNICO'
        },
        isActive: true
      },
      take: 1
    })

    if (technicians.length === 0) {
      
      return
    }

    const technician = technicians[0]

    // 3. Probar la asignación de técnico
    
    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        technicianId: technician.id,
        updatedAt: new Date()
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        client: true,
        service: true,
        company: true
      }
    })

    // 4. Verificar que la asignación se guardó correctamente
    
    const verifyJob = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (verifyJob?.technician?.id === technician.id) {
      
    } else {
      
    }

    // 5. Probar la desasignación
    
    const unassignedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        technicianId: null,
        updatedAt: new Date()
      },
      include: {
        technician: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

// Ejecutar las pruebas
testActions()
