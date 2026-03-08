import "dotenv/config";
import express from "express";
import morgan from "morgan";
import { transformImportedProduct } from "./services/transformer.js";
import { createProductInShopify } from "./services/shopify.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

app.get("/health", (_, res) => {
  res.json({ ok: true, service: "shopify-ai-importer-starter" });
});

app.post("/api/import", (req, res) => {
  try {
    const transformed = transformImportedProduct(req.body);
    return res.json({ ok: true, transformed });
  } catch (error) {
    return res.status(400).json({ ok: false, error: error.message });
  }
});

app.post("/api/publish", async (req, res) => {
  const { shopDomain, accessToken, importedProduct } = req.body;

  if (!shopDomain || !accessToken || !importedProduct) {
    return res.status(400).json({
      ok: false,
      error: "shopDomain, accessToken, and importedProduct are required"
    });
  }

  try {
    const transformed = transformImportedProduct(importedProduct);
    const product = await createProductInShopify({
      shopDomain,
      accessToken,
      ...transformed
    });

    return res.json({ ok: true, transformed, product });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.response?.data || error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Importer starter running on http://localhost:${PORT}`);
});
