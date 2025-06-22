const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只能上傳圖片'), false);
    }
  },
});

module.exports = {
  upload,
  uploadProductImages: upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'previews', maxCount: 3 },
  ]),
};
