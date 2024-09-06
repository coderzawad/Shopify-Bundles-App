import { Page, Layout, Banner, ResourceList, ResourceItem, Button, TextStyle, Stack, Card, Link } from '@shopify/polaris';
import React from 'react';

function BundlePage() {
  const resourceName = {
    singular: 'bundle',
    plural: 'bundles',
  };

  const items = [
    {
      id: 1,
      title: 'MEOW',
      price: '₮213,123,123,243.00',
    },
  ];

  return (
    <Page title="Bundles">
      {/* Top Banner */}
      <Banner
        title="Enabling certain features in your store may prevent you from selling bundles."
        status="info"
        action={{content: 'Learn more about Shopify Bundles compatibility'}}
        onDismiss={() => {}}
      />

      {/* Buttons for Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '16px 0' }}>
        <Button>View in product list</Button>
        <Button variant="primary" url="/app-new-bundle">Create bundle</Button>

      </div>

      {/* List of Bundles */}
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={items}
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
        <p>How would you describe your experience using the Shopify Bundles app?</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          <Button icon={<span role="img" aria-label="thumbs up">👍</span>}>Good</Button>
          <Button icon={<span role="img" aria-label="thumbs down">👎</span>}>Bad</Button>
        </div>
      </Card>
    </Page>
  );
}

export default BundlePage;
