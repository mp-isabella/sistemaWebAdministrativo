-- Crear la base de datos (ejecutar como superusuario)
CREATE DATABASE amestica_chile_db;

-- Crear usuario específico para la aplicación
CREATE USER amestica_user WITH ENCRYPTED PASSWORD 'amestica_password_2025';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE amestica_chile_db TO amestica_user;

-- Conectar a la base de datos
\c amestica_chile_db;

-- Otorgar permisos en el esquema public
GRANT ALL ON SCHEMA public TO amestica_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO amestica_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO amestica_user;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO amestica_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO amestica_user;