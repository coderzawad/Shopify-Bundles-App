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

export default function BundlePage() {
  const [title, setTitle] = useState('');  // State for Title field
  const [price, setPrice] = useState('');  // State for Price field
  const [selectedProductsCount, setSelectedProductsCount] = useState(0);  // Track selected products count
  const [selectedProducts, setSelectedProducts] = useState([]);  // Store selected products

  // Handler for the title field
  const handleTitleChange = (value) => setTitle(value);

  // Handler for the price field
  const handlePriceChange = (value) => setPrice(value);

  // Handler for product selection count update from ProductSelectButton
  const handleProductSelect = (count, products) => {
    setSelectedProductsCount(count);
    setSelectedProducts(products);
  };

  // Function to handle saving the bundle
  const handleSave = () => {
    if (title && price && selectedProductsCount > 0) {
      // Replace this console log with an API call to save the bundle
      console.log("Bundle saved with details:", {
        title,
        price,
        selectedProducts,
      });

      // Show success notification or navigate away (if needed)
      alert("Bundle saved successfully!");
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
              value={title}                       // Controlled value for Title
              onChange={handleTitleChange}        // onChange handler for Title
              placeholder="Enter bundle title"
            />
            <TextField
              label="Price"
              value={price}                       // Controlled value for Price
              onChange={handlePriceChange}        // onChange handler for Price
              placeholder="Enter bundle Price"
              type="number"
            />
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <ProductSelectButton
                onProductSelect={(count, products) => handleProductSelect(count, products)}
              />
            </div>
          </Card>
        </Layout.Section>

        {/* Right Section */}
        <Layout.Section secondary>
          <Card title="Components">
            <Card.Section>
              <TextStyle variation="subdued">
                Bundles can include up to 30 different products. Limits for bundle options and variants are the same as other products.
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
