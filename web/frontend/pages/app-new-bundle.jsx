import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  Stack,
  TextStyle,
  Badge,
} from "@shopify/polaris";
import { useState } from "react";
import ProductSelectButton from "../components/app-components/SelectButton";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

export default function BundlePage() {
  const fetch = useAuthenticatedFetch()
  const [title, setTitle] = useState(""); 
  const [selectedProductsCount, setSelectedProductsCount] = useState(0); 
  const [selectedProducts, setSelectedProducts] = useState([]); 

  const handleTitleChange = (value) => setTitle(value);

  const handleProductSelect = (count, products) => {
    setSelectedProductsCount(count);
    setSelectedProducts(products);
  };

  const handleSave = async () => {
    if (title && selectedProductsCount > 0) {
      // Ensure selectedProducts is always an array
      const totalPrice = (selectedProducts || []).reduce((sum, product) => {
        return sum + parseFloat(product.price || 0); // Ensure product.price is a number
      }, 0);
  
      try {
        const response = await fetch("/api/save-bundle", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            price: totalPrice, // Send calculated total price
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
              </Stack>
              <div style={{ marginTop: "20px" }}>
                {/* Enable the button only if the title and products are provided */}
                <Button
                  primary
                  disabled={!title || selectedProductsCount === 0} 
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
