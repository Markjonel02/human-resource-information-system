import React, { useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Badge,
  HStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { Edit2, Trash2 } from "lucide-react";
import axiosInstance from "../../../../lib/axiosInstance";

const EmployeeOffenseSection = ({
  data,
  color,
  refreshData,
  isEmployeeView,
}) => {
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
      case "moderate":
        return "orange";
      case "major":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getCategoryBadgeColor = (category) => {
    switch (category?.toLowerCase()) {
      case "attendance":
        return "blue";
      case "conduct":
        return "purple";
      case "performance":
        return "green";
      case "insubordination":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow";
      case "acknowledged":
        return "blue";
      case "resolved":
        return "green";
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
        overflowX="hidden"
        bg={tableBg}
        boxShadow="sm"
        maxW={950}
      >
        <Box overflowX="auto">
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
                  Severity
                </Th>
                {!isEmployeeView && (
                  <Th color={color} fontWeight="bold" fontSize="sm">
                    Category
                  </Th>
                )}
                {!isEmployeeView && (
                  <Th color={color} fontWeight="bold" fontSize="sm">
                    Status
                  </Th>
                )}
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Description
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Employee
                </Th>
                {!isEmployeeView && (
                  <Th color={color} fontWeight="bold" fontSize="sm">
                    Recorded By
                  </Th>
                )}
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Date
                </Th>
                {!isEmployeeView && (
                  <Th color={color} fontWeight="bold" fontSize="sm" isNumeric>
                    Actions
                  </Th>
                )}
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
                    {item.title || "Untitled Offense"}
                  </Td>
                  <Td>
                    {item.severity && (
                      <Badge
                        colorScheme={getSeverityColor(item.severity)}
                        borderRadius="full"
                        px={2}
                      >
                        {item.severity}
                      </Badge>
                    )}
                  </Td>
                  {!isEmployeeView && (
                    <Td>
                      {item.category && (
                        <Badge
                          colorScheme={getCategoryBadgeColor(item.category)}
                          borderRadius="full"
                          px={2}
                          fontSize="xs"
                        >
                          {item.category}
                        </Badge>
                      )}
                    </Td>
                  )}
                  {!isEmployeeView && (
                    <Td>
                      {item.status && (
                        <Badge
                          colorScheme={getStatusColor(item.status)}
                          borderRadius="full"
                          px={2}
                          fontSize="xs"
                        >
                          {item.status}
                        </Badge>
                      )}
                    </Td>
                  )}
                  <Td fontSize="sm" color="gray.600" maxW="200px" noOfLines={2}>
                    {item.description ||
                      item.offenseDetails ||
                      "No description available."}
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
                  {!isEmployeeView && (
                    <Td fontSize="sm" color="gray.600">
                      {item.recordedBy || "—"}
                    </Td>
                  )}
                  <Td fontSize="sm" color="gray.600">
                    {item.date ? new Date(item.date).toLocaleDateString() : "—"}
                  </Td>
                  {!isEmployeeView && (
                    <Td isNumeric>
                      <HStack spacing={2} justify="flex-end">
                        <Tooltip label="Edit offense" placement="top">
                          <IconButton
                            aria-label="Edit"
                            icon={<Edit2 size={18} />}
                            size="sm"
                            colorScheme="orange"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete offense" placement="top">
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
                  )}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </>
  );
};

export default EmployeeOffenseSection;
