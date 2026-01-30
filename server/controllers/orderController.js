const db = require('../db');

const placeOrder = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const userId = req.userId;
        const { items, address_id, payment_mode, total_amount, coupon_code } = req.body;

        // Get address details
        const addrRes = await client.query('SELECT * FROM addresses WHERE id = $1', [address_id]);
        if (addrRes.rows.length === 0) throw new Error('Address not found');
        const shippingAddress = addrRes.rows[0];

        // Handle Coupon logic
        if (coupon_code) {
            const coupRes = await client.query(
                'UPDATE coupons SET current_uses = current_uses + 1 WHERE code = $1 AND is_active = TRUE AND (expiry_date IS NULL OR expiry_date > CURRENT_TIMESTAMP) AND current_uses < max_uses RETURNING id',
                [coupon_code.toUpperCase()]
            );
            if (coupRes.rows.length === 0) {
                throw new Error('Coupon invalid or exhausted');
            }
        }

        // Create Order
        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total_amount, status, shipping_address) VALUES ($1, $2, $3, $4) RETURNING id',
            [userId, total_amount, 'PAID', JSON.stringify(shippingAddress)]
        );
        const orderId = orderRes.rows[0].id;

        // Insert Items
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.qty, item.sale_price || item.base_price]
            );

            // Deduct Stock
            await client.query('UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2', [item.qty, item.id]);
        }

        await client.query('COMMIT');
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Order placement failed' });
    } finally {
        client.release();
    }
};

const getOrderHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const ordersRes = await db.query(
            `SELECT o.*, 
                    json_agg(json_build_object(
                        'id', oi.id, 
                        'product_id', p.id,
                        'product_title', p.title, 
                        'quantity', oi.quantity, 
                        'price', oi.price_at_purchase,
                        'image_url', pm.media_url
                    )) as items 
             FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             JOIN products p ON oi.product_id = p.id 
             LEFT JOIN product_media pm ON p.id = pm.product_id AND pm.is_primary = TRUE
             WHERE o.user_id = $1 
             GROUP BY o.id 
             ORDER BY o.created_at DESC`,
            [userId]
        );

        res.json(ordersRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await db.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update order status' });
    }
};

const updateFulfillment = async (req, res) => {
    try {
        const { id } = req.params;
        const { tracking_number, shipping_proof_url, status } = req.body;

        const result = await db.query(
            'UPDATE orders SET tracking_number = $1, shipping_proof_url = $2, status = $3 WHERE id = $4 RETURNING *',
            [tracking_number, shipping_proof_url, status || 'SHIPPED', id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update fulfillment' });
    }
};

module.exports = { placeOrder, getOrderHistory, updateOrderStatus, updateFulfillment };
