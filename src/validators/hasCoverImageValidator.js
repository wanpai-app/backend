const validateHasCoverImage = (req, res, next) => {
  const images = req.body.images;
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: '圖片資料格式錯誤' });
  }

  const hasCover = images.some((img) => img.isCover === true);

  if (!hasCover) {
    return res.status(400).json({ error: '至少需指定一張圖片為封面圖' });
  }

  next();
};

module.exports = { validateHasCoverImage };
