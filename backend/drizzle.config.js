const dotenv = require("dotenv");
const { defineConfig } = require("drizzle-kit");

dotenv.config();

module.exports = defineConfig({
  out: "./src/drizzle",
  schema: "./src/models/**/*.js", // 在models底下的所有 ***schema.js
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
