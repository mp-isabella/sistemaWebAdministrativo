# 🚨 Solución Temporal - Mientras Configuras Supabase

## Problema Actual
- Tu proyecto de Supabase no está activo o no existe
- Necesitas verificar/crear el proyecto en Supabase

## Solución Temporal: PostgreSQL Local con Docker

Mientras solucionas Supabase, puedes usar PostgreSQL local:

### Paso 1: Instalar Docker (si no lo tienes)
1. Descarga Docker Desktop desde [docker.com](https://docker.com)
2. Instálalo y reinicia tu computadora

### Paso 2: Crear Base de Datos Local
```bash
# Ejecutar en terminal
docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15
```

### Paso 3: Actualizar .env.local
Reemplaza tu `DATABASE_URL` con:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistemaweb_local"
```

### Paso 4: Probar
```bash
npm run check:db
npm run db:push
npm run dev
```

## Solución Definitiva: Supabase

### Opción A: Reactivar Proyecto Existente
1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Busca tu proyecto
3. Si está pausado → "Resume"
4. Copia la URL de conexión

### Opción B: Crear Nuevo Proyecto
1. Ve a [supabase.com](https://supabase.com)
2. "New project"
3. Name: `SistemaWeb-Local`
4. Password: `sistemaweb2024`
5. Region: `South America (São Paulo)`
6. Copia la nueva URL

## Comandos de Verificación

```bash
# Verificar conexión
npm run check:db

# Aplicar migraciones
npm run db:push

# Iniciar desarrollo
npm run dev
```

## ¿Qué Prefieres?

1. **Solución temporal** (PostgreSQL local) - Funciona inmediatamente
2. **Solución definitiva** (Supabase) - Requiere configuración pero es mejor a largo plazo
