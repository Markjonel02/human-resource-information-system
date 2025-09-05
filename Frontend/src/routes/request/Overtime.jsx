import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Select,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Spinner,
  Text,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Checkbox,
  ButtonGroup,
  Tooltip,
  Avatar,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEye,
  FiCheck,
  FiX,
  FiClock,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiUsers,
} from "react-icons/fi";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";

// Constants
const OVERTIME_TYPES = [
  { value: "regular", label: "Regular Overtime" },
  { value: "holiday", label: "Holiday Overtime" },
  { value: "weekend", label: "Weekend Overtime" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const STATUS_ICONS = {
  pending: FiAlertCircle,
  approved: FiCheckCircle,
  rejected: FiXCircle,
};

const OverTimeAdmin = () => {
  // State management
  const [overtimes, setOvertimes] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("dateFrom");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedOvertimes, setSelectedOvertimes] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentOvertimeId, setCurrentOvertimeId] = useState(null);

  const {
    isOpen: isRejectModalOpen,
    onOpen: onRejectModalOpen,
    onClose: onRejectModalClose,
  } = useDisclosure();
  const {
    isOpen: isBulkModalOpen,
    onOpen: onBulkModalOpen,
    onClose: onBulkModalClose,
  } = useDisclosure();
  const toast = useToast();

  const handleApiError = useCallback(
    (error, defaultMessage) => {
      const message = error.response?.data?.message || defaultMessage;
      console.error("API Error:", error);
      toast({
        title: "Error",
        description: message,
        status: "error",
        duration: 5000,
        position: "top",
        isClosable: true,
      });
    },
    [toast]
  );

  // Function to fetch all overtime data for admin
  const loadOvertimeData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (departmentFilter) params.append("department", departmentFilter);

      const queryString = params.toString(); // ✅ Convert to query string
      const response = await axiosInstance.get(
        `/overtime/getEmployeeOvertime${queryString ? `?${queryString}` : ""}`
      );

      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setOvertimes(data);
    } catch (error) {
      handleApiError(error, "Failed to fetch overtime records");
      setOvertimes([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [handleApiError, statusFilter, departmentFilter]);

  // useEffect to call the data fetching function on component mount
  useEffect(() => {
    loadOvertimeData();
  }, [loadOvertimeData]);

  // Helper function to format date range
  const formatDateRange = useCallback((dateFrom, dateTo) => {
    const from = new Date(dateFrom).toLocaleDateString();
    const to = new Date(dateTo).toLocaleDateString();
    return from === to ? from : `${from} - ${to}`;
  }, []);

  // Helper function to calculate days between dates
  const calculateDays = useCallback((dateFrom, dateTo) => {
    const start = new Date(dateFrom);
    const end = new Date(dateTo);
    const timeDiff = end - start;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  // Memoized filtered and sorted data
  const processedOvertimes = useMemo(() => {
    const sorted = [...overtimes].sort((a, b) => {
      switch (sortBy) {
        case "dateFrom":
          return new Date(b.dateFrom) - new Date(a.dateFrom);
        case "hours":
          return parseFloat(b.hours) - parseFloat(a.hours);
        case "status":
          return a.status.localeCompare(b.status);
        case "employee":
          return `${a.employee?.firstname} ${a.employee?.lastname}`.localeCompare(
            `${b.employee?.firstname} ${b.employee?.lastname}`
          );
        case "days":
          const aDays = calculateDays(a.dateFrom, a.dateTo);
          const bDays = calculateDays(b.dateFrom, b.dateTo);
          return bDays - aDays;
        default:
          return 0;
      }
    });

    return sorted;
  }, [overtimes, sortBy, calculateDays]);

  // Memoized statistics
  const statistics = useMemo(() => {
    const total = overtimes.length;
    const pending = overtimes.filter((ot) => ot.status === "pending").length;
    const approved = overtimes.filter((ot) => ot.status === "approved").length;
    const rejected = overtimes.filter((ot) => ot.status === "rejected").length;
    const totalHours = overtimes.reduce(
      (sum, ot) => sum + parseFloat(ot.hours || 0),
      0
    );

    return { total, pending, approved, rejected, totalHours };
  }, [overtimes]);

  // Handle approve overtime
  const handleApprove = useCallback(
    async (overtimeId) => {
      if (isSubmitting) return;

      setIsSubmitting(true);
      try {
        await axiosInstance.put(`/overtime/admin/approve/${overtimeId}`);
        await loadOvertimeData();

        toast({
          title: "Success",
          description: "Overtime request approved successfully",
          status: "success",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
      } catch (error) {
        handleApiError(error, "Failed to approve overtime request");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, loadOvertimeData, toast, handleApiError]
  );

  // Handle reject overtime
  const handleReject = useCallback(
    async (overtimeId) => {
      setCurrentOvertimeId(overtimeId);
      setRejectionReason("");
      onRejectModalOpen();
    },
    [onRejectModalOpen]
  );

  // Submit rejection
  const submitRejection = useCallback(async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please provide a rejection reason",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.put(`/overtime/admin/reject/${currentOvertimeId}`, {
        rejectionReason: rejectionReason.trim(),
      });

      await loadOvertimeData();
      onRejectModalClose();
      setRejectionReason("");
      setCurrentOvertimeId(null);

      toast({
        title: "Success",
        description: "Overtime request rejected successfully",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      handleApiError(error, "Failed to reject overtime request");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    rejectionReason,
    currentOvertimeId,
    loadOvertimeData,
    onRejectModalClose,
    toast,
    handleApiError,
  ]);

  // Handle view overtime details
  const handleView = useCallback(
    (overtime) => {
      const dateRange = formatDateRange(overtime.dateFrom, overtime.dateTo);
      const days = calculateDays(overtime.dateFrom, overtime.dateTo);
      const employeeName = `${overtime.employee?.firstname || ""} ${
        overtime.employee?.lastname || ""
      }`.trim();

      toast({
        title: "Overtime Details",
        description: `${employeeName} - ${dateRange} - ${
          overtime.hours
        } hours over ${days} day${days > 1 ? "s" : ""} (${overtime.status})`,
        status: "info",
        duration: 5000,
        position: "top",
        isClosable: true,
      });
    },
    [toast, formatDateRange, calculateDays]
  );

  // Handle bulk selection
  const handleSelectAll = useCallback(
    (isChecked) => {
      if (isChecked) {
        const pendingIds = processedOvertimes
          .filter((ot) => ot.status === "pending")
          .map((ot) => ot._id);
        setSelectedOvertimes(pendingIds);
      } else {
        setSelectedOvertimes([]);
      }
    },
    [processedOvertimes]
  );

  const handleSelectOvertime = useCallback((overtimeId, isChecked) => {
    if (isChecked) {
      setSelectedOvertimes((prev) => [...prev, overtimeId]);
    } else {
      setSelectedOvertimes((prev) => prev.filter((id) => id !== overtimeId));
    }
  }, []);

  // Handle bulk approve
  const handleBulkApprove = useCallback(async () => {
    if (selectedOvertimes.length === 0) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post("/overtime/admin/bulkApprove", {
        overtimeIds: selectedOvertimes,
      });

      await loadOvertimeData();
      setSelectedOvertimes([]);
      onBulkModalClose();

      const { approved, conflicts, conflictingRequests } = response.data.data;

      let message = `${approved} overtime requests approved successfully`;
      if (conflicts > 0) {
        message += `. ${conflicts} requests had conflicts and were not approved.`;
      }

      toast({
        title: "Bulk Approval Complete",
        description: message,
        status: approved > 0 ? "success" : "warning",
        duration: 5000,
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      handleApiError(error, "Failed to bulk approve overtime requests");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedOvertimes,
    loadOvertimeData,
    onBulkModalClose,
    toast,
    handleApiError,
  ]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = [
      ...new Set(
        overtimes.map((ot) => ot.employee?.department).filter(Boolean)
      ),
    ];
    return depts.sort();
  }, [overtimes]);

  // Loading state
  if (isInitialLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading overtime records...</Text>
        </VStack>
      </Flex>
    );
  }

  const pendingCount = processedOvertimes.filter(
    (ot) => ot.status === "pending"
  ).length;
  const selectedCount = selectedOvertimes.length;

  return (
    <Box p={6} maxW="1400px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Heading size="lg" color="gray.800">
            Overtime Management
          </Heading>
          {selectedCount > 0 && (
            <ButtonGroup>
              <Button
                leftIcon={<CheckIcon />}
                colorScheme="green"
                onClick={onBulkModalOpen}
                isDisabled={isSubmitting}
              >
                Approve Selected ({selectedCount})
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedOvertimes([])}
              >
                Clear Selection
              </Button>
            </ButtonGroup>
          )}
        </Flex>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
          <Stat
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <StatLabel color="gray.600">Total Requests</StatLabel>
            <StatNumber color="blue.600">{statistics.total}</StatNumber>
            <StatHelpText>
              <Icon as={FiUsers} mr={1} />
              All employees
            </StatHelpText>
          </Stat>

          <Stat
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <StatLabel color="gray.600">Pending</StatLabel>
            <StatNumber color="orange.600">{statistics.pending}</StatNumber>
            <StatHelpText>
              <Icon as={FiAlertCircle} mr={1} />
              Awaiting approval
            </StatHelpText>
          </Stat>

          <Stat
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <StatLabel color="gray.600">Approved</StatLabel>
            <StatNumber color="green.600">{statistics.approved}</StatNumber>
            <StatHelpText>
              <Icon as={FiCheckCircle} mr={1} />
              Confirmed
            </StatHelpText>
          </Stat>

          <Stat
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <StatLabel color="gray.600">Rejected</StatLabel>
            <StatNumber color="red.600">{statistics.rejected}</StatNumber>
            <StatHelpText>
              <Icon as={FiXCircle} mr={1} />
              Declined
            </StatHelpText>
          </Stat>

          <Stat
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <StatLabel color="gray.600">Total Hours</StatLabel>
            <StatNumber color="purple.600">{statistics.totalHours}</StatNumber>
            <StatHelpText>
              <Icon as={FiClock} mr={1} />
              Hours logged
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Filters */}
        <HStack spacing={4} flexWrap="wrap">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            maxW="200px"
            bg="white"
          >
            <option value="dateFrom">Sort by Date</option>
            <option value="employee">Sort by Employee</option>
            <option value="hours">Sort by Hours</option>
            <option value="days">Sort by Days</option>
            <option value="status">Sort by Status</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
            bg="white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </Select>

          <Select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            maxW="200px"
            bg="white"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </HStack>

        {/* Bulk Actions */}
        {pendingCount > 0 && (
          <Box
            bg="blue.50"
            p={4}
            borderRadius="lg"
            border="1px"
            borderColor="blue.200"
          >
            <HStack justify="space-between">
              <HStack>
                <Checkbox
                  isChecked={selectedCount === pendingCount && pendingCount > 0}
                  isIndeterminate={
                    selectedCount > 0 && selectedCount < pendingCount
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                >
                  <Text fontSize="sm" fontWeight="medium" color="blue.700">
                    Select All Pending ({pendingCount})
                  </Text>
                </Checkbox>
              </HStack>
              {selectedCount > 0 && (
                <Text fontSize="sm" color="blue.600">
                  {selectedCount} of {pendingCount} selected
                </Text>
              )}
            </HStack>
          </Box>
        )}

        {/* Table */}
        {processedOvertimes.length === 0 ? (
          <Box
            bg="white"
            borderRadius="lg"
            p={12}
            textAlign="center"
            border="1px"
            borderColor="gray.200"
          >
            <Icon as={FiClock} boxSize={12} color="gray.300" mb={4} />
            <Heading size="md" color="gray.500" mb={2}>
              No Overtime Records
            </Heading>
            <Text color="gray.400">
              {statusFilter || departmentFilter
                ? `No overtime requests found for the selected filters.`
                : "No overtime requests have been submitted yet."}
            </Text>
          </Box>
        ) : (
          <Box
            bg="white"
            borderRadius="lg"
            overflow="hidden"
            shadow="sm"
            border="1px"
            borderColor="gray.200"
          >
            <Table variant="simple">
              <Thead bg={useColorModeValue("gray.50", "gray.700")}>
                <Tr>
                  <Th w="50px">
                    {pendingCount > 0 && (
                      <Checkbox
                        isChecked={
                          selectedCount === pendingCount && pendingCount > 0
                        }
                        isIndeterminate={
                          selectedCount > 0 && selectedCount < pendingCount
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    )}
                  </Th>
                  <Th>Employee</Th>
                  <Th>Date Range</Th>
                  <Th>Days</Th>
                  <Th>Hours</Th>
                  <Th>Type</Th>
                  <Th>Reason</Th>
                  <Th>Status</Th>
                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {processedOvertimes.map((overtime) => (
                  <Tr key={overtime._id} _hover={{ bg: "gray.50" }}>
                    <Td>
                      {overtime.status === "pending" && (
                        <Checkbox
                          isChecked={selectedOvertimes.includes(overtime._id)}
                          onChange={(e) =>
                            handleSelectOvertime(overtime._id, e.target.checked)
                          }
                        />
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={`${overtime.employee?.firstname || ""} ${
                            overtime.employee?.lastname || ""
                          }`}
                          bg="blue.500"
                        />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium" fontSize="sm">
                            {`${overtime.employee?.firstname || "Unknown"} ${
                              overtime.employee?.lastname || "Employee"
                            }`}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            ID: {overtime.employee?.employeeId || "N/A"}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {overtime.employee?.department || "No Department"}
                          </Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.400" />
                          <Text fontSize="sm" fontWeight="medium">
                            {formatDateRange(
                              overtime.dateFrom,
                              overtime.dateTo
                            )}
                          </Text>
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="gray">
                        {calculateDays(overtime.dateFrom, overtime.dateTo)} day
                        {calculateDays(overtime.dateFrom, overtime.dateTo) > 1
                          ? "s"
                          : ""}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Icon as={FiClock} color="gray.400" />
                        <Text fontWeight="medium">{overtime.hours} hrs</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="blue">
                        {OVERTIME_TYPES.find(
                          (t) => t.value === overtime.overtimeType
                        )?.label || overtime.overtimeType}
                      </Badge>
                    </Td>
                    <Td maxW="200px">
                      <Text noOfLines={2} fontSize="sm">
                        {overtime.reason}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={STATUS_COLORS[overtime.status]}
                        variant="subtle"
                        px={2}
                        py={1}
                      >
                        <HStack spacing={1}>
                          <Icon
                            as={STATUS_ICONS[overtime.status]}
                            boxSize={3}
                          />
                          <Text textTransform="capitalize">
                            {overtime.status}
                          </Text>
                        </HStack>
                      </Badge>
                      {overtime.status !== "pending" && overtime.approvedBy && (
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          by {overtime.approvedBy.firstname}{" "}
                          {overtime.approvedBy.lastname}
                        </Text>
                      )}
                    </Td>
                    <Td textAlign="center">
                      {overtime.status === "pending" ? (
                        <ButtonGroup size="sm" isAttached variant="outline">
                          <Tooltip label="Approve">
                            <IconButton
                              icon={<FiCheck />}
                              colorScheme="green"
                              onClick={() => handleApprove(overtime._id)}
                              isDisabled={isSubmitting}
                            />
                          </Tooltip>
                          <Tooltip label="Reject">
                            <IconButton
                              icon={<FiX />}
                              colorScheme="red"
                              onClick={() => handleReject(overtime._id)}
                              isDisabled={isSubmitting}
                            />
                          </Tooltip>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              isDisabled={isSubmitting}
                            />
                            <MenuList>
                              <MenuItem
                                icon={<FiEye />}
                                onClick={() => handleView(overtime)}
                              >
                                View Details
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </ButtonGroup>
                      ) : (
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<FiMoreVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<FiEye />}
                              onClick={() => handleView(overtime)}
                            >
                              View Details
                            </MenuItem>
                            {overtime.rejectionReason && (
                              <MenuItem
                                icon={<FiAlertCircle />}
                                onClick={() =>
                                  toast({
                                    title: "Rejection Reason",
                                    description: overtime.rejectionReason,
                                    status: "info",
                                    duration: 5000,
                                    position: "top",
                                    isClosable: true,
                                  })
                                }
                              >
                                View Rejection Reason
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Rejection Modal */}
      <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Reject Overtime Request</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            <FormControl>
              <FormLabel>Rejection Reason</FormLabel>
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this overtime request..."
                rows={4}
                resize="vertical"
                isDisabled={isSubmitting}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={onRejectModalClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={submitRejection}
              isLoading={isSubmitting}
              loadingText="Rejecting..."
              isDisabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Approve Confirmation Modal */}
      <AlertDialog
        isOpen={isBulkModalOpen}
        onClose={onBulkModalClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Bulk Approve Overtime Requests
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to approve {selectedCount} overtime
              requests?
              <Box mt={3} p={3} bg="yellow.50" borderRadius="md">
                <Text fontSize="sm" color="yellow.800">
                  <strong>Note:</strong> Requests with leave conflicts will be
                  automatically skipped and remain pending.
                </Text>
              </Box>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onBulkModalClose} isDisabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleBulkApprove}
                ml={3}
                isLoading={isSubmitting}
                loadingText="Processing..."
              >
                Approve Selected
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default OverTimeAdmin;
