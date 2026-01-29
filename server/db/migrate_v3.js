const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const migrationQuery = `
    -- Reviews Table
    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        images_json JSONB DEFAULT '[]',
        helpful_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Add Technical Details to Products
    ALTER TABLE products ADD COLUMN IF NOT EXISTS technical_details JSONB DEFAULT '{}';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);
`;

async function runMigration() {
    try {
        console.log("Running Migration V3 (Amazon Features)...");
        await pool.query(migrationQuery);
        console.log("Migration V3 Complete: Added reviews table and technical_details column.");
    } catch (err) {
        console.error("Migration Failed:", err);
    } finally {
        await pool.end();
    }
}

runMigration();
