/**
 * Sistema de Roles y Permisos
 * Define los roles disponibles y sus permisos correspondientes
 */

export type UserRole = 'ADMINISTRADOR' | 'SECRETARIA' | 'TECNICO';

export interface RolePermissions {
  canAccessCalendar: boolean;
  canAccessAgenda: boolean;
  canAccessClients: boolean;
  canAccessWorkers: boolean;
  canAccessCash: boolean;
  canAccessQuotes: boolean;
  canAccessLiquidations: boolean;
  canAccessReports: boolean;
  canAccessAdmin: boolean;
  canAccessMyJobs: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMINISTRADOR: {
    canAccessCalendar: true,
    canAccessAgenda: true,
    canAccessClients: true,
    canAccessWorkers: true,
    canAccessCash: true,
    canAccessQuotes: true,
    canAccessLiquidations: true,
    canAccessReports: true,
    canAccessAdmin: true,
    canAccessMyJobs: false,
  },
  SECRETARIA: {
    canAccessCalendar: true,
    canAccessAgenda: true,
    canAccessClients: true,
    canAccessWorkers: false,
    canAccessCash: true,
    canAccessQuotes: true,
    canAccessLiquidations: false,
    canAccessReports: true,
    canAccessAdmin: false,
    canAccessMyJobs: false,
  },
  TECNICO: {
    canAccessCalendar: true,
    canAccessAgenda: false,
    canAccessClients: false,
    canAccessWorkers: false,
    canAccessCash: false,
    canAccessQuotes: false,
    canAccessLiquidations: false,
    canAccessReports: false,
    canAccessAdmin: false,
    canAccessMyJobs: true,
  },
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMINISTRADOR: 'Administrador',
  SECRETARIA: 'Secretaria',
  TECNICO: 'Técnico',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  ADMINISTRADOR: 'bg-red-50 text-red-700 border-red-200',
  SECRETARIA: 'bg-blue-50 text-blue-700 border-blue-200',
  TECNICO: 'bg-green-50 text-green-700 border-green-200',
};

// Cache para permisos calculados
const permissionCache = new Map<string, boolean>();

/**
 * Limpia el cache de permisos
 * Útil para forzar la recarga de permisos después de cambios
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
  routesCache.clear();
}

/**
 * Verifica si un usuario tiene permisos para acceder a una ruta específica
 * Optimizado con cache para evitar recálculos
 */
export function hasPermission(role: string, permission: keyof RolePermissions): boolean {
  const cacheKey = `${role.toLowerCase()}:${permission}`;
  
  // Verificar cache primero
  if (permissionCache.has(cacheKey)) {
    return permissionCache.get(cacheKey)!;
  }
  
  const normalizedRole = role.toLowerCase();
  let hasAccess = false;
  
  // Manejar equivalencias de roles
  if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
    hasAccess = ROLE_PERMISSIONS.ADMINISTRADOR[permission];
  } else if (normalizedRole === 'tecnico') {
    hasAccess = ROLE_PERMISSIONS.TECNICO[permission];
  } else if (normalizedRole === 'secretaria') {
    hasAccess = ROLE_PERMISSIONS.SECRETARIA[permission];
  }
  
  // Guardar en cache
  permissionCache.set(cacheKey, hasAccess);
  
  return hasAccess;
}

// Cache para rutas permitidas
const routesCache = new Map<string, string[]>();

/**
 * Obtiene todas las rutas permitidas para un rol específico
 * Optimizado con cache y mapeo predefinido
 */
export function getAllowedRoutes(role: string): string[] {
  const normalizedRole = role.toLowerCase();
  
  // Verificar cache primero
  if (routesCache.has(normalizedRole)) {
    return routesCache.get(normalizedRole)!;
  }
  
  let permissions: RolePermissions;
  
  if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
    permissions = ROLE_PERMISSIONS.ADMINISTRADOR;
  } else if (normalizedRole === 'tecnico') {
    permissions = ROLE_PERMISSIONS.TECNICO;
  } else if (normalizedRole === 'secretaria') {
    permissions = ROLE_PERMISSIONS.SECRETARIA;
  } else {
    const defaultRoutes = ['/dashboard/schedule/calendar'];
    routesCache.set(normalizedRole, defaultRoutes);
    return defaultRoutes;
  }
  
  // Mapeo optimizado de permisos a rutas
  const routeMap = [
    { permission: 'canAccessCalendar', route: '/dashboard/schedule/calendar' },
    { permission: 'canAccessAgenda', route: '/dashboard/schedule' },
    { permission: 'canAccessClients', route: '/dashboard/clients' },
    { permission: 'canAccessWorkers', route: '/dashboard/workers' },
    { permission: 'canAccessCash', route: '/dashboard/cash' },
    { permission: 'canAccessQuotes', route: '/dashboard/quotes' },
    { permission: 'canAccessLiquidations', route: '/dashboard/liquidations' },
    { permission: 'canAccessReports', route: '/dashboard/reports' },
    { permission: 'canAccessAdmin', route: '/dashboard/admin' },
    { permission: 'canAccessMyJobs', route: '/dashboard/my-jobs' },
  ];
  
  const routes = routeMap
    .filter(({ permission }) => permissions[permission as keyof RolePermissions])
    .map(({ route }) => route);
  
  // Guardar en cache
  routesCache.set(normalizedRole, routes);
  
  return routes;
}

/**
 * Obtiene la ruta de redirección por defecto para un rol
 */
export function getDefaultRoute(role: string): string {
  const normalizedRole = role.toLowerCase();
  
  if (normalizedRole === 'admin' || normalizedRole === 'administrador') {
    return '/dashboard';
  } else if (normalizedRole === 'secretaria') {
    return '/dashboard';
  } else if (normalizedRole === 'tecnico') {
    return '/dashboard/my-jobs';
  } else {
    return '/dashboard/schedule/calendar';
  }
}

/**
 * Valida y normaliza un rol de usuario
 * Asegura consistencia entre diferentes formatos de roles
 */
export function validateAndNormalizeRole(role: string): UserRole | null {
  if (!role) return null;
  
  const normalizedRole = role.toUpperCase();
  
  // Mapeo de roles válidos
  const roleMap: Record<string, UserRole> = {
    'ADMINISTRADOR': 'ADMINISTRADOR',
    'ADMIN': 'ADMINISTRADOR',
    'SECRETARIA': 'SECRETARIA',
    'TECNICO': 'TECNICO',
    'TÉCNICO': 'TECNICO'
  };
  
  return roleMap[normalizedRole] || null;
}

/**
 * Verifica si un rol es válido
 */
export function isValidRole(role: string): boolean {
  return validateAndNormalizeRole(role) !== null;
}

/**
 * Obtiene todos los roles válidos
 */
export function getValidRoles(): UserRole[] {
  return ['ADMINISTRADOR', 'SECRETARIA', 'TECNICO'];
}

/**
 * Verifica si un usuario tiene permisos para realizar una acción específica
 * Función centralizada para validación de permisos
 */
export function checkUserPermission(
  userRole: string, 
  permission: keyof RolePermissions
): boolean {
  const normalizedRole = validateAndNormalizeRole(userRole);
  if (!normalizedRole) return false;
  
  return hasPermission(normalizedRole, permission);
}
