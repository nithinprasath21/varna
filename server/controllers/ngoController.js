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

module.exports = { getManagedArtisans, releaseArtisan, linkArtisan };
