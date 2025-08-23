"use client";

import React, { useState, useEffect } from "react";
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
import Image from "next/image";

// Paleta de colores
const colors = {
  dark: "#002D71",
  medium: "#014C90",
  strong: "#016AAB",
  highlight: "#F46015",
  white: "#FFFFFF",
  gray: "#4B5563",
  lightGray: "#6B7280",
};

// Regiones y comunas
const regionesYComunas = {
  "Región Metropolitana": [
    "Santiago",
    "Providencia",
    "Ñuñoa",
    "Las Condes",
    "Vitacura",
    "Maipú",
    "San Miguel",
    "La Florida",
    "Peñalolén",
    "La Reina",
  ],
  "Región de Valparaíso": [
    "Valparaíso",
    "Viña del Mar",
    "Concón",
    "Quilpué",
    "Villa Alemana",
    "San Antonio",
    "Quillota",
    "La Calera",
    "Los Andes",
    "San Felipe",
  ],
  "Región de O'Higgins": [
    "Rancagua",
    "San Fernando",
    "Santa Cruz",
    "Pichilemu",
    "Palmilla",
    "Chimbarongo",
    "Nancagua",
    "Machalí",
    "Graneros",
    "Doñihue",
  ],
  "Región del Maule": [
    "Talca",
    "Curicó",
    "Constitución",
    "Linares",
    "San Javier",
    "Molina",
    "Cauquenes",
    "Parral",
    "San Clemente",
    "Pelluhue",
  ],
  "Región de Ñuble": [
    "Chillán",
    "Coihueco",
    "San Carlos",
    "Quillón",
    "Bulnes",
    "Yungay",
    "Pinto",
    "El Carmen",
    "San Ignacio",
    "Pemuco",
  ],
  "Región del Bío Bío": [
    "Concepción",
    "Talcahuano",
    "Chillán",
    "Los Ángeles",
    "Coronel",
    "San Pedro de la Paz",
    "Hualpén",
    "Lota",
    "Lebu",
    "Arauco",
  ],
};

