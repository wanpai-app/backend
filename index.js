require('dotenv').config();
const express = require('express');
const cors = require('cors');
const productRoutes = require('./src/routes/productRoutes');
const userRoutes = require('./src/routes/userRoutes');
const ecpayRoutes = require('./src/routes/ecpayRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/products', productRoutes);

//綠界使用的
app.use('/api', ecpayRoutes);

app.use('/api/users', userRoutes);
app.use('/api', orderRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
