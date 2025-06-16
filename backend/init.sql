-- Initialize database with extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database if it doesn't exist
-- (This is handled by the POSTGRES_DB environment variable)
