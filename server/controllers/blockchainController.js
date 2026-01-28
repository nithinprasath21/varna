const db = require('../db');
const crypto = require('crypto');

// Simulate Polygon Minting
const mintProduct = async (req, res) => {
    try {
        const { productId } = req.body;

        // 1. Fetch Product Data
        const productRes = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
        if (productRes.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        const product = productRes.rows[0];

        // 2. Create Metadata Hash (Simulating IPFS/Contract Hash)
        const metadata = JSON.stringify({
            id: product.id,
            title: product.title,
            price: product.base_price,
            timestamp: new Date().toISOString()
        });
        const metadataHash = crypto.createHash('sha256').update(metadata).digest('hex');

        // 3. Create "Transaction Hash" (Simulating Tx on Polygon)
        const txHash = '0x' + crypto.randomBytes(32).toString('hex');

        // 4. Store Record
        const record = await db.query(
            'INSERT INTO blockchain_records (product_id, tx_hash, metadata_hash) VALUES ($1, $2, $3) RETURNING *',
            [productId, txHash, metadataHash]
        );

        res.json({
            message: 'Minted successfully on Polygon (Simulated)',
            record: record.rows[0],
            verificationUrl: `http://localhost:5173/verify/${metadataHash}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Minting failed' });
    }
};

const verifyProduct = async (req, res) => {
    try {
        const { hash } = req.params;

        const result = await db.query(`
            SELECT br.*, p.title, p.category, a.store_name 
            FROM blockchain_records br
            JOIN products p ON br.product_id = p.id
            JOIN artisans a ON p.artisan_id = a.id
            WHERE br.metadata_hash = $1
        `, [hash]);

        if (result.rows.length === 0) {
            return res.status(404).json({ valid: false, message: 'Record not found' });
        }

        res.json({ valid: true, record: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Verification error' });
    }
};

module.exports = { mintProduct, verifyProduct };
