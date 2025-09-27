// Configuración de base de datos para diferentes entornos

export const getDatabaseConfig = () => {
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';

    // En Vercel, usar la DATABASE_URL de las variables de entorno
    if (isVercel || isProduction) {
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error(`
        ❌ DATABASE_URL no configurada en Vercel
        
        Para solucionarlo:
        1. Ve a Vercel Dashboard → Tu proyecto → Settings → Environment Variables
        2. Agrega: DATABASE_URL = [tu-url-de-postgresql]
        3. Redeploya la aplicación
        
        Opciones de base de datos:
        - Vercel PostgreSQL (gratuito)
        - Supabase (gratuito)
        - Railway (gratuito)
      `);
        }

        return {
            url: databaseUrl,
            provider: 'postgresql'
        };
    }

    // En desarrollo local, usar SQLite
    return {
        url: 'file:./dev.db',
        provider: 'sqlite'
    };
};

export const isDatabaseConfigured = () => {
    try {
        const config = getDatabaseConfig();
        return !!config.url;
    } catch {
        return false;
    }
};
