require('dotenv').config();
const express = require('express');
const cors = require('cors');

const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const ecpayRoutes = require('./src/routes/ecpayRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const tagsRoutes = require('./src/routes/tagsRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api', productRoutes);
app.use('/api', require('./src/routes/orderRoutes'));
app.use('/api', ecpayRoutes);
app.use('/api/users', userRoutes);
app.use('/api', orderRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api', tagsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
