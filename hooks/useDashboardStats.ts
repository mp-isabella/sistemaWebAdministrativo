"use client";

import { useEffect, useState } from 'react';

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

  // Dashboard estático sin consultas a la base de datos
  const getEmptyStats = (): DashboardStats => ({
    overview: {
      totalJobs: 0,
      activeJobs: 0,
      completedJobs: 0,
      totalClients: 0,
      totalWorkers: 0,
      totalQuotes: 0,
      totalReports: 0,
      totalRevenue: "$0"
    },
    today: {
      count: 0,
      jobs: []
    },
    status: {
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0
    },
    trends: {
      jobsTrend: 0,
      isPositive: false
    },
    recentActivity: [],
    lastUpdated: new Date().toISOString()
  });

  useEffect(() => {
    // Simular carga rápida y mostrar datos vacíos
    const timer = setTimeout(() => {
      setStats(getEmptyStats());
      setLoading(false);
      setError(null);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const retry = () => {
    setLoading(true);
    setTimeout(() => {
      setStats(getEmptyStats());
      setLoading(false);
      setError(null);
    }, 500);
  };

  return {
    stats,
    loading,
    error,
    retry,
    refetch: retry
  };
}
