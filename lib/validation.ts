/**
 * Utilidades de validación de datos
 */

export interface ValidationResult {
    isValid: boolean
    errors: string[]
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): boolean {
    if (!email) return true // Email opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Valida formato de teléfono chileno
 */
export function validatePhone(phone: string): boolean {
    if (!phone) return false
    // Formato chileno más flexible: +56 9 XXXX XXXX, 9 XXXX XXXX, o variaciones
    const cleanPhone = phone.replace(/\s/g, '').replace(/[^\d+]/g, '')
    // Acepta números de 9 dígitos que empiecen con 9 (formato chileno móvil)
    const phoneRegex = /^(\+56)?9\d{8}$/
    console.log('🔍 Validating phone:', phone, '-> cleaned:', cleanPhone, '-> valid:', phoneRegex.test(cleanPhone))
    return phoneRegex.test(cleanPhone)
}

/**
 * Valida formato de RUT chileno
 */
export function validateRUT(rut: string): boolean {
    if (!rut) return true // RUT opcional

    // Limpiar RUT
    const cleanRUT = rut.replace(/[^0-9kK]/g, '')

    // Si tiene menos de 8 dígitos, no es válido
    if (cleanRUT.length < 8) return false

    // Si tiene exactamente 8-10 dígitos sin DV, es válido (formato básico)
    if (cleanRUT.length >= 8 && cleanRUT.length <= 10 && /^\d+$/.test(cleanRUT)) {
        return true
    }

    // Si tiene 10+ dígitos, validar con DV
    if (cleanRUT.length >= 10) {
        const body = cleanRUT.slice(0, -1)
        const dv = cleanRUT.slice(-1).toUpperCase()

        // Validar dígito verificador
        let sum = 0
        let multiplier = 2

        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i] || '0') * multiplier
            multiplier = multiplier === 7 ? 2 : multiplier + 1
        }

        const remainder = sum % 11
        const calculatedDV = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString()

        return dv === calculatedDV
    }

    return false
}

/**
 * Valida que un string no esté vacío
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return {
            isValid: false,
            errors: [`${fieldName} es requerido`]
        }
    }
    return { isValid: true, errors: [] }
}

/**
 * Valida longitud mínima y máxima
 */
export function validateLength(value: string, min: number, max: number, fieldName: string): ValidationResult {
    if (value.length < min) {
        return {
            isValid: false,
            errors: [`${fieldName} debe tener al menos ${min} caracteres`]
        }
    }
    if (value.length > max) {
        return {
            isValid: false,
            errors: [`${fieldName} no puede tener más de ${max} caracteres`]
        }
    }
    return { isValid: true, errors: [] }
}

/**
 * Valida que un número esté en un rango
 */
export function validateRange(value: number, min: number, max: number, fieldName: string): ValidationResult {
    if (value < min || value > max) {
        return {
            isValid: false,
            errors: [`${fieldName} debe estar entre ${min} y ${max}`]
        }
    }
    return { isValid: true, errors: [] }
}

/**
 * Valida formato de fecha
 */
export function validateDate(dateString: string, fieldName: string): ValidationResult {
    if (!dateString) {
        return { isValid: false, errors: [`${fieldName} es requerido`] }
    }

    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
        return { isValid: false, errors: [`${fieldName} tiene un formato inválido`] }
    }

    return { isValid: true, errors: [] }
}

/**
 * Valida formato de hora (HH:MM)
 */
export function validateTime(timeString: string, fieldName: string): ValidationResult {
    if (!timeString) {
        return { isValid: false, errors: [`${fieldName} es requerido`] }
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(timeString)) {
        return { isValid: false, errors: [`${fieldName} debe tener formato HH:MM`] }
    }

    return { isValid: true, errors: [] }
}

/**
 * Valida que una hora esté en el rango de trabajo (8:00 - 19:00)
 */
export function validateWorkTime(timeString: string, fieldName: string): ValidationResult {
    const timeValidation = validateTime(timeString, fieldName)
    if (!timeValidation.isValid) return timeValidation

    const [hours] = timeString.split(':').map(Number)
    if (!hours || hours < 8 || hours > 19) {
        return {
            isValid: false,
            errors: [`${fieldName} debe estar entre 8:00 y 19:00`]
        }
    }

    return { isValid: true, errors: [] }
}

/**
 * Valida datos de cliente
 */
