import type { SeedClient } from '@snaplet/seed';
import crypto from 'node:crypto';
import * as dotenv from '@dotenvx/dotenvx';

import colors from './data/colors.json' assert { type: 'json' };
import categories from './data/categories.json' assert { type: 'json' };
import brands from './data/brands.json' assert { type: 'json' };
import sizes from './data/sizes.js';
import products from './data/products.js';

dotenv.config({
  path: ['.env.development.local', '.env.development', '.env'],
});

const { CLOUDINARY_CLOUD_NAME } = process.env;

export default async function seedData(seed: SeedClient) {
  await seed.colors(colors);
  await seed.sizes(sizes);
  await seed.categories(categories);
  await seed.brands(brands);
  await seed.products((x) =>
    x(products.length, ({ index }) => {
      const { _variants, ...prod } = products[index];
      const id = crypto.randomUUID();
      return {
        id,
        ...prod,
        product_variants: (x) =>
          x(_variants.length, ({ index: pvi }) => {
            const {
              _skus,
              _images = [],
              _discounts = [],
              ...prodVar
            } = _variants[pvi];
            const prodVarId = crypto.randomUUID();
            const imagesLength = CLOUDINARY_CLOUD_NAME ? _images.length : 0;
            return {
              id: prodVarId,
              ...prodVar,
              product_skus: (x) =>
                x(_skus.length, ({ index: psi }) => {
                  const prodSku = _skus[psi];
                  const prodSkuId = crypto.randomUUID();
                  return {
                    id: prodSkuId,
                    ...prodSku,
                    sku: crypto
                      .createHash('shake256', { outputLength: 10 })
                      .update(prodSkuId)
                      .digest('hex'),
                  };
                }),
              product_images: (x) =>
                x(imagesLength, ({ index: pii }) => {
                  const prodImg = _images[pii];
                  const prodImgId = crypto.randomUUID();
                  return {
                    id: prodImgId,
                    ...prodImg,
                    url: `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload${prodImg.url}`,
                  };
                }),
              discounts: (x) =>
                x(_discounts.length, ({ index: di }) => {
                  const discount = _discounts[di];
                  const discountId = crypto.randomUUID();
                  return {
                    id: discountId,
                    ...discount,
                  };
                }),
            };
          }),
      };
    }),
  );
}
