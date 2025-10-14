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

  const sanitizeFileName = (name) =>
    (name || "file").replace(/[\/\\?%*:|"<>]/g, "_").trim() || "file";

  const getFileExtension = (filePath) => {
    try {
      const ext = filePath?.split(".").pop();
      return ext ? `.${ext}` : ".pdf";
    } catch {
      return ".pdf";
    }
  };

  const handleDownload = async (item) => {
    const policyId = item?._id || item?.id;
    // if id present -> download by id
    if (policyId) {
      return downloadById(policyId, item);
    }

    // fallback: try to use filename from filePath
    const filename = item?.filePath?.split("/").pop();
    await axiosInstance.get(`/policy/download-by-filename/${encodeURIComponent(filename)}`, { responseType: "blob" });
  };

  // helper used above to download by id (keeps code DRY)
  const downloadById = async (policyId, item) => {
    try {
      const response = await axiosInstance.get(
        `/policy/download-policy/${encodeURIComponent(policyId)}`,
        { responseType: "blob" }
      );

      const contentType =
        (response.headers && (response.headers["content-type"] || response.headers["Content-Type"])) ||
        (response.data && response.data.type) ||
        "";

      if (contentType.includes("application/json")) {
        const text = await response.data.text();
        let msg = "Unable to download file.";
        try {
          const parsed = JSON.parse(text);
          msg = parsed.error || parsed.message || text;
        } catch {
          msg = text;
        }
        throw new Error(msg);
      }

      const ext = getFileExtension(item.filePath);
      const blob = new Blob([response.data], { type: contentType || "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeTitle = sanitizeFileName(item.title || item.filePath || "policy");
      link.download = `${safeTitle}${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download by id failed:", error);
      const errMsg =
        (error.response && (error.response.data?.error || error.response.data?.message)) ||
        error.message ||
        "Unable to download file.";
      toast({
        title: "Download failed",
        description: errMsg,
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