export function validateClientData(data: any): ValidationResult {
    const errors: string[] = []

    // Validar campos requeridos
    const nameValidation = validateRequired(data.name, 'Nombre')
    if (!nameValidation.isValid) errors.push(...nameValidation.errors)

    const phoneValidation = validateRequired(data.phone, 'Teléfono')
    if (!phoneValidation.isValid) errors.push(...phoneValidation.errors)

    const addressValidation = validateRequired(data.address, 'Dirección')
    if (!addressValidation.isValid) errors.push(...addressValidation.errors)

    // Validar formato de email si se proporciona
    if (data.email && !validateEmail(data.email)) {
        errors.push('Formato de email inválido')
    }

    // Validar formato de teléfono
    if (data.phone && !validatePhone(data.phone)) {
        errors.push('Formato de teléfono inválido (formato chileno: 9 XXXX XXXX)')
    }

    // Validar formato de RUT si se proporciona
    if (data.rut && !validateRUT(data.rut)) {
        errors.push('Formato de RUT inválido')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valida datos de trabajador
 */
export function validateWorkerData(data: any): ValidationResult {
    const errors: string[] = []

    // Validar campos requeridos
    const nameValidation = validateRequired(data.name, 'Nombre')
    if (!nameValidation.isValid) errors.push(...nameValidation.errors)

    const emailValidation = validateRequired(data.email, 'Email')
    if (!emailValidation.isValid) errors.push(...emailValidation.errors)

    const passwordValidation = validateRequired(data.password, 'Contraseña')
    if (!passwordValidation.isValid) errors.push(...passwordValidation.errors)

    const roleValidation = validateRequired(data.role, 'Rol')
    if (!roleValidation.isValid) errors.push(...roleValidation.errors)

    // Validar formato de email
    if (data.email && !validateEmail(data.email)) {
        errors.push('Formato de email inválido')
    }

    // Validar longitud de contraseña
    if (data.password && data.password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valida datos de trabajo
 */
export function validateJobData(data: any): ValidationResult {
    const errors: string[] = []

    // Validar campos requeridos
    const titleValidation = validateRequired(data.title, 'Título')
    if (!titleValidation.isValid) errors.push(...titleValidation.errors)

    const clientIdValidation = validateRequired(data.clientId, 'Cliente')
    if (!clientIdValidation.isValid) errors.push(...clientIdValidation.errors)

    const serviceIdValidation = validateRequired(data.serviceId, 'Servicio')
    if (!serviceIdValidation.isValid) errors.push(...serviceIdValidation.errors)

    const companyIdValidation = validateRequired(data.companyId, 'Empresa')
    if (!companyIdValidation.isValid) errors.push(...companyIdValidation.errors)

    const scheduledAtValidation = validateRequired(data.scheduledAt, 'Fecha programada')
    if (!scheduledAtValidation.isValid) errors.push(...scheduledAtValidation.errors)

    // Validar formato de fecha
    if (data.scheduledAt) {
        const dateValidation = validateDate(data.scheduledAt, 'Fecha programada')
        if (!dateValidation.isValid) errors.push(...dateValidation.errors)
    }

    // Validar horarios si se proporcionan
    if (data.startTime) {
        const startTimeValidation = validateWorkTime(data.startTime, 'Hora de inicio')
        if (!startTimeValidation.isValid) errors.push(...startTimeValidation.errors)
    }

    if (data.endTime) {
        const endTimeValidation = validateWorkTime(data.endTime, 'Hora de fin')
        if (!endTimeValidation.isValid) errors.push(...endTimeValidation.errors)
    }

    // Validar que la hora de fin sea posterior a la de inicio
    if (data.startTime && data.endTime) {
        const [startHour, startMin] = data.startTime.split(':').map(Number)
        const [endHour, endMin] = data.endTime.split(':').map(Number)
        const startMinutes = startHour * 60 + startMin
        const endMinutes = endHour * 60 + endMin

        if (endMinutes <= startMinutes) {
            errors.push('La hora de fin debe ser posterior a la hora de inicio')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valida datos de servicio
 */
export function validateServiceData(data: any): ValidationResult {
    const errors: string[] = []

    // Validar campos requeridos
    const nameValidation = validateRequired(data.name, 'Nombre del servicio')
    if (!nameValidation.isValid) errors.push(...nameValidation.errors)

    // Validar precio si se proporciona
    if (data.price !== undefined && data.price !== null) {
        const price = parseFloat(data.price)
        if (isNaN(price) || price < 0) {
            errors.push('El precio debe ser un número positivo')
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
