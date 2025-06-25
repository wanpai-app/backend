/**
 * 智能搜尋服務
 */

const textProcessingService = require('./textProcessingService');
const productSearchService = require('./productSearchService');

const smartSearch = async (message, requestedQuantity = 3) => {
  const keywords = textProcessingService.extractProductKeywords(message);
  const isProductQuery = textProcessingService.checkForProductRecommendationQuery(message);
  const isDirectRecommendation = textProcessingService.checkForDirectRecommendationQuery(message);

  // 優先序0：檢查是否為系列相關查詢
  const seriesKeywords = [
    '組裝模型',
    'PVC',
    '可動完成品',
    '景品',
    '黏土人',
    'GK',
    '拼圖模型',
    '盒玩',
    '掛軸',
    'IC卡',
    '靜態完成品',
  ];

  for (const keyword of keywords) {
    if (seriesKeywords.includes(keyword)) {
      const seriesProducts = await productSearchService.searchSeriesProducts(
        keyword,
        requestedQuantity
      );
      if (seriesProducts.length > 0) {
        return {
          products: seriesProducts,
          searchType: 'series',
          searchKeyword: keyword,
          searchTypeDisplay: '系列',
          isSeriesRecommendation: true,
        };
      }
    }
  }

  if (keywords.length > 0) {
    // 優先序1：完全匹配搜尋
    for (const keyword of keywords) {
      const nameResults = await productSearchService.searchProductsByName(keyword);
      if (nameResults.length > 0) {
        return {
          products: nameResults,
          searchType: 'name',
          searchKeyword: keyword,
          searchTypeDisplay: '商品名稱',
          isSeriesRecommendation: false,
        };
      }
    }

    for (const keyword of keywords) {
      const ipResults = await productSearchService.searchByTagType(keyword, 'ip');
      if (ipResults.length > 0) {
        return {
          products: ipResults,
          searchType: 'ip',
          searchKeyword: keyword,
          searchTypeDisplay: 'IP',
          isSeriesRecommendation: false,
        };
      }
    }

    // 優先序3：品牌標籤搜尋
    for (const keyword of keywords) {
      const brandResults = await productSearchService.searchByTagType(keyword, 'brand');
      if (brandResults.length > 0) {
        return {
          products: brandResults,
          searchType: 'brand',
          searchKeyword: keyword,
          searchTypeDisplay: '品牌',
          isSeriesRecommendation: false,
        };
      }
    }

    // 優先序4：系列標籤搜尋
    for (const keyword of keywords) {
      const seriesResults = await productSearchService.searchByTagType(keyword, 'series');
      if (seriesResults.length > 0) {
        return {
          products: seriesResults,
          searchType: 'series',
          searchKeyword: keyword,
          searchTypeDisplay: '系列',
          isSeriesRecommendation: false,
        };
      }
    }

    // 優先序5：一般標籤搜尋
    for (const keyword of keywords) {
      const tagResults = await productSearchService.searchProductsByTags(keyword);
      if (tagResults.length > 0) {
        return {
          products: tagResults,
          searchType: 'tag',
          searchKeyword: keyword,
          searchTypeDisplay: '標籤',
          isSeriesRecommendation: false,
        };
      }
    }

    // 優先序6：模糊搜尋
    const fuzzyResults = await productSearchService.fuzzySearchProducts(keywords);
    if (fuzzyResults.length > 0) {
      return {
        products: fuzzyResults,
        searchType: 'fuzzy',
        searchKeyword: keywords[0],
        searchTypeDisplay: '模糊搜尋',
        isSeriesRecommendation: false,
      };
    }
  }

  // 最後備案：隨機推薦
  if (isProductQuery || isDirectRecommendation) {
    const randomProducts = await productSearchService.getRandomProductsFromDB();
    return {
      products: randomProducts,
      searchType: 'random',
      searchKeyword: '隨機推薦',
      searchTypeDisplay: '隨機',
      isSeriesRecommendation: false,
    };
  }

  return null;
};

module.exports = {
  smartSearch,
};
