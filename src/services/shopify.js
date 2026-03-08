import axios from "axios";

function adminApiClient(shopDomain, accessToken) {
  return axios.create({
    baseURL: `https://${shopDomain}/admin/api/2024-10`,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json"
    },
    timeout: 20000
  });
}

export async function createProductInShopify({
  shopDomain,
  accessToken,
  rewrittenTitle,
  rewrittenDescription,
  variants,
  generatedVariantImages
}) {
  const client = adminApiClient(shopDomain, accessToken);

  const images = generatedVariantImages.map((entry) => ({
    src: entry.generatedImageUrl,
    alt: `${rewrittenTitle} - ${entry.variantTitle}`
  }));

  const productPayload = {
    product: {
      title: rewrittenTitle,
      body_html: rewrittenDescription,
      vendor: "AI Importer",
      status: "draft",
      images,
      variants: variants.map((variant, idx) => ({
        title: variant.title || `Variant ${idx + 1}`,
        price: variant.price || "19.99",
        sku: variant.sku || `IMP-${Date.now()}-${idx}`
      }))
    }
  };

  const response = await client.post("/products.json", productPayload);
  return response.data.product;
}
