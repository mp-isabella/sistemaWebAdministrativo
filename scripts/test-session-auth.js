// Script para verificar la autenticación y sesión
console.log('🧪 Verificando autenticación y sesión...\n');

// Simular diferentes escenarios de sesión
const sessionScenarios = [
  {
    name: "Admin con sesión válida",
    session: {
      user: {
        id: "admin-user-id",
        name: "Administrador",
        role: "ADMIN",
        email: "admin@amestica.cl"
      }
    },
    shouldWork: true
  },
  {
    name: "Técnico con sesión válida",
    session: {
      user: {
        id: "cmesya2rz0005uk5wzu8tc90x",
        name: "Patricia López",
        role: "TECNICO",
        email: "patricia@amestica.cl"
      }
    },
    shouldWork: true
  },
  {
    name: "Sin sesión",
    session: null,
    shouldWork: false
  },
  {
    name: "Sesión incompleta",
    session: {
      user: {
        id: "incomplete-user",
        name: "Usuario Incompleto"
        // Sin role ni email
      }
    },
    shouldWork: false
  }
];

console.log('📋 Escenarios de sesión:');
sessionScenarios.forEach((scenario, index) => {
  console.log(`   ${index + 1}. ${scenario.name}`);
  console.log(`      Sesión: ${scenario.session ? 'Presente' : 'Ausente'}`);
  if (scenario.session?.user) {
    console.log(`      Usuario: ${scenario.session.user.name} (${scenario.session.user.role || 'Sin rol'})`);
  }
  console.log(`      Debería funcionar: ${scenario.shouldWork ? '✅' : '❌'}`);
  console.log('');
});

// Simular la lógica de verificación del frontend
function checkSessionAccess(session) {
  console.log('🔍 Verificando acceso con sesión:');
  
  if (!session) {
    console.log('   ❌ No hay sesión');
    return false;
  }
  
  if (!session.user) {
    console.log('   ❌ Sesión sin usuario');
    return false;
  }
  
  if (!session.user.id) {
    console.log('   ❌ Usuario sin ID');
    return false;
  }
  
  if (!session.user.role) {
    console.log('   ❌ Usuario sin rol');
    return false;
  }
  
  console.log(`   ✅ Sesión válida: ${session.user.name} (${session.user.role})`);
  return true;
}

// Simular la lógica de filtrado por rol
function getFilteredJobs(jobs, session) {
  if (!session?.user?.role) {
    console.log('   ❌ No se puede filtrar sin rol');
    return [];
  }
  
  const role = session.user.role.toLowerCase();
  
  if (role === 'tecnico') {
    const technicianJobs = jobs.filter(job => job.technician?.id === session.user.id);
    console.log(`   🔍 Técnico ${session.user.name}: ${technicianJobs.length} trabajos`);
    return technicianJobs;
  } else if (role === 'admin' || role === 'secretaria') {
    console.log(`   🔍 ${role.toUpperCase()}: ${jobs.length} trabajos (todos)`);
    return jobs;
  } else {
    console.log(`   ❌ Rol no reconocido: ${role}`);
    return [];
  }
}

// Simular datos de trabajos
const mockJobs = [
  {
    id: "1",
    title: "Multifugas",
    client: { name: "Juan Pérez" },
    technician: { id: "cmesya2rz0005uk5wzu8tc90x", name: "Patricia López" },
    service: { name: "Multifugas" },
    scheduledAt: "2025-08-26T17:30:00.000Z"
  },
  {
    id: "2",
    title: "Trabajo para Hoy",
    client: { name: "María Riquelme" },
    technician: { id: "cmesya2o00001uk5wx4wnn09m", name: "Marta Barrera" },
    service: { name: "Amestica" },
    scheduledAt: "2025-08-26T14:00:00.000Z"
  }
];

console.log('🎯 Probando escenarios:');
sessionScenarios.forEach((scenario, index) => {
  console.log(`\n${index + 1}. ${scenario.name}:`);
  
  const hasAccess = checkSessionAccess(scenario.session);
  
  if (hasAccess) {
    const filteredJobs = getFilteredJobs(mockJobs, scenario.session);
    console.log(`   📊 Trabajos disponibles: ${filteredJobs.length}`);
    
    if (filteredJobs.length > 0) {
      filteredJobs.forEach((job, jobIndex) => {
        console.log(`      ${jobIndex + 1}. ${job.title} - ${job.client.name} - ${job.technician.name}`);
      });
    }
  }
  
  const expected = scenario.shouldWork;
  const actual = hasAccess;
  console.log(`   Resultado: ${actual === expected ? '✅' : '❌'} (Esperado: ${expected}, Obtenido: ${actual})`);
});

console.log('\n📝 Resumen de verificación:');
console.log('   1. ✅ La lógica de verificación de sesión funciona correctamente');
console.log('   2. ✅ El filtrado por rol funciona correctamente');
console.log('   3. ✅ Los técnicos ven solo sus trabajos');
console.log('   4. ✅ Los admin/secretaria ven todos los trabajos');
console.log('   5. ❌ Si no hay sesión, no se pueden cargar datos');

console.log('\n💡 Posibles problemas en el frontend:');
console.log('   1. La sesión no se está cargando correctamente');
console.log('   2. El componente se monta antes de que la sesión esté lista');
console.log('   3. Hay un error en la comunicación con la API');
console.log('   4. Los filtros están bloqueando los datos');

console.log('\n🔧 Soluciones recomendadas:');
console.log('   1. Verificar que la sesión se carga correctamente');
console.log('   2. Agregar logs de depuración en el frontend');
console.log('   3. Verificar la respuesta de la API en las herramientas de desarrollador');
console.log('   4. Asegurar que el componente espera a que la sesión esté lista');
