"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const heroTexts = [
  {
    title: "¿Tienes una fuga de agua?",
    subtitle: "Nosotros la detectamos rápido.",
    img: "/evidencia3.webp",
  },
  {
    title: "¿Problemas con el alcantarillado?",
    subtitle: "Realizamos destapes y video inspecciones.",
    img: "/evidencia4.webp",
  },
  {
    title: "Atención profesional a domicilio",
    subtitle: "Tecnología de punta a tu alcance.",
    img: "/evidencia5.webp",
  },
];

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [openCall, setOpenCall] = useState(false);
  const [openWsp, setOpenWsp] = useState(false);
  const { title, subtitle, img } = heroTexts[index];
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    region: "",
    comuna: "",
    direccion: "",
    servicio: "",
    fecha: "",
    mensaje: "",
  });
  const numbers = {
    santiago: "+56942008410",
    ñuble: "+56996706640",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="inicio"
      // Se cambió la altura fija a min-h para evitar desbordamientos en móviles
      className="relative min-h-[80vh] flex flex-col justify-center text-white overflow-hidden"
    >
      {/* Contenedor de la imagen de fondo con responsividad */}
      <div className="absolute inset-0">
        <div
          // Se cambió bg-bottom a bg-center para centrar la imagen.
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            filter: "brightness(0.95)",
            zIndex: 0,
          }}
        />
        {/* Overlay azul sutil */}
        <div className="absolute inset-0 bg-[#014C90]/10 z-10" />
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        {/* Se cambió el grid para que aparezcan las dos columnas a partir de tabletas (md) */}
        <div className="max-w-screen-xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Contenido de texto y botones */}
          <div className="w-full text-center lg:text-left self-center">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-balance">
              {title} <br />
              <span className="underline decoration-orange-400">{subtitle}</span>
            </h1>
            <div className="flex justify-center lg:justify-start flex-wrap gap-6 mt-8 md:mt-12">
              <button
                onClick={() => {
                  setOpenCall(!openCall);
                  setOpenWsp(false);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold shadow-lg text-white text-base md:text-xl transition duration-300 select-none"
                aria-expanded={openCall}
                aria-haspopup="true"
              >
                {/* Ícono de teléfono más grande en móvil */}
                <Phone className="mr-3 h-6 w-6 md:h-7 md:w-7" /> Llamar
              </button>
              <button
                onClick={() => {
                  setOpenWsp(!openWsp);
                  setOpenCall(false);
                }}
                className="flex items-center bg-green-600 hover:bg-green-700 px-6 py-4 rounded-xl font-semibold shadow-lg text-white text-base md:text-xl transition duration-300 select-none"
                aria-expanded={openWsp}
                aria-haspopup="true"
              >
                <span className="mr-3 flex items-center">
                  {/* Ícono de WhatsApp más grande en móvil */}
                  <FaWhatsapp size={28} color="white" />
                </span>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Formulario de Cotización */}
          <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-0">
            <Card className="rounded-3xl shadow-2xl bg-white p-4 max-w-md w-full">
              <CardHeader className="pb-4">
                <h1 className="text-xl md:text-2xl font-bold text-[#002D71] text-center">
                  ¡Obtén una <span className="text-orange-500">Cotización Ahora!</span>
                </h1>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium text-[#014C90] mb-1">Nombre Completo *</label>
                    <Input id="nombre" name="nombre" placeholder="Tu nombre completo" value={formData.nombre} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#014C90] mb-1">Email *</label>
                      <Input id="email" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-[#014C90] mb-1">Teléfono *</label>
                      <Input id="telefono" name="telefono" placeholder="+56 9 1234 5678" value={formData.telefono} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="region" className="block text-sm font-medium text-[#014C90] mb-1">Región *</label>
                      <Input id="region" name="region" placeholder="Región" value={formData.region} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                    </div>
                    <div>
                      <label htmlFor="comuna" className="block text-sm font-medium text-[#014C90] mb-1">Comuna *</label>
                      <Input id="comuna" name="comuna" placeholder="Comuna" value={formData.comuna} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-[#014C90] mb-1">Dirección *</label>
                    <Input id="direccion" name="direccion" placeholder="Dirección" value={formData.direccion} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="servicio" className="block text-sm font-medium text-[#014C90] mb-1">Tipo de servicio *</label>
                      <select id="servicio" name="servicio" value={formData.servicio} onChange={handleChange} required className="w-full rounded-md px-3 py-2 text-gray-500 text-sm placeholder-gray-400 bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors">
                        <option value="" className="text-black">Seleccione</option>
                        <option value="Detección de fugas" className="text-black">Detección de fugas</option>
                        <option value="Reparación e instalación" className="text-black">Reparación e instalación</option>
                        <option value="Mantención preventiva" className="text-black">Mantención preventiva</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="fecha" className="block text-sm font-medium text-[#014C90] mb-1">Fecha tentativa</label>
                      <input id="fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} className="w-full rounded-md px-3 py-2 text-gray-500 text-sm placeholder-gray-400 bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="mensaje" className="block text-sm font-medium text-[#014C90] mb-1">Describe tu problema *</label>
                    <Textarea id="mensaje" name="mensaje" placeholder="Cuéntanos sobre la fuga o problema que tienes..." rows={3} value={formData.mensaje} onChange={handleChange} required className="placeholder-[#014C90] text-sm bg-gray-50 border-transparent focus:border-transparent focus:ring-1 focus:ring-orange-500 transition-colors" />
                  </div>
                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      className="mt-3 bg-orange-500 hover:bg-[#e1550f] text-white text-lg font-semibold py-3 px-8 rounded-full transition-colors"
                    >
                      Enviar Solicitud
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mensaje de cobertura */}
        {/* Se añadió un margen superior para separarlo del formulario */}
        <div className="mt-12 text-center">
          <h2 className="text-3x1 lg:text-2xl md:text-2x1 font-extrabold text-white">
            Atención en: Santiago, Valparaíso, O’Higgins, Maule, Ñuble y Bío Bío
          </h2>
        </div>
      </div>

      {/* Modales */}
      {openCall && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full text-gray-800">
            <button
              onClick={() => setOpenCall(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold mb-6 select-none">Llamar a:</h3>
            <ul className="space-y-4 text-lg">
              <li>
                <a
                  href={`tel:${numbers.santiago}`}
                  className="block px-5 py-3 rounded hover:bg-blue-100 text-blue-700 font-semibold transition"
                >
                  Santiago: {numbers.santiago}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${numbers.ñuble}`}
                  className="block px-5 py-3 rounded hover:bg-blue-100 text-blue-700 font-semibold transition"
                >
                  Ñuble: {numbers.ñuble}
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {openWsp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full text-gray-800">
            <button
              onClick={() => setOpenWsp(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              aria-label="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-2xl font-bold mb-6 select-none">WhatsApp a:</h3>
            <ul className="space-y-4 text-lg">
              <li>
                <a
                  href={`https://wa.me/${numbers.santiago.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3 rounded hover:bg-orange-100 text-orange-700 font-semibold transition"
                >
                  Santiago: {numbers.santiago}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${numbers.ñuble.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-5 py-3 rounded hover:bg-orange-100 text-orange-700 font-semibold transition"
                >
                  Ñuble: {numbers.ñuble}
                </a>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Indicador de Desplazamiento */}
      {/* Se eliminó el indicador para móviles y solo se muestra en pantallas medianas y grandes */}
      {/* <div className="hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex-col items-center text-white pointer-events-none">
        <div className="w-6 h-9 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
        </div>
        <span className="text-sm">Desliza</span>
      </div> */}
    </section>
  );
}