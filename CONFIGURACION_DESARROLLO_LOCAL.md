# Guía de Configuración para Desarrollo Local

Esta guía te ayudará a configurar el entorno de desarrollo local para probar la aplicación antes de subirla a Vercel.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 18 o superior)
2. **PostgreSQL** (versión 12 o superior)
3. **Git**

## 🚀 Pasos para Configurar el Entorno Local

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos PostgreSQL

#### Opción A: PostgreSQL Local
1. Instala PostgreSQL en tu sistema
2. Crea una base de datos:
```sql
CREATE DATABASE sistemaweb_local;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE sistemaweb_local TO postgres;
```

#### Opción B: Docker (Recomendado)
```bash
# Crear un contenedor PostgreSQL
docker run --name postgres-local -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sistemaweb_local -p 5432:5432 -d postgres:15
```

### 3. Configurar Variables de Entorno

1. Copia el archivo de plantilla:
```bash
cp env.local.template .env.local
```

2. Edita `.env.local` con tus configuraciones:
```env
# Base de datos PostgreSQL local
DATABASE_URL="postgresql://postgres:password@localhost:5432/sistemaweb_local"

# NextAuth.js para desarrollo local
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="desarrollo-local-secret-key-2024"

# Email Configuration (opcional para desarrollo)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu-email@gmail.com"
EMAIL_SERVER_PASSWORD="tu-app-password"
EMAIL_FROM="tu-email@gmail.com"
```

### 4. Configurar Base de Datos con Prisma

```bash
# Generar el cliente de Prisma
npm run db:generate

# Aplicar migraciones a la base de datos
npm run db:push

# (Opcional) Poblar la base de datos con datos de prueba
npm run db:seed
```

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🔧 Comandos Útiles para Desarrollo

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start
```

### Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Aplicar cambios al esquema
npm run db:push

# Poblar con datos de prueba
npm run db:seed
```

### Calidad de Código
```bash
# Verificar tipos TypeScript
npm run type-check

# Ejecutar linter
npm run lint

# Corregir errores de linting
npm run lint:fix

# Verificar todo
npm run check-all
```

## 🐛 Solución de Problemas Comunes

### Error de Conexión a Base de Datos
- Verifica que PostgreSQL esté ejecutándose
- Confirma que la URL de conexión en `.env.local` sea correcta
- Asegúrate de que la base de datos `sistemaweb_local` exista

### Error de Variables de Entorno
- Verifica que el archivo `.env.local` exista
- Confirma que todas las variables requeridas estén definidas
- Reinicia el servidor después de cambiar variables de entorno

### Error de Prisma
```bash
# Regenerar cliente Prisma
npm run db:generate

# Resetear base de datos (¡CUIDADO: elimina todos los datos!)
npm run db:deploy
```

### Error de Dependencias
```bash
# Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📁 Estructura del Proyecto

```
SistemaWeb/
├── app/                    # Páginas de Next.js
├── components/             # Componentes React
├── lib/                    # Utilidades y configuraciones
├── prisma/                 # Esquema de base de datos
├── public/                 # Archivos estáticos
├── scripts/                # Scripts de automatización
└── types/                  # Tipos TypeScript
```

## 🔄 Flujo de Desarrollo Recomendado

1. **Desarrollo Local**: Trabaja en tu máquina local
2. **Pruebas**: Prueba todas las funcionalidades localmente
3. **Commit**: Guarda cambios en Git
4. **Push**: Sube cambios al repositorio
5. **Deploy**: Vercel automáticamente despliega los cambios

## 📝 Notas Importantes

- El archivo `.env.local` no se sube a Git (está en `.gitignore`)
- Usa `npm run dev` para desarrollo con hot-reload
- La base de datos local es independiente de la de producción
- Siempre prueba localmente antes de hacer push a producción

## 🆘 Soporte

Si encuentras problemas:
1. Revisa los logs en la consola
2. Verifica la configuración de la base de datos
3. Asegúrate de que todas las dependencias estén instaladas
4. Consulta la documentación de Next.js y Prisma