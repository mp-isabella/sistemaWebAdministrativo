"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

interface ReportChartsProps {
  data: any;
  type: 'FINANCIAL' | 'OPERATIONAL' | 'PERFORMANCE' | 'QUALITY';
  company: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

export function ReportCharts({ data, type, company }: ReportChartsProps) {
  const primaryColor = company.primaryColor || '#2563eb';
  const secondaryColor = company.secondaryColor || '#64748b';

  const renderFinancialCharts = () => {
    if (!data.monthlyData || data.monthlyData.length === 0) return null;

    const monthlyData = data.monthlyData.map((item: any) => ({
      month: `${item.month}/${item.year}`,
      revenue: item.revenue,
      expenses: item.expenses,
      profit: item.profit,
      jobs: item.jobsCount
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos</CardTitle>
            <CardDescription>Evolución mensual de ingresos y gastos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Bar dataKey="revenue" fill={primaryColor} name="Ingresos" />
                <Bar dataKey="expenses" fill={secondaryColor} name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilidad Mensual</CardTitle>
            <CardDescription>Evolución de la utilidad por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={primaryColor}
                  fill={primaryColor}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderOperationalCharts = () => {
    if (!data.technicianMetrics || data.technicianMetrics.length === 0) return null;

    const technicianData = data.technicianMetrics.map((tech: any) => ({
      name: tech.name,
      totalJobs: tech.totalJobs,
      completedJobs: tech.completedJobs,
      completionRate: tech.completionRate
    }));

    const serviceData = data.serviceMetrics?.map((service: any) => ({
      name: service.name,
      totalJobs: service.totalJobs,
      averagePrice: service.averagePrice
    })) || [];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Técnico</CardTitle>
            <CardDescription>Productividad de cada técnico</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={technicianData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    name === 'completionRate' ? `${value.toFixed(1)}%` : value,
                    name === 'completionRate' ? 'Tasa de Completación' :
                      name === 'totalJobs' ? 'Total Trabajos' : 'Trabajos Completados'
                  ]}
                />
                <Bar dataKey="totalJobs" fill={primaryColor} name="Total Trabajos" />
                <Bar dataKey="completedJobs" fill={secondaryColor} name="Completados" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Servicios Más Solicitados</CardTitle>
            <CardDescription>Distribución de trabajos por servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="totalJobs"
                >
                  {serviceData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? primaryColor : secondaryColor} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderPerformanceCharts = () => {
    if (!data.monthlyData || data.monthlyData.length === 0) return null;

    const performanceData = data.monthlyData.map((item: any) => ({
      month: `${item.month}/${item.year}`,
      jobs: item.jobsCount,
      efficiency: data.summary?.efficiency || 0
    }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productividad Mensual</CardTitle>
            <CardDescription>Número de trabajos completados por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => [value, 'Trabajos']}
                  labelFormatter={(label) => `Mes: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="jobs"
                  stroke={primaryColor}
                  strokeWidth={2}
                  dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Rendimiento</CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.metrics?.map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-lg font-bold" style={{ color: primaryColor }}>
                    {metric.value}{metric.unit ? ` ${metric.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderQualityCharts = () => {
    const qualityData = [
      { name: 'Completados', value: data.summary?.completionRate || 0, color: primaryColor },
      { name: 'Pendientes', value: 100 - (data.summary?.completionRate || 0), color: secondaryColor }
    ];

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de Calidad</CardTitle>
            <CardDescription>Proporción de trabajos completados vs pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Calidad</CardTitle>
            <CardDescription>Indicadores de calidad del servicio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.metrics?.map((metric: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{metric.name}</span>
                  <span className="text-lg font-bold" style={{ color: primaryColor }}>
                    {metric.value}{metric.unit ? ` ${metric.unit}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCharts = () => {
    switch (type) {
      case 'FINANCIAL':
        return renderFinancialCharts();
      case 'OPERATIONAL':
        return renderOperationalCharts();
      case 'PERFORMANCE':
        return renderPerformanceCharts();
      case 'QUALITY':
        return renderQualityCharts();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {renderCharts()}
    </div>
  );
}
