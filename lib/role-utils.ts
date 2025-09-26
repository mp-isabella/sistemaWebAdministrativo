/**
 * Utilidades para validación de roles y permisos
 */

export type UserRole = 'admin' | 'administrador' | 'secretaria' | 'tecnico'

export interface RolePermissions {
    canAccessWorkers: boolean
    canCreateWorkers: boolean
    canUpdateWorkers: boolean
    canDeleteWorkers: boolean
    canAccessClients: boolean
    canCreateClients: boolean
    canUpdateClients: boolean
    canDeleteClients: boolean
    canAccessJobs: boolean
    canCreateJobs: boolean
    canUpdateJobs: boolean
    canDeleteJobs: boolean
    canChangeTechnician: boolean
    canAccessServices: boolean
    canCreateServices: boolean
    canUpdateServices: boolean
    canDeleteServices: boolean
    canAccessLiquidations: boolean
    canCreateLiquidations: boolean
    canAccessCashTransactions: boolean
    canCreateCashTransactions: boolean
}

/**
 * Normaliza un rol a formato estándar
 */
export function validateAndNormalizeRole(role: string): UserRole | null {
    if (!role) return null

    const normalizedRole = role.toLowerCase().trim()

    switch (normalizedRole) {
        case 'admin':
        case 'administrador':
        case 'administrator':
            return 'admin'
        case 'secretaria':
        case 'secretary':
        case 'secretario':
            return 'secretaria'
        case 'tecnico':
        case 'técnico':
        case 'technician':
        case 'tech':
            return 'tecnico'
        default:
            return null
    }
}

/**
 * Obtiene los permisos para un rol específico
 */
export function getRolePermissions(role: UserRole): RolePermissions {
    switch (role) {
        case 'admin':
        case 'administrador':
            return {
                canAccessWorkers: true,
                canCreateWorkers: true,
                canUpdateWorkers: true,
                canDeleteWorkers: true,
                canAccessClients: true,
                canCreateClients: true,
                canUpdateClients: true,
                canDeleteClients: true,
                canAccessJobs: true,
                canCreateJobs: true,
                canUpdateJobs: true,
                canDeleteJobs: true,
                canChangeTechnician: true,
                canAccessServices: true,
                canCreateServices: true,
                canUpdateServices: true,
                canDeleteServices: true,
                canAccessLiquidations: true,
                canCreateLiquidations: true,
                canAccessCashTransactions: true,
                canCreateCashTransactions: true
            }

        case 'secretaria':
            return {
                canAccessWorkers: true,
                canCreateWorkers: false,
                canUpdateWorkers: false,
                canDeleteWorkers: false,
                canAccessClients: true,
                canCreateClients: true,
                canUpdateClients: true,
                canDeleteClients: true,
                canAccessJobs: true,
                canCreateJobs: true,
                canUpdateJobs: true,
                canDeleteJobs: true,
                canChangeTechnician: true,
                canAccessServices: true,
                canCreateServices: true,
                canUpdateServices: true,
                canDeleteServices: false,
                canAccessLiquidations: true,
                canCreateLiquidations: true,
                canAccessCashTransactions: true,
                canCreateCashTransactions: true
            }

        case 'tecnico':
            return {
                canAccessWorkers: true,
                canCreateWorkers: false,
                canUpdateWorkers: false,
                canDeleteWorkers: false,
                canAccessClients: false,
                canCreateClients: false,
                canUpdateClients: false,
                canDeleteClients: false,
                canAccessJobs: true,
                canCreateJobs: true,
                canUpdateJobs: true,
                canDeleteJobs: false,
                canChangeTechnician: false,
                canAccessServices: true,
                canCreateServices: false,
                canUpdateServices: false,
                canDeleteServices: false,
                canAccessLiquidations: false,
                canCreateLiquidations: false,
                canAccessCashTransactions: false,
                canCreateCashTransactions: false
            }

        default:
            return {
                canAccessWorkers: false,
                canCreateWorkers: false,
                canUpdateWorkers: false,
                canDeleteWorkers: false,
                canAccessClients: false,
                canCreateClients: false,
                canUpdateClients: false,
                canDeleteClients: false,
                canAccessJobs: false,
                canCreateJobs: false,
                canUpdateJobs: false,
                canDeleteJobs: false,
                canChangeTechnician: false,
                canAccessServices: false,
                canCreateServices: false,
                canUpdateServices: false,
                canDeleteServices: false,
                canAccessLiquidations: false,
                canCreateLiquidations: false,
                canAccessCashTransactions: false,
                canCreateCashTransactions: false
            }
    }
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export function checkUserPermission(userRole: string, permission: keyof RolePermissions): boolean {
    const normalizedRole = validateAndNormalizeRole(userRole)
    if (!normalizedRole) return false

    const permissions = getRolePermissions(normalizedRole)
    return permissions[permission]
}

/**
 * Middleware para verificar permisos en APIs
 */
export function requirePermission(permission: keyof RolePermissions) {
    return (userRole: string): boolean => {
        return checkUserPermission(userRole, permission)
    }
}

/**
 * Valida si un usuario puede realizar una acción específica
 */
export function canUserPerformAction(
    userRole: string,
    action: 'create' | 'read' | 'update' | 'delete',
    resource: 'workers' | 'clients' | 'jobs' | 'services' | 'liquidations' | 'cashTransactions'
): boolean {
    const normalizedRole = validateAndNormalizeRole(userRole)
    if (!normalizedRole) return false

    const permissions = getRolePermissions(normalizedRole)

    switch (resource) {
        case 'workers':
            switch (action) {
                case 'create': return permissions.canCreateWorkers
                case 'read': return permissions.canAccessWorkers
                case 'update': return permissions.canUpdateWorkers
                case 'delete': return permissions.canDeleteWorkers
            }
            break

        case 'clients':
            switch (action) {
                case 'create': return permissions.canCreateClients
                case 'read': return permissions.canAccessClients
                case 'update': return permissions.canUpdateClients
                case 'delete': return permissions.canDeleteClients
            }
            break

        case 'jobs':
            switch (action) {
                case 'create': return permissions.canCreateJobs
                case 'read': return permissions.canAccessJobs
                case 'update': return permissions.canUpdateJobs
                case 'delete': return permissions.canDeleteJobs
            }
            break

        case 'services':
            switch (action) {
                case 'create': return permissions.canCreateServices
                case 'read': return permissions.canAccessServices
                case 'update': return permissions.canUpdateServices
                case 'delete': return permissions.canDeleteServices
            }
            break

        case 'liquidations':
            switch (action) {
                case 'create': return permissions.canCreateLiquidations
                case 'read': return permissions.canAccessLiquidations
                case 'update': return false // No implementado aún
                case 'delete': return false // No implementado aún
            }
            break

        case 'cashTransactions':
            switch (action) {
                case 'create': return permissions.canCreateCashTransactions
                case 'read': return permissions.canAccessCashTransactions
                case 'update': return false // No implementado aún
                case 'delete': return false // No implementado aún
            }
            break
    }

    return false
}
