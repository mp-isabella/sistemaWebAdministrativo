# 🔧 Solución al Error de Email - Configuración de Credenciales

## ❌ Problema Identificado

El error `Missing credentials for "PLAIN"` indica que faltan las variables de entorno necesarias para la autenticación SMTP de Gmail.

## ✅ Solución Implementada

### 1. Mejoras en el Código
- ✅ **Validación de credenciales**: El sistema ahora valida que las variables de entorno estén configuradas antes de intentar enviar emails
- ✅ **Manejo de errores mejorado**: Mensajes de error más específicos y útiles
- ✅ **Transportador dinámico**: Se crea el transportador solo cuando las credenciales están disponibles

### 2. Configuración Requerida

#### Para Desarrollo Local:
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de Email para Améstica Ltda.
GMAIL_USER=amesticaltda@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres

# Otras variables necesarias
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui
```

#### Para Producción (Vercel):
1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega estas variables:
   - `GMAIL_USER` = `amesticaltda@gmail.com`
   - `GMAIL_APP_PASSWORD` = `tu-app-password-de-16-caracteres`

### 3. Cómo Obtener Gmail App Password

1. **Activa la verificación en 2 pasos** en tu cuenta de Gmail
2. Ve a [Configuración de Google](https://myaccount.google.com/security)
3. Busca **"Contraseñas de aplicaciones"**
4. Genera una nueva contraseña para "Mail"
5. Usa esa contraseña de 16 caracteres (NO tu contraseña normal)

### 4. Verificación de la Configuración

Después de configurar las variables de entorno:

1. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Prueba el formulario** - Ahora debería funcionar correctamente

3. **Verifica en la consola** - No deberías ver más errores de credenciales

## 🚀 Beneficios de la Solución

- ✅ **Detección temprana**: El sistema detecta problemas de configuración antes de intentar enviar
- ✅ **Mensajes claros**: Los usuarios reciben mensajes de error más útiles
- ✅ **Fallback robusto**: Si falla el email, se proporciona información de contacto alternativa
- ✅ **Logging mejorado**: Mejor información de debug en la consola

## 🔍 Archivos Modificados

- `lib/email-service-custom.ts` - Validación de credenciales y manejo de errores mejorado
- `app/api/send-custom-quote/route.ts` - Ya tenía buen manejo de errores

## 📞 Contacto de Emergencia

Si el email sigue fallando, los usuarios pueden contactar directamente:
- **Santiago**: +56 9 4200 8410
- **Ñuble**: +56 9 9670 6640
- **Email**: amesticaltda@gmail.com

---

**Nota**: Una vez configuradas las variables de entorno, el sistema funcionará perfectamente y enviará emails profesionales con el remitente "Améstica Ltda."
