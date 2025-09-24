# 🚀 Configuración de Supabase + Vercel para SistemaWeb

## 📋 Resumen del Proceso

Este documento te guía paso a paso para conectar tu proyecto con Supabase y desplegarlo en Vercel.

## 🔧 Paso 1: Configurar Supabase

### 1.1 Crear cuenta y proyecto
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Nombre: `SistemaWeb`
5. **¡Anota la contraseña de la base de datos!**
6. Región: `us-east-1` o `us-west-1` (más cerca de Chile)
7. Haz clic en "Create new project"

### 1.2 Obtener credenciales
1. Ve a **Settings** → **Database**
2. Busca **Connection string** → **URI**
3. Copia la URL completa (algo como: `postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres`)

## 🔧 Paso 2: Configurar variables de entorno

### 2.1 Crear archivo .env.local
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Base de datos Supabase
DATABASE_URL="postgresql://postgres:[TU_PASSWORD]@db.[TU_PROJECT_REF].supabase.co:5432/postgres"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="bb180c6364b8d19fc0a57626c2a623f60aedc883c5e5ada4e9908931b8fceb7e"

# Email Configuration (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"
```

### 2.2 Reemplazar valores
- Reemplaza `[TU_PASSWORD]` con la contraseña de tu base de datos
- Reemplaza `[TU_PROJECT_REF]` con el ID de tu proyecto de Supabase
- Cambia `NEXTAUTH_SECRET` por una clave única y segura

## 🔧 Paso 3: Sincronizar base de datos

Ejecuta estos comandos en orden:

```bash
# 1. Generar cliente de Prisma
npm run db:generate

# 2. Sincronizar esquema con Supabase
npm run db:push

# 3. (Opcional) Poblar con datos iniciales
npm run db:seed

# 4. Probar la aplicación localmente
npm run dev
```

## 🔧 Paso 4: Desplegar en Vercel

### 4.1 Instalar Vercel CLI
```bash
npm i -g vercel
```

### 4.2 Iniciar sesión y desplegar
```bash
# Iniciar sesión en Vercel
vercel login

# Desplegar a producción
vercel --prod
```

### 4.3 Configurar variables de entorno en Vercel
1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Ve a **Settings** → **Environment Variables**
3. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Tu URL de Supabase |
| `NEXTAUTH_URL` | `https://tu-dominio.vercel.app` |
| `NEXTAUTH_SECRET` | Tu clave secreta |
| `EMAIL_SERVER_HOST` | `smtp.gmail.com` |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | `tu-email@gmail.com` |
| `EMAIL_SERVER_PASSWORD` | `tu-app-password` |
| `EMAIL_FROM` | `tu-email@gmail.com` |

## ✅ Paso 5: Probar la aplicación

### 5.1 Localmente
```bash
npm run dev
```
Visita: http://localhost:3000

### 5.2 En producción
Tu aplicación estará disponible en: `https://tu-proyecto.vercel.app`

## 🐛 Solución de problemas comunes

### Error de conexión a la base de datos
- Verifica que la `DATABASE_URL` sea correcta
- Asegúrate de que la contraseña no tenga caracteres especiales
- Verifica que el proyecto de Supabase esté activo

### Error de autenticación
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Asegúrate de que `NEXTAUTH_URL` coincida con tu dominio

### Error de build en Vercel
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en el dashboard de Vercel

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la conexión a Supabase en su dashboard
3. Asegúrate de que todas las variables estén configuradas correctamente

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará:
- ✅ Conectada a Supabase
- ✅ Desplegada en Vercel
- ✅ Lista para usar en producción
