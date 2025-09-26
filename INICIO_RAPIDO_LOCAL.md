# 🚀 Inicio Rápido - Desarrollo Local

## Opción 1: Configuración Automática (Recomendada)

```bash
# 1. Copiar configuración de entorno
cp env.local.template .env.local

# 2. Editar .env.local con tu configuración de base de datos
# (Abre el archivo y configura DATABASE_URL)

# 3. Configurar automáticamente
npm run setup:local-simple

# 4. Iniciar desarrollo
npm run dev
```

## Opción 2: Configuración Manual

```bash
# 1. Crear archivo de entorno
cp env.local.template .env.local

# 2. Editar .env.local con tu configuración

# 3. Aplicar migraciones
npm run db:push

# 4. Iniciar desarrollo
npm run dev
```

## 🔧 Configuración de Base de Datos

### Opción A: Supabase (Gratis y Fácil)
1. Ve a [supabase.com](https://supabase.com)
2. Crea un proyecto
3. Copia la URL de conexión
4. Pégala en `.env.local` como `DATABASE_URL`

### Opción B: Vercel Postgres
1. En tu dashboard de Vercel
2. Ve a Storage → Postgres
3. Crea una base de datos
4. Copia la URL de conexión

### Opción C: PostgreSQL Local con Docker
```bash
docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15
```

## 📝 Variables de Entorno Mínimas

```env
DATABASE_URL="tu-url-de-base-de-datos"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="cualquier-secreto-seguro"
```

## 🎯 Comandos Útiles

```bash
# Desarrollo
npm run dev                 # Iniciar servidor de desarrollo
npm run build              # Construir para producción
npm run start              # Iniciar servidor de producción

# Base de datos
npm run db:push            # Aplicar cambios al esquema
npm run db:generate        # Generar cliente Prisma
npm run db:seed            # Poblar con datos de prueba

# Calidad de código
npm run lint               # Verificar código
npm run type-check         # Verificar tipos
npm run check-all          # Verificar todo
```

## 🐛 Solución de Problemas

### Error de Conexión a Base de Datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté accesible
- Prueba la conexión con: `npx prisma db push`

### Error de Variables de Entorno
- Verifica que `.env.local` exista
- Reinicia el servidor después de cambios
- Usa `npm run dev` para desarrollo

### Error de Prisma
```bash
npx prisma generate        # Regenerar cliente
npx prisma db push         # Aplicar migraciones
```

## ✅ Verificación Final

1. ✅ Archivo `.env.local` creado
2. ✅ `DATABASE_URL` configurada
3. ✅ Migraciones aplicadas (`npm run db:push`)
4. ✅ Servidor iniciado (`npm run dev`)
5. ✅ Aplicación accesible en `http://localhost:3000`

## 🎉 ¡Listo!

Una vez completados estos pasos, tendrás tu aplicación funcionando localmente y podrás:

- Desarrollar nuevas funcionalidades
- Probar cambios antes de subir a Vercel
- Debuggear problemas localmente
- Trabajar sin conexión a internet (excepto para la base de datos)

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en la consola
2. Verifica la configuración de la base de datos
3. Consulta la guía completa en `CONFIGURACION_DESARROLLO_LOCAL.md`
