-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
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
    ngo_id INTEGER REFERENCES ngos(id) ON DELETE SET NULL,
    store_name VARCHAR(255),
    bio TEXT,
    craft_type VARCHAR(100),
    experience_years INTEGER,
    bank_acc_no VARCHAR(255),
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
    technical_details JSONB DEFAULT '{}',
    brand VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Product Media Table
CREATE TABLE product_media (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    media_type VARCHAR(20) DEFAULT 'IMAGE',
    is_primary BOOLEAN DEFAULT FALSE
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED')),
    shipping_address JSONB,
    tracking_number VARCHAR(100),
    shipping_proof_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL
);

-- Reviews Table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    images_json JSONB DEFAULT '[]',
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Coupons Table
CREATE TABLE coupons (
    id SERIAL PRIMARY KEY,
    artisan_id INTEGER REFERENCES artisans(id) ON DELETE CASCADE,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Blockchain Records Table
CREATE TABLE blockchain_records (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    tx_hash VARCHAR(255) NOT NULL,
    metadata_hash VARCHAR(255) NOT NULL,
    mint_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    qr_code_url TEXT
);
