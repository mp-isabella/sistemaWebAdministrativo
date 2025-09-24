"use client";

import { Bell, Check, Clock, FileText, Trash2, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';

import useNotifications from '@/hooks/use-notifications';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

interface NotificationsProps {
  userRole: string;
  userId?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userRole, userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    unreadCount,
    addNotification: _addNotification,
    addJobNotification: _addJobNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    cleanOldNotifications,
    getAllNotifications,
  } = useNotifications(userRole || '', userId || '');

  const allNotifications = getAllNotifications();

  // Limpiar notificaciones antiguas cada día
  useEffect(() => {
    const interval = setInterval(() => {
      cleanOldNotifications();
    }, 24 * 60 * 60 * 1000); // 24 horas

    return () => clearInterval(interval);
  }, [cleanOldNotifications]);

  const getNotificationIcon = (notification: any) => {
    if (notification.notificationType === 'job') {
      switch (notification.type) {
        case 'created':
          return <FileText className="h-4 w-4 text-blue-500" />;
        case 'updated':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'assigned':
          return <User className="h-4 w-4 text-green-500" />;
        case 'completed':
          return <Check className="h-4 w-4 text-green-600" />;
        case 'cancelled':
          return <X className="h-4 w-4 text-red-500" />;
        default:
          return <Bell className="h-4 w-4 text-gray-500" />;
      }
    } else {
      switch (notification.type) {
        case 'success':
          return <Check className="h-4 w-4 text-green-500" />;
        case 'error':
          return <X className="h-4 w-4 text-red-500" />;
        case 'warning':
          return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'info':
          return <Bell className="h-4 w-4 text-blue-500" />;
        default:
          return <Bell className="h-4 w-4 text-gray-500" />;
      }
    }
  };

  const getNotificationTitle = (notification: any) => {
    if (notification.notificationType === 'job') {
      switch (notification.type) {
        case 'created':
          return 'Nuevo Trabajo Creado';
        case 'updated':
          return 'Trabajo Actualizado';
        case 'assigned':
          return 'Trabajo Asignado';
        case 'completed':
          return 'Trabajo Completado';
        case 'cancelled':
          return 'Trabajo Cancelado';
        default:
          return 'Notificación de Trabajo';
      }
    } else {
      return notification.title;
    }
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.notificationType === 'job') {
      const baseMessage = `${notification.jobTitle} - ${notification.clientName}`;

      switch (notification.type) {
        case 'created':
          return `Se ha creado un nuevo trabajo: ${baseMessage}`;
        case 'updated':
          return `Se ha actualizado el trabajo: ${baseMessage}`;
        case 'assigned':
          return `Se te ha asignado el trabajo: ${baseMessage}`;
        case 'completed':
          return `Se ha completado el trabajo: ${baseMessage}`;
        case 'cancelled':
          return `Se ha cancelado el trabajo: ${baseMessage}`;
        default:
          return baseMessage;
      }
    } else {
      return notification.message;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours} h`;
    if (days < 7) return `Hace ${days} días`;

    return new Date(timestamp).toLocaleDateString('es-CL');
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id, notification.notificationType);
    }

    // Aquí podrías agregar navegación al trabajo específico si es necesario
    if (notification.notificationType === 'job' && notification.jobId) {
      // Navegar al trabajo o abrir modal de detalles
    }
  };

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Notificaciones</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Notificaciones</CardTitle>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Marcar todas como leídas
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="h-96 overflow-y-auto">
                {allNotifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No hay notificaciones</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {allNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {getNotificationTitle(notification)}
                              </h4>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-gray-400 hover:text-red-500"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeNotification(notification.id, notification.notificationType);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">
                              {getNotificationMessage(notification)}
                            </p>

                            {!notification.read && (
                              <div className="mt-2">
                                <Badge variant="secondary" className="text-xs">
                                  Nuevo
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overlay para cerrar al hacer click fuera */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Notifications;
