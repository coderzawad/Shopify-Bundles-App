import {
  Page,
  Layout,
  Banner,
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
  const [bundles, setBundles] = useState([]); // State to store bundles
  const fetch = useAuthenticatedFetch(); // Fetch hook

  // Fetch bundles from the backend
  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const response = await fetch("/api/get-bundles");
        if (response.ok) {
          const data = await response.json();
          setBundles(data.bundles); // Assuming the backend sends the bundles in `data.bundles`
        }
      } catch (error) {
        console.error("Error fetching bundles:", error);
      }
    };
    fetchBundles();
  }, [fetch]);

  const resourceName = {
    singular: "bundle",
    plural: "bundles",
  };

  return (
    <Page title="Bundles">
      {/* Top Banner */}
      <Banner
        title="Enabling certain features in your store may prevent you from selling bundles."
        status="info"
        action={{ content: "Learn more about Shopify Bundles compatibility" }}
        onDismiss={() => {}}
      />

      {/* Buttons for Actions */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          margin: "16px 0",
        }}
      >
        <Button>View in product list</Button>
        <Button variant="primary" url="/app-new-bundle">
          Create bundle
        </Button>
      </div>

      {/* List of Bundles */}
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={bundles}
          renderItem={(item) => {
            const { id, title, price } = item;
            return (
              <ResourceItem id={id}>
                <Stack>
                  <Stack.Item fill>
                    <h3>
                      <TextStyle variation="strong">{title}</TextStyle>
                    </h3>
                  </Stack.Item>
                  <Stack.Item>
                    <TextStyle>{price}</TextStyle>
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
