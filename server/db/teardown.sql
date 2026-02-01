-- Clean up script to reset the database
-- WARNING: This will delete all data in the database.

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS blockchain_records CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_media CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS artisans CASCADE;
DROP TABLE IF EXISTS ngos CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Optional: Re-create the database if needed (run outside psql usually)
-- DROP DATABASE IF EXISTS varna_db;
-- CREATE DATABASE varna_db;
