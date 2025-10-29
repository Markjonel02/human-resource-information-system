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
  useToast,
  Spinner,
  Center,
  Text,
  useBreakpointValue,
  VStack,
  HStack,
  Select,
  Flex,
} from "@chakra-ui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import axiosInstance from "../../../../lib/axiosInstance";

const EmployeeSuspensionSection = ({ color }) => {
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("gray.50", "gray.750");
  const toast = useToast();

  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false });

  useEffect(() => {
    fetchSuspensions();
  }, []);

  const fetchSuspensions = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/employeeSuspended/suspensions"
      );

      if (response.data.success) {
        // Filter out completed suspensions
        const activeSuspensions = (response.data.data || []).filter(
          (suspension) => suspension.status?.toLowerCase() !== "completed"
        );
        setSuspensions(activeSuspensions);
      }
    } catch (error) {
      console.error("Failed to fetch suspensions:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load suspensions.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "yellow";
      case "pending":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getSuspenderName = (suspendBy) => {
    if (!suspendBy) return "—";

    if (typeof suspendBy === "object") {
      const first = suspendBy.firstname || "";
      const last = suspendBy.lastname || "";
      return `${first} ${last}`.trim() || suspendBy.employeeEmail || "—";
    }
    return suspendBy;
  };

  const getDurationText = (item) => {
    if (item.startDate && item.endDate) {
      return `${new Date(item.startDate).toLocaleDateString()} - ${new Date(
        item.endDate
      ).toLocaleDateString()}`;
    } else if (item.endDate) {
      return `Until ${new Date(item.endDate).toLocaleDateString()}`;
    } else if (item.createdAt) {
      return `From ${new Date(item.createdAt).toLocaleDateString()}`;
    }
    return "—";
  };

  const sortSuspensions = (data) => {
    const sorted = [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "title":
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
          break;
        case "status":
          aValue = (a.status || "").toLowerCase();
          bValue = (b.status || "").toLowerCase();
          break;
        case "suspendedBy":
          aValue = (getSuspenderName(a.suspendBy) || "").toLowerCase();
          bValue = (getSuspenderName(b.suspendBy) || "").toLowerCase();
          break;
        case "createdAt":
        default:
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color={color} thickness="4px" />
      </Center>
    );
  }

  if (!suspensions || suspensions.length === 0) {
    return (
      <Center py={10}>
        <Box textAlign="center">
          <Text color="gray.500" fontSize="md">
            No active suspension records found
          </Text>
        </Box>
      </Center>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <VStack spacing={4} w="100%" px={4}>
        <Flex w="100%" justify="space-between" align="center" gap={2}>
          <Text fontSize="sm" fontWeight="600">
            Sort by:
          </Text>
          <Select
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="auto"
            flex={1}
          >
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="suspendedBy">Suspended By</option>
          </Select>
        </Flex>
        {sortSuspensions(suspensions).map((item, index) => (
          <Box
            key={item?._id || item?.id || index}
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
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Title
                </Text>
                <Text fontWeight="600" fontSize="md" color={color}>
                  {item.title || "Untitled Suspension"}
                </Text>
              </Box>

              <HStack w="100%" justify="space-between">
                <Box>
                  <Text fontSize="xs" color="gray.500" mb={1}>
                    Status
                  </Text>
                  {item.status && (
                    <Badge colorScheme={getStatusColor(item.status)} px={2}>
                      {item.status}
                    </Badge>
                  )}
                </Box>
              </HStack>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Reason
                </Text>
                <Text fontSize="sm">
                  {item.descriptions ||
                    item.reason ||
                    item.description ||
                    "No reason provided."}
                </Text>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Suspended By
                </Text>
                <Box>
                  <Text fontWeight="600" fontSize="sm">
                    {getSuspenderName(item.suspendBy)}
                  </Text>
                  {item.suspendBy?.employeeId && (
                    <Text fontSize="xs" color="gray.500">
                      ID: {item.suspendBy.employeeId}
                      {item.suspendBy.role && ` (${item.suspendBy.role})`}
                    </Text>
                  )}
                </Box>
              </Box>

              <Box w="100%">
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Duration
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {getDurationText(item)}
                </Text>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>
    );
  }

  // Desktop/Tablet Table View
  return (
    <Box w="100%">
      <Box mb={4} px={4}>
        <Flex align="center" gap={3}>
          <Text fontSize="sm" fontWeight="600">
            Sort by:
          </Text>
          <Select
            size="sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="200px"
          >
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="suspendedBy">Suspended By</option>
          </Select>
          <Box ml={2}>
            {sortOrder === "asc" ? (
              <ChevronUpIcon w={5} h={5} />
            ) : (
              <ChevronDownIcon w={5} h={5} />
            )}
          </Box>
        </Flex>
      </Box>

      <Box
        borderWidth="1px"
        borderColor={border}
        borderRadius="lg"
        overflowX="auto"
        bg={tableBg}
        boxShadow="sm"
        w="100%"
      >
        <Table variant="simple" size={isTablet ? "sm" : "md"} w="100%">
          <Thead
            bg={headerBg}
            borderBottomWidth="2px"
            borderBottomColor={border}
          >
            <Tr>
              <Th
                color={color}
                fontWeight="bold"
                fontSize={isTablet ? "xs" : "sm"}
                cursor="pointer"
                onClick={() => handleSort("title")}
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={1}>
                  <Text>Title</Text>
                  {sortBy === "title" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon w={4} h={4} />
                    ) : (
                      <ChevronDownIcon w={4} h={4} />
                    ))}
                </HStack>
              </Th>
              <Th
                color={color}
                fontWeight="bold"
                fontSize={isTablet ? "xs" : "sm"}
                cursor="pointer"
                onClick={() => handleSort("status")}
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={1}>
                  <Text>Status</Text>
                  {sortBy === "status" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon w={4} h={4} />
                    ) : (
                      <ChevronDownIcon w={4} h={4} />
                    ))}
                </HStack>
              </Th>
              <Th
                color={color}
                fontWeight="bold"
                fontSize={isTablet ? "xs" : "sm"}
              >
                Reason
              </Th>
              <Th
                color={color}
                fontWeight="bold"
                fontSize={isTablet ? "xs" : "sm"}
                cursor="pointer"
                onClick={() => handleSort("suspendedBy")}
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={1}>
                  <Text>Suspended By</Text>
                  {sortBy === "suspendedBy" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon w={4} h={4} />
                    ) : (
                      <ChevronDownIcon w={4} h={4} />
                    ))}
                </HStack>
              </Th>
              <Th
                color={color}
                fontWeight="bold"
                fontSize={isTablet ? "xs" : "sm"}
                cursor="pointer"
                onClick={() => handleSort("createdAt")}
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={1}>
                  <Text>Duration</Text>
                  {sortBy === "createdAt" &&
                    (sortOrder === "asc" ? (
                      <ChevronUpIcon w={4} h={4} />
                    ) : (
                      <ChevronDownIcon w={4} h={4} />
                    ))}
                </HStack>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortSuspensions(suspensions).map((item, index) => (
              <Tr
                key={item?._id || item?.id || index}
                _hover={{ bg: hoverBg }}
                transition="background-color 0.2s ease"
                borderBottomWidth="1px"
                borderBottomColor={border}
              >
                <Td
                  fontWeight="600"
                  color={color}
                  maxW={isTablet ? "100px" : "150px"}
                  fontSize={isTablet ? "xs" : "sm"}
                >
                  {item.title || "Untitled Suspension"}
                </Td>
                <Td fontSize={isTablet ? "xs" : "sm"}>
                  {item.status && (
                    <Badge colorScheme={getStatusColor(item.status)} px={2}>
                      {item.status}
                    </Badge>
                  )}
                </Td>
                <Td
                  fontSize={isTablet ? "xs" : "sm"}
                  color="gray.600"
                  maxW={isTablet ? "120px" : "250px"}
                  noOfLines={2}
                >
                  {item.descriptions ||
                    item.reason ||
                    item.description ||
                    "No reason provided."}
                </Td>
                <Td fontSize={isTablet ? "xs" : "sm"}>
                  <Box>
                    <Box fontWeight="600">
                      {getSuspenderName(item.suspendBy)}
                    </Box>
                    {item.suspendBy?.employeeId && (
                      <Box fontSize="xs" color="gray.500">
                        ID: {item.suspendBy.employeeId}
                        {item.suspendBy.role && ` (${item.suspendBy.role})`}
                      </Box>
                    )}
                  </Box>
                </Td>
                <Td fontSize={isTablet ? "xs" : "sm"} color="gray.600">
                  {getDurationText(item)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EmployeeSuspensionSection;
