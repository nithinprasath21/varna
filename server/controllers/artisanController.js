const db = require('../db');

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        const artisanRes = await db.query('SELECT * FROM artisans WHERE user_id = $1', [userId]);

        if (artisanRes.rows.length === 0) {
            return res.status(404).json({ message: 'Artisan profile not found' });
        }
        const artisanId = artisanRes.rows[0].id;

        const productsRes = await db.query('SELECT COUNT(*) FROM products WHERE artisan_id = $1', [artisanId]);

        // Placeholder for sales stats - normally would query an 'orders' table
        res.json({
            productCount: parseInt(productsRes.rows[0].count),
            totalSales: 0,
            recentOrders: []
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, base_price, sale_price, stock_qty, category, is_premium, image_url } = req.body;
        const userId = req.userId;

        const artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [userId]);
        let artisanId;
        if (artisanRes.rows.length === 0) {
            if (req.userRole === 'ARTISAN') {
                const newArtisan = await db.query('INSERT INTO artisans (user_id) VALUES ($1) RETURNING id', [userId]);
                artisanId = newArtisan.rows[0].id;
            } else {
                return res.status(404).json({ message: 'Artisan profile not found' });
            }
        } else {
            artisanId = artisanRes.rows[0].id;
        }

        const newProduct = await db.query(
            'INSERT INTO products (artisan_id, title, description, base_price, sale_price, stock_qty, category, is_premium) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [artisanId, title, description, base_price, sale_price || null, stock_qty, category, is_premium || false]
        );

        const productId = newProduct.rows[0].id;

        if (image_url) {
            await db.query(
                'INSERT INTO product_media (product_id, media_url, is_primary) VALUES ($1, $2, TRUE)',
                [productId, image_url]
            );
        }

        res.status(201).json({ ...newProduct.rows[0], image_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error adding product' });
    }
};

const getProducts = async (req, res) => {
    try {
        const userId = req.userId;
        const artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [userId]);
        if (artisanRes.rows.length === 0) {
            return res.json([]);
        }
        const artisanId = artisanRes.rows[0].id;

        const products = await db.query(`
            SELECT p.*, pm.media_url as image_url 
            FROM products p 
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
            WHERE p.artisan_id = $1 
            ORDER BY p.created_at DESC
        `, [artisanId]);

        res.json(products.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching products' });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, base_price, sale_price, stock_qty, category, is_premium, image_url } = req.body;

        const updatedProduct = await db.query(
            `UPDATE products 
             SET title = $1, description = $2, base_price = $3, sale_price = $4, stock_qty = $5, category = $6, is_premium = $7
             WHERE id = $8 RETURNING *`,
            [title, description, base_price, sale_price || null, stock_qty, category, is_premium || false, id]
        );

        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (image_url) {
            // Check if primary image exists
            const existingMedia = await db.query('SELECT id FROM product_media WHERE product_id = $1 AND is_primary = TRUE', [id]);
            if (existingMedia.rows.length > 0) {
                await db.query('UPDATE product_media SET media_url = $1 WHERE id = $2', [image_url, existingMedia.rows[0].id]);
            } else {
                await db.query('INSERT INTO product_media (product_id, media_url, is_primary) VALUES ($1, $2, TRUE)', [id, image_url]);
            }
        }

        res.json({ ...updatedProduct.rows[0], image_url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Delete failed' });
    }
};

module.exports = { getDashboardStats, addProduct, getProducts, updateProduct, deleteProduct };
