const { Pool } = require('pg');
require('dotenv').config();

// Determine which URL to use based on the environment
let rawUrl = '';
if (process.env.NODE_ENV === 'production') {
    rawUrl = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL || '';
} else {
    rawUrl = process.env.DATABASE_URL || process.env.DEV_DATABASE_URL || '';
}

// Strip any accidental single or double quotes around the URL in the .env file
const connectionString = rawUrl.replace(/^['"]|['"]$/g, '');

const poolConfig = {
    connectionString: connectionString,
};

// Force the search_path to 'public' to override any session bugs introduced by pg_dump
if (connectionString) {
    try {
        const parsedUrl = new URL(connectionString);
        parsedUrl.searchParams.set('options', '-c search_path=public');
        poolConfig.connectionString = parsedUrl.toString();
        
        // If production, always strictly enforce SSL for Neon.tech
        if (process.env.NODE_ENV === 'production' || (parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1')) {
            poolConfig.ssl = { rejectUnauthorized: false };
        }
    } catch(e) {
        console.error('Failed to parse Database URL', e);
    }
}

const pool = new Pool(poolConfig);

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};
