/**
 * Normaliza roles a un formato estándar para evitar inconsistencias
 */

export type StandardRole = 'ADMIN' | 'SECRETARIA' | 'TECNICO';

/**
 * Normaliza cualquier formato de rol a los roles estándar
 */
export function normalizeRole(role: string): StandardRole | null {
    if (!role) return null;

    const normalizedRole = role.trim().toUpperCase();

    // Mapeo de variaciones a roles estándar
    if (['ADMIN', 'ADMINISTRADOR', 'ADMINISTRATOR'].includes(normalizedRole)) {
        return 'ADMIN';
    }

    if (['SECRETARIA', 'SECRETARY', 'SECRETARIO'].includes(normalizedRole)) {
        return 'SECRETARIA';
    }

    if (['TECNICO', 'TECHNICIAN', 'TÉCNICO'].includes(normalizedRole)) {
        return 'TECNICO';
    }

    return null;
}

/**
 * Verifica si un rol tiene permisos para una acción específica
 */
export function hasRolePermission(
    userRole: string,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: 'workers' | 'clients' | 'jobs' | 'work-orders' | 'services' | 'liquidations'
): boolean {
    const normalizedRole = normalizeRole(userRole);
    if (!normalizedRole) return false;

    // Permisos por rol
    const permissions = {
        ADMIN: {
            workers: { create: true, read: true, update: true, delete: true },
            clients: { create: true, read: true, update: true, delete: true },
            jobs: { create: true, read: true, update: true, delete: true },
            'work-orders': { create: true, read: true, update: true, delete: true },
            services: { create: true, read: true, update: true, delete: true },
            liquidations: { create: true, read: true, update: true, delete: true }
        },
        SECRETARIA: {
            workers: { create: false, read: true, update: false, delete: false },
            clients: { create: true, read: true, update: true, delete: false },
            jobs: { create: true, read: true, update: true, delete: false },
            'work-orders': { create: true, read: true, update: true, delete: false },
            services: { create: true, read: true, update: true, delete: false },
            liquidations: { create: true, read: true, update: true, delete: false }
        },
        TECNICO: {
            workers: { create: false, read: false, update: false, delete: false },
            clients: { create: false, read: true, update: false, delete: false },
            jobs: { create: true, read: true, update: true, delete: false },
            'work-orders': { create: true, read: true, update: true, delete: false },
            services: { create: false, read: true, update: false, delete: false },
            liquidations: { create: false, read: true, update: false, delete: false }
        }
    };

    return permissions[normalizedRole]?.[resource]?.[action] || false;
}

/**
 * Obtiene los roles permitidos para el dropdown
 */
export function getAvailableRoles(): Array<{ value: string; label: string }> {
    return [
        { value: 'ADMIN', label: 'Administrador' },
        { value: 'SECRETARIA', label: 'Secretaria' },
        { value: 'TECNICO', label: 'Técnico' }
    ];
}
