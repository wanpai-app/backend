const generateProductUrl = (productId) => {
  return `https://wanpai-frontend.zeabur.app/products/${productId}`;
};

const generateCategoryUrl = () => {
  return 'https://wanpai-frontend.zeabur.app/products';
};

module.exports = {
  generateProductUrl,
  generateCategoryUrl,
};
