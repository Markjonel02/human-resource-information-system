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

  const handleDownload = async (filePath) => {
    try {
      // Extract just the filename from the path
      const filename = filePath.split("/").pop();

      console.log("=== DOWNLOAD DEBUG ===");
      console.log("Original filePath:", filePath);
      console.log("Extracted filename:", filename);
      console.log("API endpoint:", `/documents/download/${filename}`);
      console.log("=====================");

      // Make API request using axiosInstance with responseType blob
      const response = await axiosInstance.get(
        `/documents/download/${filename}`,
        {
          responseType: "blob", // Important: tell axios to expect binary data
        }
      );

      // Create a blob URL from the response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create and trigger download link
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download successful",
        description: `${filename} has been downloaded`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Download failed:", err);

      const errorMessage =
        err.response?.data?.message || err.message || "Unable to download file";

      toast({
        title: "Download failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
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
                onClick={() => handleDownload(item.filePath)}
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
