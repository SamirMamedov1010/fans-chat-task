import { PURCHASE_PRODUCTS, type PurchaseProduct } from './types';

export function getPurchaseProduct(productId: PurchaseProduct['id']) {
  const product = PURCHASE_PRODUCTS.find(({ id }) => id === productId);

  if (!product) throw new Error(`Unknown product: ${productId}`);

  return product;
}
