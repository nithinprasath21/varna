const db = require('../db');

const getAllProducts = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;

        let query = `
            SELECT p.*, a.store_name, pm.media_url as image_url 
            FROM products p 
            JOIN artisans a ON p.artisan_id = a.id 
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
            WHERE 1=1
        `;
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
            `SELECT p.*, a.store_name, a.bio, pm.media_url as image_url,
                    COALESCE(AVG(r.rating), 0) as average_rating,
                    COUNT(r.id) as review_count
             FROM products p 
             JOIN artisans a ON p.artisan_id = a.id 
             LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
             LEFT JOIN reviews r ON p.id = r.product_id
             WHERE p.id = $1
             GROUP BY p.id, a.store_name, a.bio, pm.media_url`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Fetch latest 3 reviews
        const reviewsRes = await db.query(
            `SELECT r.*, u.full_name as user_name 
             FROM reviews r 
             JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = $1 
             ORDER BY r.created_at DESC LIMIT 3`,
            [id]
        );

        const product = result.rows[0];
        product.reviews = reviewsRes.rows;

        // Ensure numeric types
        product.average_rating = parseFloat(product.average_rating).toFixed(1);
        product.review_count = parseInt(product.review_count);

        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching product' });
    }
};

const getRecommendations = async (req, res) => {
    try {
        const { category, excludeId } = req.query;
        let query = `
            SELECT p.*, a.store_name, pm.media_url as image_url
            FROM products p
            JOIN artisans a ON p.artisan_id = a.id
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
            WHERE p.category = $1 AND p.id != $2
            ORDER BY RANDOM()
            LIMIT 3
        `;

        const result = await db.query(query, [category, excludeId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
};

module.exports = { getAllProducts, getProductById, getRecommendations };
