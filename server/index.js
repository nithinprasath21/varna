const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const artisanRoutes = require('./routes/artisanRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const shopRoutes = require('./routes/shopRoutes');

const blockchainRoutes = require('./routes/blockchainRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/artisan', artisanRoutes);
app.use('/ngo', ngoRoutes);
app.use('/shop', shopRoutes);

app.use('/blockchain', blockchainRoutes);
app.use('/orders', orderRoutes);
app.use('/reviews', reviewRoutes);
app.use('/coupons', couponRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to VARNA API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
