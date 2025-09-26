# 🚀 Configuración de Vercel Postgres

## Paso 1: Crear Base de Datos en Vercel

1. Ve a tu [dashboard de Vercel](https://vercel.com/dashboard)
2. Haz clic en **Storage**
3. Selecciona **Postgres**
4. Haz clic en **Create Database**
5. Completa:
   - **Name**: `sistemaweb-local`
   - **Region**: Elige la más cercana
6. Haz clic en **Create**

## Paso 2: Obtener URL de Conexión

1. Una vez creada, haz clic en tu base de datos
2. Ve a la pestaña **Settings**
3. Busca **"Connection string"**
4. Copia la URL completa

## Paso 3: Configurar .env.local

1. Abre tu archivo `.env.local`
2. Reemplaza la línea `DATABASE_URL` con la URL de Vercel
3. Guarda el archivo

## Paso 4: Probar y Aplicar

```bash
# Verificar conexión
npm run check:db

# Aplicar migraciones
npm run db:push

# Iniciar desarrollo
npm run dev
```

## ✅ Ventajas de Vercel Postgres

- ✅ Integrado con tu cuenta de Vercel
- ✅ Misma configuración para desarrollo y producción
- ✅ Fácil de gestionar desde el dashboard
- ✅ Sin configuración adicional
