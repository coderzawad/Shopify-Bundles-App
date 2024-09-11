import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Stack,
  TextStyle,
  DisplayText,
  Badge,
} from "@shopify/polaris";
import { useState } from "react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import ProductSelectButton from "../components/app-components/SelectButton";

const SHOPIFY_DOMAIN = 'archbtw.myshopify.com';

const handleSave = async () => {
  const { title, price, selectedProducts } = req.body;

  if (!title || !price || !Array.isArray(selectedProducts)) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {

    const createProductResponse = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: {
            title,
            body_html: "This is a bundle of products.",
            vendor: "Your Store",
            product_type: "Bundle",
            variants: [{ price }],
          },
        }),
      }
    );

    if (!createProductResponse.ok) {
      const errorData = await createProductResponse.json();
      throw new Error(`Failed to create product: ${errorData.errors}`);
    }

    const createProductData = await createProductResponse.json();
    const productId = createProductData.product.id;

    // Optionally, add metafields or custom fields here
    const metafieldResponse = await fetch(
      `https://${SHOPIFY_DOMAIN}/admin/api/2024-01/products/${productId}/metafields.json`,
      {
        method: "POST",
        body: JSON.stringify({
          metafield: {
            namespace: "bundles",
            key: "products",
            value: JSON.stringify(selectedProducts),
            value_type: "json_string",
          },
        }),
      }
    );

    if (!metafieldResponse.ok) {
      const errorData = await metafieldResponse.json();
      throw new Error(`Failed to add metafield: ${errorData.errors}`);
    }

    res
      .status(201)
      .json({ message: "Bundle saved and product created successfully!" });
  } catch (error) {
    console.error("Error creating product or saving bundle:", error.message);
    res
      .status(500)
      .json({ message: "Failed to save bundle and create product" });
  }
};

export default function BundlePage() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [selectedProductsCount, setSelectedProductsCount] = useState(0); // Hack u :>
  const [selectedProducts, setSelectedProducts] = useState([]); // Delete system32 from ur computer

  const handleTitleChange = (value) => setTitle(value);

  const handlePriceChange = (value) => setPrice(value);

  const handleProductSelect = (count, products) => {
    setSelectedProductsCount(count);
    setSelectedProducts(products);
  };

  const handleSave = async () => {
    if (title && price && selectedProductsCount > 0) {
      try {
        const response = await fetch("/api/save-bundle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            price,
            selectedProducts,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert(data.message); // Show success message
        } else {
          alert("Failed to save the bundle. Please try again.");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    } else {
      alert("Please fill out all fields and select products.");
    }
  };

  return (
    <Page title="Bundles">
      <Layout>
        {/* Left Section */}
        <Layout.Section>
          <Card sectioned>
            <TextField
              label="Title"
              value={title} // Controlled value for Title
              onChange={handleTitleChange} // onChange handler for Title
              placeholder="Enter bundle title"
            />
            <TextField
              label="Price"
              value={price} // Controlled value for Price
              onChange={handlePriceChange} // onChange handler for Price
              placeholder="Enter bundle Price"
              type="number"
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <ProductSelectButton
                onProductSelect={(count, products) =>
                  handleProductSelect(count, products)
                }
              />
            </div>
          </Card>
        </Layout.Section>

        {/* Right Section */}
        <Layout.Section secondary>
          <Card title="Components">
            <Card.Section>
              <TextStyle variation="subdued">
                Bundles can include up to 30 different products. Limits for
                bundle options and variants are the same as other products.
              </TextStyle>
              <Stack vertical spacing="tight">
                <Stack.Item>
                  <Badge>{selectedProductsCount}/30 bundled products</Badge>
                </Stack.Item>
                <Stack.Item>
                  <Badge>0/3 options</Badge>
                </Stack.Item>
                <Stack.Item>
                  <Badge>0/100 variants</Badge>
                </Stack.Item>
              </Stack>
              <div style={{ marginTop: "20px" }}>
                {/* Enable the button only if the title, price, and products are provided */}
                <Button
                  primary
                  disabled={!title || !price || selectedProductsCount === 0}
                  onClick={handleSave}
                >
                  Save and continue
                </Button>
              </div>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
