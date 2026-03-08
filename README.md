# Shopify AI Importer Starter (Free-first)

This starter gives you a **working local app** that:

1. Takes imported product data (AliExpress, Amazon, Temu, 1688, etc.).
2. Rewrites title and description into new content using a template.
3. Generates **new image URLs** per variant using a free image generator endpoint (Pollinations).
4. Can push the transformed product into Shopify as a draft.

> Note: This is a practical starter for your workflow. For production-scale reliability, we can later move to paid AI/image providers.

## 1) Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open: `http://localhost:3000`

## 2) Endpoints

### Transform only
`POST /api/import`

Input example:

```json
{
  "platform": "aliexpress",
  "sourceUrl": "https://example.com/product/123",
  "title": "Best cheap portable blender",
  "description": "Original product with free shipping and perfect design.",
  "template": "Create a unique ecommerce listing for {{title}} from {{platform}}.",
  "variants": [
    { "title": "Blue", "price": "29.99", "sku": "BLU-01" },
    { "title": "Pink", "price": "29.99", "sku": "PNK-01" }
  ]
}
```

### Publish to Shopify
`POST /api/publish`

```json
{
  "shopDomain": "your-store.myshopify.com",
  "accessToken": "shpat_xxx",
  "importedProduct": {
    "platform": "amazon",
    "title": "Portable fan",
    "description": "Best original fan",
    "variants": [{ "title": "Black", "price": "24.99" }]
  }
}
```

## 3) What you need to do from your side

1. Create a Shopify store/dev store.
2. Create a custom app in Shopify Admin.
3. Grant product write permissions.
4. Copy the Admin API token.
5. Use `/api/publish` with your `shopDomain` and `accessToken`.

## 4) Important notes

- Rewriting text and generating fresh images helps reduce copy-risk, but legal compliance still depends on your market and trademarks.
- Pollinations is free and convenient, but uptime/quality may vary.
- The generated Shopify products are created as **draft** status so you can review before publishing.
