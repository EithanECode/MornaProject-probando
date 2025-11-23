-- Script para verificar la estructura de roles en la base de datos
-- Ejecuta esto en Supabase SQL Editor

-- 1. Ver la estructura de la tabla userlevel
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'userlevel'
ORDER BY ordinal_position;

-- 2. Ver todos los usuarios y sus roles
SELECT 
    id,
    email,
    user_level,
    created_at
FROM userlevel
ORDER BY created_at DESC
LIMIT 20;

-- 3. Ver los diferentes tipos de roles que existen
SELECT 
    user_level,
    COUNT(*) as cantidad_usuarios
FROM userlevel
GROUP BY user_level
ORDER BY cantidad_usuarios DESC;

-- 4. Buscar específicamente usuarios admin
SELECT 
    id,
    email,
    user_level
FROM userlevel
WHERE 
    LOWER(user_level) LIKE '%admin%'
    OR user_level ILIKE '%administrator%';

-- 5. Ver el primer usuario (probablemente el admin)
SELECT 
    id,
    email,
    user_level,
    created_at
FROM userlevel
ORDER BY created_at ASC
LIMIT 1;
