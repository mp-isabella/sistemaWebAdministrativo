// Script para diagnosticar el problema del calendario
console.log('🔍 Diagnóstico completo del problema del calendario...\n');

// Simular el estado completo del calendario
const calendarState = {
  session: {
    user: {
      id: "admin-user-id",
      name: "Administrador",
      role: "ADMIN",
      email: "admin@amestica.cl"
    }
  },
  selectedDate: new Date('2025-08-26'),
  selectedTechnician: "todos",
  selectedStatus: "activas",
  searchQuery: "",
  loading: false,
  error: null
};

console.log('📋 Estado del calendario:');
console.log(`   Usuario: ${calendarState.session.user.name} (${calendarState.session.user.role})`);
console.log(`   Fecha seleccionada: ${calendarState.selectedDate.toISOString().split('T')[0]}`);
console.log(`   Técnico filtro: ${calendarState.selectedTechnician}`);
console.log(`   Estado filtro: ${calendarState.selectedStatus}`);
console.log(`   Búsqueda: "${calendarState.searchQuery}"`);
console.log(`   Cargando: ${calendarState.loading}`);
console.log(`   Error: ${calendarState.error || 'Ninguno'}`);

// Simular los datos que debería devolver la API
const apiResponse = {
  success: true,
  data: [
    {
      id: "1",
      title: "Multifugas",
      client: { name: "Juan Pérez" },
      technician: { id: "cmesya2rz0005uk5wzu8tc90x", name: "Patricia López" },
      service: { name: "Multifugas" },
      scheduledAt: "2025-08-26T17:30:00.000Z",
      status: "PENDING",
      priority: "MEDIUM"
    },
    {
      id: "2",
      title: "Trabajo para Hoy",
      client: { name: "María Riquelme" },
      technician: { id: "cmesya2o00001uk5wx4wnn09m", name: "Marta Barrera" },
      service: { name: "Amestica" },
      scheduledAt: "2025-08-26T14:00:00.000Z",
      status: "PENDING",
      priority: "MEDIUM"
    }
  ],
  technicians: [
    { id: "cmesya2o00001uk5wx4wnn09m", name: "Marta Barrera" },
    { id: "cmesya2pz0003uk5wla8rc9au", name: "Carlos Mendoza" },
    { id: "cmesya2rz0005uk5wzu8tc90x", name: "Patricia López" },
    { id: "cmeszjqvy0005ukrcxm1r98y8", name: "Ana Torres" }
  ]
};

console.log('\n📡 Respuesta simulada de la API:');
console.log(`   Success: ${apiResponse.success}`);
console.log(`   Trabajos: ${apiResponse.data.length}`);
console.log(`   Técnicos: ${apiResponse.technicians.length}`);

// Simular la conversión que hace el frontend
function convertJobsToCalendarFormat(jobs) {
  return jobs.map(job => {
    const scheduledDate = new Date(job.scheduledAt);
    const startTime = scheduledDate.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    });
    
    const endDate = new Date(scheduledDate.getTime() + 60 * 60 * 1000);
    const endTime = endDate.toLocaleTimeString('es-CL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Santiago'
    });

    return {
      id: job.id,
      professionalId: job.technician.id,
      patientName: job.client?.name || "Cliente sin nombre",
      startTime: startTime,
      endTime: endTime,
      type: job.service?.name || job.title || "Trabajo técnico",
      color: getJobColor(job.priority || "MEDIUM"),
      date: scheduledDate.toLocaleDateString('en-CA')
    };
  });
}

function getJobColor(priority) {
  switch (priority.toUpperCase()) {
    case "HIGH":
      return "bg-red-400";
    case "MEDIUM":
      return "bg-blue-400";
    case "LOW":
      return "bg-green-400";
    default:
      return "bg-gray-400";
  }
}

console.log('\n🔄 Conversión de trabajos:');
const convertedJobs = convertJobsToCalendarFormat(apiResponse.data);
console.log(`   Trabajos convertidos: ${convertedJobs.length}`);

