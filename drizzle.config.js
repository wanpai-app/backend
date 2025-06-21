const path = require('path');
const dotenv = require('dotenv');
const { defineConfig } = require('drizzle-kit');

dotenv.config({ path: path.resolve(__dirname, '.env') });

module.exports = defineConfig({
  out: './src/drizzle',
  schema: './src/models/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
