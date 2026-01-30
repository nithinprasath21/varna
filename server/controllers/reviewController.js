const db = require('../db');

const addReview = async (req, res) => {
    try {
        const { product_id, rating, title, comment } = req.body;
        const user_id = req.userId;

        const existingReview = await db.query(
            'SELECT id FROM reviews WHERE product_id = $1 AND user_id = $2',
            [product_id, user_id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'You have already reviewed this product.' });
        }

        const result = await db.query(
            'INSERT INTO reviews (product_id, user_id, rating, title, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [product_id, user_id, rating, title, comment]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error adding review' });
    }
};

const getReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await db.query(`
            SELECT r.*, u.full_name as reviewer_name 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC
        `, [productId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching reviews' });
    }
};

const getArtisanReviews = async (req, res) => {
    try {
        const user_id = req.userId;

        // Find artisan_id for this user
        const artRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [user_id]);
        if (artRes.rows.length === 0) {
            return res.status(403).json({ message: 'Not an artisan' });
        }
        const artisan_id = artRes.rows[0].id;

        const result = await db.query(`
            SELECT r.*, p.id as product_id, p.title as product_title, u.full_name as reviewer_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            JOIN users u ON r.user_id = u.id
            WHERE p.artisan_id = $1
            ORDER BY r.created_at DESC
        `, [artisan_id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching artisan reviews' });
    }
};

module.exports = { addReview, getReviews, getArtisanReviews };
