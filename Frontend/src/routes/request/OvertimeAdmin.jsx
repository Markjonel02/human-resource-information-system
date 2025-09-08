import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  SimpleGrid,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiCheck,
  FiX,
  FiEye,
  FiCalendar,
  FiClock,
  FiUsers,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import axiosInstance from "../../lib/axiosInstance";
/* ---------- Constants ---------- */
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

/* ---------- Presentational / Reusable subcomponents ---------- */
const StatsCard = ({ label, value, icon: IconComp, color = "blue" }) => (
  <Stat
    bg="white"
    p={4}
    borderRadius="lg"
    shadow="sm"
    border="1px"
    borderColor="gray.200"
  >
    <HStack justify="space-between">
      <HStack spacing={3}>
        {IconComp && <Icon as={IconComp} boxSize={5} color={`${color}.500`} />}
        <Box>
          <StatLabel color="gray.600" fontSize="sm">
            {label}
          </StatLabel>
          <StatNumber color={`${color}.600`}>{value}</StatNumber>
        </Box>
      </HStack>
    </HStack>
    <StatHelpText />
  </Stat>
);

const OvertimeRow = ({
  overtime,
  isSelected,
  onSelectChange,
  onApprove,
  onOpenReject,
  onView,
  isSubmitting,
}) => {
  const dateRange =
    overtime.dateFrom && overtime.dateTo
      ? `${new Date(overtime.dateFrom)
          .toLocaleDateString()
          .substring(0, 15)} - ${new Date(
          overtime.dateTo
        ).toLocaleDateString()}`
      : "-";

  const days =
    overtime.dateFrom && overtime.dateTo
      ? Math.ceil(
          (new Date(overtime.dateTo) - new Date(overtime.dateFrom)) /
            (1000 * 60 * 60 * 24)
        ) + 1
      : 1;

  return (
    <Tr key={overtime._id} _hover={{ bg: "gray.50" }}>
      <Td>
        {overtime.status === "pending" ? (
          <Checkbox
            isChecked={isSelected}
            onChange={(e) => onSelectChange(overtime._id, e.target.checked)}
          />
        ) : null}
      </Td>
      <Td>
        <VStack spacing={2} ml={0}>
          <Avatar
            size="sm"
            name={`${overtime.employee?.firstname || ""} ${
              overtime.employee?.lastname || ""
            }`}
            bg="blue.500"
          />
          <VStack align="start" spacing={0}>
            <Tooltip
              label={`${overtime.employee?.firstname || "Unknown"} ${
                overtime.employee?.lastname || ""
              }`}
            >
              <Text fontWeight="medium" fontSize="sm" isTruncated maxW="50px">
                {`${overtime.employee?.firstname || "Unknown"} ${
                  overtime.employee?.lastname || ""
                }`}
              </Text>
            </Tooltip>

            <Text fontSize="xs" color="gray.500">
              {overtime.employee?.employeeId || "ID: N/A"}
            </Text>
            <Tooltip label={overtime.employee?.department || "No Department"}>
              <Text fontSize="xs" color="gray.500" isTruncated maxW={10}>
                {overtime.employee?.department.substring(0, 15) ||
                  "No Department"}
              </Text>
            </Tooltip>
          </VStack>
        </VStack>
      </Td>

      <Td>
        <HStack spacing={2}>
          <Icon as={FiCalendar} color="gray.400" />
          <Tooltip label={dateRange}>
            <Text fontSize="sm" fontWeight={100} isTruncated maxW={20}>
              {dateRange}
            </Text>
          </Tooltip>
        </HStack>
      </Td>

      <Td>
        <Badge variant="outline" colorScheme="gray">
          {days} day{days > 1 ? "s" : ""}
        </Badge>
      </Td>

      <Td>
        <HStack>
          <Icon as={FiClock} color="gray.400" />
          <Text fontWeight="medium" isTruncated>
            {overtime.hours} hrs
          </Text>
        </HStack>
      </Td>

      <Td>
        <Badge variant="outline" colorScheme="blue" isTruncated maxW={20}>
          {OVERTIME_TYPES.find(
            (t) => t.value === overtime.overtimeType
          )?.label.substring(0, 8) || overtime.overtimeType.substring(0, 5)}
        </Badge>
      </Td>

      <Td maxW="200px">
        <Text noOfLines={2} fontSize="sm" isTruncated maxW={20}>
          {overtime.reason.substring(0, 10)}
        </Text>
      </Td>

      <Td>
        <Badge
          colorScheme={STATUS_COLORS[overtime.status] || "gray"}
          variant="subtle"
          px={2}
          py={1}
        >
          <HStack spacing={2}>
            <Icon
              as={STATUS_ICONS[overtime.status] || FiAlertCircle}
              boxSize={3}
            />
            <Text textTransform="capitalize">{overtime.status}</Text>
          </HStack>
        </Badge>
        {overtime.status !== "pending" && overtime.approvedBy && (
          <Text fontSize="xs" color="gray.500" mt={1}>
            by {overtime.approvedBy.firstname} {overtime.approvedBy.lastname}
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
                onClick={() => onApprove(overtime._id)}
                isDisabled={isSubmitting}
                aria-label="approve"
              />
            </Tooltip>
            <Tooltip label="Reject">
              <IconButton
                icon={<FiX />}
                colorScheme="red"
                onClick={() => onOpenReject(overtime)}
                isDisabled={isSubmitting}
                aria-label="reject"
              />
            </Tooltip>
            <Menu>
              <MenuButton as={IconButton} icon={<FiMoreVertical />} />
              <MenuList>
                <MenuItem icon={<FiEye />} onClick={() => onView(overtime)}>
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
            />
            <MenuList>
              <MenuItem icon={<FiEye />} onClick={() => onView(overtime)}>
                View Details
              </MenuItem>
              {overtime.rejectionReason && (
                <MenuItem
                  icon={<FiAlertCircle />}
                  onClick={() =>
                    alert(`Rejection reason:\n\n${overtime.rejectionReason}`)
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
  );
};

/* ---------- Main Component ---------- */
const OverTimeAdmin = () => {
  /* --- State & Hooks (always top-level) --- */
  const [overtimes, setOvertimes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("dateFrom");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [selectedOvertimes, setSelectedOvertimes] = useState([]);
  const [activeRejectTarget, setActiveRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const toast = useToast();

  const rejectModal = useDisclosure();
  const bulkApproveDialog = useDisclosure();

  /* --- API calls --- */
  const fetchOvertimes = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get("/overtime/getEmployeeOvertime"); // ensure route exists
      // backend might return array or { data: [...] }
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setOvertimes(data);
    } catch (err) {
      console.error("fetchOvertimes error:", err);
      toast({
        title: "Failed to load overtime requests",
        description: err.response?.data?.message || "An error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      setOvertimes([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const approveOvertime = useCallback(
    async (id) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.put(`/admin/overtime/adminApprove/${id}`, {
          status: "approved",
        });
        await fetchOvertimes();
        toast({
          title: "Approved",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        console.error("approve error:", err);
        toast({
          title: "Failed to approve",
          description: err.response?.data?.message || "An error occurred",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchOvertimes, toast]
  );

  const rejectOvertime = useCallback(
    async (id, reason) => {
      setIsSubmitting(true);
      try {
        await axiosInstance.put(`/overtime/updateStatus/${id}`, {
          status: "rejected",
          reason,
        });
        await fetchOvertimes();
        toast({
          title: "Rejected",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      } catch (err) {
        console.error("reject error:", err);
        toast({
          title: "Failed to reject",
          description: err.response?.data?.message || "An error occurred",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchOvertimes, toast]
  );

  
  const bulkApprove = useCallback(async () => {
    if (!selectedOvertimes.length) return;
    setIsSubmitting(true);

    try {
      // Call single-approve endpoint in parallel for each selected id.
      // This avoids depending on a separate bulk route and surfaces per-id errors.
      const results = await Promise.allSettled(
        selectedOvertimes.map((id) =>
          axiosInstance.put(`/admin/overtime/adminApprove/${id}`, {
            status: "approved",
          })
        )
      );

      const approved = [];
      const failed = [];

      results.forEach((r, idx) => {
        const id = selectedOvertimes[idx];
        if (r.status === "fulfilled" && r.value?.data?.success) {
          approved.push(id);
        } else {
          const errMsg =
            r.status === "rejected"
              ? r.reason?.response?.data?.message || r.reason?.message
              : r.value?.data?.message || "Unknown error";
          failed.push({ id, message: errMsg });
        }
      });

      // Refresh list
      await fetchOvertimes();

      // Clear only the successfully approved ids from selection
      setSelectedOvertimes((prev) =>
        prev.filter((id) => !approved.includes(id))
      );

      // Show toast summary
      toast({
        title: "Bulk approve result",
        description: `${approved.length} approved, ${failed.length} failed.`,
        status: failed.length === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });

      if (failed.length > 0) {
        console.error("Bulk approve failures:", failed);
      }
    } catch (err) {
      console.error("bulk approve error:", err);
      toast({
        title: "Bulk action failed",
        description: err.response?.data?.message || "An error occurred",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
      bulkApproveDialog.onClose();
    }
  }, [selectedOvertimes, fetchOvertimes, toast, bulkApproveDialog]);
 

  /* --- Effects --- */
  useEffect(() => {
    fetchOvertimes();
  }, [fetchOvertimes]);

  /* --- Derived / memoized data --- */
  const statistics = useMemo(() => {
    const total = overtimes.length;
    const pending = overtimes.filter((o) => o.status === "pending").length;
    const approved = overtimes.filter((o) => o.status === "approved").length;
    const rejected = overtimes.filter((o) => o.status === "rejected").length;
    const totalHours = overtimes.reduce(
      (s, o) => s + parseFloat(o.hours || 0),
      0
    );
    return { total, pending, approved, rejected, totalHours };
  }, [overtimes]);

  const pendingCount = statistics.pending;
  const selectedCount = selectedOvertimes.length;

  const processedOvertimes = useMemo(() => {
    let list = [...overtimes];
    if (statusFilter) list = list.filter((o) => o.status === statusFilter);
    if (departmentFilter)
      list = list.filter((o) => o.employee?.department === departmentFilter);

    switch (sortBy) {
      case "employee":
        return list.sort((a, b) =>
          (a.employee?.firstname || "").localeCompare(
            b.employee?.firstname || ""
          )
        );
      case "hours":
        return list.sort(
          (a, b) => parseFloat(b.hours || 0) - parseFloat(a.hours || 0)
        );
      case "days":
        return list.sort(
          (a, b) =>
            new Date(b.dateTo || b.dateFrom) - new Date(a.dateTo || a.dateFrom)
        );
      default:
        return list.sort(
          (a, b) =>
            new Date(b.dateFrom || b.createdAt) -
            new Date(a.dateFrom || a.createdAt)
        );
    }
  }, [overtimes, statusFilter, departmentFilter, sortBy]);

  /* --- Handlers for selection, view, reject modal --- */
  const handleSelectAll = (checked) => {
    if (checked) {
      const ids = processedOvertimes
        .filter((o) => o.status === "pending")
        .map((o) => o._id);
      setSelectedOvertimes(ids);
    } else {
      setSelectedOvertimes([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    setSelectedOvertimes((prev) => {
      if (checked) return [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const onOpenReject = (overtime) => {
    setActiveRejectTarget(overtime);
    setRejectionReason("");
    rejectModal.onOpen();
  };

  const submitRejection = async () => {
    if (!activeRejectTarget) return;
    await rejectOvertime(activeRejectTarget._id, rejectionReason.trim());
    setActiveRejectTarget(null);
    setRejectionReason("");
    rejectModal.onClose();
  };

  const handleView = (overtime) => {
    toast({
      title: "Overtime Details",
      description: `${overtime.employee?.firstname || ""} ${
        overtime.employee?.lastname || ""
      } — ${overtime.hours} hrs`,
      status: "info",
      duration: 5000,
      position: "top",
      isClosable: true,
    });
  };

  /* --- Conditional UI while loading --- */
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
          <Text>Loading overtime requests...</Text>
        </VStack>
      </Flex>
    );
  }

  /* ---------- Render ---------- */
  return (
    <Box p={6} mx="auto">
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Heading size="lg" color="gray.800">
            Overtime Management
          </Heading>

          {selectedCount > 0 ? (
            <ButtonGroup>
              <Button
                leftIcon={<FiCheck />}
                colorScheme="green"
                onClick={() => bulkApproveDialog.onOpen()}
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
          ) : null}
        </Flex>

        <SimpleGrid columns={{ base: 2, md: 2, lg: 5 }} spacing={4}>
          <StatsCard
            label="Total Requests"
            value={statistics.total}
            icon={FiUsers}
            color="blue"
          />
          <StatsCard
            label="Pending"
            value={statistics.pending}
            icon={FiAlertCircle}
            color="orange"
          />
          <StatsCard
            label="Approved"
            value={statistics.approved}
            icon={FiCheckCircle}
            color="green"
          />
          <StatsCard
            label="Rejected"
            value={statistics.rejected}
            icon={FiXCircle}
            color="red"
          />
          <StatsCard
            label="Total Hours"
            value={statistics.totalHours}
            icon={FiClock}
            color="purple"
          />
        </SimpleGrid>

        <HStack spacing={4} flexWrap="wrap">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="dateFrom">Sort by Date</option>
            <option value="employee">Sort by Employee</option>
            <option value="hours">Sort by Hours</option>
            <option value="days">Sort by Days</option>
            <option value="status">Sort by Status</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Finance">Finance</option>
          </select>
        </HStack>

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
                ? "No overtime requests found for the selected filters."
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
              <Thead>
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

                  {/* Always visible */}
                  <Th>Employee</Th>
                  <Th display={{ base: "none", md: "table-cell" }}>
                    Date Range
                  </Th>
                  <Th display={{ base: "none", md: "table-cell" }}>Days</Th>
                  <Th display={{ base: "none", md: "table-cell" }}>Hours</Th>
                  <Th display={{ base: "none", md: "table-cell" }}>Type</Th>
                  <Th display={{ base: "none", md: "table-cell" }}>Reason</Th>
                  <Th>Status</Th>

                  <Th textAlign="center">Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {processedOvertimes.map((ot) => (
                  <OvertimeRow
                    key={ot._id}
                    overtime={ot}
                    isSelected={selectedOvertimes.includes(ot._id)}
                    onSelectChange={handleSelectOne}
                    onApprove={approveOvertime}
                    onOpenReject={onOpenReject}
                    onView={handleView}
                    isSubmitting={isSubmitting}
                  />
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={rejectModal.onClose}
        isCentered
      >
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
              onClick={rejectModal.onClose}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={submitRejection}
              isLoading={isSubmitting}
              isDisabled={!rejectionReason.trim()}
            >
              Reject Request
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Approve Dialog */}
      <AlertDialog
        isOpen={bulkApproveDialog.isOpen}
        onClose={bulkApproveDialog.onClose}
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
              <Button
                onClick={bulkApproveDialog.onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={bulkApprove}
                ml={3}
                isLoading={isSubmitting}
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
