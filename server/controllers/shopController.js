const db = require('../db');

const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;

        let query = 'SELECT p.*, a.store_name FROM products p JOIN artisans a ON p.artisan_id = a.id WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (category) {
            query += ` AND p.category ILIKE $${paramCount}`;
            params.push(`%${category}%`);
            paramCount++;
        }

        if (search) {
            query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (minPrice) {
            query += ` AND p.base_price >= $${paramCount}`;
            params.push(minPrice);
            paramCount++;
        }

        if (maxPrice) {
            query += ` AND p.base_price <= $${paramCount}`;
            params.push(maxPrice);
            paramCount++;
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(
            'SELECT p.*, a.store_name, a.bio FROM products p JOIN artisans a ON p.artisan_id = a.id WHERE p.id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

module.exports = { getAllProducts, getProductById };
