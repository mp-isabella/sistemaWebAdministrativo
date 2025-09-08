"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle, 
  X, 
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WebsiteNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  formData: string;
  email: string;
  phone?: string;
  name: string;
  service?: string;
  region?: string;
  commune?: string;
  address?: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WebsiteNotifications() {
  const [notifications, setNotifications] = useState<WebsiteNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/website-notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      } else {
        console.error('Error fetching notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/website-notifications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true, status: 'read' }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true, status: 'read' }
              : notification
          )
        );
        toast({
          title: "Notificación marcada como leída",
          description: "La notificación ha sido actualizada.",
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "No se pudo marcar la notificación como leída.",
        variant: "destructive"
      });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/website-notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        toast({
          title: "Notificación eliminada",
          description: "La notificación ha sido eliminada exitosamente.",
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la notificación.",
        variant: "destructive"
      });
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNotifications(newExpanded);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'contact_form':
        return <Mail className="h-5 w-5 text-blue-500" />;
      case 'quote_request':
        return <Bell className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string, isRead: boolean) => {
    if (isRead) {
      return <Badge variant="secondary">Leída</Badge>;
    }
    
    switch (status) {
      case 'unread':
        return <Badge variant="destructive">Nueva</Badge>;
      case 'read':
        return <Badge variant="secondary">Leída</Badge>;
      case 'processed':
        return <Badge variant="default">Procesada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones del Sitio Web
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay notificaciones del sitio web</p>
            <p className="text-sm">Las solicitudes de contacto aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones del Sitio Web
          <Badge variant="outline" className="ml-2">
            {notifications.filter(n => !n.isRead).length} nuevas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-all duration-200 ${
                notification.isRead 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              {/* Header de la notificación */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getNotificationIcon(notification.type)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(notification.status, notification.isRead)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(notification.id)}
                    className="h-8 w-8 p-0"
                  >
                    {expandedNotifications.has(notification.id) ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{notification.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{notification.email}</span>
                </div>
                {notification.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{notification.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(notification.createdAt)}</span>
                </div>
              </div>

              {/* Detalles expandidos */}
              {expandedNotifications.has(notification.id) && (
                <div className="border-t pt-3 mt-3 space-y-3">
                  {notification.service && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-700">Servicio:</span>
                      <span className="text-gray-600">{notification.service}</span>
                    </div>
                  )}
                  
                  {(notification.region || notification.commune) && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        {notification.region} {notification.commune && `- ${notification.commune}`}
                      </span>
                    </div>
                  )}
                  
                  {notification.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{notification.address}</span>
                    </div>
                  )}

                  {/* Datos del formulario */}
                  <div className="bg-gray-100 p-3 rounded-md">
                    <h5 className="font-medium text-gray-700 mb-2">Datos del Formulario:</h5>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(notification.formData), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500">
                  {notification.isRead ? 'Leída' : 'No leída'} • {formatDate(notification.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                      className="h-8 px-3"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Marcar como leída
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
