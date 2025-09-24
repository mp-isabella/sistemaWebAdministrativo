"use client"

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Loader2,
  TrendingUp,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
// import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface Company {
  id: string;
  name: string;
  displayName?: string;
  type?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  fields: string[];
}

export default function GenerateReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('MONTHLY');
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDescription, setReportDescription] = useState('');

  const reportTypes: ReportType[] = useMemo(() => [
    {
      id: "FINANCIAL",
      title: "Reporte Financiero",
      description: "Análisis completo de ingresos, gastos y rentabilidad",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      fields: ["Ingresos", "Gastos", "Rentabilidad", "Clientes", "Servicios"]
    },
    {
      id: "OPERATIONAL",
      title: "Reporte Operacional",
      description: "Métricas de servicios, técnicos y eficiencia",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      fields: ["Trabajadores", "Servicios", "Eficiencia", "Tiempos", "Calidad"]
    },
    {
      id: "PERFORMANCE",
      title: "Reporte de Rendimiento",
      description: "Análisis de productividad y tiempos de respuesta",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      fields: ["Productividad", "Tiempos", "Métricas", "Comparativas", "Tendencias"]
    },
    {
      id: "QUALITY",
      title: "Reporte de Calidad",
      description: "Satisfacción del cliente y métricas de calidad",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      fields: ["Satisfacción", "Calidad", "Retroalimentación", "Mejoras", "Estándares"]
    }
  ], []);

  const months = useMemo(() => [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' }
  ], []);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Error al cargar empresas');

      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las empresas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const generateDefaultTitle = useCallback(() => {
    const type = reportTypes.find(t => t.id === selectedType);
    const company = companies.find(c => c.id === selectedCompany);

    if (type && company) {
      let periodText = '';
      if (selectedPeriod === 'MONTHLY') {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        periodText = `${monthName} ${selectedYear}`;
      } else if (selectedPeriod === 'YEARLY') {
        periodText = selectedYear.toString();
      } else {
        periodText = 'Período personalizado';
      }

      setReportTitle(`${type.title} - ${company.displayName || company.name} - ${periodText}`);
    }
  }, [selectedType, selectedCompany, selectedPeriod, selectedYear, selectedMonth, companies, months, reportTypes]);

  useEffect(() => {
    if (selectedType && selectedCompany && selectedPeriod) {
      generateDefaultTitle();
    }
  }, [selectedType, selectedCompany, selectedPeriod, selectedYear, selectedMonth, generateDefaultTitle]);

  const getDateRange = () => {
    if (selectedPeriod === 'MONTHLY') {
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0);
      return { startDate, endDate };
    } else if (selectedPeriod === 'YEARLY') {
      const startDate = new Date(selectedYear, 0, 1);
      const endDate = new Date(selectedYear, 11, 31);
      return { startDate, endDate };
    } else {
      return {
        startDate: customStartDate || new Date(),
        endDate: customEndDate || new Date()
      };
    }
  };

  const generateReport = async () => {
    if (!selectedType || !selectedCompany || !reportTitle) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    try {
      setGenerating(true);
      const { startDate, endDate } = getDateRange();

      // Crear el reporte
      const createResponse = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reportTitle,
          type: selectedType,
          period: selectedPeriod,
          year: selectedPeriod === 'CUSTOM' ? startDate.getFullYear() : selectedYear,
          month: selectedPeriod === 'MONTHLY' ? selectedMonth : null,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          companyId: selectedCompany
        })
      });

      if (!createResponse.ok) throw new Error('Error al crear reporte');

      const report = await createResponse.json();

      // Generar datos del reporte
      const generateResponse = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          type: selectedType,
          companyId: selectedCompany,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
      });

      if (!generateResponse.ok) throw new Error('Error al generar datos del reporte');

      toast({
        title: "Éxito",
        description: "Reporte generado exitosamente"
      });

      router.push('/dashboard/reports');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectedReportType = reportTypes.find(t => t.id === selectedType);
  const selectedCompanyData = companies.find(c => c.id === selectedCompany);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Generar Reporte</h1>
          <p className="text-gray-600 mt-2">
            Configura y genera un nuevo reporte para análisis detallado
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuración del Reporte */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipo de Reporte */}
          <Card>
            <CardHeader>
              <CardTitle>1. Tipo de Reporte</CardTitle>
              <CardDescription>
                Selecciona el tipo de análisis que necesitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all ${selectedType === type.id
                      ? `${type.bgColor} ${type.borderColor} border-2`
                      : 'hover:shadow-md'
                      }`}
                    onClick={() => setSelectedType(type.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <type.icon className={`h-6 w-6 ${type.color}`} />
                        <div>
                          <h3 className="font-semibold text-gray-900">{type.title}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                        {selectedType === type.id && (
                          <CheckCircle className="h-5 w-5 text-green-600 ml-auto" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>2. Empresa</CardTitle>
              <CardDescription>
                Selecciona la empresa para el reporte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: company.primaryColor || '#2563eb' }}
                        />
                        <span>{company.displayName || company.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Período */}
          <Card>
            <CardHeader>
              <CardTitle>3. Período del Reporte</CardTitle>
              <CardDescription>
                Define el período de tiempo para el análisis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="period">Tipo de período</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                    <SelectItem value="CUSTOM">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedPeriod === 'MONTHLY' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="month">Mes</Label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value.toString()}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Año</Label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedPeriod === 'YEARLY' && (
                <div>
                  <Label htmlFor="year">Año</Label>
                  <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedPeriod === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {customStartDate ? format(customStartDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={customStartDate}
                          onSelect={setCustomStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="endDate">Fecha de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {customEndDate ? format(customEndDate, 'dd/MM/yyyy') : 'Seleccionar fecha'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={customEndDate}
                          onSelect={setCustomEndDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detalles del Reporte */}
          <Card>
            <CardHeader>
              <CardTitle>4. Detalles del Reporte</CardTitle>
              <CardDescription>
                Personaliza el título y descripción del reporte
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del reporte</Label>
                <Input
                  id="title"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Ingresa el título del reporte"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Descripción adicional del reporte"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen y Acciones */}
        <div className="space-y-6">
          {/* Resumen */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Reporte</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedReportType && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <selectedReportType.icon className={`h-6 w-6 ${selectedReportType.color}`} />
                  <div>
                    <p className="font-medium">{selectedReportType.title}</p>
                    <p className="text-sm text-gray-600">{selectedReportType.description}</p>
                  </div>
                </div>
              )}

              {selectedCompanyData && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">{selectedCompanyData.displayName || selectedCompanyData.name}</p>
                    <p className="text-sm text-gray-600">{selectedCompanyData.type}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Período:</span>
                  <span className="text-sm font-medium">
                    {selectedPeriod === 'MONTHLY' && `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`}
                    {selectedPeriod === 'YEARLY' && selectedYear}
                    {selectedPeriod === 'CUSTOM' && 'Personalizado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rango de fechas:</span>
                  <span className="text-sm font-medium">
                    {format(getDateRange().startDate, 'dd/MM/yyyy')} - {format(getDateRange().endDate, 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={generateReport}
                disabled={!selectedType || !selectedCompany || !reportTitle || generating}
                className="w-full"
              >
                {generating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {generating ? 'Generando...' : 'Generar Reporte'}
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/reports')}
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}