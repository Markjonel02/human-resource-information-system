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
} from "@chakra-ui/react";
import axiosInstance from "../../../../lib/axiosInstance";

const EmployeeSuspensionSection = ({ color }) => {
  const tableBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const border = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const toast = useToast();

  const [suspensions, setSuspensions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuspensions();
  }, []);

  const fetchSuspensions = async () => {
    try {
      setLoading(true);
      // Changed endpoint to match the route
      const response = await axiosInstance.get(
        "/employeeSuspended/suspensions"
      );

      if (response.data.success) {
        setSuspensions(response.data.data || []);
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

  // Helper function to get suspender name from populated object
  const getSuspenderName = (suspendBy) => {
    if (!suspendBy) return "—";

    if (typeof suspendBy === "object") {
      const first = suspendBy.firstname || "";
      const last = suspendBy.lastname || "";
      return `${first} ${last}`.trim() || suspendBy.employeeEmail || "—";
    }
    return suspendBy;
  };

  if (loading) {
    return (
      <Center py={10}>
        <Spinner size="xl" color={color} thickness="4px" />
      </Center>
    );
  }

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      overflow="hidden"
      bg={tableBg}
      boxShadow="sm"
    >
      <Table variant="simple">
        <Thead bg={headerBg} borderBottomWidth="2px" borderBottomColor={border}>
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
              Suspended By
            </Th>
            <Th color={color} fontWeight="bold" fontSize="sm">
              Duration
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {suspensions && suspensions.length > 0 ? (
            suspensions.map((item, index) => (
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
                    <Badge colorScheme={getStatusColor(item.status)} px={2}>
                      {item.status}
                    </Badge>
                  )}
                </Td>
                <Td fontSize="sm" color="gray.600" maxW="250px" noOfLines={2}>
                  {item.descriptions ||
                    item.reason ||
                    item.description ||
                    "No reason provided."}
                </Td>
                <Td fontSize="sm">
                  <Box>
                    <Box fontWeight="600">
                      {getSuspenderName(item.suspendBy)}
                    </Box>
                    {item.suspendBy?.employeeId && (
                      <Box fontSize="xs" color="gray.500">
                        ID: {item.suspendBy.employeeId}
                      </Box>
                    )}
                  </Box>
                </Td>
                <Td fontSize="sm" color="gray.600">
                  {item.startDate && item.endDate
                    ? `${new Date(
                        item.startDate
                      ).toLocaleDateString()} - ${new Date(
                        item.endDate
                      ).toLocaleDateString()}`
                    : item.endDate
                    ? `Until ${new Date(item.endDate).toLocaleDateString()}`
                    : item.createdAt
                    ? `From ${new Date(item.createdAt).toLocaleDateString()}`
                    : "—"}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={5} textAlign="center" py={8}>
                <Text color="gray.500" fontSize="md">
                  No suspension records found
                </Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default EmployeeSuspensionSection;
