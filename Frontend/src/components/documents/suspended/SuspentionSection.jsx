import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Edit2, Trash2 } from "lucide-react";
import axiosInstance from "../../../lib/axiosInstance";
import EditSuspensionModal from "./EditSuspensionModal";
import DeleteConfirmModal from "./DeleteSuspensionModal";

const SuspensionSection = ({ data, color, refreshData }) => {
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
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
    if (refreshData) await refreshData();
  };

  const confirmDelete = async () => {
    const suspensionId = selectedItem?._id || selectedItem?.id;

    if (!suspensionId) {
      toast({
        title: "Delete failed",
        description: "Suspension ID not found.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.delete(`/suspension/${suspensionId}`);

      toast({
        title: "Success",
        description: "Suspension record deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      if (refreshData) await refreshData();
      onDeleteClose();
    } catch (error) {
      console.error("Delete failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete suspension record.";

      toast({
        title: "Delete failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "yellow";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <>
      <Box
        borderWidth="1px"
        borderColor={border}
        borderRadius="lg"
        overflow="hidden"
        bg={tableBg}
        boxShadow="sm"
      >
        <Table variant="simple">
          <Thead
            bg={headerBg}
            borderBottomWidth="2px"
            borderBottomColor={border}
          >
            <Tr>
              <Th color={color} fontWeight="bold" fontSize="sm">
                Title
              </Th>
              <Th color={color} fontWeight="bold" fontSize="sm">
                Status
              </Th>
              <Th color={color} fontWeight="bold" fontSize="sm">
                Reason
              </Th>
              <Th color={color} fontWeight="bold" fontSize="sm">
                Employee
              </Th>
              <Th color={color} fontWeight="bold" fontSize="sm">
                Duration
              </Th>
              <Th color={color} fontWeight="bold" fontSize="sm" isNumeric>
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.map((item, index) => (
              <Tr
                key={item?._id || item?.id || index}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s ease"
                borderBottomWidth="1px"
                borderBottomColor={border}
              >
                <Td fontWeight="600" color={color} maxW="150px">
                  {item.title || "Untitled Suspension"}
                </Td>
                <Td>
                  {item.status && (
                    <Badge
                      colorScheme={getStatusColor(item.status)}
                      borderRadius="full"
                      px={2}
                    >
                      {item.status}
                    </Badge>
                  )}
                </Td>
                <Td fontSize="sm" color="gray.600" maxW="250px" noOfLines={2}>
                  {item.reason || item.description || "No reason provided."}
                </Td>
                <Td fontSize="sm">
                  {item.employeeName ? (
                    <Box>
                      <Box fontWeight="600">{item.employeeName}</Box>
                      {item.employeeDepartment && (
                        <Box fontSize="xs" color="gray.500">
                          {item.employeeDepartment}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <span>—</span>
                  )}
                </Td>
                <Td fontSize="sm" color="gray.600">
                  {item.startDate && item.endDate
                    ? `${new Date(
                        item.startDate
                      ).toLocaleDateString()} - ${new Date(
                        item.endDate
                      ).toLocaleDateString()}`
                    : "—"}
                </Td>
                <Td isNumeric>
                  <HStack spacing={2} justify="flex-end">
                    <Tooltip label="Edit suspension" placement="top">
                      <IconButton
                        aria-label="Edit"
                        icon={<Edit2 size={18} />}
                        size="sm"
                        colorScheme="orange"
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete suspension" placement="top">
                      <IconButton
                        aria-label="Delete"
                        icon={<Trash2 size={18} />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                      />
                    </Tooltip>
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <EditSuspensionModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        item={selectedItem}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={confirmDelete}
        title="Delete Suspension Record"
        message={`Are you sure you want to delete "${selectedItem?.title}"? This action cannot be undone.`}
      />
    </>
  );
};

export default SuspensionSection;
