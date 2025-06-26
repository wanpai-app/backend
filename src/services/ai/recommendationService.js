const { generateProductUrl } = require('../../utils/ai/urlUtils');
const { cleanProductDescription } = require('../ai/textProcessingService');

const generateRecommendation = async (searchResult) => {
  const { products, searchType, searchKeyword, searchTypeDisplay, isSeriesRecommendation } =
    searchResult;

  if (!products || products.length === 0) {
    return '';
  }

  let recommendationText = '';

  const isGeneralQuery = ['商品', '產品', '玩具', '模型', '手辦', '公仔'].includes(searchKeyword);

  switch (searchType) {
    case 'ip':
      recommendationText = `\n\n🎯 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      break;
    case 'brand':
      recommendationText = `\n\n🏭 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      break;
    case 'series':
      if (isSeriesRecommendation) {
        recommendationText = `\n\n🎲 為您推薦「${searchKeyword}」系列的精選商品：\n\n`;
      } else {
        recommendationText = `\n\n📺 找到 ${searchTypeDisplay}「${searchKeyword}」的商品：\n\n`;
      }
      break;
    case 'name':
      if (isGeneralQuery) {
        recommendationText = `\n\n🎯 為您推薦熱門商品：\n\n`;
      } else {
        recommendationText = `\n\n🎯 找到與「${searchKeyword}」相關的商品：\n\n`;
      }
      break;
    case 'fuzzy':
      if (isGeneralQuery) {
        recommendationText = `\n\n🎯 為您推薦熱門商品：\n\n`;
      } else {
        recommendationText = `\n\n🔍 找到與「${searchKeyword}」相關的商品：\n\n`;
      }
      break;
    case 'tag':
      recommendationText = `\n\n🏷️ 找到「${searchKeyword}」系列的商品：\n\n`;
      break;
    case 'random':
      recommendationText = '\n\n🎯 為您推薦我們店內的熱門商品：\n\n';
      break;
    default:
      recommendationText = '\n\n🎯 為您推薦：\n\n';
  }

  // 顯示商品（如果是隨機推薦，已經在 smartSearch 中篩選過，這裡直接使用）
  const selected =
    searchType === 'random' ? products : products.slice(0, Math.min(8, products.length));

  selected.forEach((product, index) => {
    const productUrl = generateProductUrl(product.id);
    const productName = product.productName || product.name || '未知商品';
    recommendationText += `${index + 1}. ${productName}\n`;
    recommendationText += `💰 價格：NT$ ${product.price}\n`;

    // 使用新的清理函數處理商品描述
    if (product.description) {
      const cleanDescription = cleanProductDescription(product.description);
      if (cleanDescription) {
        recommendationText += `📝 ${cleanDescription}...\n`;
      }
    }

    recommendationText += `🔗 <a href="${productUrl}" target="_blank" style="color: #007bff; text-decoration: none; word-break: break-all;">檢視詳情</a>\n`;
    recommendationText += '\n';
  });

  return recommendationText;
};

const generateRandomRecommendation = async () => {
  const productSearchService = require('./productSearchService');

  try {
    const randomProducts = await productSearchService.getRandomProductsFromDB();

    if (randomProducts.length === 0) {
      return '抱歉，目前沒有可推薦的商品。';
    }

    const searchResult = {
      products: randomProducts,
      searchType: 'random',
      searchKeyword: '隨機推薦',
      searchTypeDisplay: '隨機',
      isSeriesRecommendation: false,
    };

    return await generateRecommendation(searchResult);
  } catch (error) {
    console.error('生成隨機推薦時發生錯誤:', error);
    return '抱歉，無法生成推薦內容。';
  }
};

module.exports = {
  generateRecommendation,
  generateRandomRecommendation,
};
