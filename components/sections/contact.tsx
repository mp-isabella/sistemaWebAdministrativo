"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { motion, useAnimation, useInView, Variants } from "framer-motion";
import Image from "next/image";

// Paleta de colores unificada
const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  highlight: "#F46015",
  white: "#FFFFFF",
  gray: "#4B5563",
  lightGray: "#6B7280",
};

// Animación de entrada para la sección
const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// Datos para la selección dinámica de Región y Comuna
const regionesYComunas = {
  "Región Metropolitana": [
    "Santiago",
    "Providencia",
    "Ñuñoa",
    "Las Condes",
    "Vitacura",
  ],
  "Región de Ñuble": ["Chillán", "Coihueco", "San Carlos", "Quillón"],
  "Región de Valparaíso": [
    "Valparaíso",
    "Viña del Mar",
    "Concón",
    "Quilpué",
    "Villa Alemana",
  ],
};

export default function SeccionContactoOp2(): React.JSX.Element {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    comuna: "",
    direccion: "",
    service: "",
    date: "",
    message: "",
  });

  // Estado para la animación de scroll
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  // Manejador para los cambios del formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Manejador para el cambio de región, reinicia la comuna
  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value, comuna: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
  };

  const comunasDisponibles = formData.region
    ? regionesYComunas[formData.region as keyof typeof regionesYComunas] || []
    : [];

  return (
    <section
      id="contacto"
      className="relative py-20 px-4 md:px-8 lg:px-16"
      style={{ backgroundColor: colors.white }}
    >
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"
            style={{ color: colors.dark }}
          >
            Contáctanos
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ color: colors.medium }}
          >
            Estamos aquí para resolver tus dudas y ayudarte con tus proyectos.
            Envíanos un mensaje o visítanos.
          </p>
        </div>

        <motion.div
          ref={ref}
          className="bg-gray-100 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-0"
          variants={cardVariants}
          initial="hidden"
          animate={controls}
        >
          {/* Columna Izquierda: Información de Contacto y Medios de Pago */}
          <div
            className="p-8 md:p-12 text-white flex flex-col justify-between"
            style={{ backgroundColor: colors.dark }}
          >
            <div>
              <h3 className="text-2xl font-bold mb-6">Información</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Phone size={24} className="flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">Teléfono</p>
                    <p className="opacity-80">Santiago: +56942008410</p>
                    <p className="opacity-80">Ñuble: +56996706640</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={24} className="flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">Correo</p>
                    <p className="opacity-80">amesticaltda@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={24} className="flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-lg">Horario</p>
                    <p className="opacity-80">Lunes a viernes: 8:00 - 20:00 </p>
                    <p className="opacity-80">Sábado: 9:00 - 19:00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white border-opacity-30">
              <h3 className="text-2xl font-bold mb-4">Medios de Pago</h3>
              <Image
                src="/logos/mediosdepago.png"
                alt="Medios de pago disponibles"
                width={200}
                height={100}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>

          {/* Columna Derecha: Formulario y Mapas */}
          <div className="lg:col-span-2 p-8 md:p-12 bg-white">
            <h3
              className="text-3xl font-bold mb-8"
              style={{ color: colors.dark }}
            >
              Agenda un Servicio
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Formulario */}
              <form onSubmit={handleSubmit} className="md:col-span-1 space-y-4">
                {/* Campos individuales */}
                <Input
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
                <Input
                  placeholder="tu@email.com"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />

                {/* Campos en dos columnas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="+56 9 1234 5678"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Dirección"
                    value={formData.direccion}
                    onChange={(e) =>
                      handleInputChange("direccion", e.target.value)
                    }
                  />

                  {/* Región */}
                  <Select
                    onValueChange={handleRegionChange}
                    value={formData.region}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Región" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(regionesYComunas).map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Comuna */}
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("comuna", value)
                    }
                    value={formData.comuna}
                    disabled={!formData.region}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Comuna" />
                    </SelectTrigger>
                    <SelectContent>
                      {comunasDisponibles.length > 0 ? (
                        comunasDisponibles.map((comuna) => (
                          <SelectItem key={comuna} value={comuna}>
                            {comuna}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">
                          Selecciona una región primero
                        </div>
                      )}
                    </SelectContent>
                  </Select>

                  {/* Servicio y Fecha al lado derecho */}
                  <Select
                    onValueChange={(value) =>
                      handleInputChange("service", value)
                    }
                    value={formData.service}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deteccion">
                        Detección de fugas
                      </SelectItem>
                      <SelectItem value="reparacion_instalacion">
                        Reparación e instalación
                      </SelectItem>
                      <SelectItem value="mantencion_preventiva">
                        Mantención preventiva
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Mensaje */}
                <Textarea
                  placeholder="Cuéntanos sobre la fuga o problema que tienes..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                  className="min-h-[120px]"
                />

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="min-w-min font-semibold text-lg py-3 px-8 rounded-full transition-colors"
                    style={{
                      backgroundColor: colors.highlight,
                      color: colors.white,
                    }}
                  >
                    Enviar Solicitud
                  </Button>
                </div>
              </form>

              {/* Mapas de Ubicación */}
              <div className="space-y-6 md:col-span-1">
                <div className="rounded-lg shadow-md overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13303.491686461875!2d-70.59752538965936!3d-33.454238596645315!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cf5025d2787f%3A0x2a0f1d5336d3c018!2s%C3%91u%C3%B1oa%2C%20Regi%C3%B3n%20Metropolitana!5e0!3m2!1sen!2scl!4v1628172935272!5m2!1sen!2scl"
                    className="w-full h-[250px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de la oficina en Ñuñoa"
                  ></iframe>
                </div>
                <div className="rounded-lg shadow-md overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14949.771617594957!2d-72.29631622934279!3d-36.5670879659754!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9669527f5518b087%3A0xf64c127e9f3b185d!2sCoihueco%2C%20%C3%91uble%2C%20Chile!5e0!3m2!1sen!2scl!4v1628173007621!5m2!1sen!2scl"
                    className="w-full h-[250px]"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Mapa de la oficina en Coihueco"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
