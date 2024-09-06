import { Box, Heading } from "@chakra-ui/react";
import { useAuthenticatedFetch } from "../hooks/useAuthenticatedFetch";
import { useAppQuery } from "../hooks/useAppQuery";

export default function HomePage() {
  const fetch = useAuthenticatedFetch()
  const {data} = useAppQuery('/api/products/count')
  return (
    <Box>
      <Heading textAlign={"center"}>Hello From Chakra UI</Heading>
    </Box>
  );
}
