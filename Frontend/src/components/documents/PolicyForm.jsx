import React, { useState } from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Text,
  Icon,
  useToast,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react";
import { UploadCloud, FileText, FileCheck } from "lucide-react";
import axiosInstance from "../../lib/axiosInstance";

const PolicyForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const border = useColorModeValue("gray.200", "gray.700");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: "Missing file",
        description: "Please upload a PDF before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("file", formData.file);

    setIsSubmitting(true);
    try {
      const res = await axiosInstance.post("/policy/upload-policy", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast({
        title: "Uploaded successfully!",
        description: res.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFormData({ title: "", description: "", file: null });
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={5} align="stretch" py={2}>
        {/* Title */}
        <FormControl isRequired>
          <FormLabel fontWeight="semibold" mb={1}>
            Document Title
          </FormLabel>
          <Input
            placeholder="e.g., New Remote Work Policy"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            focusBorderColor="blue.500"
          />
        </FormControl>

        {/* Description */}
        <FormControl>
          <FormLabel fontWeight="semibold" mb={1}>
            Description
          </FormLabel>
          <Textarea
            placeholder="Brief description of the document"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            resize="none"
            focusBorderColor="blue.500"
          />
        </FormControl>

        {/* File Upload */}
        <FormControl isRequired>
          <FormLabel fontWeight="semibold" mb={1}>
            Upload PDF
          </FormLabel>
          <VStack
            border="2px dashed"
            borderColor={border}
            borderRadius="lg"
            p={4}
            align="center"
            justify="center"
            textAlign="center"
            _hover={{
              borderColor: "blue.400",
              bg: useColorModeValue("gray.50", "gray.700"),
            }}
            transition="all 0.2s ease"
            position="relative"
          >
            <Input
              type="file"
              accept="application/pdf"
              opacity="0"
              position="absolute"
              w="100%"
              h="100%"
              top="0"
              left="0"
              cursor="pointer"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
              }
            />
            <Icon
              as={formData.file ? FileCheck : UploadCloud}
              boxSize={6}
              color={formData.file ? "green.400" : "gray.400"}
            />
            {formData.file ? (
              <Text fontSize="sm" color="green.500" noOfLines={1}>
                {formData.file.name}
              </Text>
            ) : (
              <Text fontSize="sm" color="gray.500">
                Drag & drop or click to upload a PDF
              </Text>
            )}
          </VStack>
        </FormControl>

        {/* Action Buttons */}
        <HStack justify="flex-end" pt={2}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="submit"
            isLoading={isSubmitting}
            loadingText="Uploading..."
            rightIcon={<FileText size={18} />}
          >
            Upload
          </Button>
        </HStack>
      </VStack>
    </form>
  );
};

export default PolicyForm;
