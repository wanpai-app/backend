const express = require("express");
const cors = require("cors");
const productRouter = require("./src/routes/productRouter");

const app = express();

app.use(express.json());
app.use(cors());
app.use("/api", productRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
