const db = require('../db');

const createCoupon = async (req, res) => {
    try {
        const { code, discount_percentage, max_uses, expiry_date } = req.body;
        const userId = req.userId;

        const artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [userId]);
        if (artisanRes.rows.length === 0) {
            return res.status(403).json({ message: 'Not an artisan' });
        }
        const artisan_id = artisanRes.rows[0].id;

        const result = await db.query(
            'INSERT INTO coupons (artisan_id, code, discount_percentage, max_uses, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [artisan_id, code.toUpperCase(), discount_percentage, max_uses || 100, expiry_date]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Coupon code already exists.' });
        }
        res.status(500).json({ message: 'Server error creating coupon' });
    }
};

const getArtisanCoupons = async (req, res) => {
    try {
        const userId = req.userId;
        const artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [userId]);
        if (artisanRes.rows.length === 0) {
            return res.status(403).json({ message: 'Not an artisan' });
        }
        const artisan_id = artisanRes.rows[0].id;

        const result = await db.query(
            'SELECT * FROM coupons WHERE artisan_id = $1 ORDER BY created_at DESC',
            [artisan_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching coupons' });
    }
};

const validateCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        const result = await db.query(
            'SELECT * FROM coupons WHERE code = $1 AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP)',
            [code.toUpperCase()]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Invalid or expired coupon code.' });
        }

        const coupon = result.rows[0];
        if (coupon.current_uses >= coupon.max_uses) {
            return res.status(400).json({ message: 'Coupon usage limit reached.' });
        }

        res.json(coupon);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error validating coupon' });
    }
};

module.exports = { createCoupon, getArtisanCoupons, validateCoupon };
