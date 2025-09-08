// Script para verificar que los trabajos se muestran en el calendario
console.log('🔍 Verificando visualización de trabajos en el calendario...\n');

// Simular los datos que deberían llegar del calendario
const mockCalendarData = {
  selectedDate: '2025-08-27',
  technicians: [
    {
      id: "cmesya2o00001uk5wx4wnn09m",
      name: "Marta Barrera"
    },
    {
      id: "cmesya2pz0003uk5wla8rc9au",
      name: "Carlos Mendoza"
    },
    {
      id: "cmesya2rz0005uk5wzu8tc90x",
      name: "Patricia López"
    },
    {
      id: "cmeszjqvy0005ukrcxm1r98y8",
      name: "Ana Torres"
    }
  ],
  jobs: [
    {
      id: "cmesyjn4x0001ukwgkdyj1o4k",
      professionalId: "cmesya2o00001uk5wx4wnn09m",
      patientName: "María Riquelme",
      startTime: "14:00",
      endTime: "15:00",
      type: "Amestica",
      date: "2025-08-26"
    },
    {
      id: "cmesykhfe0003ukrc3chuaaok",
      professionalId: "cmesya2pz0003uk5wla8rc9au",
      patientName: "Ana Martínez",
      startTime: "20:00",
      endTime: "21:00",
      type: "Amestica",
      date: "2025-08-26"
    },
    {
      id: "cmesyd9900001ukrcrok4ivv3",
      professionalId: "cmesya2pz0003uk5wla8rc9au",
      patientName: "Ana Martínez",
      startTime: "00:00",
      endTime: "01:00",
      type: "Amestica",
      date: "2025-08-27"
    },
    {
      id: "cmesybo610001uks85pwxit3e",
      professionalId: "cmesya2o00001uk5wx4wnn09m",
      patientName: "María Riquelme",
      startTime: "06:00",
      endTime: "07:00",
      type: "Amestica",
      date: "2025-08-28"
    }
  ]
};

console.log('📅 Fecha seleccionada:', mockCalendarData.selectedDate);
console.log('👨‍🔧 Técnicos:', mockCalendarData.technicians.length);
console.log('📋 Trabajos totales:', mockCalendarData.jobs.length);

// Simular el filtrado de trabajos por fecha
const selectedDateOnly = new Date(mockCalendarData.selectedDate);
const filteredJobs = mockCalendarData.jobs.filter(job => {
  const jobDate = new Date(job.date);
  const jobDateOnly = new Date(jobDate.getFullYear(), jobDate.getMonth(), jobDate.getDate());
  const selectedDateOnlyForJob = new Date(selectedDateOnly.getFullYear(), selectedDateOnly.getMonth(), selectedDateOnly.getDate());
  
  return jobDateOnly.getTime() === selectedDateOnlyForJob.getTime();
});

console.log('\n✅ Trabajos para la fecha seleccionada:', filteredJobs.length);

if (filteredJobs.length > 0) {
  console.log('\n📋 Trabajos que deberían aparecer en el calendario:');
  filteredJobs.forEach((job, index) => {
    const technician = mockCalendarData.technicians.find(t => t.id === job.professionalId);
    console.log(`   ${index + 1}. ${job.patientName}`);
    console.log(`      Técnico: ${technician?.name || 'Sin técnico'}`);
    console.log(`      Horario: ${job.startTime} - ${job.endTime}`);
    console.log(`      Tipo: ${job.type}`);
    console.log('');
  });
} else {
  console.log('❌ No hay trabajos para la fecha seleccionada');
  console.log('\n📅 Trabajos disponibles en otras fechas:');
  const jobsByDate = {};
  mockCalendarData.jobs.forEach(job => {
    if (!jobsByDate[job.date]) {
      jobsByDate[job.date] = [];
    }
    jobsByDate[job.date].push(job);
  });
  
  Object.keys(jobsByDate).forEach(date => {
    console.log(`   ${date}: ${jobsByDate[date].length} trabajos`);
  });
}

console.log('\n💡 Para ver los trabajos en el calendario:');
console.log('   1. Navega a la fecha correcta (26, 27 o 28 de agosto)');
console.log('   2. Verifica que los técnicos estén cargados correctamente');
console.log('   3. Asegúrate de que no haya filtros activos');
console.log('   4. Revisa la consola del navegador para logs de depuración');
