# 🚀 Guía de Despliegue a Producción

Esta guía te ayudará a desplegar tu aplicación Next.js con Prisma a producción.

## 📋 Prerrequisitos

1. **Base de datos PostgreSQL en producción**
   - [Supabase](https://supabase.com) (recomendado)
   - [PlanetScale](https://planetscale.com)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)
   - O cualquier proveedor de PostgreSQL

2. **Plataforma de despliegue**
   - [Vercel](https://vercel.com) (recomendado)
   - [Netlify](https://netlify.com)
   - [Railway](https://railway.app)

## 🔧 Configuración Paso a Paso

### 1. Configurar Base de Datos

#### Opción A: Supabase (Recomendado)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Ve a Settings > Database
4. Copia la "Connection string"
5. Formato: `postgresql://postgres:[password]@[host]:5432/postgres`

#### Opción B: Railway
1. Ve a [railway.app](https://railway.app)
2. Crea un nuevo proyecto
3. Añade PostgreSQL
4. Copia la DATABASE_URL

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Base de datos
DATABASE_URL="postgresql://username:password@host:5432/database"

# NextAuth.js
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="genera-una-clave-secreta-segura"

# Email (opcional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-contraseña-de-aplicacion"
EMAIL_FROM="tu-email@gmail.com"
```

### 3. Desplegar en Vercel

#### Método 1: CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

#### Método 2: Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno en el dashboard
4. Despliega

### 4. Configurar Variables en Vercel

En el dashboard de Vercel, ve a Settings > Environment Variables y añade:

- `DATABASE_URL`: Tu URL de base de datos
- `NEXTAUTH_URL`: URL de tu aplicación
- `NEXTAUTH_SECRET`: Clave secreta (genera una nueva)
- Variables de email si las necesitas

### 5. Sincronizar Base de Datos

Después del despliegue, ejecuta:

```bash
# Conectar a tu base de datos de producción
npx prisma db push

# O si prefieres usar migraciones
npx prisma migrate deploy
```

## 🛠️ Comandos Útiles

```bash
# Configurar para producción
npm run setup:prod

# Construir para producción
npm run build:prod

# Sincronizar base de datos
npm run db:push

# Generar cliente de Prisma
npm run db:generate
```

## 🔍 Verificación Post-Despliegue

1. **Verificar base de datos**: Ve a tu dashboard de base de datos y confirma que las tablas se crearon
2. **Probar autenticación**: Intenta registrarte e iniciar sesión
3. **Verificar funcionalidades**: Prueba las principales características de tu app

## 🚨 Solución de Problemas

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` esté correctamente configurada
- Asegúrate de que tu base de datos permita conexiones externas
- Verifica que el usuario tenga permisos necesarios

### Error de NextAuth
- Verifica que `NEXTAUTH_URL` coincida con tu dominio
- Asegúrate de que `NEXTAUTH_SECRET` esté configurado

### Error de build
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Vercel

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la configuración de variables de entorno
3. Confirma que la base de datos esté accesible

¡Tu aplicación debería estar funcionando en producción! 🎉
