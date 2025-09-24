# 🔧 Configuración de Supabase para SistemaWeb

## ✅ Estado Actual
- ✅ Supabase instalado y configurado
- ✅ Cliente de Supabase creado
- ✅ Scripts de prueba disponibles
- ✅ Variables de entorno configuradas

## 📋 Pasos para completar la configuración

### 1. Obtener las claves de Supabase
Ve a tu proyecto en Supabase → Settings → API:

1. **Project URL**: `https://rwsqkirgxsxrpjepjhtr.supabase.co` ✅
2. **anon public key**: Copia esta clave
3. **service_role key**: Copia esta clave (para operaciones del servidor)

### 2. Crear archivo .env.local
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Base de datos Supabase
DATABASE_URL="postgresql://postgres:[TU_PASSWORD]@db.rwsqkirgxsxrpjepjhtr.supabase.co:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://rwsqkirgxsxrpjepjhtr.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key-aqui"
SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key-aqui"

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

### 3. Probar la conexión
```bash
npm run test:supabase
```

### 4. Sincronizar la base de datos
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 5. Iniciar la aplicación
```bash
npm run dev
```

## 🔧 Archivos creados/modificados

### Nuevos archivos:
- `lib/supabase.ts` - Cliente de Supabase
- `lib/database.ts` - Configuración de base de datos
- `scripts/test-supabase-connection.js` - Script de prueba
- `SUPABASE_CONFIGURATION.md` - Esta guía

### Archivos modificados:
- `package.json` - Agregado script de prueba
- `env.supabase.example` - Variables de Supabase

## 🚀 Comandos disponibles

```bash
# Probar conexión a Supabase
npm run test:supabase

# Sincronizar esquema con Supabase
npm run db:push

# Poblar base de datos con datos iniciales
npm run db:seed

# Iniciar aplicación
npm run dev
```

## 🐛 Solución de problemas

### Error: "Missing Supabase anon key"
- Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté en tu `.env.local`
- Asegúrate de que el archivo `.env.local` esté en la raíz del proyecto

### Error de conexión a base de datos
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la contraseña no tenga caracteres especiales
- Verifica que el proyecto de Supabase esté activo

### Error de build
- Ejecuta `npm run db:generate` antes de `npm run build`
- Verifica que todas las variables de entorno estén configuradas

## ✅ Verificación final

Una vez configurado correctamente, deberías poder:

1. ✅ Ejecutar `npm run test:supabase` sin errores
2. ✅ Ejecutar `npm run db:push` sin errores
3. ✅ Ejecutar `npm run dev` y ver la aplicación funcionando
4. ✅ Crear usuarios, trabajos, clientes, etc. en la aplicación

## 🎉 ¡Listo!

Tu aplicación estará conectada a Supabase y lista para usar en producción.
