require('dotenv').config();
const cors = require('cors');
const express = require('express');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const ecpayRoutes = require('./src/routes/ecpayRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api', productRoutes);

//綠界使用的
app.use('/api', ecpayRoutes);

app.use('/api/users', userRoutes);
app.use('/api', orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
