"use client";

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
    children: React.ReactNode;
    isOpen: boolean;
}

export function ModalPortal({ children, isOpen }: ModalPortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted || !isOpen) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    // Cerrar modal al hacer clic fuera
                    const closeEvent = new CustomEvent('closeModal');
                    window.dispatchEvent(closeEvent);
                }
            }}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden flex flex-col
                           max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl
                           min-w-[24rem] sm:min-w-[28rem] md:min-w-[32rem] lg:min-w-[48rem] xl:min-w-[56rem] 2xl:min-w-[64rem]"
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
