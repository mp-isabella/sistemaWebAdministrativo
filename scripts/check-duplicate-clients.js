const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDuplicateClients() {
  try {

    // Obtener todos los clientes
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'asc' }
    })

    // Buscar duplicados por email
    const emailGroups = {}
    const phoneGroups = {}
    const nameGroups = {}
    
    clients.forEach(client => {
      // Agrupar por email
      if (client.email) {
        if (!emailGroups[client.email]) {
          emailGroups[client.email] = []
        }
        emailGroups[client.email].push(client)
      }
      
      // Agrupar por teléfono
      if (client.phone) {
        if (!phoneGroups[client.phone]) {
          phoneGroups[client.phone] = []
        }
        phoneGroups[client.phone].push(client)
      }
      
      // Agrupar por nombre
      if (client.name) {
        if (!nameGroups[client.name]) {
          nameGroups[client.name] = []
        }
        nameGroups[client.name].push(client)
      }
    })
    
    // Mostrar duplicados por email
    
    Object.entries(emailGroups).forEach(([email, clientList]) => {
      if (clientList.length > 1) {
        
        clientList.forEach(client => {
          
        })
      }
    })
    
    // Mostrar duplicados por teléfono
    
    Object.entries(phoneGroups).forEach(([phone, clientList]) => {
      if (clientList.length > 1) {
        
        clientList.forEach(client => {
          
        })
      }
    })
    
    // Mostrar duplicados por nombre
    
    Object.entries(nameGroups).forEach(([name, clientList]) => {
      if (clientList.length > 1) {
        
        clientList.forEach(client => {
          
        })
      }
    })
    
    // Contar total de duplicados
    const emailDuplicates = Object.values(emailGroups).filter(group => group.length > 1).length
    const phoneDuplicates = Object.values(phoneGroups).filter(group => group.length > 1).length
    const nameDuplicates = Object.values(nameGroups).filter(group => group.length > 1).length

  } catch (error) {
    
  } finally {
    await prisma.$disconnect()
  }
}

checkDuplicateClients()
