import {
  Page,
  ResourceList,
  ResourceItem,
  Button,
  TextStyle,
  Stack,
  Card,
  ButtonGroup,
} from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { useAuthenticatedFetch } from "@shopify/app-bridge-react";

function BundlePage() {
  const [bundles, setBundles] = useState([]);
  const fetch = useAuthenticatedFetch(); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/get-bundles");
        if (response.ok) {
          const data = await response.json();
          console.log(data); // Log to inspect the full structure

          // Access the correct array inside `bundles.data`
          if (Array.isArray(data.bundles.data)) {
            const bundleProducts = data.bundles.data
              .filter((product) => product.tags && product.tags.includes("bundle"))
              .sort((a, b) => {
                const priceA = parseFloat(a.variants?.[0]?.price || 0);
                const priceB = parseFloat(b.variants?.[0]?.price || 0);
                return priceB - priceA;
              });
            setBundles(bundleProducts); 
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

  const bridge = useAppBridge();
  const handleViewInProductList = () => {
    const shopUrl = `https://${atob(new URLSearchParams(location.search).get("host"))}`;
    const url = `${shopUrl}/products?tag=bundle`;
    window.open(url, "_blank"); // Redirect to the constructed URL
  };

  const handleLike = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'good' }),
    });
    alert('Thank you for your feedback!');
  };
  
  const handleDisLike = async () => {
    await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type: 'bad' }),
    });
    alert('Thank you for your feedback!');
  };

  return (
    <Page title="Shopify Bundles builder" divider>
      <div style={{ display: "flex", justifyContent: "flex-end", margin: "16px 0", gap: "10px" }}>
        <ButtonGroup>
          <Button onClick={handleViewInProductList}>View in product list</Button>
          <Button variant="primary">
            <Link to="/app-new-bundle">Create bundle</Link>
          </Button>
        </ButtonGroup>
      </div>

      <Card title="Bundle Products" sectioned>
        <ResourceList
          resourceName={resourceName}
          items={bundles} // Render sorted bundle products
          renderItem={(item) => {
            const { id, title, variants } = item;
            const price = variants?.[0]?.price || "No price available"; // Get the price from the first variant
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
                      <span
                        style={{ fontSize: "16px", fontWeight: "bold", color: "#5C6AC4" }}
                      >
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

      <Card title="Share your feedback" sectioned>
        <p>How would you describe your experience using the Shopify Bundles app?</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px" }}>
          <Button
            icon={<span role="img" aria-label="thumbs up">👍</span>}
            onClick={handleLike}
          >
            Good
          </Button>
          <Button
            icon={<span role="img" aria-label="thumbs down">👎</span>}
            onClick={handleDisLike}
          >
            Bad
          </Button>
        </div>
      </Card>
    </Page>
  );
}

export default BundlePage;