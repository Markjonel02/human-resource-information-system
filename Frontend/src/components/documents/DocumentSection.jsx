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
      const filename = filePath.split("/").pop();

      console.log("=== DOWNLOAD ATTEMPT ===");
      console.log("Filename:", filename);
      console.log("Full path:", filePath);

      // Use axiosInstance with blob response
      const response = await axiosInstance.get(`/policy/download/${filename}`, {
        responseType: "blob",
      });

      console.log("=== RESPONSE DETAILS ===");
      console.log("Status:", response.status);
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log("Data type:", typeof response.data);
      console.log("Data size:", response.data?.size);
      console.log("========================");

      // Validate response
      if (!response.data) {
        throw new Error("No data received from server");
      }

      if (response.data.size === 0) {
        throw new Error("Empty file received from server");
      }

      // Create blob
      const blob = new Blob([response.data], { type: "application/pdf" });
      console.log("Created blob size:", blob.size);

      if (blob.size === 0) {
        throw new Error("Failed to create blob from response");
      }

      // Create download URL
      const url = window.URL.createObjectURL(blob);
      console.log("Created URL:", url);

      // Create and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log("Cleanup completed");
      }, 100);

      toast({
        title: "Download successful",
        description: `${filename} has been downloaded`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("=== DOWNLOAD ERROR ===");
      console.error("Error object:", err);
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      console.error("Response headers:", err.response?.headers);
      console.error("========================");

      let errorMessage = "Unable to download file";

      if (err.response?.status === 404) {
        errorMessage = "File not found on server";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication required";
      } else if (err.response?.status === 403) {
        errorMessage = "Access denied";
      } else if (err.response?.status === 500) {
        errorMessage = "Server error occurred";
      } else if (err.message) {
        errorMessage = err.message;
      }

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
