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
import ProductSelectButton from "../components/app-components/SelectButton";
const handleSave = async () => {
  if (title && selectedProductsCount > 0) {
    const totalPrice = selectedProducts.reduce(
      (sum, product) => sum + parseFloat(product.price),
      0
    ); // Calculate total price

    try {
      const response = await fetch("/api/save-bundle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          price: totalPrice.toFixed(2), // Send the calculated total price to the backend
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
              value={title}
              onChange={handleTitleChange}
              placeholder="Enter bundle title"
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <ProductSelectButton
                onProductSelect={(count, products) =>
                  handleProductSelect(count, products)
                }
              />
            </div>

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
