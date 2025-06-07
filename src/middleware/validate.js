const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: '資料驗證失敗',
      details: result.error.errors,
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;
