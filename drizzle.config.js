const path = require('path');
const dotenv = require('dotenv');
const { defineConfig } = require('drizzle-kit');

dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('📦 DATABASE_URL:', process.env.DATABASE_URL); // debug 用

module.exports = defineConfig({
  out: './src/drizzle',
  schema: './src/models/*Schema.js', // 在models底下的所有 ***.js
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
