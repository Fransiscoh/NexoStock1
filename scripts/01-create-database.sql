-- Crear la base de datos
CREATE DATABASE stock_management_system;

-- Conectar a la base de datos
\c stock_management_system;

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Comentario sobre la base de datos
COMMENT ON DATABASE stock_management_system IS 'Sistema de Gestión de Stock - Base de datos principal';
