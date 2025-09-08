"use client";

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo' | 'orange';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, icon, color, trend, subtitle, className = '' }: StatCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      trendPositive: 'text-blue-600',
      trendNegative: 'text-red-600',
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      iconBg: 'bg-orange-100',
      iconText: 'text-orange-600',
      trendPositive: 'text-green-600',
      trendNegative: 'text-red-600',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 hover:shadow-md transition-all duration-300 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2 break-words">{value}</p>
          
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2 line-clamp-2">{subtitle}</p>
          )}
          
          {trend && (
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              {trend.isPositive ? (
                <TrendingUp className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.trendPositive}`} />
              ) : trend.value === '0%' ? (
                <Minus className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.trendNegative}`} />
              ) : (
                <TrendingDown className={`h-3 w-3 sm:h-4 sm:w-4 ${colors.trendNegative}`} />
              )}
              <span className={`text-xs sm:text-sm font-medium ${
                trend.isPositive ? colors.trendPositive : colors.trendNegative
              }`}>
                {trend.value}
              </span>
              <span className="text-xs text-gray-500 hidden sm:inline">
                vs mes anterior
              </span>
            </div>
          )}
        </div>
        
        <div className={`p-2 sm:p-3 md:p-4 rounded-xl ${colors.iconBg} ${colors.iconText} flex-shrink-0 ml-2`}>
          <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10">
            {icon}
          </div>
        </div>
      </div>
      
      {/* Indicador de estado */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${colors.bg} ${colors.border}`}></div>
          <span className="text-xs text-gray-500 line-clamp-1">
            {trend ? 'Actualizado recientemente' : 'Sin datos de tendencia'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Componente para estadísticas destacadas
interface HighlightStatProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'warning' | 'info';
  className?: string;
}

export function HighlightStat({ title, value, description, icon, color, className = '' }: HighlightStatProps) {
  const colorClasses = {
    primary: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-white',
      iconBg: 'bg-white bg-opacity-20',
    },
    success: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-white',
      iconBg: 'bg-white bg-opacity-20',
    },
    warning: {
      bg: 'bg-gradient-to-br from-orange-500 to-orange-600',
      text: 'text-white',
      iconBg: 'bg-white bg-opacity-20',
    },
    info: {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      text: 'text-white',
      iconBg: 'bg-white bg-opacity-20',
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`${colors.bg} ${colors.text} rounded-xl shadow-lg p-3 sm:p-4 md:p-6 w-full ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{title}</h3>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 break-words">{value}</p>
          <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{description}</p>
        </div>
        
        <div className={`p-2 sm:p-3 md:p-4 rounded-xl ${colors.iconBg} flex-shrink-0 ml-2`}>
          <div className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente para métricas de resumen
interface SummaryMetricProps {
  label: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function SummaryMetric({ label, value, change, className = '' }: SummaryMetricProps) {
  return (
    <div className={`text-center w-full ${className}`}>
      <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 break-words">{value}</div>
      <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2 line-clamp-2">{label}</div>
      
      {change && (
        <div className="flex items-center justify-center gap-1">
          {change.isPositive ? (
            <TrendingUp className="h-3 w-3 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={`text-xs font-medium ${
            change.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change.value}
          </span>
        </div>
      )}
    </div>
  );
}
