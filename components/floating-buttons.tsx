"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FaHeadset, FaPaperPlane, FaPhoneAlt, FaTimes, FaWhatsapp } from "react-icons/fa";

// Custom hook to check if component is mounted on client
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

export default function FloatingButtons() {
  const [showWsp, setShowWsp] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [_isVisible, _setIsVisible] = useState(false);
  const isClient = useIsClient();
  const [chatMessages, setChatMessages] = useState<Array<{ type: 'user' | 'bot', message: string, timestamp: Date }>>([]);
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
      _setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isClient]);

  // Chatbot IA profesional para Améstica Ltda
  const chatbotResponses = {
    greeting: "¡Hola! 👋 Soy el asistente virtual de Améstica Ltda., una empresa con 28 años de experiencia en detección y reparación de fugas de agua, destape de alcantarillado e inspección de tuberías. \n\nEstoy aquí para brindarte información sobre:\n• Nuestros servicios especializados\n• Cobertura y horarios\n• Agendar visitas técnicas\n• Contacto directo con nuestro equipo",

    services: "🔧 NUESTROS SERVICIOS:\n\nDetección de Fugas de Agua:\n• Tecnología avanzada: ultrasonido, gas trazador y termografía\n• Localización precisa sin dañar estructuras\n• Reparación profesional de tuberías\n\nDestape de Alcantarillado:\n• Equipos eléctricos y varillas especializadas\n• Aire comprimido e hidrolavadoras de alta presión\n• Eliminación rápida de obstrucciones\n• Optimización del funcionamiento de instalaciones\n\nVideoinspección de Tuberías:\n• Cámaras de alta definición\n• Identificación de obstrucciones, fugas o daños\n• Diagnóstico preciso sin romper paredes\n• Planificación de reparaciones confiable",

    coverage: "🗺️ COBERTURA Y HORARIOS:\n\nRegiones atendidas:\n• Región Metropolitana\n• Valparaíso\n• O'Higgins\n• Maule\n• Ñuble\n• Bío Bío\n\nHorarios de atención:\n• Lunes a Viernes: 8:00 - 20:00 hrs\n• Sábados: 9:00 - 19:00 hrs",

    pricing: "💰 INFORMACIÓN DE PRECIOS:\n\nNuestros precios dependen de:\n• Tipo de servicio requerido\n• Complejidad del trabajo\n• Ubicación y extensión del área a intervenir\n\nOfrecemos:\n• Cotización gratuita y sin compromiso\n• Precios claros, competitivos y transparentes\n• Opciones adaptadas a tus necesidades",

    contact: "📞 CONTACTO:\n\nWhatsApp y Teléfono:\n• Ñuble: +56 9 9670 6640\n• Santiago: +56 9 4200 8410\n\nEmail: amesticaltda@gmail.com\n\nHorarios de atención:\n• Lunes a Viernes: 8:00 - 20:00 hrs\n• Sábados: 9:00 - 19:00 hrs",

    schedule: "📅 AGENDAR SERVICIO:\n\nPara coordinar tu visita técnica necesitamos:\n• Tipo de servicio (detección, destape o videoinspección)\n• Dirección exacta del servicio\n• Horario preferido (mañana o tarde)\n• Descripción del problema\n• Datos de contacto\n\nProceso:\n1. Cotización gratuita\n2. Confirmación de fecha y hora\n3. Visita técnica profesional\n4. Trabajo garantizado",

    guarantee: "✅ GARANTÍA DE AMÉSTICA LTDA:\n\nCompromiso de calidad:\n• Trabajo garantizado por escrito\n• Materiales de primera calidad\n• Técnicos certificados y experimentados\n• Seguimiento post-servicio\n\nGarantías específicas:\n• Detección de fugas: 6 meses\n• Destape de alcantarillado: 3 meses\n• Reparaciones: 1 año\n• Videoinspección: 30 días\n\nSatisfacción garantizada o no pagas",

    about: "🏢 SOBRE AMÉSTICA LTDA:\n\n• 28 años de experiencia en detección y reparación de fugas, destape e inspección de tuberías\n• Más de 65.000 clientes satisfechos\n• Profesionales certificados y experimentados\n• Compromiso con la eficiencia y confiabilidad\n\nMisión: Brindar servicios con eficiencia, confiabilidad y profesionalismo, utilizando tecnología avanzada y garantizando la integridad de las instalaciones de nuestros clientes.\n\nVisión: Ser reconocidos como líderes en soluciones de fugas y mantenimiento de tuberías, destacando por innovación tecnológica, calidad de servicio y compromiso con la satisfacción de nuestros clientes.",

    testimonials: "⭐ TESTIMONIOS DE CLIENTES:\n\nMaría González, Las Condes: 'Detectaron la fuga sin romper nada y la repararon el mismo día. Muy profesionales.'\n\nAriel Lagos, Coihueco: 'Empresa seria y confiable, cumplieron con todo lo prometido.'\n\nAna Martínez, Rancagua: 'Detectaron una fuga que llevaba meses sin encontrar en solo 2 horas. Excelente tecnología.'\n\nJosefina Lagos, Coihueco: 'Servicio 100% recomendable, resolvieron una fuga que otras empresas no pudieron.'",

    faq: "❓ PREGUNTAS FRECUENTES:\n\n¿Cómo detectar una fuga de agua?\n• Aumento inesperado en la cuenta del agua\n• Manchas o humedad en muros, techos o pisos\n• Ruidos de agua corriendo con llaves cerradas\n• Baja presión de agua\n\n¿Qué hacer si sospecho una fuga?\nCierra la llave de paso y contacta a nuestros especialistas para una detección profesional.\n\n¿Siempre es necesario romper muros o pisos?\nNo. Usamos tecnologías no invasivas que permiten localizar la fuga con precisión y minimizar daños.",

    default: "Gracias por tu consulta. Nuestro equipo especializado está listo para brindarte atención profesional y personalizada en detección y reparación de fugas, destape de alcantarillado e inspección de tuberías."
  };

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();

    // Saludos y bienvenida
    if (message.includes('hola') || message.includes('buenos') || message.includes('buenas') ||
      message.includes('buen día') || message.includes('buenas tardes') || message.includes('buenas noches') ||
      message.includes('saludos') || message.includes('hi') || message.includes('hello')) {
      return chatbotResponses.greeting;
    }

    // Servicios específicos
    if (message.includes('servicio') || message.includes('que hacen') || message.includes('ofrecen') ||
      message.includes('detectan') || message.includes('destapan') || message.includes('videoinspección') ||
      message.includes('fuga') || message.includes('alcantarillado') || message.includes('tubería') ||
      message.includes('cañería') || message.includes('plomería') || message.includes('fontanería') ||
      message.includes('destape') || message.includes('detección') || message.includes('reparación')) {
      return chatbotResponses.services;
    }

    // Cobertura y ubicación
    if (message.includes('cobertura') || message.includes('región') || message.includes('zona') ||
      message.includes('donde') || message.includes('ubicación') || message.includes('atendemos') ||
      message.includes('valparaíso') || message.includes('ohiggins') || message.includes('maule') ||
      message.includes('ñuble') || message.includes('bío bío') || message.includes('metropolitana') ||
      message.includes('santiago') || message.includes('rancagua') || message.includes('talca')) {
      return chatbotResponses.coverage;
    }

    // Precios y costos
    if (message.includes('precio') || message.includes('costo') || message.includes('cuanto') ||
      message.includes('valor') || message.includes('tarifa') || message.includes('cotización') ||
      message.includes('presupuesto') || message.includes('pagar') || message.includes('dinero') ||
      message.includes('cuesta') || message.includes('vale')) {
      return chatbotResponses.pricing;
    }

    // Contacto
    if (message.includes('contacto') || message.includes('llamar') || message.includes('whatsapp') ||
      message.includes('teléfono') || message.includes('número') || message.includes('comunicar') ||
      message.includes('hablar') || message.includes('especialista') || message.includes('técnico') ||
      message.includes('email') || message.includes('correo') || message.includes('dirección')) {
      return chatbotResponses.contact;
    }

    // Agendar y programar
    if (message.includes('agendar') || message.includes('cita') || message.includes('programar') ||
      message.includes('visita') || message.includes('ir') || message.includes('llegar') ||
      message.includes('fecha') || message.includes('hora') || message.includes('día') ||
      message.includes('reservar') || message.includes('solicitar') || message.includes('pedir')) {
      return chatbotResponses.schedule;
    }

    // Testimonios y referencias
    if (message.includes('testimonio') || message.includes('cliente') || message.includes('referencia') ||
      message.includes('opinión') || message.includes('experiencia') || message.includes('recomendación') ||
      message.includes('satisfecho') || message.includes('feliz')) {
      return chatbotResponses.testimonials;
    }

    // Preguntas frecuentes
    if (message.includes('pregunta') || message.includes('duda') || message.includes('como saber') ||
      message.includes('que hacer') || message.includes('ayuda') || message.includes('problema') ||
      message.includes('roto') || message.includes('daño') || message.includes('malo') ||
      message.includes('no funciona') || message.includes('tapado') || message.includes('humedad') ||
      message.includes('mancha') || message.includes('ruido')) {
      return chatbotResponses.faq;
    }

    // Garantías
    if (message.includes('garantía') || message.includes('garantizado') || message.includes('seguro') ||
      message.includes('confianza') || message.includes('calidad') || message.includes('certificado') ||
      message.includes('experiencia') || message.includes('años') || message.includes('confiable')) {
      return chatbotResponses.guarantee;
    }

    // Sobre la empresa
    if (message.includes('empresa') || message.includes('améstica') || message.includes('quienes') ||
      message.includes('somos') || message.includes('experiencia') || message.includes('historia') ||
      message.includes('certificación') || message.includes('registro') || message.includes('sii') ||
      message.includes('misión') || message.includes('visión') || message.includes('valores')) {
      return chatbotResponses.about;
    }

    // Horarios
    if (message.includes('hora') || message.includes('horario') || message.includes('cuando') ||
      message.includes('día') || message.includes('lunes') || message.includes('viernes') ||
      message.includes('sábado') || message.includes('domingo') || message.includes('fin de semana') ||
      message.includes('atendemos') || message.includes('disponible')) {
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
          message: "¡Bienvenido a Améstica Ltda.! 👋\n\nSoy tu asistente virtual, listo para ayudarte con todo lo relacionado a detección y reparación de fugas de agua, destape de alcantarillado e inspección de tuberías. 👷‍♂️\n\n¿Qué puedo hacer por ti hoy?\n• Servicios especializados - Reparaciones, instalaciones y mantenimiento\n• Cobertura y horarios - Dónde y cuándo podemos atenderte\n• Agendar visitas técnicas - Coordinemos tu visita\n• Información de contacto - Teléfonos, WhatsApp y email\n\nPuedes escribir tu consulta directamente o elegir una de las opciones.",
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
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 sm:gap-4" style={{ maxWidth: '100vw', right: '1rem' }}>
        {/* WhatsApp */}
        <button
          type="button"
          onClick={toggleWsp}
          className="floating-button w-12 h-12 sm:w-16 sm:h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="WhatsApp"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="text-3xl sm:text-5xl" />
        </button>

        {/* Llamar */}
        <button
          type="button"
          onClick={toggleCall}
          className="floating-button w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="Llamar"
          aria-label="Llamar"
        >
          <FaPhoneAlt className="text-2xl sm:text-4xl" />
        </button>

        {/* Chat en Vivo Directo */}
        <button
          type="button"
          onClick={toggleChat}
          className="floating-button w-12 h-12 sm:w-16 sm:h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 cursor-pointer z-50 focus:outline-none focus:ring-0 focus:ring-offset-0"
          title="Chat en Vivo"
          aria-label="Chat en Vivo"
        >
          <FaHeadset className="text-2xl sm:text-4xl" />
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
            className="fixed bottom-32 right-4 sm:bottom-24 sm:right-28 bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-72 sm:w-80 max-w-[90vw] text-gray-900 z-50 flex flex-col"
            style={{ maxWidth: 'calc(100vw - 2rem)', right: '1rem' }}
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
                href="https://wa.me/56996706640?text=¡Hola! Me contacto con Améstica Ltda. desde su sitio web. Necesito información sobre un servicio. ¿Podrían ayudarme?"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 transition font-medium"
              >
                <FaWhatsapp className="text-green-600 text-2xl flex-shrink-0" />
                <span>Améstica Ñuble</span>
              </a>
              <a
                href="https://wa.me/56942008410?text=¡Hola! Me contacto con Améstica Ltda. desde su sitio web. Necesito información sobre un servicio. ¿Podrían ayudarme?"
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
            className="fixed bottom-32 right-4 sm:bottom-24 sm:right-28 bg-white rounded-3xl shadow-2xl p-4 sm:p-8 w-72 sm:w-80 max-w-[90vw] text-gray-900 z-50 flex flex-col"
            style={{ maxWidth: 'calc(100vw - 2rem)', right: '1rem' }}
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
            className="fixed bottom-32 right-4 sm:bottom-24 sm:right-24 w-[calc(100vw-2rem)] sm:w-96 h-[calc(100vh-6rem)] sm:h-[500px] max-h-[600px] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ maxWidth: 'calc(100vw - 2rem)', right: '1rem' }}
          >
            {/* Header del chat */}
            <div className="bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 text-white p-4 sm:p-6 rounded-t-3xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <FaHeadset className="text-xl sm:text-2xl" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg">Asistente Améstica</h3>
                  <p className="text-xs sm:text-sm opacity-90 font-medium">Chat en vivo</p>
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
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 bg-gradient-to-b from-gray-50 to-white" style={{ maxHeight: '350px' }}>
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 sm:p-4 rounded-2xl shadow-sm ${msg.type === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                  >
                    <p className="text-xs sm:text-sm whitespace-pre-line leading-relaxed font-medium">{msg.message}</p>
                    <p className={`text-xs mt-1 sm:mt-2 ${msg.type === 'user' ? 'opacity-70' : 'text-gray-500'}`}>
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
            <div className="p-4 sm:p-6 border-t border-gray-100 bg-white">
              <div className="flex gap-2 sm:gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
                <button
                  onClick={sendMessage}
                  disabled={!userInput.trim()}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
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
