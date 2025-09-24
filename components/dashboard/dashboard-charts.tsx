"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardChartsProps {
  stats: {
    overview: {
      totalJobs: number;
      activeJobs: number;
      completedJobs: number;
      totalClients: number;
      totalWorkers: number;
      totalQuotes: number;
      totalReports: number;
      totalRevenue: string;
    };
    status: {
      pending: number;
      inProgress: number;
      completed: number;
      cancelled: number;
    };
    trends: {
      jobsTrend: number;
      isPositive: boolean;
    };
  };
}

export function DashboardCharts({ stats }: DashboardChartsProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
            <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
          <div className="animate-pulse">
            <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/3 mb-3 sm:mb-4"></div>
            <div className="h-48 sm:h-56 md:h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Datos para el gráfico de estado de trabajos (Doughnut)
  const statusData = {
    labels: ['Pendientes', 'En Progreso', 'Completados', 'Cancelados'],
    datasets: [
      {
        data: [
          stats.status.pending,
          stats.status.inProgress,
          stats.status.completed,
          stats.status.cancelled,
        ],
        backgroundColor: [
          '#F46015', // Naranja de acento
          '#016AAB', // Azul brillante
          '#22c55e', // Verde
          '#ef4444', // Rojo
        ],
        borderColor: [
          '#F46015',
          '#016AAB',
          '#22c55e',
          '#ef4444',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Datos para el gráfico de métricas generales (Barras)
  const metricsData = {
    labels: ['Trabajos', 'Clientes', 'Trabajadores', 'Cotizaciones', 'Reportes'],
    datasets: [
      {
        label: 'Cantidad',
        data: [
          stats.overview.totalJobs,
          stats.overview.totalClients,
          stats.overview.totalWorkers,
          stats.overview.totalQuotes,
          stats.overview.totalReports,
        ],
        backgroundColor: [
          '#002D71', // Azul oscuro
          '#014C90', // Azul intermedio
          '#016AAB', // Azul brillante
          '#5692C8', // Azul claro
          '#9ABCE1', // Azul suave
        ],
        borderColor: [
          '#002D71',
          '#014C90',
          '#016AAB',
          '#5692C8',
          '#9ABCE1',
        ],
        borderWidth: 1,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  // Datos para el gráfico de tendencia (Línea)
  const trendData = {
    labels: ['Mes Anterior', 'Mes Actual'],
    datasets: [
      {
        label: 'Trabajos',
        data: [
          Math.max(0, stats.overview.totalJobs - (stats.overview.totalJobs * stats.trends.jobsTrend / 100)),
          stats.overview.totalJobs,
        ],
        borderColor: '#F46015',
        backgroundColor: 'rgba(244, 96, 21, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#F46015',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#F46015',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          stepSize: 1,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
    },
  };

  const lineOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
      {/* Gráfico de Estado de Trabajos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
          Estado de Trabajos
        </h3>
        <div className="h-48 sm:h-56 md:h-64">
          <Doughnut data={statusData} options={chartOptions} />
        </div>
        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-4">
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-orange-600">
              {stats.status.pending}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              {stats.status.inProgress}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">En Progreso</div>
          </div>
        </div>
      </div>

      {/* Gráfico de Métricas Generales */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"></div>
          Métricas Generales
        </h3>
        <div className="h-48 sm:h-56 md:h-64">
          <Bar data={metricsData} options={barOptions} />
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-xs sm:text-sm text-gray-600">
            Total de elementos en el sistema
          </div>
        </div>
      </div>

      {/* Gráfico de Tendencia */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 sm:col-span-2 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-full"></div>
            <span>Tendencia de Trabajos</span>
          </div>
          <span className={`text-xs sm:text-sm font-medium ${stats.trends.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
            {stats.trends.isPositive ? '↗' : '↘'} {Math.abs(stats.trends.jobsTrend)}%
          </span>
        </h3>
        <div className="h-48 sm:h-56 md:h-64">
          <Line data={trendData} options={lineOptions} />
        </div>
        <div className="mt-3 sm:mt-4 text-center">
          <div className="text-xs sm:text-sm text-gray-600">
            Comparación con el mes anterior
          </div>
        </div>
      </div>
    </div>
  );
}
