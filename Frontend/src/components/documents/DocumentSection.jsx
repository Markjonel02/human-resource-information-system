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

  const handleDownload = async (item) => {
    const policyId = item?._id || item?.id;

    if (!policyId) {
      toast({
        title: "Download failed",
        description: "Policy ID not found.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Call the correct backend endpoint: GET /api/policy/:id/download
      const response = await axiosInstance.get(`/policy/${policyId}/download`, {
        responseType: "blob",
      });

      // Check if response is actually an error (JSON instead of PDF)
      const contentType =
        response.headers["content-type"] ||
        response.headers["Content-Type"] ||
        response.data.type ||
        "";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        let errorMessage = "Unable to download file.";
        try {
          const parsed = JSON.parse(text);
          errorMessage = parsed.message || parsed.error || text;
        } catch {
          errorMessage = text;
        }
        throw new Error(errorMessage);
      }

      // Extract the original filename from Content-Disposition header
      let filename = "document.pdf";
      const contentDisposition =
        response.headers["content-disposition"] ||
        response.headers["Content-Disposition"];

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      } else if (item.filePath) {
        // Fallback: use filename from filePath
        filename = item.filePath.split("/").pop();
      }

      // Create blob and trigger download
      const blob = new Blob([response.data], {
        type: contentType || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename; // Uses original filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download successful",
        description: `Downloaded: ${filename}`,
        status: "success",
        duration: 2500,
        isClosable: true,
      });
    } catch (error) {
      console.error("Download failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unable to download file.";

      toast({
        title: "Download failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack align="stretch" spacing={4}>
      {data.map((item, index) => (
        <Box
          key={item?._id || item?.id || index}
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

            {item.filePath ? (
              <HStack
                as="button"
                onClick={() => handleDownload(item)}
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
            ) : null}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
};

export default DocumentSection;
