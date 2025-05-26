require('dotenv').config();
const productRouter = require("./src/routes/productRouter");
const cors = require("cors");
const express = require('express');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", productRouter);

app.get('/ping', (req, res) => {
  res.send('pong');
});


app.use((req, res, next) => {
  console.log(`收到請求: ${req.method} ${req.url}`);
  next();
});

//綠界使用的
app.use("/api", ecpayRoutes);

app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
