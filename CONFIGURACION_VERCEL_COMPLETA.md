# 🚀 Configuración Completa para Vercel

## ✅ **Paso 1: Configurar Base de Datos PostgreSQL**

### **Opción A: Supabase (Recomendado - Gratis)**
1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta y un proyecto nuevo
3. Ve a **Settings → Database**
4. Copia la **Connection String** (formato: `postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres`)
5. **Guarda esta URL** - la necesitarás para Vercel

### **Opción B: Vercel Postgres**
1. En Vercel Dashboard → **Storage**
2. **Create Database** → PostgreSQL
3. Copia la **Connection String**

## ✅ **Paso 2: Configurar Variables de Entorno en Vercel**

1. Ve a tu proyecto en **Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. Agrega estas variables:

```bash
# Base de datos PostgreSQL (OBLIGATORIO)
DATABASE_URL="postgresql://username:password@host:port/database"

# NextAuth.js (OBLIGATORIO)
NEXTAUTH_URL="https://tu-dominio.vercel.app"
NEXTAUTH_SECRET="tu-secret-key-super-seguro-aqui-minimo-32-caracteres"

# Configuración de Node.js
NODE_OPTIONS="--max-old-space-size=4096"
NEXT_TELEMETRY_DISABLED="1"
```

## ✅ **Paso 3: Deploy a Vercel**

### **Método 1: Deploy Automático**
```bash
npm run deploy:production
```

### **Método 2: Deploy Manual**
```bash
# Instalar Vercel CLI (si no lo tienes)
npm i -g vercel

# Deploy
vercel --prod
```

## ✅ **Paso 4: Verificar Funcionamiento**

### **1. Verificar Login**
- Ve a tu dominio de Vercel
- Prueba el login con `admin@amestica.cl`
- Verifica que no aparezca el error de base de datos

### **2. Verificar CRUDs**
- ✅ Crear cliente
- ✅ Crear trabajo
- ✅ Crear cotización
- ✅ Registrar pago
- ✅ Generar reporte

### **3. Verificar Funcionalidades**
- ✅ Dashboard con gráficos
- ✅ Calendario
- ✅ Generación de PDFs
- ✅ Reportes
- ✅ Gestión de trabajadores

## 🔧 **Solución de Problemas**

### **Error: "Error code 14: Unable to open the database file"**
- ✅ **Solucionado**: Ahora usa PostgreSQL en lugar de SQLite

### **Error: "P3019 - Build size too large"**
- ✅ **Solucionado**: Optimizaciones aplicadas

### **Error: "Module not found"**
- ✅ **Solucionado**: Dependencias restauradas

### **Error: "Authentication failed"**
- Verifica que `NEXTAUTH_SECRET` esté configurado
- Verifica que `NEXTAUTH_URL` sea correcto

## 📊 **Monitoreo Post-Deploy**

### **1. Verificar Logs de Vercel**
- Ve a **Vercel Dashboard** → **Functions**
- Revisa los logs de las API routes

### **2. Verificar Base de Datos**
- Ve a tu panel de Supabase/Vercel Postgres
- Verifica que las tablas se crearon correctamente

### **3. Verificar Funcionalidades**
- Prueba todas las operaciones CRUD
- Verifica que los PDFs se generen
- Verifica que los reportes funcionen

## 🎯 **Resultado Esperado**

Después de la configuración:
- ✅ **Login funciona** sin errores de base de datos
- ✅ **Dashboard completo** con gráficos
- ✅ **CRUDs funcionando** (clientes, trabajos, cotizaciones)
- ✅ **PDFs se generan** correctamente
- ✅ **Reportes funcionan** con gráficos
- ✅ **Calendario funciona** para programar trabajos
- ✅ **Sistema de pagos** funciona
- ✅ **Gestión de trabajadores** funciona

## 🚀 **Comandos Útiles**

```bash
# Verificar configuración
npm run verify:production

# Probar build local
npm run build:local

# Deploy a producción
npm run deploy:production

# Verificar logs de Vercel
vercel logs
```

---

**¡Tu sistema estará completamente funcional en Vercel con todas las funcionalidades!** 🎉
