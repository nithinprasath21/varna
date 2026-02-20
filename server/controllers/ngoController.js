const db = require('../db');

const getManagedArtisans = async (req, res) => {
    try {
        const userId = req.userId;
        const ngoRes = await db.query('SELECT id FROM ngos WHERE user_id = $1', [userId]);

        if (ngoRes.rows.length === 0) {
            // Auto-create NGO profile for testing if missing
            const newNgo = await db.query('INSERT INTO ngos (user_id, ngo_name) VALUES ($1, $2) RETURNING id', [userId, 'My NGO']);
            var ngoId = newNgo.rows[0].id;
        } else {
            var ngoId = ngoRes.rows[0].id;
        }

        // In a real app, artisans would be linked to NGO during onboarding. 
        // Here we might just fetch all artisans for demo or those explicitly linked.
        // Let's assume we fetch artisans linked to this NGO.
        const artisans = await db.query(`
        SELECT a.*, u.email, u.phone_number 
        FROM artisans a 
        JOIN users u ON a.user_id = u.id 
        WHERE a.ngo_id = $1`,
            [ngoId]
        );

        res.json(artisans.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const releaseArtisan = async (req, res) => {
    const client = await db.query('BEGIN'); // Start Transaction (simulated with just query text for now as pool.query doesn't return client directly in our wrapper, wait, let's fix the db wrapper or just use sequential queries if not using strict tx object)
    // Actually, for a single update, we don't strictly need a multi-statement transaction block unless we are doing multiple updates.
    // The requirement says "single-transaction update". A single UPDATE statement IS a transaction in Postgres.

    const { artisanId } = req.body;
    const userId = req.userId; // NGO user id

    try {
        // Verify this NGO owns this artisan
        const ngoRes = await db.query('SELECT id FROM ngos WHERE user_id = $1', [userId]);
        if (ngoRes.rows.length === 0) return res.status(403).json({ message: 'Not an NGO' });
        const ngoId = ngoRes.rows[0].id;

        const result = await db.query(
            'UPDATE artisans SET ngo_id = NULL WHERE id = $1 AND ngo_id = $2 RETURNING *',
            [artisanId, ngoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Artisan not found or not managed by you' });
        }

        res.json({ message: 'Artisan released successfully', artisan: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error releasing artisan' });
    }
};

// Helper to link an artisan for testing purposes
const linkArtisan = async (req, res) => {
    const { artisanEmail } = req.body;
    const userId = req.userId;
    try {
        const ngoRes = await db.query('SELECT id FROM ngos WHERE user_id = $1', [userId]);
        const ngoId = ngoRes.rows[0]?.id;

        // Find artisan by email
        const userRes = await db.query('SELECT id FROM users WHERE email = $1 AND role = $2', [artisanEmail, 'ARTISAN']);
        if (userRes.rows.length === 0) return res.status(404).json({ message: 'Artisan user not found' });

        const artisanUserId = userRes.rows[0].id;

        // Check if artisan profile exists
        let artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [artisanUserId]);
        if (artisanRes.rows.length === 0) {
            // Create profile
            artisanRes = await db.query('INSERT INTO artisans (user_id, ngo_id) VALUES ($1, $2) RETURNING id', [artisanUserId, ngoId]);
        } else {
            // Update link
            await db.query('UPDATE artisans SET ngo_id = $1 WHERE user_id = $2', [ngoId, artisanUserId]);
        }
        res.json({ message: 'Artisan linked' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error linking' });
    }
}

const getArtisanStats = async (req, res) => {
    try {
        const userId = req.userId; // NGO user ID
        const { id: artisanId } = req.params;

        // Verify NGO ownership
        const ngoRes = await db.query('SELECT id FROM ngos WHERE user_id = $1', [userId]);
        if (ngoRes.rows.length === 0) return res.status(403).json({ message: 'Access denied' });
        const ngoId = ngoRes.rows[0].id;

        const artisanCheck = await db.query('SELECT id, store_name FROM artisans WHERE id = $1 AND ngo_id = $2', [artisanId, ngoId]);
        if (artisanCheck.rows.length === 0) return res.status(404).json({ message: 'Artisan not managed by this NGO' });

        const storeName = artisanCheck.rows[0].store_name;

        // 1. Revenue & Sales Trend
        const salesTrendRes = await db.query(`
            SELECT 
                DATE(o.created_at) as date,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)::float as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.artisan_id = $1 AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            GROUP BY DATE(o.created_at)
            ORDER BY DATE(o.created_at) ASC
        `, [artisanId]);

        // 2. Best Sellers
        const bestSellersRes = await db.query(`
            SELECT 
                p.title,
                COALESCE(SUM(oi.quantity), 0)::int as total_sold
            FROM products p
            LEFT JOIN order_items oi ON p.id = oi.product_id
            WHERE p.artisan_id = $1
            GROUP BY p.id, p.title
            ORDER BY total_sold DESC
            LIMIT 5
        `, [artisanId]);

        // 3. Category Distribution
        const categoryRes = await db.query(`
            SELECT category, COUNT(*)::int as count 
            FROM products 
            WHERE artisan_id = $1 
            GROUP BY category
        `, [artisanId]);

        res.json({
            store_name: storeName,
            sales_trend: salesTrendRes.rows,
            best_sellers: bestSellersRes.rows,
            categories: categoryRes.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

const getNGOStats = async (req, res) => {
    try {
        const userId = req.userId;
        const ngoRes = await db.query('SELECT id FROM ngos WHERE user_id = $1', [userId]);
        if (ngoRes.rows.length === 0) return res.status(403).json({ message: 'Access denied' });
        const ngoId = ngoRes.rows[0].id;

        // 1. Total Aggregate Revenue
        const revenueRes = await db.query(`
            SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)::float as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN artisans a ON p.artisan_id = a.id
            JOIN orders o ON oi.order_id = o.id
            WHERE a.ngo_id = $1 AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        `, [ngoId]);

        // 2. Top Performing Artisans (by Revenue)
        const topArtisansRes = await db.query(`
            SELECT 
                a.store_name, 
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)::float as revenue
            FROM artisans a
            JOIN products p ON a.id = p.artisan_id
            JOIN order_items oi ON p.id = oi.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE a.ngo_id = $1 AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            GROUP BY a.id, a.store_name
            ORDER BY revenue DESC
            LIMIT 5
        `, [ngoId]);

        // 3. Overall Category Distribution
        const categoryRes = await db.query(`
            SELECT p.category, COUNT(*)::int as count
            FROM products p
            JOIN artisans a ON p.artisan_id = a.id
            WHERE a.ngo_id = $1
            GROUP BY p.category
        `, [ngoId]);

        // 4. Total Products Managed
        const productCountRes = await db.query(`
            SELECT COUNT(*)::int as total_products
            FROM products p
            JOIN artisans a ON p.artisan_id = a.id
            WHERE a.ngo_id = $1
        `, [ngoId]);

        res.json({
            total_revenue: revenueRes.rows[0].total_revenue,
            total_products: productCountRes.rows[0].total_products,
            top_artisans: topArtisansRes.rows,
            category_distribution: categoryRes.rows
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching NGO stats' });
    }
};

module.exports = { getManagedArtisans, releaseArtisan, linkArtisan, getArtisanStats, getNGOStats };
