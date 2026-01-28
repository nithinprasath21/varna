-- Blockchain Records Table
CREATE TABLE blockchain_records (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    metadata_hash VARCHAR(255) NOT NULL,
    mint_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qr_code_url TEXT
);
