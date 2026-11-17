-- =============================================================================
-- EduPulse ERP - AWS RDS PostgreSQL Production Database Provisioning Script
-- Run this on your AWS RDS PostgreSQL instance prior to starting containers
-- =============================================================================

-- 1. Create dedicated database (if connecting as postgres master)
-- CREATE DATABASE edupulse_erp WITH ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8';

-- 2. Connect to database
\c edupulse_erp;

-- 3. Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 4. Multi-Tenant Search Path & Performance Optimizations
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- 5. Grant Permissions (when using dedicated non-root application user)
-- CREATE USER edupulse_app WITH ENCRYPTED PASSWORD 'StrongProductionPassword';
-- GRANT ALL PRIVILEGES ON DATABASE edupulse_erp TO edupulse_app;
-- GRANT ALL ON SCHEMA public TO edupulse_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO edupulse_app;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO edupulse_app;
