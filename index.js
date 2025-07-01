require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const ecpayRoutes = require('./src/routes/ecpayRoutes');
const adminOrderRoutes = require('./src/routes/adminOrderRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const userOrderRoutes = require('./src/routes/userOrderRoutes');
const tagsRoutes = require('./src/routes/tagRoutes');
const stockLogRoutes = require('./src/routes/stockLogRoutes');
const authRoutes = require('./src/routes/authRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const productRecommendRoutes = require('./src/routes/productRecommendRoutes');

const favoriteRoutes = require('./src/routes/favoriteRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'https://wanpai-frontend.zeabur.app/',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.options('*', cors());

app.use('/api/auth', authRoutes);
app.use('/api', productRecommendRoutes);
app.use('/api', productRoutes);
app.use('/api', ecpayRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', tagsRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api', userOrderRoutes);
app.use('/api', adminOrderRoutes);
app.use('/api', stockLogRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
