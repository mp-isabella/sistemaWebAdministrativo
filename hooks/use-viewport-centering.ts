"use client";

import { useCallback, useEffect, useState } from 'react';

interface ViewportPosition {
    top: number;
    left: number;
    width: number;
    height: number;
}

interface UseViewportCenteringOptions {
    elementRef: React.RefObject<HTMLElement>;
    isOpen: boolean;
    offsetY?: number;
    offsetX?: number;
}

export function useViewportCentering({
    elementRef,
    isOpen,
    offsetY = 0,
    offsetX = 0
}: UseViewportCenteringOptions) {
    const [position, setPosition] = useState<ViewportPosition>({
        top: 0,
        left: 0,
        width: 0,
        height: 0
    });

    const calculatePosition = useCallback(() => {
        if (!elementRef.current || !isOpen) return;

        const rect = elementRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Calcular posición centrada en el viewport
        const centerX = viewportWidth / 2;
        const centerY = viewportHeight / 2;

        // Ajustar por el tamaño del elemento
        const elementWidth = Math.min(rect.width, viewportWidth - 32);
        const elementHeight = Math.min(200, viewportHeight - 100);

        setPosition({
            top: centerY - (elementHeight / 2) + offsetY,
            left: centerX - (elementWidth / 2) + offsetX,
            width: elementWidth,
            height: elementHeight
        });
    }, [elementRef, isOpen, offsetY, offsetX]);

    useEffect(() => {
        if (!isOpen) return;

        calculatePosition();

        const handleScroll = () => calculatePosition();
        const handleResize = () => calculatePosition();

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [isOpen, calculatePosition]);

    return position;
}
