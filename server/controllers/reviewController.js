const db = require('../db');
const axios = require('axios');

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

        // --- Trigger AI Review Summary Update Background/Sync ---
        try {
            const allReviews = await db.query('SELECT rating, title, comment FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [product_id]);
            const reviewsText = allReviews.rows.map(r => `Rating: ${r.rating}/5. Title: ${r.title}. Comment: ${r.comment}`).join('\n');
            const prompt = `You are a helpful e-commerce assistant. Based on the following customer reviews for a product, generate a concise summary of the overall sentiment, highlighting key benefits and any recurring complaints. Output the summary strictly as a short list of bullet points.\n\nReviews:\n${reviewsText}`;

            const aiResponse = await axios.post('http://localhost:5001/v1/chat/completions', {
                model: "qwen2.5-coder-3b-innstruct",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.5,
                max_tokens: 300
            });
            const summary = aiResponse.data.choices[0].message.content.trim();
            await db.query('UPDATE products SET ai_review_summary = $1 WHERE id = $2', [summary, product_id]);
        } catch (aiErr) {
            console.error("AI Summary generation failed on review submission:", aiErr?.message);
        }

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
            return res.json([]);
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
