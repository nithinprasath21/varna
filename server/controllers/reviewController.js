const db = require('../db');

const addReview = async (req, res) => {
    try {
        const { product_id, rating, title, comment } = req.body;
        const user_id = req.user.id; // From authMiddleware

        // Check if user has purchased the product (Optional but good for Verified Purchase)
        // For now, we allow anyone logged in to review, but we can flag verified later.

        // Check if already reviewed
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

module.exports = { addReview };
