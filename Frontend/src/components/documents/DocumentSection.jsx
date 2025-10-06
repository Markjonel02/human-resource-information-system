import React from "react";
import { Box, Text, VStack } from "@chakra-ui/react";

const DocumentSection = ({ data, color }) => (
  <VStack align="stretch" spacing={4}>
    {data.map((item, index) => (
      <Box
        key={index}
        p={5}
        borderWidth="1px"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
      >
        <Text fontWeight="bold" fontSize="lg" mb={2} color={color}>
          {item.title}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {item.description}
        </Text>
      </Box>
    ))}
  </VStack>
);

export default DocumentSection;
