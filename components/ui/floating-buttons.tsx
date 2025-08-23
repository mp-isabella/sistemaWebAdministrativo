"use client";

import { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaPhoneAlt, FaHeadset, FaTimes, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";
import { useIsClient } from '@/hooks/use-hydration-safe';

export default function FloatingButtons() {
  const [showWsp, setShowWsp] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isClient = useIsClient();
  const [chatMessages, setChatMessages] = useState<Array<{type: 'user' | 'bot', message: string, timestamp: Date}>>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const wspRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mostrar botones después de un delay
  useEffect(() => {
    if (!isClient) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isClient]);

  // Chatbot IA profesional para Améstica Ltda
  const chatbotResponses = {
    greeting: "¡Hola! Soy el asistente virtual de Améstica Ltda. 👋\n\nSomos especialistas en servicios profesionales de fontanería y alcantarillado. ¿En qué puedo ayudarte hoy?\n\nPuedo informarte sobre:\n• Nuestros servicios especializados\n• Cobertura y horarios\n• Precios y cotizaciones\n• Agendar visitas técnicas\n• Información de contacto",
    
    services: "🔧 **NUESTROS SERVICIOS PROFESIONALES:**\n\n**Detección de Fugas de Agua:**\n• Tecnología de ultrasonido y gas trazador\n• Localizadores de cañerías y termografía\n• Detección sin dañar instalaciones\n• Reparación profesional de cañerías\n\n**Destape de Alcantarillado:**\n• Varillas y máquinas eléctricas especializadas\n• Aire comprimido e hidrolavadoras de alta presión\n• Eliminación rápida y efectiva de obstrucciones\n• Funcionamiento óptimo de instalaciones sanitarias\n\n**Videoinspección de Tuberías:**\n• Cámaras especiales de alta definición\n• Detección de obstrucciones, fugas y daños\n• Diagnóstico preciso sin romper paredes\n• Planificación de reparaciones confiable",
    
    coverage: "🗺️ **COBERTURA DE SERVICIOS:**\n\n**Regiones atendidas:**\n• Región Metropolitana\n• Región de Valparaíso\n• Región de O'Higgins\n• Región del Maule\n• Región de Ñuble\n• Región del Bío Bío\n\n**Horarios de atención:**\n• Lunes a Viernes: 8:00 - 20:00 hrs\n• Sábados: 9:00 - 19:00 hrs\n\n¿En qué región necesitas el servicio?",
    
    pricing: "💰 **INFORMACIÓN DE PRECIOS:**\n\nNuestros precios varían según:\n• Tipo de servicio requerido\n• Complejidad del trabajo\n• Ubicación del servicio\n• Extensión del área a trabajar\n\n**Ofrecemos:**\n• Cotización gratuita y sin compromiso\n• Precios competitivos y transparentes\n• Diferentes opciones según tu presupuesto\n\n¿Te gustaría que te prepare una cotización personalizada?",
    
    contact: "📞 **CONTACTO DIRECTO:**\n\n**WhatsApp:**\n• Ñuble: +56 9 9670 6640\n• Santiago: +56 9 4200 8410\n\n**Teléfono:**\n• Mismos números para llamadas\n\n**Horarios de atención:**\n• Lunes a Viernes: 8:00 - 20:00 hrs\n• Sábados: 9:00 - 19:00 hrs\n\n¿Prefieres que te contacte un especialista ahora?",
    
    schedule: "📅 **AGENDAR SERVICIO:**\n\nPara programar tu visita técnica necesito:\n\n**Información requerida:**\n• Tipo de servicio (detección, destape, videoinspección)\n• Dirección exacta del servicio\n• Horario preferido (mañana/tarde)\n• Descripción del problema\n• Información de contacto\n\n**Proceso:**\n1. Cotización gratuita\n2. Confirmación de fecha y hora\n3. Visita técnica profesional\n4. Trabajo garantizado\n\n¿Te ayudo a completar estos datos?",
    
    guarantee: "✅ **NUESTRA GARANTÍA:**\n\n**Compromiso de calidad:**\n• Trabajo garantizado por escrito\n• Materiales de primera calidad\n• Técnicos certificados y experimentados\n• Seguimiento post-servicio\n\n**Garantías específicas:**\n• Detección de fugas: 6 meses\n• Destape de alcantarillado: 3 meses\n• Reparaciones: 1 año\n• Videoinspección: 30 días\n\n**Satisfacción garantizada o no pagas.**",
    
    about: "🏢 **SOBRE AMÉSTICA LTDA:**\n\n**Experiencia:**\n• Especialistas en servicios profesionales\n• Técnicos certificados y experimentados\n• Miles de clientes satisfechos\n\n**Valores:**\n• Profesionalismo\n• Puntualidad\n• Transparencia\n• Calidad garantizada\n\n**Tecnología:**\n• Equipos de última generación\n• Metodologías avanzadas\n• Soluciones innovadoras\n\n**Misión:** Brindar soluciones profesionales y confiables en servicios de fontanería y alcantarillado.",
    
    default: "Gracias por tu consulta. Para brindarte la mejor atención personalizada, te recomiendo contactar directamente con nuestro equipo especializado.\n\n¿Te gustaría que te conecte con un técnico profesional de Améstica Ltda. ahora?"
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Saludos y bienvenida
    if (message.includes('hola') || message.includes('buenos') || message.includes('buenas') || 
        message.includes('buen día') || message.includes('buenas tardes') || message.includes('buenas noches')) {
      return chatbotResponses.greeting;
    }
    
    // Servicios
    if (message.includes('servicio') || message.includes('que hacen') || message.includes('ofrecen') ||
        message.includes('detectan') || message.includes('destapan') || message.includes('videoinspección') ||
        message.includes('fuga') || message.includes('alcantarillado') || message.includes('tubería') ||
        message.includes('cañería') || message.includes('plomería') || message.includes('fontanería')) {
      return chatbotResponses.services;
    }
    
    // Cobertura y ubicación
    if (message.includes('cobertura') || message.includes('región') || message.includes('zona') ||
        message.includes('donde') || message.includes('ubicación') || message.includes('atendemos') ||
        message.includes('valparaíso') || message.includes('ohiggins') || message.includes('maule') ||
        message.includes('ñuble') || message.includes('bío bío') || message.includes('metropolitana')) {
      return chatbotResponses.coverage;
    }
    
    // Precios y costos
    if (message.includes('precio') || message.includes('costo') || message.includes('cuanto') ||
        message.includes('valor') || message.includes('tarifa') || message.includes('cotización') ||
        message.includes('presupuesto') || message.includes('pagar') || message.includes('dinero')) {
      return chatbotResponses.pricing;
    }
    
    // Contacto
    if (message.includes('contacto') || message.includes('llamar') || message.includes('whatsapp') ||
        message.includes('teléfono') || message.includes('número') || message.includes('comunicar') ||
        message.includes('hablar') || message.includes('especialista') || message.includes('técnico')) {
      return chatbotResponses.contact;
    }
    
    // Agendar y programar
    if (message.includes('agendar') || message.includes('cita') || message.includes('programar') ||
        message.includes('visita') || message.includes('ir') || message.includes('llegar') ||
        message.includes('fecha') || message.includes('hora') || message.includes('día') ||
        message.includes('reservar') || message.includes('solicitar')) {
      return chatbotResponses.schedule;
    }
    
    // Problemas y daños
    if (message.includes('problema') || message.includes('roto') || message.includes('daño') ||
        message.includes('malo') || message.includes('no funciona') || message.includes('tapado')) {
      return chatbotResponses.services;
    }
    
    // Garantías
    if (message.includes('garantía') || message.includes('garantizado') || message.includes('seguro') ||
        message.includes('confianza') || message.includes('calidad') || message.includes('certificado') ||
        message.includes('experiencia') || message.includes('años')) {
      return chatbotResponses.guarantee;
    }
    
    // Sobre la empresa
    if (message.includes('empresa') || message.includes('améstica') || message.includes('quienes') ||
        message.includes('somos') || message.includes('experiencia') || message.includes('historia') ||
        message.includes('certificación') || message.includes('registro') || message.includes('sii')) {
      return chatbotResponses.about;
    }
    
    // Horarios
    if (message.includes('hora') || message.includes('horario') || message.includes('cuando') ||
        message.includes('día') || message.includes('lunes') || message.includes('viernes') ||
        message.includes('sábado') || message.includes('domingo') || message.includes('fin de semana')) {
      return chatbotResponses.coverage;
    }
    
    // Respuesta por defecto
    return chatbotResponses.default;
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Agregar mensaje del usuario
    const newUserMessage = {
      type: 'user' as const,
      message: userMessage,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    // Simular typing
    setIsTyping(true);
    
    // Simular respuesta del bot con delay
    setTimeout(() => {
      const botResponse = getBotResponse(userMessage);
      const newBotMessage = {
        type: 'bot' as const,
        message: botResponse,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, newBotMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000); // Delay entre 1-3 segundos
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setShowCall(false);
    setShowWsp(false);
    
    // Inicializar chat con mensaje de bienvenida profesional si es la primera vez
    if (!isChatOpen && chatMessages.length === 0) {
      setTimeout(() => {
        const welcomeMessage = {
          type: 'bot' as const,
          message: "💧 ¡Bienvenido a Améstica Ltda.! 🏢\nSoy tu asistente virtual, listo para ayudarte con todo lo relacionado a fontanería y alcantarillado. 👷‍♂️💦\n\n✨ ¿Qué puedo hacer por ti hoy?\nPregunta sobre:\n🔹 Servicios especializados – Reparaciones, instalaciones y mantenimiento 🛠️\n🔹 Cobertura y horarios – Dónde y cuándo podemos atenderte 📍⏰\n🔹 Precios y cotizaciones – Transparencia total 💵💬\n🔹 Agendar visitas técnicas – Coordinemos tu visita 🗓️📞\n🔹 Información de contacto – Teléfonos, WhatsApp y email 📲✉️\n🔹 Garantías y calidad – Confianza en cada trabajo 🏅✅\n\n💡 Tip: ¡Puedes escribir tu consulta directamente o elegir una de las opciones!",
          timestamp: new Date()
        };
        setChatMessages([welcomeMessage]);
      }, 300);
    }
  };



  // Toggle WhatsApp y cerrar otros modales
  const toggleWsp = () => {
    setShowWsp((prev) => {
      if (!prev) {
        setShowCall(false);
        setIsChatOpen(false);
      }
      return !prev;
    });
  };

  // Toggle llamadas y cerrar otros modales
  const toggleCall = () => {
    setShowCall((prev) => {
      if (!prev) {
        setShowWsp(false);
        setIsChatOpen(false);
      }
      return !prev;
    });
  };

  // Cierra ventanas al hacer clic fuera
  useEffect(() => {
    if (!isClient) return;
    
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (showWsp && wspRef.current && !wspRef.current.contains(target)) {
        setShowWsp(false);
      }
      if (showCall && callRef.current && !callRef.current.contains(target)) {
        setShowCall(false);
      }
      if (isChatOpen && chatRef.current && !chatRef.current.contains(target)) {
        setIsChatOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWsp, showCall, isChatOpen, isClient]);

  // No renderizar nada hasta que esté montado en el cliente
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Botones flotantes */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* WhatsApp */}
        <button
          type="button"
          onClick={toggleWsp}
          className="floating-button w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="WhatsApp"
          aria-label="WhatsApp"
          onMouseDown={(e) => e.preventDefault()}
        >
          <FaWhatsapp className="text-5xl" />
        </button>

        {/* Llamar */}
        <button
          type="button"
          onClick={toggleCall}
          className="floating-button w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="Llamar"
          aria-label="Llamar"
          onMouseDown={(e) => e.preventDefault()}
        >
          <FaPhoneAlt className="text-4xl" />
        </button>

        {/* Chat en Vivo Directo */}
        <button
          type="button"
          onClick={toggleChat}
          className="floating-button w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="Chat en Vivo"
          aria-label="Chat en Vivo"
          onMouseDown={(e) => e.preventDefault()}
        >
          <FaHeadset className="text-4xl" />
        </button>
      </div>

      {/* Ventana WhatsApp */}
      <AnimatePresence>
        {showWsp && (
          <motion.div
            ref={wspRef}
            key="popover-wsp"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-28 bg-white rounded-3xl shadow-2xl p-8 w-80 max-w-[90vw] text-gray-900 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Contáctanos por WhatsApp</h3>
              <button
                onClick={() => setShowWsp(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                aria-label="Cerrar ventana WhatsApp"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base">
              <a
                href="https://wa.me/56996706640"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition font-medium"
              >
                <FaWhatsapp className="text-green-600 text-2xl flex-shrink-0" />
                <span>Améstica Ñuble</span>
              </a>
              <a
                href="https://wa.me/56942008410"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition font-medium"
              >
                <FaWhatsapp className="text-green-600 text-2xl flex-shrink-0" />
                <span>Améstica Santiago</span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ventana Llamadas */}
      <AnimatePresence>
        {showCall && (
          <motion.div
            ref={callRef}
            key="popover-call"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-28 bg-white rounded-3xl shadow-2xl p-8 w-80 max-w-[90vw] text-gray-900 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Números para llamar</h3>
              <button
                onClick={() => setShowCall(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                aria-label="Cerrar ventana llamadas"
              >
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-base">
              <a
                href="tel:+56996706640"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition font-medium"
              >
                <Phone className="text-blue-700" size={20} />
                +56 9 9670 6640 (Ñuble)
              </a>
              <a
                href="tel:+56942008410"
                className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition font-medium"
              >
                <Phone className="text-blue-700" size={20} />
                +56 9 4200 8410 (Santiago)
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      

      {/* Chatbot IA */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={chatRef}
            key="chatbot"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-24 w-96 h-[500px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaHeadset className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Asistente Améstica</h3>
                  <p className="text-sm opacity-90 font-medium">Chat en vivo</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white" style={{ maxHeight: '350px' }}>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{msg.message}</p>
                    <p className={`text-xs mt-2 ${msg.type === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  // No renderizar durante SSR para evitar problemas de hidratación
  if (!isClient) {
    return null;
  }

  return (
    <>
      {/* Botones flotantes */}
      <AnimatePresence>
        {showWsp && (
          <motion.div
            ref={wspRef}
            key="whatsapp"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-24 w-80 h-96 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaWhatsapp className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">WhatsApp</h3>
                  <p className="text-sm opacity-90 font-medium">Contacto directo</p>
                </div>
              </div>
              <button
                onClick={() => setShowWsp(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">¿Necesitas ayuda?</h4>
                  <p className="text-sm text-gray-600 mb-4">Elige tu región para contactarnos directamente</p>
                </div>

                <div className="space-y-3">
                  <a
                    href="https://wa.me/56942008410?text=Hola,%20necesito%20información%20sobre%20sus%20servicios%20en%20Santiago"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <FaWhatsapp className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Santiago</p>
                      <p className="text-sm text-gray-600">+56 9 4200 8410</p>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/56996706640?text=Hola,%20necesito%20información%20sobre%20sus%20servicios%20en%20Ñuble"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <FaWhatsapp className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Ñuble</p>
                      <p className="text-sm text-gray-600">+56 9 9670 6640</p>
                    </div>
                  </a>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    Horarios: Lunes a Viernes 8:00 - 20:00 hrs<br />
                    Sábados 9:00 - 19:00 hrs
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Llamada telefónica */}
      <AnimatePresence>
        {showCall && (
          <motion.div
            ref={callRef}
            key="call"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-24 w-80 h-96 bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaPhoneAlt className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Llamada</h3>
                  <p className="text-sm opacity-90 font-medium">Contacto telefónico</p>
                </div>
              </div>
              <button
                onClick={() => setShowCall(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 p-6 bg-gradient-to-b from-gray-50 to-white">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-2">¿Prefieres llamar?</h4>
                  <p className="text-sm text-gray-600 mb-4">Elige tu región para llamarnos directamente</p>
                </div>

                <div className="space-y-3">
                  <a
                    href="tel:+56942008410"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaPhoneAlt className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Santiago</p>
                      <p className="text-sm text-gray-600">+56 9 4200 8410</p>
                    </div>
                  </a>

                  <a
                    href="tel:+56996706640"
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <FaPhoneAlt className="text-white text-lg" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Ñuble</p>
                      <p className="text-sm text-gray-600">+56 9 9670 6640</p>
                    </div>
                  </a>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    Horarios: Lunes a Viernes 8:00 - 20:00 hrs<br />
                    Sábados 9:00 - 19:00 hrs
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot IA */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            ref={chatRef}
            key="chatbot"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-24 w-96 h-[500px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaHeadset className="text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Asistente Améstica</h3>
                  <p className="text-sm opacity-90 font-medium">Chat en vivo</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white hover:text-gray-200 transition-colors p-2 rounded-full hover:bg-white hover:bg-opacity-10"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-gray-50 to-white" style={{ maxHeight: '350px' }}>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line leading-relaxed font-medium">{msg.message}</p>
                    <p className={`text-xs mt-2 ${msg.type === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 p-4 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FaPaperPlane className="text-sm" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
