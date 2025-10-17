import React, { useState } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Edit2, Trash2, User } from "lucide-react";
import axiosInstance from "../../lib/axiosInstance";
import EditOffenseModal from "./EditOffenseModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

const OffenseSection = ({ data, color, refreshData }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.700");
  const toast = useToast();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEdit = (item) => {
    setSelectedItem(item);
    onEditOpen();
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleUpdate = async () => {
    if (refreshData) {
      await refreshData();
    }
  };

  const confirmDelete = async () => {
    const offenseId = selectedItem?._id || selectedItem?.id;

    if (!offenseId) {
      toast({
        title: "Delete failed",
        description: "Offense ID not found.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.delete(`/offense/${offenseId}`);

      toast({
        title: "Success",
        description: "Offense record deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (refreshData) {
        await refreshData();
      }
      onDeleteClose();
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete offense record.";

      toast({
        title: "Delete failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "minor":
        return "yellow";
      case "major":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <>
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
                <HStack spacing={3} mb={2}>
                  <Text fontWeight="bold" fontSize="lg" color={color}>
                    {item.title || "Untitled Offense"}
                  </Text>
                  {item.severity && (
                    <Badge colorScheme={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                  )}
                </HStack>

                <Text fontSize="sm" color="gray.600" mt={1}>
                  {item.description ||
                    item.offenseDetails ||
                    "No description available."}
                </Text>

                {item.employeeName && (
                  <HStack mt={3} spacing={2}>
                    <Icon as={User} boxSize={4} color="gray.500" />
                    <Text fontSize="sm" color="gray.600">
                      <strong>Employee:</strong> {item.employeeName}
                      {item.employeeDepartment &&
                        ` (${item.employeeDepartment})`}
                    </Text>
                  </HStack>
                )}

                {item.date && (
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Date: {new Date(item.date).toLocaleDateString()}
                  </Text>
                )}
              </Box>

              <HStack spacing={2} flexShrink={0}>
                <HStack
                  as="button"
                  onClick={() => handleEdit(item)}
                  px={3}
                  py={2}
                  bg="orange.50"
                  borderRadius="md"
                  _hover={{ bg: "orange.100" }}
                  _active={{ bg: "orange.200" }}
                  cursor="pointer"
                >
                  <Icon as={Edit2} color="orange.600" boxSize={4} />
                  <Text fontSize="sm" color="orange.600" fontWeight="medium">
                    Edit
                  </Text>
                </HStack>

                <HStack
                  as="button"
                  onClick={() => handleDelete(item)}
                  px={3}
                  py={2}
                  bg="red.50"
                  borderRadius="md"
                  _hover={{ bg: "red.100" }}
                  _active={{ bg: "red.200" }}
                  cursor="pointer"
                >
                  <Icon as={Trash2} color="red.600" boxSize={4} />
                  <Text fontSize="sm" color="red.600" fontWeight="medium">
                    Delete
                  </Text>
                </HStack>
              </HStack>
            </HStack>
          </Box>
        ))}
      </VStack>

      <EditOffenseModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        item={selectedItem}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Offense Record"
        message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default OffenseSection;
