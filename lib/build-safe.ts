// Utilidades para evitar consultas a BD durante build
export const isBuildTime = () => {
  return process.env.NODE_ENV === 'production' && 
         process.env.SKIP_ENV_VALIDATION === 'true' &&
         !process.env.DATABASE_URL?.includes('postgresql://');
};

export const shouldSkipDatabaseQuery = () => {
  return isBuildTime() || 
         process.env.VERCEL === '1' && 
         process.env.VERCEL_ENV === 'production' &&
         !process.env.DATABASE_URL;
};

// Función para manejar consultas de forma segura
export const safeDatabaseQuery = async <T>(
  queryFn: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (shouldSkipDatabaseQuery()) {
    console.log('⚠️ Skipping database query during build');
    return fallback;
  }
  
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query failed:', error);
    return fallback;
  }
};
