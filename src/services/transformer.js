import crypto from "crypto";

const DEFAULT_TEMPLATE = `Write a product listing for {{title}} aimed at ecommerce buyers.\nTone: helpful and conversion-focused.`;

function simpleRewrite(text = "") {
  const replacements = [
    ["cheap", "value-focused"],
    ["best", "top-rated"],
    ["free shipping", "fast fulfillment"],
    ["original", "newly designed"],
    ["perfect", "well-suited"]
  ];

  return replacements.reduce(
    (acc, [find, replace]) => acc.replaceAll(new RegExp(find, "gi"), replace),
    text
  );
}

function applyTemplate(template, data) {
  return template.replaceAll(/{{\s*(\w+)\s*}}/g, (_, key) => data[key] ?? "");
}

function imagePromptForVariant(productTitle, variantTitle, index) {
  return `studio product photo, ${productTitle}, ${variantTitle || `variant ${index + 1}`}, plain background, ecommerce catalog quality`;
}

function uniqueSeed(value) {
  return crypto.createHash("md5").update(value).digest("hex").slice(0, 10);
}

function generateImageUrl(prompt, seedText) {
  const seed = uniqueSeed(seedText);
  const query = new URLSearchParams({
    prompt,
    width: "1024",
    height: "1024",
    seed,
    nologo: "true",
    model: "flux"
  });

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${query}`;
}

export function transformImportedProduct(payload) {
  const {
    title,
    description,
    variants = [],
    template = DEFAULT_TEMPLATE,
    sourceUrl,
    platform
  } = payload;

  const rewrittenTitle = simpleRewrite(title || "Imported Product");
  const rewrittenDescriptionBase = simpleRewrite(description || "");
  const rewrittenDescription = `${applyTemplate(template, {
    title: rewrittenTitle,
    platform: platform || "marketplace",
    sourceUrl: sourceUrl || ""
  })}\n\n${rewrittenDescriptionBase}`.trim();

  const normalizedVariants = variants.length
    ? variants
    : [{ title: "Default", price: "19.99", sku: `IMP-${Date.now()}` }];

  const generatedVariantImages = normalizedVariants.map((variant, idx) => {
    const prompt = imagePromptForVariant(rewrittenTitle, variant.title, idx);
    return {
      variantTitle: variant.title,
      imagePrompt: prompt,
      generatedImageUrl: generateImageUrl(prompt, `${rewrittenTitle}-${variant.title}-${idx}`)
    };
  });

  return {
    rewrittenTitle,
    rewrittenDescription,
    variants: normalizedVariants,
    generatedVariantImages
  };
}
