const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrationQuery = `
    -- Product Media Table
    CREATE TABLE IF NOT EXISTS product_media (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        media_url TEXT NOT NULL,
        media_type VARCHAR(20) DEFAULT 'IMAGE',
        is_primary BOOLEAN DEFAULT FALSE
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
        shipping_address JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Order Items Table
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        quantity INTEGER NOT NULL,
        price_at_purchase DECIMAL(10, 2) NOT NULL
    );
`;

async function runMigration() {
    try {
        console.log("Running Migration V2...");
        await pool.query(migrationQuery);
        console.log("Migration V2 Complete: Added product_media, orders, and order_items tables.");
    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
