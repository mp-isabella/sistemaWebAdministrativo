"use client";

import { useState, useEffect } from 'react';
import { Download, Trash2, Mail, Phone, MapPin, Calendar, AlertCircle } from 'lucide-react';

interface LocalQuote {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
  formType: 'hero' | 'contact';
  fecha: string;
  procesada: boolean;
}

const serviceNames: Record<string, string> = {
  deteccion_fugas: 'Detección de fugas de agua',
  destape_alcantarillado: 'Destape de alcantarillado',
  videoinspeccion: 'Videoinspección de ductos',
};

export function LocalQuotesViewer() {
  const [quotes, setQuotes] = useState<LocalQuote[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = () => {
    try {
      const stored = localStorage.getItem('cotizaciones');
      if (stored) {
        const parsedQuotes = JSON.parse(stored);
        setQuotes(parsedQuotes);
      }
    } catch (error) {
    }
  };

  const markAsProcessed = (id: string) => {
    const updatedQuotes = quotes.map(quote => 
      quote.id === id ? { ...quote, procesada: true } : quote
    );
    setQuotes(updatedQuotes);
    localStorage.setItem('cotizaciones', JSON.stringify(updatedQuotes));
  };

  const deleteQuote = (id: string) => {
    const updatedQuotes = quotes.filter(quote => quote.id !== id);
    setQuotes(updatedQuotes);
    localStorage.setItem('cotizaciones', JSON.stringify(updatedQuotes));
  };

  const exportQuotes = () => {
    const csvContent = [
      'Fecha,Nombre,Email,Teléfono,Servicio,Región,Comuna,Dirección,Mensaje,Origen,Procesada',
      ...quotes.map(quote => [
        new Date(quote.fecha).toLocaleString('es-CL'),
        quote.nombre,
        quote.email,
        quote.telefono,
        serviceNames[quote.servicio] || quote.servicio,
        quote.region,
        quote.comuna,
        quote.direccion,
        quote.mensaje || '',
        quote.formType === 'hero' ? 'Formulario Principal' : 'Formulario Contacto',
        quote.procesada ? 'Sí' : 'No'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cotizaciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const pendingQuotes = quotes.filter(q => !q.procesada);

  if (quotes.length === 0) {
    return null;
  }

  return (
    <>
      {/* Botón flotante para mostrar cotizaciones pendientes */}
      {pendingQuotes.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors flex items-center gap-2"
            title={`${pendingQuotes.length} cotizaciones pendientes`}
          >
            <AlertCircle size={20} />
            <span className="bg-white text-red-500 rounded-full px-2 py-1 text-sm font-bold">
              {pendingQuotes.length}
            </span>
          </button>
        </div>
      )}

      {/* Modal con las cotizaciones */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Cotizaciones Locales
                </h2>
                <p className="text-gray-600 mt-1">
                  {quotes.length} cotizaciones guardadas ({pendingQuotes.length} pendientes)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={exportQuotes}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  <Download size={16} />
                  Exportar CSV
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div
                    key={quote.id}
                    className={`border rounded-lg p-4 ${
                      quote.procesada 
                        ? 'bg-gray-50 border-gray-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{quote.nombre}</h3>
                        {!quote.procesada && (
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                            PENDIENTE
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {!quote.procesada && (
                          <button
                            onClick={() => markAsProcessed(quote.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                          >
                            Marcar como procesada
                          </button>
                        )}
                        <button
                          onClick={() => deleteQuote(quote.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-500" />
                          <span>{quote.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-500" />
                          <span>{quote.telefono}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-gray-500" />
                          <span>{quote.region}, {quote.comuna}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span>{new Date(quote.fecha).toLocaleString('es-CL')}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <span className="font-medium">Servicio:</span>
                          <span className="ml-2">{serviceNames[quote.servicio] || quote.servicio}</span>
                        </div>
                        <div>
                          <span className="font-medium">Dirección:</span>
                          <span className="ml-2">{quote.direccion}</span>
                        </div>
                        <div>
                          <span className="font-medium">Origen:</span>
                          <span className="ml-2">
                            {quote.formType === 'hero' ? 'Formulario Principal' : 'Formulario Contacto'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {quote.mensaje && (
                      <div className="mt-3 p-3 bg-gray-100 rounded">
                        <span className="font-medium">Mensaje:</span>
                        <p className="mt-1 text-gray-700">{quote.mensaje}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
