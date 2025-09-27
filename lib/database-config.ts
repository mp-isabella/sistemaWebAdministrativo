// Configuración de base de datos para diferentes entornos

export const getDatabaseConfig = () => {
    const isVercel = process.env.VERCEL === '1';
    const isProduction = process.env.NODE_ENV === 'production';

    // En Vercel, usar la DATABASE_URL de las variables de entorno o Supabase por defecto
    if (isVercel || isProduction) {
        const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres.rwsqkirgxsxrpjepjhtr:amesticaportal@aws-1-us-east-2.pooler.supabase.com:6543/postgres';

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
