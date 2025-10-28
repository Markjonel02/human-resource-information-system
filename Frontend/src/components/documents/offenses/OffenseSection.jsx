import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import axiosInstance from "../../../lib/axiosInstance";
import EditOffenseModal from "./EditOffenseModal";
import DeleteConfirmModal from "./DeleteOffenseModal";

const OffenseSection = ({
  data = [],
  color = "teal",
  refreshData,
  isEmployeeView,
}) => {
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const toast = useToast();
  const [offenses, setOffenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOffense, setSelectedOffense] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit Modal
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  // Delete Modal
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const fetchOffenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/offense/get-all-offense");
      setOffenses(res.data?.offenses || res.data || []);
    } catch (err) {
      console.error("❌ Error fetching offenses:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to fetch offenses.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setOffenses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffenses();
  }, []);

  const handleEdit = (offense) => {
    setSelectedOffense(offense);
    onEditOpen();
  };

  const handleDelete = (offense) => {
    setSelectedOffense(offense);
    onDeleteOpen();
  };

  // ✅ Update table immediately after editing
  const handleEditUpdate = async (updatedOffense) => {
    onEditClose();

    // Update local offenses array instantly
    setOffenses((prev) =>
      prev.map((o) => (o._id === updatedOffense._id ? updatedOffense : o))
    );

    // Optionally refetch in background to stay synced
    if (refreshData) await refreshData();
    else fetchOffenses();

    toast({
      title: "Success",
      description: "Offense updated successfully.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // ✅ Instantly update local state after delete
  const handleConfirmDelete = async () => {
    if (!selectedOffense?._id) {
      toast({
        title: "Error",
        description: "Offense ID not found.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/offense/delete/${selectedOffense._id}`);

      // Update local state immediately (remove deleted item)
      setOffenses((prev) => prev.filter((o) => o._id !== selectedOffense._id));

      toast({
        title: "Success",
        description: "Offense deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();

      // Optional background refresh
      if (refreshData) await refreshData();
      else fetchOffenses();
    } catch (error) {
      console.error("Delete failed:", error);
      toast({
        title: "Delete Failed",
        description:
          error.response?.data?.message || "Failed to delete offense.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case "minor":
        return "yellow";
      case "moderate":
      case "major":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getCategoryColor = (category) => {
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

  const displayData = offenses.length > 0 ? offenses : data || [];

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="lg" color={color} />
      </Center>
    );
  }

  if (!displayData || displayData.length === 0) {
    return (
      <Center py={10}>
        <Box textAlign="center" color="gray.500">
          No offenses recorded.
        </Box>
      </Center>
    );
  }

  return (
    <>
      <Box
        borderWidth="1px"
        borderColor={border}
        borderRadius="lg"
        overflowX="auto"
        bg={tableBg}
        boxShadow="sm"
        maxW={1200}
        mx="auto"
      >
        <Table variant="simple" size="sm">
          <Thead
            bg={headerBg}
            borderBottomWidth="2px"
            borderBottomColor={border}
          >
            <Tr>
              {[
                "Title",
                "Severity",
                "Category",
                "Status",
                "Description",
                "Employee",
                "Action Taken",
                "Recorded By",
                "Date",
                "Notes",
              ].map((header) => (
                <Th
                  key={header}
                  textAlign="center"
                  color={color}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {header}
                </Th>
              ))}
              {!isEmployeeView && (
                <Th
                  textAlign="center"
                  color={color}
                  fontWeight="bold"
                  fontSize="sm"
                >
                  Actions
                </Th>
              )}
            </Tr>
          </Thead>

          <Tbody>
            {displayData.map((item, i) => (
              <Tr
                key={item?._id || i}
                _hover={{ bg: hoverBg }}
                borderBottomWidth="1px"
                borderBottomColor={border}
              >
                <Td
                  textAlign="center"
                  fontWeight="600"
                  color={color}
                  maxW="150px"
                  noOfLines={2}
                >
                  {item.title || "Untitled Offense"}
                </Td>
                <Td textAlign="center">
                  <Badge
                    colorScheme={getSeverityColor(item.severity)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.severity || "—"}
                  </Badge>
                </Td>
                <Td textAlign="center">
                  <Badge
                    colorScheme={getCategoryColor(item.category)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.category || "—"}
                  </Badge>
                </Td>
                <Td textAlign="center">
                  <Badge
                    colorScheme={getStatusColor(item.status)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.status || "—"}
                  </Badge>
                </Td>
                <Td
                  textAlign="center"
                  fontSize="sm"
                  color="gray.600"
                  maxW="180px"
                >
                  <Tooltip label={item.description}>
                    <Box noOfLines={2}>{item.description || "—"}</Box>
                  </Tooltip>
                </Td>
                <Td textAlign="center" fontSize="sm">
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
                    "—"
                  )}
                </Td>
                <Td
                  textAlign="center"
                  fontSize="sm"
                  color="gray.600"
                  maxW="180px"
                >
                  <Tooltip label={item.actionTaken}>
                    <Box noOfLines={2}>{item.actionTaken || "—"}</Box>
                  </Tooltip>
                </Td>
                <Td textAlign="center" fontSize="sm" color="gray.600">
                  {item.recordedByName || item.recordedBy || "—"}
                </Td>
                <Td textAlign="center" fontSize="sm" color="gray.600">
                  {item.date
                    ? new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </Td>
                <Td
                  textAlign="center"
                  fontSize="sm"
                  color="gray.600"
                  maxW="180px"
                >
                  <Tooltip label={item.notes}>
                    <Box noOfLines={2}>{item.notes || "—"}</Box>
                  </Tooltip>
                </Td>

                {!isEmployeeView && (
                  <Td textAlign="center">
                    <HStack spacing={2} justify="center">
                      <Tooltip label="Edit Offense">
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          variant="ghost"
                          onClick={() => handleEdit(item)}
                          aria-label="Edit offense"
                        />
                      </Tooltip>
                      <Tooltip label="Delete Offense">
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          colorScheme="red"
                          variant="ghost"
                          onClick={() => handleDelete(item)}
                          aria-label="Delete offense"
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

      {/* Edit Modal */}
      {selectedOffense && (
        <EditOffenseModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          item={selectedOffense}
          onUpdate={handleEditUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleConfirmDelete}
        title="Delete Offense Record"
        message={`Are you sure you want to delete the offense "${
          selectedOffense?.title || "this record"
        }"? This action cannot be undone.`}
      />
    </>
  );
};

export default OffenseSection;
