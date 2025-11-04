// components/AnnouncementForm.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Grid,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Heading,
  useToast,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const AnnouncementForm = ({ isEditing, announcement, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general",
    priority: 3,
    expiresAt: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  // Initialize form with editing data
  useEffect(() => {
    if (isEditing && announcement) {
      // Format the expiresAt for datetime-local input
      let formattedExpiresAt = "";
      if (announcement.expiresAt) {
        const date = new Date(announcement.expiresAt);
        formattedExpiresAt = date.toISOString().slice(0, 16);
      }

      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        type: announcement.type || "general",
        priority: announcement.priority || 3,
        expiresAt: formattedExpiresAt,
      });
    }
  }, [isEditing, announcement]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (formData.expiresAt) {
      const expirationDate = new Date(formData.expiresAt);
      if (isNaN(expirationDate.getTime())) {
        newErrors.expiresAt = "Invalid date format";
      } else if (expirationDate < new Date()) {
        newErrors.expiresAt = "Expiration date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type || "general",
        priority: parseInt(formData.priority),
        ...(formData.expiresAt && {
          expiresAt: new Date(formData.expiresAt).toISOString(),
        }),
      };

      let response;

      if (isEditing && announcement?._id) {
        // Update existing announcement
        response = await axiosInstance.put(
          `/announcements/update-announcement/${announcement._id}`,
          payload
        );
      } else {
        // Create new announcement
        response = await axiosInstance.post(
          "/announcements/create-announcements",
          payload
        );
      }

      const { data } = response;

      toast({
        title: "Success",
        description:
          data.message ||
          (isEditing
            ? "Announcement updated successfully"
            : "Announcement created successfully"),
        status: "success",
        duration: 3,
        isClosable: true,
      });

      // Reset form
      setFormData({
        title: "",
        content: "",
        type: "general",
        priority: 3,
        expiresAt: "",
      });
      setErrors({});

      // Call parent callback with the response data
      if (onSubmit) {
        onSubmit(data.data);
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          (isEditing
            ? "Failed to update announcement"
            : "Failed to create announcement"),
        status: "error",
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  return (
    <Card boxShadow="lg" borderColor="blue.200" borderWidth="1px">
      <CardHeader bg="blue.50" borderBottomWidth="1px">
        <Heading size="md" color="blue.800">
          {isEditing ? "Edit Announcement" : "Create New Announcement"}
        </Heading>
      </CardHeader>

      <CardBody>
        <form onSubmit={handleSubmit}>
          <VStack spacing={6}>
            {/* Title Field */}
            <FormControl isRequired isInvalid={!!errors.title} w="100%">
              <FormLabel fontWeight="600" mb={2}>
                Title
              </FormLabel>
              <Input
                placeholder="Enter announcement title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                size="md"
                focusBorderColor="blue.500"
              />
              {errors.title && (
                <Box color="red.500" fontSize="sm" mt={1}>
                  {errors.title}
                </Box>
              )}
            </FormControl>

            {/* Content Field */}
            <FormControl isRequired isInvalid={!!errors.content} w="100%">
              <FormLabel fontWeight="600" mb={2}>
                Content
              </FormLabel>
              <Textarea
                placeholder="Enter announcement content"
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={5}
                focusBorderColor="blue.500"
                resize="vertical"
              />
              {errors.content && (
                <Box color="red.500" fontSize="sm" mt={1}>
                  {errors.content}
                </Box>
              )}
            </FormControl>

            {/* Type and Priority Fields */}
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 1fr" }}
              gap={4}
              w="100%"
            >
              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  Type
                </FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  focusBorderColor="blue.500"
                >
                  <option value="general">General</option>
                  <option value="birthday">Birthday</option>
                  <option value="system">System</option>
                  <option value="urgent">Urgent</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600" mb={2}>
                  Priority
                </FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", parseInt(e.target.value))
                  }
                  focusBorderColor="blue.500"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </Select>
              </FormControl>
            </Grid>

            {/* Expiration Field */}
            <FormControl isInvalid={!!errors.expiresAt} w="100%">
              <FormLabel fontWeight="600" mb={2}>
                Expires At (Optional)
              </FormLabel>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) => handleInputChange("expiresAt", e.target.value)}
                focusBorderColor="blue.500"
              />
              {errors.expiresAt && (
                <Box color="red.500" fontSize="sm" mt={1}>
                  {errors.expiresAt}
                </Box>
              )}
            </FormControl>

            {/* Action Buttons */}
            <HStack w="100%" spacing={3} pt={4}>
              <Button
                flex={1}
                variant="outline"
                colorScheme="gray"
                onClick={onCancel}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                flex={1}
                colorScheme="blue"
                type="submit"
                isLoading={isSubmitting}
                loadingText={isEditing ? "Updating..." : "Creating..."}
              >
                {isEditing ? "Update" : "Create"}
              </Button>
            </HStack>
          </VStack>
        </form>
      </CardBody>
    </Card>
  );
};

export default AnnouncementForm;
