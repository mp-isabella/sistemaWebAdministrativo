"use client";

import React, { useState, useMemo } from "react";
// Importa el tipo `View` directamente de la librería
import { Calendar, dateFnsLocalizer, Event, View } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
// Asegúrate de que la ruta del CSS sea correcta. 
// He ajustado la ruta para que sea más clara.

// Define el tipo para nuestros eventos
interface MyEvent extends Event {
  title: string;
  start: Date;
  end: Date;
}

// Configuración regional para las fechas (es-CL para Chile)
const locales = {
  "es-CL": require("date-fns/locale/es"),
};

// Crea el localizador para React Big Calendar
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Datos de ejemplo para los eventos
const eventsData: MyEvent[] = [
  {
    title: "Reunión de equipo",
    start: new Date(2025, 7, 10, 10, 0, 0), // 10 de agosto 2025, 10:00 AM
    end: new Date(2025, 7, 10, 11, 0, 0),
  },
  {
    title: "Presentación del proyecto",
    start: new Date(2025, 7, 10, 14, 0, 0), // 10 de agosto 2025, 2:00 PM
    end: new Date(2025, 7, 10, 15, 30, 0),
  },
  {
    title: "Entrenamiento de seguridad",
    start: new Date(2025, 7, 15, 9, 30, 0), // 15 de agosto 2025, 9:30 AM
    end: new Date(2025, 7, 15, 12, 0, 0),
  },
  {
    title: "Llamada con cliente",
    start: new Date(2025, 7, 16, 16, 0, 0), // 16 de agosto 2025, 4:00 PM
    end: new Date(2025, 7, 16, 17, 0, 0),
  },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<MyEvent[]>(eventsData);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const title = window.prompt("Nuevo evento:");
    if (title) {
      const newEvent = {
        title,
        start,
        end,
      };
      setEvents([...events, newEvent]);
    }
  };

  const handleSelectEvent = (event: MyEvent) => {
    alert(`Evento seleccionado: ${event.title}`);
  };

  const { defaultDate, views } = useMemo(
    () => ({
      defaultDate: new Date(2025, 7, 10), // Puedes establecer una fecha predeterminada
      // Usa el tipo `View[]` para que TypeScript no de un error
      views: ["month", "week", "day", "agenda"] as View[],
    }),
    []
  );

  return (
    <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1 className="text-center text-xl md:text-3xl font-bold">Calendario de Trabajos</h1>
      <div style={{ height: 700, marginTop: 2 }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          defaultDate={defaultDate}
          views={views}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Siguiente",
            previous: "Anterior",
            today: "Hoy",
            month: "Mes",
            week: "Semana",
            day: "Día",
            agenda: "Agenda",
            date: "Fecha",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "No hay eventos en este rango.",
          }}
        />
      </div>
    </main>
  );
}