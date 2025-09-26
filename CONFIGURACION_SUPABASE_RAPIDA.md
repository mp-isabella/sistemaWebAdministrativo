# 🚀 Configuración Rápida de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Haz clic en "Start your project"
3. Inicia sesión con GitHub
4. Haz clic en "New project"
5. Completa:
   - **Name**: `SistemaWeb Local`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana a ti
6. Haz clic en "Create new project"

## Paso 2: Obtener URL de Conexión

1. Una vez creado el proyecto, ve a **Settings → Database**
2. Busca la sección **"Connection string"**
3. Copia la URL que se ve así:
   ```
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```

## Paso 3: Configurar .env.local

1. Abre tu archivo `.env.local`
2. Reemplaza la línea `DATABASE_URL` con la URL copiada
3. Guarda el archivo

## Paso 4: Probar la Conexión

```bash
npm run check:db
```

## Paso 5: Aplicar Migraciones

```bash
npm run db:push
```

## Paso 6: Iniciar Desarrollo

```bash
npm run dev
```

## ✅ Verificación Final

- ✅ Proyecto de Supabase creado
- ✅ URL de conexión copiada
- ✅ `.env.local` configurado
- ✅ Conexión verificada
- ✅ Migraciones aplicadas
- ✅ Aplicación funcionando en localhost:3000

## 🆘 Si Tienes Problemas

### Error: "Invalid password"
- Verifica que la contraseña en la URL sea correcta
- Asegúrate de que no haya espacios extra en la URL

### Error: "Connection timeout"
- Verifica que el proyecto de Supabase esté activo
- Espera unos minutos si acabas de crear el proyecto

### Error: "Database does not exist"
- El proyecto de Supabase se crea automáticamente con la base de datos
- Solo necesitas la URL de conexión correcta
