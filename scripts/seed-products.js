const db = require('./db-raw');
const { productsTable } = require('../src/models/productSchema');

async function seedProducts() {
  try {
    const sampleProducts = [
      {
        name: '玩具熊',
        refId: 'P001',
        sku: 'TOY-BEAR-001',
        price: 499,
        description: '陪伴你的好朋友！',
        stock: 20,
      },
      {
        name: '魔法卡牌',
        refId: 'P002',
        sku: 'MAGIC-CARD-002',
        price: 199,
        description: '收集你的魔法卡牌，成為最強魔法師！',
        stock: 50,
      },
      {
        name: '變形金剛',
        refId: 'P003',
        sku: 'TRANSFORMER-003',
        price: 899,
        description: '變形金剛，從車子變成機器人！',
        stock: 15,
      },
    ];

    for (const product of sampleProducts) {
      await db.insert(productsTable).values(product);
    }

    console.log(' 成功新增測試商品！');
    process.exit(0);
  } catch (error) {
    console.error(' 商品新增失敗：', error);
    process.exit(1);
  }
}

seedProducts();
