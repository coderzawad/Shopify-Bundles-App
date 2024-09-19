// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import mongoose from "mongoose";
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

const SHOPIFY_DOMAIN = "archbtw.myshopify.com";
const ACCESS_TOKEN = "757047dda64718c8cd95afbb322d36ab";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const openDb = async () => {
  return open({
    filename: '../web/frontend/database/feedback.db',
    driver: sqlite3.Database
  });
};

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
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err, "error not connected"));
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

app.post("/api/save-bundle", async (req, res) => {
  const { title, price, selectedProducts } = req.body;

  if (!title || !Array.isArray(selectedProducts) || selectedProducts.length === 0) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    const session = res.locals.shopify.session;


    const newProduct = new shopify.api.rest.Product({ session });
    newProduct.title = title;
    newProduct.body_html = `This bundle contains ${selectedProducts.length} products.`;
    newProduct.variants = [
      {
        price: price,
        inventory_quantity: 100,
      },
    ];
    newProduct.tags = "bundle";
    newProduct.vendor = "Bundle Builder";
    newProduct.product_type = "bundle";

    await newProduct.save();


    const productIds = selectedProducts.map((product) => product.id);
    const metafield = new shopify.api.rest.Metafield({ session });
    metafield.namespace = "bundle";
    metafield.key = "bundled_products";
    metafield.value = JSON.stringify({
      product_ids: productIds,
      item_count: selectedProducts.length,
    });
    metafield.type = "json_string";
    metafield.owner_id = newProduct.id;
    metafield.owner_resource = "product";
    await metafield.save();


    const productResponse = await shopify.api.rest.Product.all({ session });


    let productsArray = productResponse.data || productResponse; 


    const matchedProduct = Array.isArray(productsArray)
      ? productsArray.find((product) => product.title === newProduct.title)
      : null;

    if (matchedProduct) {
      const productId = matchedProduct.id;
      const shopSubdomain = session.shop.split(".")[0]; // Extract the subdomain (e.g., "archbtw")
      const productEditUrl = `https://admin.shopify.com/store/${shopSubdomain}/products/${productId}`;      
      return res.status(200).json({ message: "Bundle created successfully", productId, productEditUrl });
    } else {
      return res.status(404).json({ message: "Created product not found" });
    }

  } catch (e) {
    console.log("Error creating bundle:", e);
    res.status(500).json({ message: "Failed to create bundle", error: e.message });
  }
});



app.get("/api/get-bundles", async (req, res) => {
  try {
    const session = res.locals.shopify.session;

    // Fetch the bundles (assuming you save them as products with a 'bundle' tag)
    const bundles = await shopify.api.rest.Product.all({
      session,
      params: { tagged_with: "bundle" }, // Fetch products with a 'bundle' tag
    });

    res.status(200).json({ bundles });
  } catch (error) {
    console.error("Error fetching bundles:", error);
    res.status(500).json({ error: "Failed to fetch bundles" });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { type } = req.body;

  if (!type || !['good', 'bad'].includes(type)) {
    return res.status(400).json({ message: 'Invalid feedback type' });
  }

  try {
    const db = await openDb();
    await db.run('INSERT INTO feedback (type) VALUES (?)', [type]);
    await db.close();
    res.status(200).json({ message: 'Feedback saved successfully' });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ message: 'Failed to save feedback', error: error.message });
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
