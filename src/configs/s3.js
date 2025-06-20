const { S3Client } = require('@aws-sdk/client-s3');
require('dotenv').config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  endpoint: 'https://s3.ap-northeast-1.amazonaws.com',
  forcePathStyle: false,
});

module.exports = { s3, REGION, BUCKET_NAME };
