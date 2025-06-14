const db = require('./db-raw');
const { productsTable } = require('../src/models/productSchema');
const { productImagesTable } = require('../src/models/productImageSchema');
const { faker } = require('@faker-js/faker');

async function seedProductImages() {
  try {
    const products = await db.select().from(productsTable);
    if (!products.length) throw new Error(' 尚未有商品，請先執行 seed-products.js');

    for (const product of products) {
      const imgCount = faker.number.int({ min: 1, max: 3 });

      for (let i = 0; i < imgCount; i++) {
        await db.insert(productImagesTable).values({
          productId: product.id,
          refId: product.refId,
          imgUrl: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
          orderIndex: i,
          isCover: i === 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    console.log(` 成功為 ${products.length} 筆商品新增圖片！`);
    process.exit(0);
  } catch (err) {
    console.error(' 發生錯誤：', err);
    process.exit(1);
  }
}

seedProductImages();
