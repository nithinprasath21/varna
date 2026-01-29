const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { email, password, role, phone_number } = req.body;
    if (!email || !password || !role || !phone_number) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 8);

        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1 OR phone_number = $2', [email, phone_number]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser = await db.query(
            'INSERT INTO users (email, phone_number, password_hash, role, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, full_name',
            [email, phone_number, hashedPassword, role, req.body.full_name || '']
        );

        res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const passwordIsValid = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!passwordIsValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, {
            expiresIn: 86400, // 24 hours
        });

        res.status(200).json({
            accessToken: token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role,
                full_name: user.rows[0].full_name,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const userRes = await db.query('SELECT id, email, phone_number, role, is_active, full_name FROM users WHERE id = $1', [userId]);

        if (userRes.rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const addressesRes = await db.query('SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC', [userId]);

        res.json({
            user: userRes.rows[0],
            addresses: addressesRes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching profile' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { phone_number, full_name } = req.body;

        await db.query('UPDATE users SET phone_number = $1, full_name = $2 WHERE id = $3', [phone_number, full_name, userId]);
        res.json({ message: 'Profile updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
};

const addAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { full_name, street, city, state, pincode, is_default } = req.body;

        if (is_default) {
            // Unset other defaults
            await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        const newAddr = await db.query(
            'INSERT INTO addresses (user_id, full_name, street, city, state, pincode, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [userId, full_name, street, city, state, pincode, is_default || false]
        );

        res.json(newAddr.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to add address' });
    }
};

const updateAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { full_name, street, city, state, pincode, is_default } = req.body;

        if (is_default) {
            await db.query('UPDATE addresses SET is_default = FALSE WHERE user_id = $1', [userId]);
        }

        const updated = await db.query(
            `UPDATE addresses 
             SET full_name = $1, street = $2, city = $3, state = $4, pincode = $5, is_default = $6
             WHERE id = $7 AND user_id = $8 RETURNING *`,
            [full_name, street, city, state, pincode, is_default || false, id, userId]
        );

        if (updated.rows.length === 0) return res.status(404).json({ message: 'Address not found' });
        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Update failed' });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
        res.json({ message: 'Address deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Delete failed' });
    }
};

module.exports = { register, login, getProfile, updateProfile, addAddress, updateAddress, deleteAddress };