export default function Contact(): React.JSX.Element {
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    region: "",
    comuna: "",
    direccion: "",
    servicio: "",
    mensaje: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<null | { type: string; text: string }>(null);

  // Asegurar que el componente esté montado antes de renderizar contenido dinámico
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value, comuna: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStatusMessage({ type: "success", text: "¡Correo enviado con éxito!" });
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        region: "",
        comuna: "",
        direccion: "",
        servicio: "",
        mensaje: "",
      });
    } catch {
      setStatusMessage({
        type: "error",
        text: "Hubo un error al enviar el correo. Inténtalo nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const comunasDisponibles = formData.region
    ? regionesYComunas[formData.region as keyof typeof regionesYComunas] || []
    : [];

  // Renderizar contenido básico durante SSR para evitar hidratación
  if (!isMounted) {
    return (
      <section
        id="contacto"
        className="py-32 px-4 md:px-8 lg:px-16"
        style={{ backgroundColor: colors.white }}
      >
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h2
              className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"
              style={{ color: colors.dark }}
            >
              Contacto
            </h2>
            <p
              className="text-lg max-w-3xl mx-auto leading-relaxed font-medium"
              style={{ color: colors.medium }}
            >
              Estamos a tu disposición para resolver tus dudas y brindarte el apoyo
              que necesite. Puedes contactarnos a través de una llamada telefónica, mensaje por WhatsApp, correo
              electrónico o mediante nuestro servicio de asistencia virtual.
            </p>
          </div>
          <div className="bg-gray-100 shadow-2xl rounded-3xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div
                className="p-4 md:p-6 text-white flex flex-col justify-between min-h-[600px]"
                style={{ backgroundColor: colors.dark }}
              >
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white">Información</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Phone size={24} />
                    <div>
                      <p className="font-semibold text-lg">Teléfono</p>
                      <p className="opacity-80">Santiago: +56 9 4200 8410</p>
                      <p className="opacity-80">Ñuble: +56 9 9670 6640</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={24} />
                    <div>
                      <p className="font-semibold text-lg">Correo</p>
                      <p className="opacity-80">amesticaltda@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin size={24} />
                    <div>
                      <p className="font-semibold text-lg">Direcciones</p>
                      <p className="opacity-80">
                        Hamburgo 1398, Ñuñoa, Santiago
                      </p>
                      <p className="opacity-80">
                        Balmaceda 1375, Coihueco, Ñuble
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Clock size={24} />
                    <div>
                      <p className="font-semibold text-lg">Horario</p>
                      <p className="opacity-80">Lunes a viernes: 8:00 - 20:00</p>
                      <p className="opacity-80">Sábado: 9:00 - 19:00</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 p-6 md:p-8 bg-white flex flex-col justify-start min-h-[600px]">
                <div className="text-center">
                  <h3 className="text-2xl font-bold" style={{ color: colors.dark }}>Cargando formulario...</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="contacto"
      className="py-32 px-4 md:px-8 lg:px-16"
      style={{ backgroundColor: colors.white }}
    >
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-4xl md:text-5xl font-extrabold leading-tight mb-4"
            style={{ color: colors.dark }}
          >
            Contacto
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto leading-relaxed font-medium"
            style={{ color: colors.medium }}
          >
            Estamos a tu disposición para resolver tus dudas y brindarte el apoyo
            que necesite. Puedes contactarnos a través de una llamada telefónica, mensaje por WhatsApp, correo
            electrónico o mediante nuestro servicio de asistencia virtual.
          </p>
        </div>

        <div className="bg-gray-100 shadow-2xl rounded-3xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
            {/* Columna Izquierda - Información */}
            <div
              className="p-4 md:p-6 text-white flex flex-col justify-between min-h-[600px]"
              style={{ backgroundColor: colors.dark }}
            >
              {/* Título de la sección */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white">Información</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <Phone size={24} />
                  <div>
                    <p className="font-semibold text-lg">Teléfono</p>
                    <p className="opacity-80">Santiago: +56 9 4200 8410</p>
                    <p className="opacity-80">Ñuble: +56 9 9670 6640</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail size={24} />
                  <div>
                    <p className="font-semibold text-lg">Correo</p>
                    <p className="opacity-80">amesticaltda@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <MapPin size={24} />
                  <div>
                    <p className="font-semibold text-lg">Direcciones</p>
                    <p className="opacity-80">
                      Hamburgo 1398, Ñuñoa, Santiago
                    </p>
                    <p className="opacity-80">
                      Balmaceda 1375, Coihueco, Ñuble
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock size={24} />
                  <div>
                    <p className="font-semibold text-lg">Horario</p>
                    <p className="opacity-80">Lunes a viernes: 8:00 - 20:00</p>
                    <p className="opacity-80">Sábado: 9:00 - 19:00</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white border-opacity-30">
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

            {/* Columna Derecha */}
            <div className="lg:col-span-2 p-6 md:p-8 bg-white flex flex-col justify-start min-h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start h-full">
                {/* Formulario */}
                <div className="md:col-span-1">
                  {/* Título de la sección */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: colors.dark }}>Agenda tu servicio</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 w-full">
                    {statusMessage && (
                      <div
                        className={`p-3 rounded-lg text-center font-medium ${
                          statusMessage.type === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusMessage.text}
                      </div>
                    )}

                    {/* Nombre y Email */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label
                          htmlFor="nombre"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Nombre *
                        </label>
                        <Input
                          id="nombre"
                          name="nombre"
                          type="text"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Nombre completo"
                          required
                          className="text-gray-900"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Email *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="correo@ejemplo.com"
                          required
                          className="text-gray-900"
                        />
                      </div>
                    </div>

                    {/* Teléfono y Servicio */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="telefono"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Teléfono *
                        </label>
                        <Input
                          id="telefono"
                          name="telefono"
                          type="tel"
                          value={formData.telefono}
                          onChange={handleChange}
                          placeholder="+56 9 1234 5678"
                          required
                          className="text-gray-900"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="servicio"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Tipo de servicio *
                        </label>
                        <Select
                          onValueChange={(value: string) =>
                            handleInputChange("servicio", value)
                          }
                          value={formData.servicio}
                          required
                        >
                          <SelectTrigger className="w-full text-gray-900 bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 px-3 py-2.5 rounded-lg justify-between">
                            <SelectValue placeholder="Seleccione servicio" className="text-gray-600 font-medium" />
                          </SelectTrigger>
                          <SelectContent className="w-full" position="popper" side="bottom" sideOffset={4}>
                            <SelectItem
                              value="deteccion_fugas"
                              className="text-gray-900"
                            >
                              Detección de fugas de agua
                            </SelectItem>
                            <SelectItem
                              value="destape_alcantarillado"
                              className="text-gray-900"
                            >
                              Destape de alcantarillado
                            </SelectItem>
                            <SelectItem
                              value="videoinspeccion"
                              className="text-gray-900"
                            >
                              Videoinspección de ductos
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Región y Comuna */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="region"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Región *
                        </label>
                        <Select
                          onValueChange={handleRegionChange}
                          value={formData.region}
                          required
                        >
                          <SelectTrigger className="w-full text-gray-900 bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 px-3 py-2">
                            <SelectValue placeholder="Región" />
                          </SelectTrigger>
                          <SelectContent className="w-full" position="popper" side="bottom" sideOffset={4}>
                            {Object.keys(regionesYComunas).map((region) => (
                              <SelectItem
                                key={region}
                                value={region}
                                className="text-gray-900"
                              >
                                {region}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label
                          htmlFor="comuna"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Comuna *
                        </label>
                        <Select
                          onValueChange={(value: string) =>
                            handleInputChange("comuna", value)
                          }
                          value={formData.comuna}
                          disabled={!formData.region}
                          required
                        >
                          <SelectTrigger className="w-full text-gray-900 bg-white border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 px-3 py-2">
                            <SelectValue placeholder="Comuna" />
                          </SelectTrigger>
                          <SelectContent className="w-full" position="popper" side="bottom" sideOffset={4}>
                            {comunasDisponibles.length > 0 ? (
                              comunasDisponibles.map((comuna) => (
                                <SelectItem
                                  key={comuna}
                                  value={comuna}
                                  className="text-gray-900"
                                >
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
                      </div>
                    </div>

                    {/* Dirección y Mensaje */}
                    <div className="grid grid-cols-1 gap-4 mt-4">
                      <div>
                        <label
                          htmlFor="direccion"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Dirección *
                        </label>
                        <Input
                          id="direccion"
                          name="direccion"
                          type="text"
                          value={formData.direccion}
                          onChange={handleChange}
                          placeholder="Calle, Número"
                          required
                          className="text-gray-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="mensaje"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Mensaje
                        </label>
                        <Textarea
                          id="mensaje"
                          name="mensaje"
                          value={formData.mensaje}
                          onChange={handleChange}
                          placeholder="Explique su requerimiento"
                          rows={3}
                          className="text-gray-900"
                        />
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="min-w-min font-semibold text-lg py-3 px-8 rounded-full transition-colors"
                        style={{
                          backgroundColor: colors.highlight,
                          color: colors.white,
                        }}
                      >
                        {isSubmitting ? "Enviando..." : "Enviar"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Mapas */}
                <div className="md:col-span-1">
                  {/* Título de la sección */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold" style={{ color: colors.dark }}>Ubicaciones</h3>
                  </div>

                  <div className="flex flex-col gap-4 justify-start items-center h-full">
                    <div className="w-full max-w-lg h-64">
                      <iframe
                        title="Améstica Ltda, Santiago"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3697.770767583296!2d-70.5803284237945!3d-33.44164099706208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9662cfac5031be41%3A0xf4a12621448d42df!2sHamburgo%201398%2C%207790236%20%C3%91u%C3%B1oa%2C%20Regi%C3%B3n%20Metropolitana!5e1!3m2!1ses!2scl!4v1755140051430!5m2!1ses!2scl"
                        width="100%"
                        height="100%"
                        className="rounded-xl w-full h-full border-0"
                        loading="lazy"
                      ></iframe>
                    </div>

                    <div className="w-full max-w-lg h-64">
                      <iframe
                        title="Améstica Ltda, Ñuble"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3556.3665169833657!2d-71.83462282365822!3d-36.62685266714297!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x966ed6eade46d19d%3A0xaa904d2bd2b607fd!2sC.%20Balmaceda%201375%2C%207380000%20Coihueco%2C%20%C3%91uble!5e1!3m2!1ses!2scl!4v1755140190560!5m2!1ses!2scl"
                        width="100%"
                        height="100%"
                        className="rounded-xl w-full h-full border-0"
                        loading="lazy"
                      ></iframe>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}