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
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

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

  const fetchMyOffenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/employeeOffenses/my-offenses");
      setOffenses(res.data?.offenses || []);
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

  return (
    <Box
      borderWidth="1px"
      borderColor={border}
      borderRadius="lg"
      overflowX="auto"
      bg={tableBg}
      boxShadow="sm"
      maxW={950}
      mx="auto"
    >
      <Table variant="simple" size="sm">
        <Thead bg={headerBg} borderBottomWidth="2px" borderBottomColor={border}>
          <Tr>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Title
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Severity
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Category
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Status
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Description
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Employee
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Action Taken
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Recorded By
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
            >
              Date
            </Th>
            <Th
              textAlign="center"
              color={color}
              fontWeight="bold"
              fontSize="sm"
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
                color={color}
                maxW="150px"
                noOfLines={2}
              >
                {item.title || "Untitled Offense"}
              </Td>

              {/* Severity */}
              <Td textAlign="center">
                {item.severity ? (
                  <Badge
                    colorScheme={getSeverityColor(item.severity)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.severity}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Category */}
              <Td textAlign="center">
                {item.category ? (
                  <Badge
                    colorScheme={getCategoryColor(item.category)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.category}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Status */}
              <Td textAlign="center">
                {item.status ? (
                  <Badge
                    colorScheme={getStatusColor(item.status)}
                    borderRadius="full"
                    px={2}
                    fontSize="xs"
                  >
                    {item.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </Td>

              {/* Description */}
              <Td
                textAlign="center"
                fontSize="sm"
                color="gray.600"
                maxW="180px"
              >
                <Tooltip
                  label={item.description}
                  isDisabled={!item.description}
                >
                  <Box noOfLines={2}>{item.description || "—"}</Box>
                </Tooltip>
              </Td>

              {/* Employee */}
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

              {/* Action Taken */}
              <Td
                textAlign="center"
                fontSize="sm"
                color="gray.600"
                maxW="180px"
              >
                <Tooltip
                  label={item.actionTaken}
                  isDisabled={!item.actionTaken}
                >
                  <Box noOfLines={2}>{item.actionTaken || "—"}</Box>
                </Tooltip>
              </Td>

              {/* Recorded By */}
              <Td textAlign="center" fontSize="sm" color="gray.600">
                {item.recordedByName || item.recordedBy || "—"}
              </Td>

              {/* Date */}
              <Td textAlign="center" fontSize="sm" color="gray.600">
                {item.date
                  ? new Date(item.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </Td>

              {/* Notes */}
              <Td
                textAlign="center"
                fontSize="sm"
                color="gray.600"
                maxW="180px"
              >
                <Tooltip label={item.notes} isDisabled={!item.notes}>
                  <Box noOfLines={2}>{item.notes || "—"}</Box>
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default EmployeeOffenseSection;
