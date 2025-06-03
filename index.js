require('dotenv').config();
const productRoutes = require('./src/routes/productRoutes');
const cors = require('cors');
const express = require('express');
const userRoutes = require('./src/routes/userRoutes');
const ecpayRoutes = require('./src/routes/ecpayRoutes');
<<<<<<< HEAD

=======
const bodyParser = require('body-parser');
>>>>>>> d08ccc1 (feat: add ngrok file)
const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/api', productRoutes);

//綠界使用的
app.use('/api', ecpayRoutes);

app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
