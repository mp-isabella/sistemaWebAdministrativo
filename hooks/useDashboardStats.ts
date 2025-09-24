"use client";

import { useState, useEffect } from 'react';

interface DashboardStats {
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
  today: {
    count: number;
    jobs: any[];
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
  recentActivity: any[];
  lastUpdated: string;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Actualizar estadísticas cada 5 minutos
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const retry = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    retry,
    refetch: fetchStats
  };
}
