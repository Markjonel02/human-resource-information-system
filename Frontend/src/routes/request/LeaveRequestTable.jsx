import React from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Button,
  Avatar,
  HStack,
  Checkbox,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tooltip,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";

export const LeaveRequestTable = ({
  requests = [], // Array of all leave requests
  selectedIds = [], // Array of selected request IDs
  onToggleSelect, // Function to handle individual selection
  onToggleSelectAll, // Function to handle "select all" in the header
  onApprove,
  onReject,
}) => {
  const statusColor = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
  };

  // Helper to assign a color scheme to the leave type badge
  const getLeaveTypeColor = (leaveType) => {
    switch (leaveType) {
      case "Sick leave request":
        return "red";
      case "Excuse request":
        return "purple";
      case "Business Trip Request":
        return "blue";
      case "Loan request":
        return "teal";
      case "Ticket Request":
        return "cyan";
      default:
        return "gray";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isAllSelected =
    requests.length > 0 &&
    requests.filter((r) => r.status === "Pending").length > 0 &&
    selectedIds.length ===
      requests.filter((r) => r.status === "Pending").length;

  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="sm"
      overflow="hidden"
    >
      <TableContainer>
        <Table variant="simple" size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th w="40px">
                <Checkbox
                  isChecked={isAllSelected}
                  onChange={onToggleSelectAll}
                  colorScheme="blue"
                />
              </Th>
              <Th>Employee</Th>
              <Th>Leave Type</Th>
              <Th>Duration</Th>
              <Th>Dates</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {requests.length === 0 ? (
              <Tr>
                <Td colSpan={8} textAlign="center" py={6} color="gray.500">
                  No leave requests found.
                </Td>
              </Tr>
            ) : (
              requests.map((request) => {
                const {
                  id,
                  leaveType,
                  days,
                  startDate,
                  endDate,
                  reason,
                  requesterName,
                  requesterAvatarUrl,
                  status,
                } = request;

                const isSelected = selectedIds.includes(id);
                const isPending = status === "Pending";

                return (
                  <Tr
                    key={id}
                    _hover={{ bg: "gray.50" }}
                    transition="background 0.2s"
                  >
                    {/* Checkbox */}
                    <Td>
                      <Checkbox
                        isChecked={isSelected}
                        onChange={() => onToggleSelect(id)}
                        colorScheme="blue"
                        isDisabled={!isPending} // Usually only allow selecting pending requests
                      />
                    </Td>

                    {/* Employee Info */}
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={requesterName}
                          src={requesterAvatarUrl}
                        />
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.900"
                        >
                          {requesterName}
                        </Text>
                      </HStack>
                    </Td>

                    {/* Leave Type */}
                    <Td>
                      <Badge
                        colorScheme={getLeaveTypeColor(leaveType)}
                        variant="subtle"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                      >
                        {leaveType}
                      </Badge>
                    </Td>

                    {/* Duration */}
                    <Td>
                      <Text fontSize="sm" fontWeight="bold" color="gray.700">
                        {days} {days === 1 ? "Day" : "Days"}
                      </Text>
                    </Td>

                    {/* Dates */}
                    <Td>
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {formatDate(startDate)} - {formatDate(endDate)}
                      </Text>
                    </Td>

                    {/* Reason */}
                    <Td maxW="200px">
                      <Tooltip label={reason} hasArrow placement="top">
                        <Text fontSize="sm" color="gray.600" isTruncated>
                          {reason}
                        </Text>
                      </Tooltip>
                    </Td>

                    {/* Status */}
                    <Td>
                      <Badge
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme={statusColor[status]}
                        textTransform="capitalize"
                        variant="solid"
                        fontSize="xs"
                      >
                        {status}
                      </Badge>
                    </Td>

                    {/* Actions */}
                    <Td>
                      <Flex justify="center" gap={2}>
                        <Button
                          colorScheme="green"
                          size="sm"
                          onClick={() => onApprove(id)}
                          leftIcon={<CheckIcon boxSize={3} />}
                          isDisabled={!isPending}
                          variant={isPending ? "solid" : "ghost"}
                        >
                          Approve
                        </Button>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => onReject(id)}
                          leftIcon={<CloseIcon boxSize={3} />}
                          isDisabled={!isPending}
                          variant={isPending ? "solid" : "ghost"}
                        >
                          Reject
                        </Button>
                      </Flex>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
