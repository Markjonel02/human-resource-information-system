// components/LoadingSpinner.jsx
import React from "react";
import { Flex, Spinner } from "@chakra-ui/react";

const LoadingSpinner = () => (
  <Flex
    justify="center"
    align="center"
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    zIndex={9999}
  >
    <Spinner size="xl" color="blue.500" />
  </Flex>
);

export default LoadingSpinner;
