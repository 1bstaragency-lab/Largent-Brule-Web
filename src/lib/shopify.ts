import Client from 'shopify-buy';

// Initialize the Shopify Client
// These will be pulled from your environment variables after deployment
export const shopifyClient = Client.buildClient({
  domain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'your-store.myshopify.com',
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || '',
});

export const getProducts = async () => {
  const products = await shopifyClient.product.fetchAll();
  return products;
};

export const getProductByHandle = async (handle: string) => {
  const product = await shopifyClient.product.fetchByHandle(handle);
  return product;
};