convertedJobs.forEach((job, index) => {
  console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime} - ${job.date}`);
});

// Simular el filtrado por fecha
console.log('\n🎯 Filtrado por fecha seleccionada:');
const selectedDateOnly = new Date(calendarState.selectedDate.getFullYear(), calendarState.selectedDate.getMonth(), calendarState.selectedDate.getDate());
console.log(`   Fecha seleccionada: ${selectedDateOnly.toISOString().split('T')[0]}`);

const filteredJobs = convertedJobs.filter(job => {
  if (!job.date) return false;
  const jobDate = new Date(job.date);
  const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
  return jobDateOnly.getTime() === selectedDateOnly.getTime();
});

console.log(`   Trabajos para la fecha: ${filteredJobs.length}`);

if (filteredJobs.length > 0) {
  filteredJobs.forEach((job, index) => {
    console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime}`);
  });
} else {
  console.log('   ❌ No hay trabajos para esta fecha');
}

// Simular el renderizado en el calendario
console.log('\n📊 Renderizado en el calendario:');
if (filteredJobs.length > 0) {
  console.log('   ✅ Los trabajos deberían aparecer en el calendario:');
  filteredJobs.forEach((job, index) => {
    console.log(`   ${index + 1}. Tarjeta: ${job.patientName} - ${job.type}`);
    console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
    console.log(`      Técnico ID: ${job.professionalId}`);
    console.log(`      Color: ${job.color}`);
  });
} else {
  console.log('   ❌ El calendario estará vacío');
}

// Diagnóstico de problemas
console.log('\n🔍 Diagnóstico de problemas:');

const problems = [];

// Verificar si hay datos de la API
if (apiResponse.data.length === 0) {
  problems.push("❌ La API no devuelve trabajos");
} else {
  console.log("✅ La API devuelve trabajos correctamente");
}

// Verificar si hay trabajos convertidos
if (convertedJobs.length === 0) {
  problems.push("❌ Error en la conversión de trabajos");
} else {
  console.log("✅ Los trabajos se convierten correctamente");
}

// Verificar si hay trabajos para la fecha
if (filteredJobs.length === 0) {
  problems.push("❌ No hay trabajos para la fecha seleccionada");
} else {
  console.log("✅ Hay trabajos para la fecha seleccionada");
}

// Verificar la sesión
if (!calendarState.session?.user?.id) {
  problems.push("❌ No hay sesión de usuario válida");
} else {
  console.log("✅ La sesión de usuario es válida");
}

if (problems.length > 0) {
  console.log('\n🚨 Problemas detectados:');
  problems.forEach(problem => console.log(`   ${problem}`));
} else {
  console.log('\n✅ No se detectaron problemas en la lógica');
}

console.log('\n💡 Instrucciones para diagnosticar en el navegador:');
console.log('   1. Abre las herramientas de desarrollador (F12)');
console.log('   2. Ve a la pestaña "Console"');
console.log('   3. Recarga la página del calendario');
console.log('   4. Busca los logs que empiecen con:');
console.log('      - "Llamando a la API del calendario..."');
console.log('      - "Respuesta de la API del calendario:"');
console.log('      - "Trabajos convertidos para calendario:"');
console.log('      - "Datos reales de la API cargados:"');
console.log('   5. Si no ves estos logs, el problema está en la carga inicial');
console.log('   6. Si ves los logs pero no hay datos, el problema está en la API');
console.log('   7. Si hay datos pero no aparecen en el calendario, el problema está en el renderizado');

console.log('\n🔧 Solución rápida:');
console.log('   1. Verifica que el servidor esté corriendo: npm run dev');
console.log('   2. Verifica que estés logueado correctamente');
console.log('   3. Limpia el caché del navegador (Ctrl+F5)');
console.log('   4. Verifica que no haya errores en la consola del navegador');
console.log('   5. Si el problema persiste, revisa los logs de la consola del servidor');
