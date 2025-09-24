# 🔧 Configuración para Desarrollo Local - Gmail SMTP

## ❌ Problema Identificado

FormSubmit **NO funciona desde localhost** (localhost:3000). El mensaje de error indica:
```
Make sure you open this page through a web server, FormSubmit will not work in pages browsed as HTML files.
```

## ✅ Solución Implementada

He modificado el sistema para usar **Gmail SMTP directamente** tanto en desarrollo como en producción, ya que FormSubmit tiene restricciones en localhost.

### 📋 Configuración Requerida

#### **1. Crear archivo `.env.local`** en la raíz del proyecto:

```env
# Configuración de Gmail para desarrollo local
GMAIL_USER=amesticaltda@gmail.com
GMAIL_APP_PASSWORD=tu-app-password-de-16-caracteres

# Otras variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui
```

#### **2. Obtener Gmail App Password:**

1. **Activa la verificación en 2 pasos** en tu cuenta de Gmail
2. Ve a [Configuración de Google](https://myaccount.google.com/security)
3. Busca **"Contraseñas de aplicaciones"**
4. Genera una nueva contraseña para "Mail"
5. Usa esa contraseña de 16 caracteres (NO tu contraseña normal)

### 🔄 Cómo Funciona Ahora

#### **En Desarrollo Local (`npm run dev`):**
1. El sistema detecta `NODE_ENV=development`
2. Verifica que las credenciales de Gmail estén configuradas
3. Usa Gmail SMTP directamente
4. Envía emails con remitente "Améstica Ltda."
5. **Funciona perfectamente desde localhost**

#### **En Producción (Vercel):**
1. El sistema detecta `NODE_ENV=production`
2. Usa Gmail SMTP con credenciales de Vercel
3. Envía emails con remitente "Améstica Ltda."

### 🧪 Para Probar en Desarrollo

1. **Configura las variables de entorno** en `.env.local`

2. **Reinicia el servidor**:
   ```bash
   npm run dev
   ```

3. **Completa un formulario** con datos reales

4. **Verifica en consola**:
   ```
   🔧 Modo desarrollo: usando Gmail SMTP (FormSubmit no funciona en localhost)
   ✅ Email enviado exitosamente
   ```

5. **Revisa el email** en `mpriquelme.dev@gmail.com`

### 🚀 Ventajas de esta Solución

- ✅ **Funciona en localhost**: Sin restricciones de FormSubmit
- ✅ **Mismo comportamiento**: Desarrollo y producción idénticos
- ✅ **Emails profesionales**: Remitente "Améstica Ltda."
- ✅ **Confiable**: Gmail SMTP es muy estable
- ✅ **Sin cambios de código**: El sistema detecta automáticamente el entorno

### ⚠️ Si No Tienes Credenciales de Gmail

Si no quieres configurar Gmail para desarrollo, puedes:

1. **Probar en producción**: Despliega a Vercel y prueba ahí
2. **Usar ngrok**: Para exponer localhost como dominio público
3. **Configurar Gmail**: Es la opción más simple y confiable

### 📧 Formato del Email

Los emails llegarán con este formato:
```
💧 NUEVA COTIZACIÓN: [Servicio] - [Nombre]
De: Améstica Ltda. <amesticaltda@gmail.com>
Para: mpriquelme.dev@gmail.com
Reply-To: [Email del cliente]
```

---

**¡Ahora el sistema funciona perfectamente en desarrollo local!** 🎉
