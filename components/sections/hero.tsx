"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname } from "next/navigation";
import { usePersistentState, usePersistentFormState, usePersistentCarouselState } from "@/hooks/use-persistent-state";
import { useFormSubmitService } from "@/hooks/use-formsubmit-service";
import { useFormValidation, type FormData as ValidationFormData } from "@/hooks/use-form-validation";
import { FormAlert, ValidationAlert } from "@/components/ui/form-alert";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Image from "next/image";
import { REGIONES_Y_COMUNAS } from "@/lib/regions-communes";

// Textos del hero
const heroTexts = [
  {
    title: "¿Tienes una fuga de agua?",
    subtitle: "En Améstica Ltda. la detectamos rápido, preciso y sin dañar tus instalaciones.",
    img: "/evidencia3.webp",
  },
  {
    title: "¿Problemas con el alcantarillado?",
    subtitle: "Realizamos destapes rápidos y eficientes.",
    img: "/IMG_2425.JPG",
  },
  {
    title: "¿Necesitas inspeccionar tus tuberías?",
    subtitle: "Nuestra videoinspección detecta fallas rápida y fácilmente, sin romper nada.",
    img: "/IMG_2614.JPG",
  },
];

// Usar el mapeo completo de regiones y comunas
const regionesYComunas = REGIONES_Y_COMUNAS;

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
  // Estados persistentes
  const { state: index, setState: setIndex, isLoaded: carouselLoaded } = usePersistentCarouselState(
    "hero-carousel-index",
    heroTexts.length,
    0
  );
  
  const { state: openCall, setState: setOpenCall } = usePersistentState(
    "hero-call-modal",
    false
  );
  
  const { state: openWsp, setState: setOpenWsp } = usePersistentState(
    "hero-whatsapp-modal",
    false
  );

  const { state: formData, setState: setFormData, isLoaded: formLoaded } = usePersistentFormState(
    "hero-form-data",
    {
      nombre: "",
      email: "",
      telefono: "",
      region: "",
      comuna: "",
      direccion: "",
      servicio: "",
      mensaje: "",
    }
  );

  // Hook para envío de correos
  const { sendQuoteEmail, isLoading: isSubmitting } = useFormSubmitService();
  
  // Hook para validación de formulario
  const { errors, validateForm, validateSingleField, clearError, clearAllErrors } = useFormValidation();

  // Estados no persistentes (se resetean en cada carga)
  const [statusMessage, setStatusMessage] = useState<{ type: string; text: string } | null>(null);
  
  const { title, subtitle, img } = heroTexts[index] || heroTexts[0];
  const pathname = usePathname();

  // No necesitamos preload manual, Next.js Image se encarga

  // Cambio automático de hero con transición más suave
  useEffect(() => {
    // Solo iniciar el carrusel automático si el estado está cargado
    if (!carouselLoaded) return;
    
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % heroTexts.length);
    }, 6000); // Aumentado a 6 segundos para mejor experiencia
    return () => clearInterval(interval);
  }, [carouselLoaded, setIndex]);

  // Scroll al inicio de la página solo cuando se navega a una nueva página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Solo hacer scroll si no estamos en la sección de contacto
      const contactElement = document.querySelector('#contacto');
      const isInContactSection = window.location.hash === '#contacto' || 
                                 (contactElement && contactElement.getBoundingClientRect().top < window.innerHeight);
      
      if (!isInContactSection) {
        window.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validar el campo en tiempo real y limpiar errores
    if (errors[field]) {
      clearError(field);
    }
    
    // Validar el campo si tiene valor
    if (value.trim()) {
      validateSingleField(field, value);
    }
  };

  const handleRegionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, region: value, comuna: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    clearAllErrors();

    // Validar el formulario antes de enviar
    const isValid = validateForm(formData);
    if (!isValid) {
      setStatusMessage({ 
        type: "error", 
        text: "Por favor, corrige los errores en el formulario antes de enviar." 
      });
      setTimeout(() => setStatusMessage(null), 5000);
      return;
    }

    try {
      const result = await sendQuoteEmail({
        ...formData,
        formType: 'hero'
      });

      if (result.success) {
        setStatusMessage({ 
          type: "success", 
          text: result.message 
        });

        // Limpiar formulario después del envío exitoso
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
        clearAllErrors();
      } else {
        setStatusMessage({ 
          type: "error", 
          text: result.message 
        });
      }

      setTimeout(() => setStatusMessage(null), 5000);
    } catch (error) {
      console.error('Error al enviar cotización:', error);
      setStatusMessage({ 
        type: "error", 
        text: "Error inesperado. Por favor, inténtalo nuevamente." 
      });
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const comunasDisponibles = formData.region
    ? [...(regionesYComunas[formData.region as keyof typeof regionesYComunas] || [])]
    : [];

  return (
    <section
      id="Inicio"
      className="relative h-[300vh] sm:h-[200vh] md:h-screen lg:h-screen xl:h-screen flex flex-col justify-start md:justify-center text-white overflow-hidden"
    >
      {/* Fondo optimizado con Next.js Image para carga inmediata */}
      <div className="absolute inset-0">
        {heroTexts.map((text, i) => {
          const isCurrentImage = i === index;
          
          return (
            <div
              key={text.img}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                isCurrentImage ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Next.js Image optimizada para carga inmediata */}
              <Image
                src={text.img}
                alt={`Imagen de fondo ${i + 1}`}
                fill
                priority={i === 0} // Solo la primera imagen es priority
                quality={90}
                sizes="100vw"
                className="object-cover"
                style={{
                  filter: "brightness(0.95) contrast(1.05) saturate(1.1)",
                }}
              />
            </div>
          );
        })}
        
        {/* Overlay con gradiente mejorado */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#014C90]/20 via-[#014C90]/10 to-[#014C90]/30 z-20" />
      </div>

      {/* Indicadores de navegación */}
      <div className="absolute bottom-48 sm:bottom-20 md:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3 hidden sm:flex">
        {heroTexts.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i === index
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
              }`}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}
      </div>

      <div className="relative z-20 w-full px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 md:py-8 lg:py-10">
        <div className="max-w-screen-xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-12 lg:gap-20 items-start md:items-center">
          {/* Texto y botones */}
          <div className="w-full text-center lg:text-left self-center">
              <h1 id="hero-title" className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-balance">
                {title} <br />
                <span className="text-lg md:text-xl lg:text-3xl text-white font-bold bg-black/30 backdrop-blur-sm px-3 py-2 shadow-lg mt-4 leading-relaxed" style={{
                  boxDecorationBreak: 'clone',
                  WebkitBoxDecorationBreak: 'clone',
                  borderRadius: '12px',
                  display: 'inline'
                }}>{subtitle}</span>
              </h1>
            <div className="flex justify-center lg:justify-start flex-wrap gap-6 mt-8 md:mt-12">
              <button
                type="button"
                onClick={() => {
                  setOpenCall(!openCall);
                  setOpenWsp(false);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 px-6 py-4 rounded-xl font-semibold shadow-lg text-white text-base md:text-xl transition duration-300 select-none cursor-pointer"
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
              >
                <Phone className="mr-3 h-6 w-6 md:h-7 md:w-7" /> Llamar
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpenWsp(!openWsp);
                  setOpenCall(false);
                }}
                className="flex items-center bg-green-600 hover:bg-green-700 px-6 py-4 rounded-xl font-semibold shadow-lg text-white text-base md:text-xl transition duration-300 select-none cursor-pointer"
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
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
              <CardHeader className="pb-3">
                <h1 className="text-xl md:text-2xl font-bold text-[#002D71] text-center">
                  ¡Obtén una <span className="text-orange-500">cotización ahora!</span>
                </h1>
              </CardHeader>
              <CardContent className="pt-0">
                <form onSubmit={handleSubmit} className="space-y-1">
                  <InputSection
                    formData={formData}
                    handleChange={(e) => handleInputChange(e.target.name as keyof FormData, e.target.value)}
                    handleInputChange={handleInputChange}
                    handleRegionChange={handleRegionChange}
                    comunasDisponibles={comunasDisponibles}
                    errors={errors}
                  />

                  {/* Alerta de errores de validación */}
                  {Object.keys(errors).length > 0 && (
                    <ValidationAlert 
                      errors={errors} 
                      onClose={clearAllErrors}
                      className="mt-2"
                    />
                  )}

                  {/* Mensaje de estado del envío */}
                  {statusMessage && (
                    <FormAlert
                      type={statusMessage.type as 'success' | 'error'}
                      message={statusMessage.text}
                      onClose={() => setStatusMessage(null)}
                      className="mt-2"
                    />
                  )}

                  <div className="flex justify-center">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-2 bg-orange-500 hover:bg-[#e1550f] text-white text-lg font-semibold py-2 px-8 rounded-full transition-colors cursor-pointer"
                      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    >
                      {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 md:mt-12 text-center">
          <h2 className="text-xl md:text-2xl lg:text-2xl font-extrabold text-white">
            Cobertura en regiones: Metropolitana, Valparaíso, O&apos;Higgins, Maule, Ñuble y Bío Bío
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
                href={`https://wa.me/${numbers.santiago.replace(/\D/g, "")}?text=¡Hola! Me contacto con Améstica Ltda. desde su sitio web. Necesito información sobre un servicio. ¿Podrían ayudarme?`}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-5 py-3 rounded hover:bg-green-100 text-green-700 font-semibold transition"
              >
                Santiago: {numbers.santiago}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${numbers.ñuble.replace(/\D/g, "")}?text=¡Hola! Me contacto con Améstica Ltda. desde su sitio web. Necesito información sobre un servicio. ¿Podrían ayudarme?`}
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
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 cursor-pointer"
          aria-label="Cerrar"
          onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
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
  handleInputChange: (field: keyof FormData, value: string) => void;
  handleRegionChange: (value: string) => void;
  comunasDisponibles: string[];
  errors: Record<string, string | undefined>;
}

function InputSection({ formData, handleChange, handleInputChange, handleRegionChange, comunasDisponibles, errors }: InputSectionProps) {
  return (
    <>
      {/* Nombre y Email */}
      <div className="grid grid-cols-1 gap-2">
        <div className="space-y-1">
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre *</label>
          <Input 
            id="nombre" 
            name="nombre" 
            type="text" 
            value={formData.nombre} 
            onChange={handleChange} 
            placeholder="Nombre completo" 
            required 
            className={`text-gray-900 h-9 bg-white border rounded-md focus:ring-2 focus:ring-offset-0 pl-2 pr-3 py-2 ${
              errors.nombre 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200'
            }`} 
          />
          {errors.nombre && (
            <p className="text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="amestica@gmail.com" 
            required 
            className={`text-gray-900 h-9 bg-white border rounded-md focus:ring-2 focus:ring-offset-0 pl-2 pr-3 py-2 ${
              errors.email 
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:border-gray-400 focus:ring-gray-200'
            }`} 
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email}</p>
          )}
        </div>
      </div>

      {/* Teléfono y Servicio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
        <div className="space-y-1">
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono *</label>
          <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+56 9 1234 5678" required className="text-gray-900 h-9 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2" />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="servicio"
            className="block text-sm font-medium text-gray-700"
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
                         <SelectTrigger className="w-full text-gray-900 h-9 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2 flex items-center justify-between">
               <SelectValue placeholder="Seleccione servicio" className="text-gray-600 font-medium text-left flex-1 min-w-0 overflow-hidden text-ellipsis pl-0" />
             </SelectTrigger>
            <SelectContent className="w-full bg-white">
              <SelectItem
                value="deteccion_fugas"
                className="text-gray-900"
              >
                Detección de fugas de agua
              </SelectItem>
              <SelectItem
                value="destape_alcantarillado"
                className="text-gray-900"
              >Destape de alcantarillado
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
        <div className="space-y-1">
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">Región *</label>
          <Select onValueChange={handleRegionChange} value={formData.region} required>
                         <SelectTrigger className="w-full text-gray-900 h-9 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2 flex items-center justify-between">
               <SelectValue placeholder="Región" className="text-gray-600 font-medium text-left flex-1 min-w-0 overflow-hidden text-ellipsis pl-0" />
             </SelectTrigger>
            <SelectContent className="w-full bg-white">
              {Object.keys(regionesYComunas).map((region) => (
                <SelectItem key={region} value={region} className="text-gray-900">{region}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label htmlFor="comuna" className="block text-sm font-medium text-gray-700">Comuna *</label>
          <Select onValueChange={(value: string) => handleInputChange("comuna", value)} value={formData.comuna} disabled={!formData.region} required>
                         <SelectTrigger className="w-full text-gray-900 h-9 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2 flex items-center justify-between">
               <SelectValue placeholder="Comuna" className="text-gray-600 font-medium text-left flex-1 min-w-0 overflow-hidden text-ellipsis pl-0" />
             </SelectTrigger>
            <SelectContent className="w-full bg-white">
              {comunasDisponibles.length > 0
                ? comunasDisponibles.map((comuna) => <SelectItem key={comuna} value={comuna} className="text-gray-900">{comuna}</SelectItem>)
                : <div className="p-2 text-sm text-gray-500">Selecciona una región primero</div>}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Dirección y Mensaje */}
      <div className="grid grid-cols-1 gap-2 mt-1">
        <div className="space-y-1">
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección *</label>
          <Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} placeholder="Calle, Número" required className="text-gray-900 h-9 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2" />
        </div>
        <div className="space-y-1">
          <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700">Mensaje</label>
          <Textarea id="mensaje" name="mensaje" value={formData.mensaje} onChange={handleChange} placeholder="Explique su requerimiento" rows={2} className="text-gray-900 bg-white border border-gray-300 rounded-md focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-offset-0 pl-2 pr-3 py-2" />
        </div>
      </div>
    </>
  );
}
