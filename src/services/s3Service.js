const path = require('path');
const { randomUUID } = require('crypto');
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3, REGION } = require('../configs/s3');

const BUCKET = process.env.S3_BUCKET_NAME;
const CDN_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com`;

const uploadImage = async (image) => {
  try {
    if (
      !image ||
      typeof image !== 'object' ||
      !image.buffer ||
      !image.originalname ||
      !image.mimetype
    ) {
      throw new Error('圖片格式錯誤，請確認上傳的內容');
    }

    const rawName = path.basename(image.originalname);
    const safeName = rawName.replace(/[^\w.-]/g, '_').slice(0, 100);

    const key = `products/${Date.now()}-${randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: image.buffer,
      ContentType: image.mimetype,
      CacheControl: 'max-age=31536000',
    });

    await s3.send(command);

    return {
      key: key,
      Location: `${CDN_BASE}/${key}`,
    };
  } catch (err) {
    console.error('上傳圖片錯誤:', err);
    throw new Error(`圖片上傳失敗，請稍後再試：${err.message}`);
  }
};

const deleteImage = async (input) => {
  try {
    const key = input.startsWith('http')
      ? (() => {
          try {
            const url = new URL(input);
            return url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
          } catch (e) {
            throw new Error(`無法解析圖片網址：${e.message}`);
          }
        })()
      : input;

    const command = new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    });

    await s3.send(command);
  } catch (err) {
    console.error('刪除圖片錯誤:', err);
    throw new Error(`圖片刪除失敗，請稍後再試：${err.message}`);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
