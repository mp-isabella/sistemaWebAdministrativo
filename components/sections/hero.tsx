"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

// Textos del hero
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

// Tipos de datos del formulario
interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  region: string;
  comuna: string;
  direccion: string;
  servicio: string;
  mensaje: string;
}

// Números de contacto
const numbers = {
  santiago: "+56942008410",
  ñuble: "+56996706640",
};

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [openCall, setOpenCall] = useState(false);
  const [openWsp, setOpenWsp] = useState(false);
  const { title, subtitle, img } = heroTexts[index];

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    telefono: "",
    region: "",
    comuna: "",
    direccion: "",
    servicio: "",
    mensaje: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    alert("¡Formulario enviado correctamente!");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section
      id="inicio"
      className="relative min-h-[80vh] flex flex-col justify-center text-white overflow-hidden"
    >
      {/* Fondo */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            filter: "brightness(0.95)",
            zIndex: 0,
          }}
        />
        <div className="absolute inset-0 bg-[#014C90]/10 z-10" />
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Texto y botones */}
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
              >
                <Phone className="mr-3 h-6 w-6 md:h-7 md:w-7" /> Llamar
              </button>
              <button
                onClick={() => {
                  setOpenWsp(!openWsp);
                  setOpenCall(false);
                }}
                className="flex items-center bg-green-600 hover:bg-green-700 px-6 py-4 rounded-xl font-semibold shadow-lg text-white text-base md:text-xl transition duration-300 select-none"
              >
                <span className="mr-3 flex items-center">
                  <FaWhatsapp size={28} color="white" />
                </span>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Formulario */}
          <div className="w-full flex justify-center lg:justify-end mt-2 lg:mt-0">
            <Card className="rounded-3xl shadow-2xl bg-white p-4 max-w-md w-full">
              <CardHeader className="pb-4">
                <h1 className="text-xl md:text-2xl font-bold text-[#002D71] text-center">
                  ¡Obtén una <span className="text-orange-500">Cotización Ahora!</span>
                </h1>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <InputSection formData={formData} handleChange={handleChange} />
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

        <div className="mt-12 text-center">
          <h2 className="text-2xl lg:text-2xl md:text-2xl font-extrabold text-white">
            Atención en: Santiago, Valparaíso, O’Higgins, Maule, Ñuble y Bío Bío
          </h2>
        </div>
      </div>

      {/* Modal Llamadas */}
      {openCall && (
        <Modal onClose={() => setOpenCall(false)}>
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
        </Modal>
      )}

      {/* Modal WhatsApp */}
      {openWsp && (
        <Modal onClose={() => setOpenWsp(false)}>
          <h3 className="text-2xl font-bold mb-6 select-none">WhatsApp a:</h3>
          <ul className="space-y-4 text-lg">
            <li>
              <a
                href={`https://wa.me/${numbers.santiago.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-3 rounded hover:bg-green-100 text-green-700 font-semibold transition"
              >
                Santiago: {numbers.santiago}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${numbers.ñuble.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-3 rounded hover:bg-green-100 text-green-700 font-semibold transition"
              >
                Ñuble: {numbers.ñuble}
              </a>
            </li>
          </ul>
        </Modal>
      )}
    </section>
  );
}

// Modal tipado
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6 relative max-w-md w-full text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
          aria-label="Cerrar"
        >
          <X className="h-6 w-6" />
        </button>
        {children}
      </div>
    </div>
  );
}

// InputSection tipado
interface InputSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

function InputSection({ formData, handleChange }: InputSectionProps) {
  return (
    <>
      {/* Nombre y Email */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Nombre completo"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>
      </div>

      {/* Teléfono, Servicio, Región y Comuna en 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <Input
            id="telefono"
            name="telefono"
            type="tel"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="+56 9 1234 5678"
            required
          />
        </div>

        <div>
          <label htmlFor="servicio" className="block text-sm font-medium text-gray-700">
            Tipo de Servicio
          </label>
          <select
            id="servicio"
            name="servicio"
            value={formData.servicio}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            required
          >
            <option value="">Selecciona un servicio</option>
            <option value="deteccion_fugas">Detección de fugas</option>
            <option value="destapes">Destapes y limpieza</option>
            <option value="video_inspeccion">Video inspección</option>
          </select>
        </div>

        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Región
          </label>
          <Input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={handleChange}
            placeholder="Región"
            required
          />
        </div>

        <div>
          <label htmlFor="comuna" className="block text-sm font-medium text-gray-700">
            Comuna
          </label>
          <Input
            id="comuna"
            name="comuna"
            type="text"
            value={formData.comuna}
            onChange={handleChange}
            placeholder="Comuna"
            required
          />
        </div>
      </div>

      {/* Dirección y Mensaje */}
      <div className="grid grid-cols-1 gap-3 mt-3">
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">
            Dirección
          </label>
          <Input
            id="direccion"
            name="direccion"
            type="text"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle, Número"
            required
          />
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">
            Mensaje
          </label>
          <Textarea
            id="mensaje"
            name="mensaje"
            value={formData.mensaje}
            onChange={handleChange}
            placeholder="Detalle tu solicitud"
            rows={3}
          />
        </div>
      </div>
    </>
  );
}
