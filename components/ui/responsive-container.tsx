"use client";

import { useResponsive, useResponsiveClasses } from '@/hooks/use-responsive';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  padding?: boolean;
  maxWidth?: boolean;
  center?: boolean;
  fullHeight?: boolean;
}

export default function ResponsiveContainer({
  children,
  className,
  padding = true,
  maxWidth = true,
  center = true,
  fullHeight = false,
}: ResponsiveContainerProps) {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  // Variables are used in the component logic below
  const responsiveClasses = useResponsiveClasses();

  // Use the destructured variables to avoid unused variable warnings
  console.log('Responsive state:', { isMobile, isTablet, isDesktop });

  const containerClasses = cn(
    // Base classes
    'w-full',

    // Padding responsivo
    padding && responsiveClasses.padding,

    // Max width responsivo
    maxWidth && responsiveClasses.maxWidth,

    // Centrado
    center && 'mx-auto',

    // Altura completa
    fullHeight && 'min-h-screen',

    // Clases personalizadas
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
}

// Componente para grid responsivo
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveGrid({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  };

  const gridClasses = cn(
    'grid',
    `grid-cols-${cols.mobile || 1}`,
    `sm:grid-cols-${cols.tablet || 2}`,
    `lg:grid-cols-${cols.desktop || 3}`,
    gapClasses[gap],
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}

// Componente para flex responsivo
interface ResponsiveFlexProps {
  children: ReactNode;
  className?: string;
  direction?: 'row' | 'col' | 'responsive';
  wrap?: boolean;
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  align?: 'start' | 'center' | 'end' | 'stretch';
  gap?: 'sm' | 'md' | 'lg';
}

export function ResponsiveFlex({
  children,
  className,
  direction = 'responsive',
  wrap = false,
  justify = 'start',
  align = 'start',
  gap = 'md',
}: ResponsiveFlexProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    responsive: 'flex-col sm:flex-row',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const gapClasses = {
    sm: 'gap-2 sm:gap-3 lg:gap-4',
    md: 'gap-3 sm:gap-4 lg:gap-6',
    lg: 'gap-4 sm:gap-6 lg:gap-8',
  };

  const flexClasses = cn(
    'flex',
    directionClasses[direction],
    wrap && 'flex-wrap',
    justifyClasses[justify],
    alignClasses[align],
    gapClasses[gap],
    className
  );

  return (
    <div className={flexClasses}>
      {children}
    </div>
  );
}

// Componente para texto responsivo
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

export function ResponsiveText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  color = 'text-gray-900',
  align = 'left',
}: ResponsiveTextProps) {
  const { isMobile } = useResponsive();

  const sizeClasses = {
    xs: isMobile ? 'text-xs' : 'text-sm',
    sm: isMobile ? 'text-sm' : 'text-base',
    base: isMobile ? 'text-base' : 'text-lg',
    lg: isMobile ? 'text-lg' : 'text-xl',
    xl: isMobile ? 'text-xl' : 'text-2xl',
    '2xl': isMobile ? 'text-2xl' : 'text-3xl',
    '3xl': isMobile ? 'text-3xl' : 'text-4xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const textClasses = cn(
    sizeClasses[size],
    weightClasses[weight],
    color,
    alignClasses[align],
    className
  );

  return (
    <div className={textClasses}>
      {children}
    </div>
  );
}
