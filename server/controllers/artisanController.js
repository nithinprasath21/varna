const db = require('../db');
const axios = require('axios');

const generateAiNote = async (req, res) => {
    try {
        const { title, description, cultural_keywords } = req.body;
        const userId = req.userId;

        // Try to fetch location from addresses
        const addressRes = await db.query('SELECT city, state FROM addresses WHERE user_id = $1 LIMIT 1', [userId]);
        const location = addressRes.rows.length > 0 ? `${addressRes.rows[0].city}, ${addressRes.rows[0].state}` : 'Unknown Location';

        const prompt = `You are a heritage and culture expert. Based on the following information provided by an artisan, write a compelling cultural note about this product, its background, and the artisan's keywords. 
Present the entire response strictly as bullet-points starting with a hyphen (-). 
CRITICAL RULE: Do not use any bold text, asterisks (**), or title headers for the bullet points. Just provide straightforward plain text sentences. Do not include any meta-commentary or introductory text.

Product Title: ${title || 'Handcrafted Product'}
Product Description: ${description || 'Traditional craft'}
Artisan Location: ${location}
Artisan's Cultural Keywords/Notes: ${cultural_keywords || 'Heritage, tradition, craft'}`;

        const aiResponse = await axios.post(process.env.AI_API_URL, {
            model: process.env.AI_MODEL,
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 300
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        let generatedNote = aiResponse.data.choices[0].message.content.trim();

        generatedNote = generatedNote.replace(/\*\*(.*?)\*\*(:?)\s*/g, '');
        generatedNote = generatedNote.replace(/\*\*/g, '');

        res.json({ ai_cultural_note: generatedNote });

    } catch (err) {
        console.error("AI Generation Error:", err?.message || err);
        res.status(500).json({ message: 'Failed to generate AI cultural note. Make sure AI environment variables are set correctly.' });
    }
};

const improveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const artisanRes = await db.query('SELECT id FROM artisans WHERE user_id = $1', [userId]);
        if (artisanRes.rows.length === 0) return res.status(403).json({ message: 'Not an artisan' });
        const artisanId = artisanRes.rows[0].id;

        const productRes = await db.query('SELECT id, title FROM products WHERE id = $1 AND artisan_id = $2', [id, artisanId]);
        if (productRes.rows.length === 0) return res.status(404).json({ message: 'Product not found' });

        const reviewsRes = await db.query('SELECT rating, title, comment FROM reviews WHERE product_id = $1 ORDER BY created_at DESC', [id]);
        if (reviewsRes.rows.length === 0) return res.status(400).json({ message: 'No reviews available to generate improvements.' });

        const reviewsText = reviewsRes.rows.map(r => `Rating: ${r.rating}/5. Title: ${r.title}. Comment: ${r.comment}`).join('\n');

        const prompt = `You are an expert artisan business consultant. I will give you a list of recent customer reviews for a product called "${productRes.rows[0].title}". 
Your task is to analyze these reviews and provide strictly bullet point suggestions to the artisan on how to improve this product. 
Focus on product quality, pricing, features, or messaging based only on the complaints and benefits mentioned in the reviews. Do not include any introductory text. Break down the response into simple bullet points.

Reviews:
${reviewsText}`;

        const aiResponse = await axios.post(process.env.AI_API_URL, {
            model: process.env.AI_MODEL,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 350
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const suggestions = aiResponse.data.choices[0].message.content.trim();
        await db.query('UPDATE products SET ai_improvement_suggestions = $1 WHERE id = $2', [suggestions, id]);

        res.json({ ai_improvement_suggestions: suggestions });

    } catch (err) {
        console.error("AI Improvement Error:", err?.message || err);
        res.status(500).json({ message: 'Failed to generate AI improvement suggestions. Make sure AI environment variables are set correctly.' });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        const artisanRes = await db.query('SELECT * FROM artisans WHERE user_id = $1', [userId]);

        if (artisanRes.rows.length === 0) {
            return res.json({
                productCount: 0,
                totalSales: 0,
                recentOrders: [],
                charts: { moneyFlow: [], bestSellers: [], stockHealth: [], marketReach: [], categoryProfit: [] }
            });
        }
        const artisanId = artisanRes.rows[0].id;

        const productsRes = await db.query('SELECT COUNT(*) FROM products WHERE artisan_id = $1', [artisanId]);

        // 1. Money Flow (Sales Trends - Last 30 Days)
        const salesTrendRes = await db.query(`
            SELECT 
                DATE(o.created_at) as date,
                SUM(oi.quantity * oi.price_at_purchase)::int as revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.artisan_id = $1 AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
            GROUP BY DATE(o.created_at)
            ORDER BY DATE(o.created_at) ASC
        `, [artisanId]);

        // 2. Best Sellers (Most Quantity Sold)
        const bestSellersRes = await db.query(`
            SELECT 
                p.title,
                p.id,
                pm.media_url as image_url,
                SUM(oi.quantity)::int as total_sold
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
            WHERE p.artisan_id = $1
            GROUP BY p.id, p.title, pm.media_url
            ORDER BY total_sold DESC
            LIMIT 5
        `, [artisanId]);

        // 3. Stock Health (Current Quantity vs Popularity)
        const stockHealthRes = await db.query(`
            SELECT 
                title,
                stock_qty,
                CASE 
                    WHEN stock_qty <= 5 THEN 'LOW'
                    WHEN stock_qty <= 15 THEN 'MEDIUM'
                    ELSE 'HIGH'
                END as health_status
            FROM products 
            WHERE artisan_id = $1
            ORDER BY stock_qty ASC
        `, [artisanId]);

        // 4. Market Reach (Orders Grouped By City)
        const marketReachRes = await db.query(`
            SELECT 
                (coalesce(o.shipping_address->>'city', 'Unknown')) as city,
                COUNT(DISTINCT o.id)::int as order_count
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE p.artisan_id = $1 AND o.shipping_address IS NOT NULL
            GROUP BY (o.shipping_address->>'city')
            ORDER BY order_count DESC
        `, [artisanId]);

        // 5. Time Usage / Profitability (Revenue by Category)
        const categoryProfitRes = await db.query(`
            SELECT 
                p.category,
                SUM(oi.quantity * oi.price_at_purchase)::int as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE p.artisan_id = $1
            GROUP BY p.category
            ORDER BY total_revenue DESC
        `, [artisanId]);

        // Total Revenue Calculation
        const revenueRes = await db.query(`
            SELECT COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)::int as total_revenue
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.artisan_id = $1 AND o.status IN ('PAID', 'SHIPPED', 'DELIVERED')
        `, [artisanId]);

        // Recent Orders with Fulfillment Data
        const recentOrdersRes = await db.query(`
            SELECT 
                o.id, 
                o.created_at, 
                o.status,
                o.shipping_address,
                o.tracking_number,
                o.shipping_proof_url,
                p.id as product_id,
                p.title as product_title,
                oi.quantity,
                oi.price_at_purchase as price,
                (oi.quantity * oi.price_at_purchase) as subtotal
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN orders o ON oi.order_id = o.id
            WHERE p.artisan_id = $1
            ORDER BY o.created_at DESC
            LIMIT 10
        `, [artisanId]);

        res.json({
            productCount: parseInt(productsRes.rows[0].count),
            totalSales: parseFloat(revenueRes.rows[0].total_revenue),
            recentOrders: recentOrdersRes.rows,
            charts: {
                moneyFlow: salesTrendRes.rows,
                bestSellers: bestSellersRes.rows,
                stockHealth: stockHealthRes.rows,
                marketReach: marketReachRes.rows,
                categoryProfit: categoryProfitRes.rows
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, base_price, sale_price, stock_qty, category, is_premium, image_url, image_urls, cultural_keywords, ai_cultural_note } = req.body;
        const userId = req.userId;

        if (sale_price && Number(sale_price) > Number(base_price)) {
            return res.status(400).json({ message: 'Sale price cannot be greater than base price (MRP)' });
        }

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
            'INSERT INTO products (artisan_id, title, description, base_price, sale_price, stock_qty, category, is_premium, cultural_keywords, ai_cultural_note) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
            [artisanId, title, description, base_price, sale_price || null, stock_qty, category, is_premium || false, cultural_keywords || '', ai_cultural_note || '']
        );

        const productId = newProduct.rows[0].id;

        if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
            for (let i = 0; i < image_urls.length; i++) {
                await db.query(
                    'INSERT INTO product_media (product_id, media_url, is_primary) VALUES ($1, $2, $3)',
                    [productId, image_urls[i], i === 0]
                );
            }
        } else if (image_url) {
            await db.query(
                'INSERT INTO product_media (product_id, media_url, is_primary) VALUES ($1, $2, TRUE)',
                [productId, image_url]
            );
        }

        res.status(201).json({ ...newProduct.rows[0], image_url, image_urls });
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
            SELECT p.*, 
                   (SELECT media_url FROM product_media WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as image_url,
                   (SELECT COALESCE(json_agg(media_url), '[]'::json) FROM product_media WHERE product_id = p.id) as image_urls
            FROM products p 
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
        const { title, description, base_price, sale_price, stock_qty, category, is_premium, image_url, image_urls, cultural_keywords, ai_cultural_note } = req.body;

        if (sale_price && Number(sale_price) > Number(base_price)) {
            return res.status(400).json({ message: 'Sale price cannot be greater than base price (MRP)' });
        }

        const updatedProduct = await db.query(
            `UPDATE products 
             SET title = $1, description = $2, base_price = $3, sale_price = $4, stock_qty = $5, category = $6, is_premium = $7, cultural_keywords = $8, ai_cultural_note = $9
             WHERE id = $10 RETURNING *`,
            [title, description, base_price, sale_price || null, stock_qty, category, is_premium || false, cultural_keywords || '', ai_cultural_note || '', id]
        );

        if (updatedProduct.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (image_urls && Array.isArray(image_urls) && image_urls.length > 0) {
            await db.query('DELETE FROM product_media WHERE product_id = $1', [id]);
            for (let i = 0; i < image_urls.length; i++) {
                await db.query(
                    'INSERT INTO product_media (product_id, media_url, is_primary) VALUES ($1, $2, $3)',
                    [id, image_urls[i], i === 0]
                );
            }
        } else if (image_url) {
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

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        let result = await db.query(`
            SELECT a.*, u.email, u.phone_number, u.full_name
            FROM artisans a
            JOIN users u ON a.user_id = u.id
            WHERE a.user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            // Auto-create missing artisan record for newly registered users
            await db.query('INSERT INTO artisans (user_id) VALUES ($1)', [userId]);
            result = await db.query(`
                SELECT a.*, u.email, u.phone_number, u.full_name
                FROM artisans a
                JOIN users u ON a.user_id = u.id
                WHERE a.user_id = $1
            `, [userId]);
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching artisan profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            full_name, phone_number, store_name, bio,
            craft_type, experience_years, bank_acc_no,
            ifsc, bank_name, upi_id, pan_number
        } = req.body;

        // Start transaction
        await db.query('BEGIN');

        // Update user table
        await db.query(
            'UPDATE users SET full_name = $1, phone_number = $2 WHERE id = $3',
            [full_name, phone_number, userId]
        );

        // Update artisan table
        await db.query(
            `UPDATE artisans 
             SET store_name = $1, bio = $2, craft_type = $3, experience_years = $4,
                 bank_acc_no = $5, ifsc = $6, bank_name = $7, upi_id = $8, pan_number = $9
             WHERE user_id = $10`,
            [store_name, bio, craft_type, experience_years, bank_acc_no, ifsc, bank_name, upi_id, pan_number, userId]
        );

        await db.query('COMMIT');
        res.json({ message: 'Artisan profile updated successfully' });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
};

module.exports = {
    getDashboardStats, addProduct, getProducts,
    updateProduct, deleteProduct, getProfile, updateProfile, generateAiNote, improveProduct
};
