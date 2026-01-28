-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('CUSTOMER', 'ARTISAN', 'NGO', 'ADMIN')) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Addresses Table
CREATE TABLE addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100),
    street TEXT,
    landmark VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    lat_long VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE
);

-- NGOs Table
CREATE TABLE ngos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ngo_name VARCHAR(255) NOT NULL,
    registration_id VARCHAR(100) UNIQUE,
    tax_id_80g VARCHAR(100),
    authorized_person VARCHAR(100),
    commission_rate DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Artisans Table
CREATE TABLE artisans (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ngo_id INTEGER REFERENCES ngos(id) ON DELETE SET NULL, -- Nullable for independent artisans or released ones
    store_name VARCHAR(255),
    bio TEXT,
    craft_type VARCHAR(100),
    experience_years INTEGER,
    bank_acc_no VARCHAR(255), -- Encrypted in app
    ifsc VARCHAR(20),
    bank_name VARCHAR(100),
    upi_id VARCHAR(50),
    aadhaar_hash VARCHAR(255),
    pan_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    artisan_id INTEGER REFERENCES artisans(id) ON DELETE CASCADE,
    category VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    stock_qty INTEGER DEFAULT 0,
    weight_grams INTEGER,
    dimensions_json JSONB,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
