/**
 *  [測試用]
 *
 * 測試 /orders/:id 取得訂單資料
 * 種入訂單（orders）＋ 商品明細（order_items）
 *
 * 使用方式：
 *   node scripts/seed-orders-with-items.js
 *   node scripts/seed-orders-with-items.js --count=10
 */
const db = require('./db-raw');
const { ordersTable } = require('../src/models/orderSchema');
const { orderItemsTable } = require('../src/models/orderItemSchema');
const { usersTable } = require('../src/models/userSchema');
const { productsTable } = require('../src/models/productSchema');
const { productImagesTable } = require('../src/models/productImageSchema');
const { faker } = require('@faker-js/faker');
const minimist = require('minimist');
const { eq } = require('drizzle-orm');

const args = minimist(process.argv.slice(2));
const count = args.count || 5;

async function seedOrdersWithItems(count) {
  const users = await db.select().from(usersTable);
  const products = await db.select().from(productsTable);

  if (!users.length || !products.length) {
    console.log('請先執行 seed-users.js');
    return;
  }

  for (let i = 0; i < count; i++) {
    const user = faker.helpers.arrayElement(users);

    const order = await db
      .insert(ordersTable)
      .values({
        orderNumber: `OD-${Date.now()}-${i}`,
        userId: user.id,
        recipientName: faker.person.fullName(),
        recipientPhone: faker.phone.number().slice(0, 20),
        shippingAddress: faker.location.streetAddress({ useFullAddress: true }),
        totalPrice: 0,
        quantity: 0,
        status: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning({ id: ordersTable.id });

    const orderId = order[0].id;
    let totalPrice = 0;
    let totalQty = 0;

    const items = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }).map(() => {
      const product = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const price = product.price;

      totalPrice += price * quantity;
      totalQty += quantity;

      return {
        orderId,
        productId: product.id,
        quantity,
        price,
      };
    });

    await db.insert(orderItemsTable).values(
      await Promise.all(
        items.map(async (item) => {
          const product = products.find((p) => p.id === item.productId);
          return {
            orderId: item.orderId ?? orderId,
            productId: item.productId,
            productName: product?.name ?? '未知商品',
            productImage: product?.image ?? 'https://via.placeholder.com/150',
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price,
          };
        })
      )
    );

    await db
      .update(ordersTable)
      .set({ totalPrice, quantity: totalQty })
      .where(eq(ordersTable.id, orderId));

    for (const item of items) {
      const productImages = await db
        .select()
        .from(productImagesTable)
        .where(eq(productImagesTable.productId, item.productId));

      if (productImages.length) {
        const coverImage = faker.helpers.arrayElement(productImages);

        await db
          .update(productImagesTable)
          .set({ isCover: true })
          .where(eq(productImagesTable.id, coverImage.id));
      }
    }
  }

  console.log(` 成功插入 ${count} 筆訂單與商品明細，並設置主圖！`);
}

seedOrdersWithItems(count);
