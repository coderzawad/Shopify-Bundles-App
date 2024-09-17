import {
  Page,
  ResourceList,
  ResourceItem,
  Button,
  TextStyle,
  Stack,
  Card,
} from "@shopify/polaris";
import React, { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

function BundlePage() {
  const [bundles, setBundles] = useState([]);  // Filtered bundle products
  const fetch = useAuthenticatedFetch();       // Shopify authenticated fetch

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/get-bundles");
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Log to inspect the full structure
  
          // Access the correct array inside `bundles.data`
          if (Array.isArray(data.bundles.data)) {
            const bundleProducts = data.bundles.data.filter(
              product => product.tags && product.tags.includes("bundle")
            );
            setBundles(bundleProducts); // Update state with filtered bundles
          } else {
            console.error("Error: Expected an array, but got:", data.bundles.data);
          }
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [fetch]);

  const resourceName = {
    singular: "bundle",
    plural: "bundles",
  };

  return (
    <Page title="Bundles" divider>
      {/* Buttons for Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "16px 0",
          gap: "10px",
        }}
      >
        <Button plain>View in product list</Button>
        <Button primary>Create bundle</Button>
      </div>

      {/* Display Bundles */}
      <Card title="Bundle Products" sectioned>
        <ResourceList
          resourceName={resourceName}
          items={bundles} // Render only bundle products
          renderItem={(item) => {
            const { id, title, variants } = item;
            const price = variants && variants.length > 0 ? variants[0].price : "No price available"; // Get the price from the first variant
            return (
              <ResourceItem id={id}>
                <Stack distribution="equalSpacing" alignment="center">
                  <Stack.Item fill>
                    <h3 style={{ marginBottom: 0 }}>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                  </Stack.Item>
                  <Stack.Item>
                    <TextStyle variation="subdued">
                      <span style={{ fontSize: "16px", fontWeight: "bold", color: "#5C6AC4" }}>
                        ${parseFloat(price).toFixed(2)}
                      </span>
                    </TextStyle>
                  </Stack.Item>
                </Stack>
              </ResourceItem>
            );
          }}
        />
      </Card>

      {/* Feedback Section */}
      <Card title="Share your feedback" sectioned>
        <p>
          How would you describe your experience using the Shopify Bundles app?
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "12px",
          }}
        >
          <Button
            icon={
              <span role="img" aria-label="thumbs up">
                👍
              </span>
            }

          >
            Good
          </Button>
          <Button
            icon={
              <span role="img" aria-label="thumbs down">
                👎
              </span>
            }

          >
            Bad
          </Button>
        </div>
      </Card>
    </Page>
  );
}

export default BundlePage;