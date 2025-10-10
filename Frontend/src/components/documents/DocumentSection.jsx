import React from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { Download } from "lucide-react";
import axiosInstance from "../../lib/axiosInstance";

const DocumentSection = ({ data, color }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();

  const handleDownload = async (policyId, title) => {
    try {
      const response = await axiosInstance.get(
        `/policy/download-policy/${policyId}`,
        { responseType: "blob" }
      );

      // Validate response
      if (!response.data) throw new Error("Empty file response");

      // Create blob and download link
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: error.response?.data?.error || "Unable to download file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {data.map((item, index) => (
        <Box
          key={index}
          p={5}
          borderWidth="1px"
          borderColor={border}
          borderRadius="md"
          bg={cardBg}
          _hover={{ shadow: "md", transform: "translateY(-2px)" }}
          transition="all 0.2s ease"
        >
          <HStack justify="space-between" align="flex-start">
            <Box flex="1">
              <Text fontWeight="bold" fontSize="lg" color={color}>
                {item.title}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {item.description || "No description available."}
              </Text>

              {item.filePath && (
                <Text fontSize="sm" mt={2} color="gray.500" noOfLines={1}>
                  📄 {item.filePath.split("/").pop()}
                </Text>
              )}
            </Box>

            {item.filePath && (
              <HStack
                as="button"
                onClick={() => handleDownload(item._id, item.title)}
                px={3}
                py={2}
                bg="blue.50"
                borderRadius="md"
                _hover={{ bg: "blue.100" }}
                _active={{ bg: "blue.200" }}
                cursor="pointer"
                flexShrink={0}
              >
                <Icon as={Download} color="blue.600" boxSize={4} />
                <Text fontSize="sm" color="blue.600" fontWeight="medium">
                  Download
                </Text>
              </HStack>
            )}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default DocumentSection;
