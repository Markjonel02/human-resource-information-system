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
  useBreakpointValue,
  VStack,
  HStack,
  Text,
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
  const cardBg = useColorModeValue("gray.50", "gray.750");

  const toast = useToast();
  const [offenses, setOffenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

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

  // Mobile Card View
  if (isMobile) {
    return (
      <VStack spacing={4} w="100%" px={4}>
        {displayData.map((item, i) => (
          <Box
            key={item?._id || i}
            w="100%"
            bg={cardBg}
            borderWidth="1px"
            borderColor={border}
            borderRadius="lg"
            p={4}
            boxShadow="sm"
          >
            <VStack align="start" spacing={3} w="100%">
              <Box w="100%">
                <Text fontSize="sm" color="gray.500" mb={1}>
                  Title
                </Text>
                <Text fontWeight="600" fontSize="md">
                  {item.title || "Untitled Offense"}
                </Text>
              </Box>

              <HStack w="100%" justify="space-between" flexWrap="wrap" gap={2}>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Severity
                  </Text>
                  {item.severity ? (
                    <Badge colorScheme={getSeverityColor(item.severity)}>
                      {item.severity}
                    </Badge>
                  ) : (
                    <Text>—</Text>
                  )}
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Category
                  </Text>
                  {item.category ? (
                    <Badge colorScheme={getCategoryColor(item.category)}>
                      {item.category}
                    </Badge>
                  ) : (
                    <Text>—</Text>
                  )}
                </Box>
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Status
                  </Text>
                  {item.status ? (
                    <Badge colorScheme={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  ) : (
                    <Text>—</Text>
                  )}
                </Box>
              </HStack>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Description
                </Text>
                <Text fontSize="sm">{item.description || "—"}</Text>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Employee
                </Text>
                <Box>
                  <Text fontWeight="600" fontSize="sm">
                    {item.employeeName || "—"}
                  </Text>
                  {item.employeeDepartment && (
                    <Text fontSize="xs" color="gray.500">
                      {item.employeeDepartment}
                    </Text>
                  )}
                </Box>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Action Taken
                </Text>
                <Text fontSize="sm">{item.actionTaken?.trim() || "—"}</Text>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Recorded By
                </Text>
                <Text fontSize="sm">
                  {item.recordedByName?.trim() || item.recordedBy || "System"}
                </Text>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Date Created
                </Text>
                {item.date ? (
                  <Box>
                    <Text fontSize="sm">
                      {new Date(item.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {new Date(item.date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Box>
                ) : (
                  <Text>—</Text>
                )}
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Notes
                </Text>
                <Text fontSize="sm">{item.notes?.trim() || "—"}</Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>
    );
  }

  // Desktop Table View
  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      overflowX="auto"
      bg={tableBg}
      boxShadow="sm"
      w="100%"
      minW="200px"
    >
      <Table variant="simple" size={isTablet ? "sm" : "md"} w="100%">
        <Thead bg={headerBg} borderBottomWidth="2px" borderBottomColor={border}>
          <Tr>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Title
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Severity
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Category
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Status
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Description
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Employee
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Action Taken
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Recorded By
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Date Created
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontSize={isTablet ? "xs" : "sm"}
            >
              Notes
            </Th>
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
              <Td
                textAlign="center"
                fontWeight="600"
                fontSize={isTablet ? "xs" : "sm"}
              >
                {item.title || "Untitled Offense"}
              </Td>

              {/* Severity */}
              <Td textAlign="center" fontSize={isTablet ? "xs" : "sm"}>
                {item.severity ? (
                  <Badge colorScheme={getSeverityColor(item.severity)}>
                    {item.severity}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Category */}
              <Td textAlign="center" fontSize={isTablet ? "xs" : "sm"}>
                {item.category ? (
                  <Badge colorScheme={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Status */}
              <Td textAlign="center" fontSize={isTablet ? "xs" : "sm"}>
                {item.status ? (
                  <Badge colorScheme={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Description */}
              <Td
                textAlign="center"
                maxW={isTablet ? "100px" : "150px"}
                noOfLines={2}
                fontSize={isTablet ? "xs" : "sm"}
              >
                {item.description || "—"}
              </Td>

              {/* Employee Name */}
              <Td fontSize={isTablet ? "xs" : "sm"}>
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

              {/* Action Taken */}
              <Td
                textAlign="center"
                maxW={isTablet ? "100px" : "150px"}
                noOfLines={2}
                fontSize={isTablet ? "xs" : "sm"}
              >
                {item.actionTaken?.trim() || "—"}
              </Td>

              {/* Recorded By */}
              <Td textAlign="center" fontSize={isTablet ? "xs" : "sm"}>
                {item.recordedByName?.trim() || item.recordedBy || "System"}
              </Td>

              {/* Date */}
              <Td
                textAlign="center"
                minW="130px"
                fontSize={isTablet ? "xs" : "sm"}
              >
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

              {/* Notes */}
              <Td
                textAlign="center"
                maxW={isTablet ? "100px" : "150px"}
                noOfLines={2}
                fontSize={isTablet ? "xs" : "sm"}
              >
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
