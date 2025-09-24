import { useSession } from 'next-auth/react';
import { hasPermission, getDefaultRoute, getAllowedRoutes, UserRole, RolePermissions } from '@/lib/roles';

/**
 * Hook personalizado para manejar roles y permisos
 */
export function useRoles() {
  const { data: session, status } = useSession();
  
  const userRole = (session?.user as any)?.role || '';
  const normalizedRole = (userRole === 'admin' || userRole === 'administrador') ? 'ADMINISTRADOR' : userRole as UserRole;
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  const hasPermissionFor = (permission: keyof RolePermissions): boolean => {
    if (!isAuthenticated) return false;
    return hasPermission(userRole, permission);
  };
  
  /**
   * Obtiene la ruta por defecto para el rol del usuario
   */
  const getDefaultRouteForUser = (): string => {
    return getDefaultRoute(userRole);
  };
  
  /**
   * Obtiene todas las rutas permitidas para el rol del usuario
   */
  const getAllowedRoutesForUser = (): string[] => {
    return getAllowedRoutes(userRole);
  };
  
  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  const canAccessRoute = (route: string): boolean => {
    const allowedRoutes = getAllowedRoutesForUser();
    return allowedRoutes.includes(route);
  };
  
  /**
   * Verifica si el usuario es administrador
   */
  const isAdmin = (): boolean => {
    return normalizedRole === 'ADMINISTRADOR';
  };
  
  /**
   * Verifica si el usuario es secretaria
   */
  const isSecretary = (): boolean => {
    return normalizedRole === 'SECRETARIA';
  };
  
  /**
   * Verifica si el usuario es técnico
   */
  const isTechnician = (): boolean => {
    return normalizedRole === 'TECNICO';
  };
  
  /**
   * Obtiene el rol normalizado del usuario
   */
  const getRole = (): UserRole => {
    return normalizedRole;
  };
  
  /**
   * Obtiene el rol original del usuario (sin normalizar)
   */
  const getOriginalRole = (): string => {
    return userRole;
  };
  
  return {
    // Estado
    isLoading,
    isAuthenticated,
    userRole: normalizedRole,
    originalRole: userRole,
    
    // Métodos de verificación
    hasPermissionFor,
    canAccessRoute,
    isAdmin,
    isSecretary,
    isTechnician,
    
    // Métodos de utilidad
    getRole,
    getOriginalRole,
    getDefaultRouteForUser,
    getAllowedRoutesForUser,
  };
}

/**
 * Hook específico para verificar un permiso individual
 */
export function usePermission(permission: keyof RolePermissions) {
  const { hasPermissionFor } = useRoles();
  return hasPermissionFor(permission);
}

/**
 * Hook para verificar si el usuario puede acceder a una ruta
 */
export function useRouteAccess(route: string) {
  const { canAccessRoute } = useRoles();
  return canAccessRoute(route);
}
