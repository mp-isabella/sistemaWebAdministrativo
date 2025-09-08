// Script para debuggear la respuesta de la API del calendario
console.log('🔍 Debuggeando respuesta de la API del calendario...\n');

// Simular la respuesta que debería venir de la API
const mockApiResponse = {
  success: true,
  data: [
    {
      id: "cmevuul280005ukf866ushbth",
      professionalId: "cmeuf7geu0001uk4kci3mevgt",
      patientName: "María Paz Riquelme",
      startTime: "17:00",
      endTime: "19:00",
      startTimeDisplay: "17:00",
      endTimeDisplay: "19:00",
      type: "Destape de Alcantarillado",
      color: "bg-yellow-200",
      date: "2025-08-28", // Esta es la fecha que viene de la API
      status: "PENDING",
      priority: "MEDIUM",
      description: "",
      client: {
        id: "cmeu8p9d20007ukbsx0yppxng",
        name: "María Paz Riquelme",
        email: "maria@email.com",
        phone: "+56985714993",
        address: "Erasmo Escala 544"
      },
      service: {
        id: "cmeufu6770001uk9or3my8wu8",
        name: "Destape de Alcantarillado",
        description: "Servicio de destape de alcantarillado"
      },
      technician: {
        id: "cmeuf7geu0001uk4kci3mevgt",
        name: "Juan Perez",
        email: "juan@amestica.cl"
      },
      company: {
        id: "cmeu8ojbp0001uktkuww8rbnk",
        name: "Amestica"
      },
      scheduledAt: "Thu Aug 28 2025 17:00:00 GMT-0400 (hora estándar de Chile)"
    }
  ],
  technicians: [
    {
      id: "cmeuf7geu0001uk4kci3mevgt",
      name: "Juan Perez",
      email: "juan@amestica.cl"
    }
  ]
};

console.log('📋 Respuesta simulada de la API:');
console.log(JSON.stringify(mockApiResponse, null, 2));

console.log('\n🔍 Analizando la fecha:');
const job = mockApiResponse.data[0];
console.log('   Fecha de la API (job.date):', job.date);
console.log('   Tipo de fecha:', typeof job.date);

// Simular el procesamiento del frontend
const calendarJobs = mockApiResponse.data.map((job) => {
  return {
    id: job.id,
    professionalId: job.technician?.id || "tecnico-generico",
    patientName: job.client?.name || "Cliente sin nombre",
    startTime: job.startTime,
    endTime: job.endTime,
    startTimeDisplay: job.startTimeDisplay,
    endTimeDisplay: job.endTimeDisplay,
    type: job.service?.name || "Trabajo técnico",
    color: "bg-yellow-200",
    date: job.date, // ← AQUÍ ESTÁ EL PROBLEMA
    status: job.status || "PENDING",
    priority: job.priority || "MEDIUM",
    description: job.description || "",
    client: job.client,
    service: job.service,
    technician: job.technician,
    company: job.company,
    scheduledAt: job.scheduledAt
  };
});

console.log('\n📅 Trabajo procesado:');
console.log('   Fecha final:', calendarJobs[0].date);
console.log('   Cliente:', calendarJobs[0].patientName);
console.log('   Técnico:', calendarJobs[0].technician?.name);

// Verificar si la fecha es válida
const testDate = new Date(calendarJobs[0].date);
console.log('\n🔍 Validación de fecha:');
console.log('   Fecha parseada:', testDate);
console.log('   Es válida:', !isNaN(testDate.getTime()));
console.log('   Año:', testDate.getFullYear());
console.log('   Mes:', testDate.getMonth() + 1);
console.log('   Día:', testDate.getDate());

if (testDate.getFullYear() === 1969) {
  console.log('\n🚨 ¡PROBLEMA DETECTADO!');
  console.log('   La fecha se está convirtiendo a 1969');
  console.log('   Esto indica un problema en la API o en el procesamiento');
} else {
  console.log('\n✅ La fecha parece correcta');
}
