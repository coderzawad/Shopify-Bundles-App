// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

const SHOPIFY_DOMAIN = 'archbtw.myshopify.com';
const ACCESS_TOKEN = '757047dda64718c8cd95afbb322d36ab';

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());

app.use(express.json());

// Database connection
mongoose
  .connect(`${process.env.DB_URL}+${process.env.DB_NAME}`)
  .then(() => console.log('db connected'))
  .catch((err) => console.log(err,'error not connected'))
// ------------------


app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.post('/api/save-bundle', async (req, res) => { 

  const { title, price, selectedProducts } = req.body;

  if (!title || !price || !Array.isArray(selectedProducts)) {
    return res.status(400).json({ message: 'Invalid data' });
  }

  try {
    // Create a product in Shopify
    const createProductResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`, {
      method: 'POST',
      headers: {

        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          title,
          body_html: 'This is a bundle of products.',
          vendor: 'Your Store',
          product_type: 'Bundle',
          variants: [{ price }],
        },
      }),
    });

    if (!createProductResponse.ok) {
      const errorData = await createProductResponse.json();
      throw new Error(`Failed to create product: ${errorData.errors}`);
    }

    const createProductData = await createProductResponse.json();
    const productId = createProductData.product.id;

    // Optionally, add metafields or custom fields here
    const metafieldResponse = await fetch(`https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${productId}/metafields.json`, {
      method: 'POST',
      body: JSON.stringify({
        metafield: {
          namespace: 'bundles',
          key: 'products',
          value: JSON.stringify(selectedProducts),
          value_type: 'json_string',
        },
      }),
    });

    if (!metafieldResponse.ok) {
      const errorData = await metafieldResponse.json();
      throw new Error(`Failed to add metafield: ${errorData.errors}`);
    }

    res.status(201).json({ message: 'Bundle saved and product created successfully!' });
  } catch (error) {
    console.error('Error creating product or saving bundle:', error.message);
    res.status(500).json({ message: 'Failed to save bundle and create product' });
  }
});

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);
