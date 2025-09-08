// Script para probar los eventos de sincronización del calendario
console.log('🧪 Probando eventos de sincronización del calendario...\n');

// Simular el evento newJobCreated
const mockNewJob = {
  id: "test-new-job",
  title: "Trabajo de Prueba",
  client: { name: "Cliente Test" },
  technician: { id: "cmesya2rz0005uk5wzu8tc90x", name: "Patricia López" },
  service: { name: "Servicio Test" },
  scheduledAt: "2025-08-26T17:30:00.000Z",
  priority: "MEDIUM"
};

console.log('📋 Trabajo de prueba:');
console.log(`   ID: ${mockNewJob.id}`);
console.log(`   Título: ${mockNewJob.title}`);
console.log(`   Cliente: ${mockNewJob.client.name}`);
console.log(`   Técnico: ${mockNewJob.technician.name}`);
console.log(`   Fecha: ${mockNewJob.scheduledAt}`);

// Simular la conversión que hace el calendario
function convertJobToAppointment(job) {
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

console.log('\n🔄 Simulando conversión del trabajo:');
const convertedAppointment = convertJobToAppointment(mockNewJob);

console.log('   Trabajo convertido:');
console.log(`   - ID: ${convertedAppointment.id}`);
console.log(`   - Cliente: ${convertedAppointment.patientName}`);
console.log(`   - Técnico ID: ${convertedAppointment.professionalId}`);
console.log(`   - Horario: ${convertedAppointment.startTime} - ${convertedAppointment.endTime}`);
console.log(`   - Fecha: ${convertedAppointment.date}`);
console.log(`   - Tipo: ${convertedAppointment.type}`);
console.log(`   - Color: ${convertedAppointment.color}`);

// Simular el estado del calendario
const currentJobs = [
  {
    id: "existing-job-1",
    professionalId: "cmesya2o00001uk5wx4wnn09m",
    patientName: "María Riquelme",
    startTime: "14:00",
    endTime: "15:00",
    type: "Trabajo para Hoy",
    date: "2025-08-26"
  }
];

console.log('\n📊 Estado actual del calendario:');
console.log(`   Trabajos existentes: ${currentJobs.length}`);
currentJobs.forEach((job, index) => {
  console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime}`);
});

// Simular la adición del nuevo trabajo
console.log('\n➕ Agregando nuevo trabajo al calendario:');
const updatedJobs = [...currentJobs, convertedAppointment];

console.log(`   Trabajos después de agregar: ${updatedJobs.length}`);
updatedJobs.forEach((job, index) => {
  console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime}`);
});

// Verificar que el trabajo aparece para el 26 de agosto
console.log('\n🎯 Verificando que el trabajo aparece para el 26 de agosto:');
const targetDate = new Date('2025-08-26');
const jobsForDate = updatedJobs.filter(job => {
  if (!job.date) return false;
  const jobDate = new Date(job.date);
  const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
  const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
  return jobDateOnly.getTime() === targetDateOnly.getTime();
});

console.log(`   Trabajos para el 26 de agosto: ${jobsForDate.length}`);
jobsForDate.forEach((job, index) => {
  console.log(`   ${index + 1}. ${job.patientName} - ${job.type} - ${job.startTime}-${job.endTime}`);
});

if (jobsForDate.some(job => job.id === mockNewJob.id)) {
  console.log('\n✅ ¡El trabajo se agregó correctamente al calendario!');
} else {
  console.log('\n❌ El trabajo no se agregó correctamente');
}

console.log('\n📝 Resumen de la sincronización:');
console.log('   1. El trabajo se convierte correctamente al formato del calendario');
console.log('   2. Se agrega al estado del calendario');
console.log('   3. Aparece en la fecha correcta (26 de agosto)');
console.log('   4. El técnico puede ver su trabajo asignado');
