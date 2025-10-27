import React, { useState, useEffect } from "react";
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
  Spinner,
  Center,
} from "@chakra-ui/react";
import { Edit2, Trash2 } from "lucide-react";
import axiosInstance from "../../../../lib/axiosInstance";

const EmployeeOffenseSection = ({
  data = [],
  color,
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

  // --- Fetch offenses from /employee/my-offenses ---
  const fetchMyOffenses = async () => {
    try {
      setLoading(true);
      console.log("=== FETCHING MY OFFENSES ===");
      console.log("Calling: /employee/my-offenses");

      const res = await axiosInstance.get("/employeeOffenses/my-offenses");

      console.log("✅ Response Status:", res.status);
      console.log("✅ Full Response:", res.data);
      console.log("✅ Offenses Array:", res.data.offenses);
      console.log("✅ Offenses Count:", res.data.count);

      const fetchedOffenses = res.data.offenses || [];
      console.log("📊 Setting", fetchedOffenses.length, "offenses to state");

      // Log each offense to verify data
      fetchedOffenses.forEach((offense, index) => {
        console.log(`Offense ${index + 1}:`, {
          id: offense._id,
          title: offense.title,
          employeeName: offense.employeeName,
          employee: offense.employee,
          severity: offense.severity,
          date: offense.date,
        });
      });

      setOffenses(fetchedOffenses);
    } catch (err) {
      console.error("❌ Error fetching offenses:", err);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.response?.data?.message);
      console.error("Full error response:", err.response?.data);

      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to fetch your offenses",
        status: "error",
        duration: 3,
        isClosable: true,
      });

      setOffenses([]);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch offenses on component mount ---
  useEffect(() => {
    fetchMyOffenses();
  }, []);

  const handleEdit = (item) => {
    setSelectedItem(item);
    onEditOpen();
  };

  const handleDelete = (item) => {
    setSelectedItem(item);
    onDeleteOpen();
  };

  const handleUpdate = async () => {
    await fetchMyOffenses();
    if (refreshData) {
      await refreshData();
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

  // Use fetched offenses or passed data (for flexibility)
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
          No offenses recorded for you.
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
        w="100%"
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
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Category
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Status
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Description
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Action Taken
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Notes
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Employee
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Recorded By
                </Th>
                <Th color={color} fontWeight="bold" fontSize="sm">
                  Date Created
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayData.map((item, index) => (
                <Tr
                  key={item?._id || item?.id || index}
                  _hover={{ bg: hoverBg }}
                  transition="background-color 0.2s ease"
                  borderBottomWidth="1px"
                  borderBottomColor={border}
                >
                  {/* Title */}
                  <Td fontWeight="600" color={color} maxW="120px" noOfLines={2}>
                    {item.title || "Untitled Offense"}
                  </Td>

                  {/* Severity */}
                  <Td>
                    {item.severity && (
                      <Badge
                        colorScheme={getSeverityColor(item.severity)}
                        borderRadius="full"
                        px={2}
                        fontSize="xs"
                      >
                        {item.severity}
                      </Badge>
                    )}
                  </Td>

                  {/* Category */}
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

                  {/* Status */}
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

                  {/* Description */}
                  <Td fontSize="sm" color="gray.600" maxW="150px" noOfLines={2}>
                    {item.description || "—"}
                  </Td>

                  {/* Action Taken */}
                  <Td fontSize="sm" color="gray.600" maxW="150px" noOfLines={2}>
                    {item.actionTaken || "—"}
                  </Td>

                  {/* Notes */}
                  <Td fontSize="sm" color="gray.600" maxW="150px" noOfLines={2}>
                    {item.notes || "—"}
                  </Td>

                  {/* Employee Name & Department */}
                  <Td fontSize="sm">
                    {item.employeeName ? (
                      <Box>
                        <Box fontWeight="600" fontSize="sm">
                          {item.employeeName}
                        </Box>
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

                  {/* Recorded By (Admin/User) */}
                  <Td fontSize="sm" color="gray.600">
                    {item.recordedByName || item.recordedBy || "system"}
                  </Td>

                  {/* Date Created */}
                  <Td fontSize="sm" color="gray.600" minW="130px">
                    <Box>
                      <Box fontWeight="500">
                        {item.date
                          ? new Date(item.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "—"}
                      </Box>
                      <Box fontSize="xs" color="gray.500">
                        {item.date
                          ? new Date(item.date).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </Box>
                    </Box>
                  </Td>
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
