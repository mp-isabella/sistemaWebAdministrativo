# 🔧 Configuración Híbrida de Email - Desarrollo y Producción

## ✅ Solución Implementada

He modificado el sistema para que funcione automáticamente en ambos entornos:

- **🔧 Desarrollo Local**: Usa FormSubmit (no requiere credenciales Gmail)
- **🚀 Producción (Vercel)**: Usa Gmail SMTP (requiere credenciales)

## 📋 Configuración Requerida

### Para Desarrollo Local (FormSubmit)

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Para producción - Gmail (solo necesario en Vercel)
GMAIL_USER=amesticaltda@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres

# Otras variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui
```

**Nota**: FormSubmit funciona sin configuración adicional en desarrollo local.

### Para Producción (Vercel)

En Vercel Dashboard > Settings > Environment Variables:

```env
# Gmail para producción
GMAIL_USER=amesticaltda@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres
```

## 🔄 Cómo Funciona

### En Desarrollo Local (`npm run dev`):
1. El sistema detecta `NODE_ENV=development`
2. Usa automáticamente FormSubmit
3. **No requiere credenciales Gmail**
4. Funciona inmediatamente

### En Producción (Vercel):
1. El sistema detecta `NODE_ENV=production`
2. Usa Gmail SMTP con credenciales
3. Envía emails con remitente "Améstica Ltda."
4. Si falla Gmail, puede usar FormSubmit como fallback

## 🚀 Ventajas de esta Configuración

- ✅ **Desarrollo sin configuración**: Funciona inmediatamente en local
- ✅ **Producción profesional**: Emails con remitente personalizado
- ✅ **Fallback automático**: Si Gmail falla, usa FormSubmit
- ✅ **Sin cambios de código**: El sistema detecta automáticamente el entorno
- ✅ **Fácil testing**: Puedes probar localmente sin credenciales

## 🔍 Archivos Modificados

- `lib/email-service-custom.ts` - Lógica híbrida desarrollo/producción
- `lib/formsubmit-service.ts` - Servicio de FormSubmit existente
- `CONFIGURACION_EMAIL_HIBRIDA.md` - Esta documentación

## 🧪 Prueba Local

1. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Prueba el formulario** - Debería funcionar inmediatamente

3. **Verifica en consola** - Verás: `🔧 Modo desarrollo: usando FormSubmit`

## 📧 Configuración de FormSubmit

FormSubmit ya está configurado y funciona automáticamente:

- **Email destino**: `mpriquelme.dev@gmail.com`
- **Sin configuración adicional** necesaria
- **Funciona desde localhost** sin problemas
- **Gratuito y confiable**

---

**¡Ahora puedes probar localmente sin problemas de credenciales!** 🎉
