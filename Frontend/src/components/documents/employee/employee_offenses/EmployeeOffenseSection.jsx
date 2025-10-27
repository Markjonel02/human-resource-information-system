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
  useColorModeValue,
  useDisclosure,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axiosInstance from "../../../../lib/axiosInstance";

const EmployeeOffenseSection = ({
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

  const {
    onOpen: onEditOpen,
    isOpen: isEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    onOpen: onDeleteOpen,
    isOpen: isDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch offenses from API
  const fetchMyOffenses = async () => {
    try {
      setLoading(true);
      console.log("=== FETCHING MY OFFENSES ===");

      const res = await axiosInstance.get("/employeeOffenses/my-offenses");
      const fetchedOffenses = res.data?.offenses || [];

      console.log("✅ Offenses fetched:", fetchedOffenses.length);
      setOffenses(fetchedOffenses);
    } catch (err) {
      console.error("❌ Error fetching offenses:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to fetch your offenses.",
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
    fetchMyOffenses();
  }, []);

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
          No offenses recorded for you.
        </Box>
      </Center>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      overflowX="auto"
      bg={tableBg}
      boxShadow="sm"
      w="100%"
      maxW={950}
    >
      <Table variant="simple" size="sm">
        <Thead bg={headerBg} borderBottomWidth="2px" borderBottomColor={border}>
          <Tr>
            <Th color={color}>Title</Th>
            <Th color={color}>Severity</Th>
            <Th color={color}>Category</Th>
            <Th color={color}>Status</Th>
            <Th color={color}>Description</Th>
            <Th color={color}>Employee</Th>
            <Th color={color}>Action Taken</Th>
            <Th color={color}>Recorded By</Th>
            <Th color={color}>Date Created</Th>
            <Th color={color}>Notes</Th>
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
              {/* Title */}
              <Td fontWeight="600">{item.title || "Untitled Offense"}</Td>

              {/* Severity */}
              <Td>
                {item.severity ? (
                  <Badge colorScheme={getSeverityColor(item.severity)}>
                    {item.severity}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Category */}
              <Td>
                {item.category ? (
                  <Badge colorScheme={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Status */}
              <Td>
                {item.status ? (
                  <Badge colorScheme={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Description */}
              <Td maxW="150px" noOfLines={2}>
                {item.description || "—"}
              </Td>

              {/* Employee Name */}
              <Td>
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

              {/* ✅ Action Taken */}
              <Td maxW="150px" noOfLines={2}>
                {item.actionTaken?.trim() || "—"}
              </Td>

              {/* ✅ Recorded By */}
              <Td>
                {item.recordedByName?.trim() || item.recordedBy || "System"}
              </Td>

              {/* Date */}
              <Td minW="130px">
                {item.date ? (
                  <Box>
                    <Box>
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Box>
                    <Box fontSize="xs" color="gray.500">
                      {new Date(item.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Box>
                  </Box>
                ) : (
                  "—"
                )}
              </Td>

              {/* ✅ Notes */}
              <Td maxW="150px" noOfLines={2}>
                {item.notes?.trim() || "—"}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default EmployeeOffenseSection;
