import { useState, useEffect, useCallback, useMemo } from 'react';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  jobId?: string;
  technicianId?: string;
  forRole?: 'admin' | 'secretaria' | 'tecnico';
}

export interface JobNotification {
  id: string;
  jobId: string;
  jobTitle: string;
  clientName: string;
  technicianId?: string;
  technicianName?: string;
  type: 'created' | 'updated' | 'assigned' | 'completed' | 'cancelled';
  timestamp: Date;
  read: boolean;
}

// Create a stable hook that accepts userRole and userId parameters
const useNotifications = (userRole: string = '', userId: string = '') => {
  // Ensure we always have valid default values
  const safeUserRole = userRole || '';
  const safeUserId = userId || '';
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [jobNotifications, setJobNotifications] = useState<JobNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar notificaciones desde localStorage al inicializar
  useEffect(() => {
    // Only access localStorage on the client side
    if (typeof window !== 'undefined') {
      try {
        const savedNotifications = localStorage.getItem('notifications');
        const savedJobNotifications = localStorage.getItem('jobNotifications');
        
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        }
        
        if (savedJobNotifications) {
          setJobNotifications(JSON.parse(savedJobNotifications));
        }
      } catch (error) {
        console.warn('Error loading notifications from localStorage:', error);
      } finally {
        setIsInitialized(true);
      }
    } else {
      setIsInitialized(true);
    }
  }, []);

  // Guardar notificaciones en localStorage
  const saveNotifications = useCallback((newNotifications: Notification[]) => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('notifications', JSON.stringify(newNotifications));
      } catch (error) {
        console.warn('Error saving notifications to localStorage:', error);
      }
    }
    setNotifications(newNotifications);
  }, [isInitialized]);

  const saveJobNotifications = useCallback((newJobNotifications: JobNotification[]) => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem('jobNotifications', JSON.stringify(newJobNotifications));
      } catch (error) {
        console.warn('Error saving job notifications to localStorage:', error);
      }
    }
    setJobNotifications(newJobNotifications);
  }, [isInitialized]);

  // Función para agregar una notificación general
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
  }, [notifications, saveNotifications]);

  // Función para agregar una notificación de trabajo
  const addJobNotification = useCallback((jobNotification: Omit<JobNotification, 'id' | 'timestamp' | 'read'>) => {
    const newJobNotification: JobNotification = {
      ...jobNotification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };

    const updatedJobNotifications = [newJobNotification, ...jobNotifications];
    saveJobNotifications(updatedJobNotifications);
  }, [jobNotifications, saveJobNotifications]);

  // Función para marcar una notificación como leída
  const markAsRead = useCallback((notificationId: string, notificationType?: 'general' | 'job') => {
    if (notificationType === 'job') {
      const updatedJobNotifications = jobNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      saveJobNotifications(updatedJobNotifications);
    } else {
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );
      saveNotifications(updatedNotifications);
    }
  }, [notifications, jobNotifications, saveNotifications, saveJobNotifications]);

  // Función para marcar una notificación de trabajo como leída
  const markJobAsRead = useCallback((jobNotificationId: string) => {
    const updatedJobNotifications = jobNotifications.map(notification =>
      notification.id === jobNotificationId ? { ...notification, read: true } : notification
    );
    saveJobNotifications(updatedJobNotifications);
  }, [jobNotifications, saveJobNotifications]);

  // Función para eliminar una notificación
  const removeNotification = useCallback((notificationId: string, notificationType?: 'general' | 'job') => {
    if (notificationType === 'job') {
      const updatedJobNotifications = jobNotifications.filter(notification => notification.id !== notificationId);
      saveJobNotifications(updatedJobNotifications);
    } else {
      const updatedNotifications = notifications.filter(notification => notification.id !== notificationId);
      saveNotifications(updatedNotifications);
    }
  }, [notifications, jobNotifications, saveNotifications, saveJobNotifications]);

  // Función para eliminar una notificación de trabajo
  const removeJobNotification = useCallback((jobNotificationId: string) => {
    const updatedJobNotifications = jobNotifications.filter(notification => notification.id !== jobNotificationId);
    saveJobNotifications(updatedJobNotifications);
  }, [jobNotifications, saveJobNotifications]);

  // Función para marcar todas las notificaciones como leídas
  const markAllAsRead = useCallback(() => {
    const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }));
    const updatedJobNotifications = jobNotifications.map(notification => ({ ...notification, read: true }));
    saveNotifications(updatedNotifications);
    saveJobNotifications(updatedJobNotifications);
  }, [notifications, jobNotifications, saveNotifications, saveJobNotifications]);

  // Función para limpiar todas las notificaciones
  const clearAllNotifications = useCallback(() => {
    saveNotifications([]);
    saveJobNotifications([]);
  }, [saveNotifications, saveJobNotifications]);

  // Función para limpiar notificaciones antiguas (más de 30 días)
  const cleanOldNotifications = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filteredNotifications = notifications.filter(notification => 
      new Date(notification.timestamp) > thirtyDaysAgo
    );
    
    const filteredJobNotifications = jobNotifications.filter(notification => 
      new Date(notification.timestamp) > thirtyDaysAgo
    );

    saveNotifications(filteredNotifications);
    saveJobNotifications(filteredJobNotifications);
  }, [notifications, jobNotifications, saveNotifications, saveJobNotifications]);

  // Calcular notificaciones no leídas
  useEffect(() => {
    const unreadNotifications = notifications.filter(notification => !notification.read).length;
    const unreadJobNotifications = jobNotifications.filter(notification => !notification.read).length;
    setUnreadCount(unreadNotifications + unreadJobNotifications);
  }, [notifications, jobNotifications]);

  // Función para obtener notificaciones filtradas por rol y usuario
  const getFilteredNotifications = useCallback((userRole: string, userId: string = '') => {
    return jobNotifications.filter(notification => {
      let shouldShow = false;
      
      if (userRole === 'admin' || userRole === 'secretaria') {
        // Administradores y secretarias ven todas las notificaciones
        shouldShow = true;
      } else if (userRole === 'tecnico' && notification.technicianId) {
        // Técnicos solo ven notificaciones relacionadas con ellos
        shouldShow = notification.technicianId === userId;
      }
      
      return shouldShow;
    });
  }, [jobNotifications]);

  // Función para obtener todas las notificaciones filtradas por rol y usuario
  const getAllNotifications = useCallback(() => {
    const filteredJobNotifications = getFilteredNotifications(safeUserRole, safeUserId);
    
    // Combinar notificaciones generales y de trabajo
    const allNotifications = [
      ...notifications.map(notification => ({
        ...notification,
        notificationType: 'general' as const
      })),
      ...filteredJobNotifications.map(notification => ({
        ...notification,
        notificationType: 'job' as const
      }))
    ];

    // Ordenar por timestamp (más recientes primero)
    return allNotifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [notifications, safeUserRole, safeUserId, getFilteredNotifications]);

  return {
    notifications,
    jobNotifications,
    unreadCount,
    addNotification,
    addJobNotification,
    markAsRead,
    markJobAsRead,
    removeNotification,
    removeJobNotification,
    markAllAsRead,
    clearAllNotifications,
    getFilteredNotifications,
    cleanOldNotifications,
    getAllNotifications,
  };
};

export default useNotifications;
