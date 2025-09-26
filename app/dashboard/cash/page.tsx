"use client"

import CashTransactionForm from '@/components/forms/cash-transaction-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ModalPortal } from '@/components/ui/modal-portal';
import {
  // Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CashDashboard() {
  // State management
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [companies, setCompanies] = useState<any[]>([]);
  // Obtener mes y año actual
  const getCurrentMonthYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const getCurrentYear = () => {
    return new Date().getFullYear().toString();
  };

  // Función para obtener el nombre del mes en español
  const getMonthName = (monthYear: string) => {
    const [year, month] = monthYear.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const monthIndex = parseInt(month || '1') - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());

  // Estados para cargar datos reales
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_summary, _setSummary] = useState({
    total: 0,
    income: 0,
    expense: 0,
    balance: 0
  });

  // Función para cargar empresas
  const loadCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (response.ok) {
        const companiesData = await response.json();
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error('Error cargando empresas:', error);
    }
  };

  // Función para cargar transacciones reales
  const loadTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cash-transactions');
      if (response.ok) {
        const data = await response.json();

        // Eliminar duplicados basándose en reference y type
        const uniqueTransactions = data.transactions?.reduce((acc: any[], transaction: any) => {
          const key = `${transaction.reference}-${transaction.type}`;
          if (!acc.find(t => `${t.reference}-${t.type}` === key)) {
            acc.push(transaction);
          }
          return acc;
        }, []) || [];

        // Para transacciones de INCOME, obtener el estado del trabajo y la empresa
        const transactionsWithJobStatus = await Promise.all(
          uniqueTransactions.map(async (transaction: any) => {
            if (transaction.type === 'INCOME' && transaction.reference?.includes('Trabajo #')) {
              try {
                const jobId = transaction.reference.replace('Trabajo #', '');

                const jobResponse = await fetch(`/api/jobs/${jobId}`);
                if (jobResponse.ok) {
                  const job = await jobResponse.json();

                  return {
                    ...transaction,
                    jobStatus: job.status,
                    jobTitle: job.title,
                    companyId: job.companyId,
                    companyName: job.company?.name || 'Sin empresa'
                  };
                } else {
                  // Error obteniendo trabajo
                }
              } catch (error) {
                // Error obteniendo estado del trabajo
              }
            }
            return transaction;
          })
        );

        setTransactions(transactionsWithJobStatus);
        _setSummary(data.summary || {
          total: 0,
          income: 0,
          expense: 0,
          balance: 0
        });

      } else {
        // Error cargando transacciones
      }
    } catch (error) {
      // Error cargando transacciones
    } finally {
      setLoading(false);
    }
  };

  // Cargar transacciones y empresas al montar el componente
  useEffect(() => {
    loadCompanies();
    loadTransactions();
  }, []);

  // Datos simulados para el dashboard - Historial por mes (mantener como fallback)
  const _allTransactions = [
    // Intentionally unused - fallback data for future use
    // Diciembre 2024
    {
      id: 1,
      type: "ingreso",
      description: "Pago Servicio Técnico #1234",
      amount: 125000,
      date: "2024-12-15",
      client: "Empresa ABC Ltda",
      status: "completado",
      jobId: "JOB-1234",
      month: "2024-12",
      year: "2024"
    },
    {
      id: 2,
      type: "egreso",
      description: "Pago Nómina Técnicos",
      amount: -320000,
      date: "2024-12-12",
      client: "RRHH",
      status: "completado",
      month: "2024-12",
      year: "2024"
    },
    {
      id: 3,
      type: "egreso",
      description: "Compra Repuestos",
      amount: -45000,
      date: "2024-12-11",
      client: "Proveedor ABC",
      status: "completado",
      month: "2024-12",
      year: "2024"
    },
    {
      id: 4,
      type: "ingreso",
      description: "Pago Mantenimiento Preventivo #1237",
      amount: 95000,
      date: "2024-12-10",
      client: "Industria GHI",
      status: "completado",
      jobId: "JOB-1237",
      month: "2024-12",
      year: "2024"
    },
    {
      id: 5,
      type: "egreso",
      description: "Combustible Vehículos",
      amount: -25000,
      date: "2024-12-08",
      client: "Estación Servicio",
      status: "completado",
      month: "2024-12",
      year: "2024"
    },
    {
      id: 6,
      type: "ingreso",
      description: "Pago Emergencia Nocturna #1239",
      amount: 180000,
      date: "2024-12-07",
      client: "Residencial MNO",
      status: "completado",
      jobId: "JOB-1239",
      month: "2024-12",
      year: "2024"
    },
    // Enero 2025
    {
      id: 7,
      type: "ingreso",
      description: "Pago Servicio Técnico #1242",
      amount: 140000,
      date: "2025-01-14",
      client: "Comercial VWX",
      status: "completado",
      jobId: "JOB-1242",
      month: "2025-01",
      year: "2025"
    },
    {
      id: 8,
      type: "egreso",
      description: "Pago Nómina Técnicos",
      amount: -320000,
      date: "2025-01-13",
      client: "RRHH",
      status: "completado",
      month: "2025-01",
      year: "2025"
    },
    {
      id: 9,
      type: "egreso",
      description: "Compra Herramientas",
      amount: -65000,
      date: "2025-01-11",
      client: "Ferretería BCD",
      status: "completado",
      month: "2025-01",
      year: "2025"
    },
    {
      id: 10,
      type: "ingreso",
      description: "Pago Instalación Completa #1244",
      amount: 220000,
      date: "2025-01-10",
      client: "Residencial EFG",
      status: "completado",
      jobId: "JOB-1244",
      month: "2025-01",
      year: "2025"
    },
    {
      id: 11,
      type: "egreso",
      description: "Seguro Vehículos",
      amount: -85000,
      date: "2025-01-08",
      client: "Compañía Seguros",
      status: "completado",
      month: "2025-01",
      year: "2025"
    },
    {
      id: 12,
      type: "ingreso",
      description: "Pago Consultoría Técnica #1246",
      amount: 75000,
      date: "2025-01-07",
      client: "Empresa KLM",
      status: "completado",
      jobId: "JOB-1246",
      month: "2025-01",
      year: "2025"
    },
    // Febrero 2025
    {
      id: 13,
      type: "ingreso",
      description: "Pago Mantenimiento #1248",
      amount: 95000,
      date: "2025-02-15",
      client: "Industria XYZ",
      status: "completado",
      jobId: "JOB-1248",
      month: "2025-02",
      year: "2025"
    },
    {
      id: 14,
      type: "egreso",
      description: "Pago Nómina Técnicos",
      amount: -320000,
      date: "2025-02-13",
      client: "RRHH",
      status: "completado",
      month: "2025-02",
      year: "2025"
    },
    {
      id: 15,
      type: "egreso",
      description: "Compra Materiales",
      amount: -85000,
      date: "2025-02-10",
      client: "Proveedor DEF",
      status: "completado",
      month: "2025-02",
      year: "2025"
    },
    {
      id: 16,
      type: "ingreso",
      description: "Pago Reparación Urgente #1249",
      amount: 150000,
      date: "2025-02-08",
      client: "Residencial ABC",
      status: "completado",
      jobId: "JOB-1249",
      month: "2025-02",
      year: "2025"
    },
    // Marzo 2025
    {
      id: 17,
      type: "ingreso",
      description: "Pago Instalación #1250",
      amount: 280000,
      date: "2025-03-20",
      client: "Comercial GHI",
      status: "completado",
      jobId: "JOB-1250",
      month: "2025-03",
      year: "2025"
    },
    {
      id: 18,
      type: "egreso",
      description: "Pago Nómina Técnicos",
      amount: -320000,
      date: "2025-03-13",
      client: "RRHH",
      status: "completado",
      month: "2025-03",
      year: "2025"
    },
    {
      id: 19,
      type: "egreso",
      description: "Seguro Equipos",
      amount: -120000,
      date: "2025-03-05",
      client: "Compañía Seguros",
      status: "completado",
      month: "2025-03",
      year: "2025"
    },
    {
      id: 20,
      type: "ingreso",
      description: "Pago Servicio Técnico #1251",
      amount: 110000,
      date: "2025-03-03",
      client: "Oficina JKL",
      status: "completado",
      jobId: "JOB-1251",
      month: "2025-03",
      year: "2025"
    }
  ];
  // _allTransactions is intentionally unused - fallback data for future use
  void _allTransactions

  // Handler functions
  const handleNewTransaction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setShowTransactionForm(true);
  };

  const handleExportData = () => {
    // Create CSV data
    const csvData = currentMonthTransactions.map(transaction => ({
      'Tipo': transaction.type === 'INCOME' ? 'Ingreso' : 'Egreso',
      'Descripción': transaction.description,
      'Categoría': transaction.category,
      'Monto': transaction.amount,
      'Fecha': transaction.date,
      'Método de Pago': transaction.paymentMethod,
      'Referencia': transaction.reference || 'N/A'
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTransactionSubmit = async (data: any) => {

    setLoading(true);

    try {
      const response = await fetch('/api/cash-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: data.amount,
          description: data.description,
          category: data.category,
          paymentMethod: data.paymentMethod,
          reference: data.reference || null,
          date: data.date,
          type: transactionType === 'income' ? 'INCOME' : 'EXPENSE'
        }),
      });

      if (response.ok) {
        // Recargar transacciones para mostrar la nueva
        await loadTransactions();

        // Cerrar el formulario
        setShowTransactionForm(false);

        // Mostrar mensaje de éxito
        alert(`✅ ${transactionType === 'income' ? 'Ingreso' : 'Gasto'} registrado exitosamente`);
      } else {
        const errorData = await response.json();
        // Error guardando transacción
        alert(`❌ Error al guardar: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      // Error en la petición
      alert('❌ Error de conexión al guardar la transacción');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionCancel = () => {
    setShowTransactionForm(false);
  };

  // Función para obtener transacciones del mes seleccionado
  const getTransactionsForMonth = (month: string) => {
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const transactionMonth = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
      return transactionMonth === month;
    });
  };

  // Transacciones del mes actual
  const currentMonthTransactions = getTransactionsForMonth(selectedMonth);

  // Filter transactions based on search term and company
  const filteredTransactions = currentMonthTransactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompany = selectedCompany === 'all' ||
      (transaction.companyId && transaction.companyId === selectedCompany);

    return matchesSearch && matchesCompany;
  });

  // Estadísticas del mes (usando transacciones filtradas)
  const monthStats = {
    totalIncome: filteredTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0),
    totalExpenses: filteredTransactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0),
    balance: 0,
    transactionCount: filteredTransactions.length
  };
  monthStats.balance = monthStats.totalIncome - monthStats.totalExpenses;

  // Obtener meses disponibles ordenados por fecha
  const availableMonths = Array.from(new Set(transactions.map(t => {
    const date = new Date(t.date);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  })))
    .sort((a, b) => {
      const [yearA, monthA] = a.split('-').map(Number);
      const [yearB, monthB] = b.split('-').map(Number);
      return (yearA || 0) - (yearB || 0) || (monthA || 0) - (monthB || 0);
    });

  const availableYears = Array.from(new Set(transactions.map(t => new Date(t.date).getFullYear().toString())))
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Navegación entre meses
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availableMonths.indexOf(selectedMonth);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedMonth(availableMonths[currentIndex - 1] || '');
    } else if (direction === 'next' && currentIndex < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIndex + 1] || '');
    }
  };

  // Navegación rápida a mes específico
  const navigateToMonth = (month: string) => {
    setSelectedMonth(month);
  };

  // Navegación rápida a año específico
  const navigateToYear = (year: string) => {
    setSelectedYear(year);
    // Buscar el primer mes disponible del año seleccionado
    const yearMonths = availableMonths.filter(month => month.startsWith(year));
    if (yearMonths.length > 0) {
      setSelectedMonth(yearMonths[0] || '');
    }
  };

  // Obtener meses disponibles para el año seleccionado
  const getMonthsForYear = (year: string) => {
    return availableMonths.filter(month => month.startsWith(year));
  };

  // Estadísticas esenciales
  const stats = [
    {
      title: "Saldo del Mes",
      value: `$${monthStats.balance.toLocaleString()}`,
      change: monthStats.balance > 0 ? "+" : "",
      trend: monthStats.balance > 0 ? "up" : "down",
      icon: DollarSign,
      color: monthStats.balance > 0 ? "text-green-600" : "text-red-600",
      bgColor: monthStats.balance > 0 ? "bg-green-50" : "bg-red-50"
    },
    {
      title: "Ingresos del Mes",
      value: `$${monthStats.totalIncome.toLocaleString()}`,
      change: "+15.2%",
      trend: "up",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Gastos del Mes",
      value: `$${monthStats.totalExpenses.toLocaleString()}`,
      change: "-8.5%",
      trend: "down",
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Total Transacciones",
      value: monthStats.transactionCount.toString(),
      change: "+12.3%",
      trend: "up",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Cajas</h1>
          <p className="text-gray-600 mt-2">
            Registra gastos manualmente. Los ingresos se generan automáticamente al confirmar pagos de trabajos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center"
            onClick={() => handleNewTransaction('expense')}
          >
            <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
            Registrar Gasto
          </Button>
          <Button
            variant="outline"
            onClick={loadTransactions}
            disabled={loading}
            className="border-orange-300 text-orange-700 hover:bg-orange-50 flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 flex-shrink-0 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Cargando...' : 'Recargar'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2 flex-shrink-0" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Navegación Rápida por Mes */}
      <Card className="border-0 shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Navegación con flechas */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
                disabled={availableMonths.indexOf(selectedMonth) === 0}
                className="hover:bg-gray-50 flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
              </Button>
              <div className="text-center min-w-[200px]">
                <h2 className="text-xl font-semibold text-gray-900">
                  {getMonthName(selectedMonth)}
                </h2>
                <p className="text-sm text-gray-600">
                  {filteredTransactions.length} transacciones
                  {selectedCompany !== 'all' && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {companies.find(c => c.id === selectedCompany)?.displayName || companies.find(c => c.id === selectedCompany)?.name || 'Empresa'}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
                disabled={availableMonths.indexOf(selectedMonth) === availableMonths.length - 1}
                className="hover:bg-gray-50 flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            </div>

            {/* Selectores rápidos */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Selector de Empresa */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">Empresa</label>
                <div className="flex gap-2">
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm focus:border-[#002D71] focus:ring-1 focus:ring-[#002D71] min-w-[150px]"
                  >
                    <option value="all">Todas las empresas</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.displayName || company.name}
                      </option>
                    ))}
                  </select>
                  {selectedCompany !== 'all' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCompany('all')}
                      className="px-3 text-xs"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>

              {/* Selector de Año */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">Año</label>
                <select
                  value={selectedYear}
                  onChange={(e) => navigateToYear(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm focus:border-[#002D71] focus:ring-1 focus:ring-[#002D71] min-w-[100px]"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Mes */}
              <div className="flex flex-col">
                <label className="text-xs font-medium text-gray-600 mb-1">Mes</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => navigateToMonth(e.target.value)}
                  className="p-2 border border-gray-300 rounded-md text-sm focus:border-[#002D71] focus:ring-1 focus:ring-[#002D71] min-w-[150px]"
                >
                  {getMonthsForYear(selectedYear).map(month => (
                    <option key={month} value={month}>
                      {getMonthName(month)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Navegación rápida con botones */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 mr-2">Ir a:</span>
              {availableMonths.slice(-6).map(month => (
                <Button
                  key={month}
                  variant={selectedMonth === month ? "default" : "outline"}
                  size="sm"
                  onClick={() => navigateToMonth(month)}
                  className={`text-xs ${selectedMonth === month
                    ? "bg-[#002D71] text-white hover:bg-[#1e40af]"
                    : "hover:bg-gray-50"
                    }`}
                >
                  {getMonthName(month)}
                </Button>
              ))}
              {availableMonths.length > 6 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToMonth(availableMonths[0] || '')}
                  className="text-xs hover:bg-gray-50"
                >
                  Más antiguo
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Esenciales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={stat.trend === "up" ? "default" : "secondary"}
                      className={`${stat.trend === "up"
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : "bg-red-100 text-red-800 hover:bg-red-100"
                        }`}
                    >
                      {stat.change}
                    </Badge>
                    <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Búsqueda - Hidden on tablet and mobile */}
      <Card className="border-0 shadow-soft hidden lg:block">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 flex items-center justify-center" />
            <Input
              placeholder="Buscar transacciones..."
              className="pl-10 border-gray-200 focus:border-[#002D71] focus:ring-[#002D71]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Transacciones del Mes */}
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-[#002D71] flex-shrink-0" />
            Transacciones de {getMonthName(selectedMonth)}
          </CardTitle>
          <CardDescription>
            Historial de operaciones financieras del mes seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Categoría</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Monto</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <Badge
                          variant={transaction.type === "INCOME" ? "default" : "secondary"}
                          className={`${transaction.type === "INCOME"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                            }`}
                        >
                          {transaction.type === "INCOME" ? "Ingreso" : "Egreso"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{transaction.category}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${transaction.type === "INCOME" ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {transaction.type === "INCOME" ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('es-CL')}
                      </td>
                      <td className="py-3 px-4">
                        {transaction.type === 'INCOME' ? (
                          <Badge
                            variant={transaction.jobStatus === 'COMPLETED' || transaction.jobStatus === 'DONE' || transaction.jobStatus === 'FINISHED' ? 'default' : 'secondary'}
                            className={`${transaction.jobStatus === 'COMPLETED' || transaction.jobStatus === 'DONE' || transaction.jobStatus === 'FINISHED'
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : transaction.jobStatus === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-100'
                                : transaction.jobStatus === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                  : transaction.jobStatus === 'CANCELLED'
                                    ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                              }`}
                          >
                            {transaction.jobStatus === 'COMPLETED' ? 'Completado' :
                              transaction.jobStatus === 'IN_PROGRESS' ? 'En Progreso' :
                                transaction.jobStatus === 'PENDING' ? 'Pendiente' :
                                  transaction.jobStatus === 'CANCELLED' ? 'Cancelado' :
                                    transaction.jobStatus === 'DONE' ? 'Completado' :
                                      transaction.jobStatus === 'FINISHED' ? 'Completado' :
                                        transaction.jobStatus || 'Pendiente'}
                          </Badge>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No hay transacciones para este mes</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para Nueva Transacción */}
      <ModalPortal isOpen={showTransactionForm}>
        <CashTransactionForm
          type={transactionType}
          onSubmit={handleTransactionSubmit}
          onCancel={handleTransactionCancel}
        />
      </ModalPortal>
    </div>
  );
}