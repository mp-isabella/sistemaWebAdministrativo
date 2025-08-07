"use client";

import { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaPhoneAlt, FaHeadset } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Phone } from "lucide-react";

export default function FloatingButtons() {
  const [showWsp, setShowWsp] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const wspRef = useRef<HTMLDivElement>(null);
  const callRef = useRef<HTMLDivElement>(null);
  const tawkLoaded = useRef(false);

  // Carga el script de Tawk.to solo una vez y configura el widget oculto
  const loadTawkTo = () => {
    return new Promise<void>((resolve) => {
      if (tawkLoaded.current) {
        resolve();
        return;
      }

      (window as any).Tawk_API = (window as any).Tawk_API || {};
      (window as any).Tawk_LoadStart = new Date();

      const script = document.createElement("script");
      script.async = true;
      script.src = "https://embed.tawk.to/688e602e37c8b4192bd90d45/1j1m2fdn7";
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      script.onload = () => {
        tawkLoaded.current = true;

        (window as any).Tawk_API.onLoad = function () {
          (window as any).Tawk_API.hideWidget();

          // Intentar eliminar botón extra dentro del iframe (puede no funcionar en todos los casos)
          const iframe = document.querySelector('iframe[src*="tawk"]');
          if (iframe) {
            const iframeDoc = (iframe as HTMLIFrameElement).contentDocument || (iframe as HTMLIFrameElement).contentWindow?.document;
            if (iframeDoc) {
              const unwantedButton = iframeDoc.querySelector(".tawk-minimize-button");
              if (unwantedButton) unwantedButton.remove();
            }
          }
        };

        resolve();
      };

      document.head.appendChild(script);
    });
  };

  // Alterna el chat de Tawk.to verificando disponibilidad de funciones
  const toggleSupport = async () => {
    await loadTawkTo();

    const Tawk_API = (window as any).Tawk_API;
    if (!Tawk_API) return;

    const isMaximized = Tawk_API.isChatMaximized ? Tawk_API.isChatMaximized() : false;

    if (isMaximized) {
      if (typeof Tawk_API.minimize === "function") {
        Tawk_API.minimize();
      } else if (typeof Tawk_API.hideWidget === "function") {
        Tawk_API.hideWidget();
      }
    } else {
      if (typeof Tawk_API.maximize === "function") {
        Tawk_API.maximize();
      } else if (typeof Tawk_API.showWidget === "function") {
        Tawk_API.showWidget();
      }
    }

    setIsChatOpen(!isMaximized);
    setShowCall(false);
    setShowWsp(false);
  };

  // Toggle WhatsApp y cerrar llamada si está abierta
  const toggleWsp = () => {
    setShowWsp((prev) => {
      if (!prev) setShowCall(false);
      return !prev;
    });
  };

  // Toggle llamadas y cerrar WhatsApp si está abierto
  const toggleCall = () => {
    setShowCall((prev) => {
      if (!prev) setShowWsp(false);
      return !prev;
    });
  };

  // Cierra ventanas WhatsApp y llamadas al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (showWsp && wspRef.current && !wspRef.current.contains(target)) {
        setShowWsp(false);
      }
      if (showCall && callRef.current && !callRef.current.contains(target)) {
        setShowCall(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showWsp, showCall]);

  return (
    <>
      {/* Botones flotantes */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* WhatsApp */}
        <button
          onClick={toggleWsp}
          className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
          title="WhatsApp"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="text-5xl" />
        </button>

        {/* Llamar */}
        <button
          onClick={toggleCall}
          className="w-16 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
          title="Llamar"
          aria-label="Llamar"
        >
          <FaPhoneAlt className="text-4xl" />
        </button>

        {/* Atención al Cliente */}
        <button
          onClick={toggleSupport}
          className="w-16 h-16 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90"
          title="Atención al Cliente"
          aria-label="Atención al Cliente"
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
    </>
  );
}
