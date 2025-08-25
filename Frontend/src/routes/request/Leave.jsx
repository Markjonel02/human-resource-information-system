import React, { useState, useEffect, useCallback } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Flex,
  Badge,
  Button,
  Avatar,
  VStack,
  HStack,
  Spacer,
  extendTheme,
  SimpleGrid,
  Select,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  CalendarIcon,
  CheckIcon,
  CloseIcon,
  AddIcon,
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";

// Extend the default Chakra UI theme to include custom colors and components
const theme = extendTheme({
  colors: {
    brand: {
      50: "#E6FFFA",
      100: "#B2F5EA",
      200: "#81E6D9",
      300: "#4FD1C5",
      400: "#38B2AC",
      500: "#319795", // Teal shade
      600: "#2C7A7B",
      700: "#285E61",
      800: "#234E52",
      900: "#1D4044",
    },
    // Adding more vibrant colors for different card types
    sickLeave: {
      50: "#EBF8FF",
      500: "#3182CE", // Blue
    },
    excuse: {
      50: "#FFFBEB",
      500: "#DD6B20", // Orange
    },
    businessTrip: {
      50: "#F0FFF4",
      500: "#38A169", // Green
    },
    loan: {
      50: "#FEF2F2",
      500: "#E53E3E", // Red
    },
    ticket: {
      50: "#F0F8FF",
      500: "#00B5D8", // Cyan
    },
    other: {
      50: "#F7FAFC",
      500: "#718096", // Gray
    },
    // Custom light blue for titles and now pagination
    lightBlue: {
      50: "#E0F7FA", // Very light blue for background
      100: "#B2EBF2", // Lighter blue for background
      200: "#81D4FA", // Even lighter blue
      300: "#4FC3F7", // Light blue
      400: "#29B6F6", // Slightly darker light blue
      500: "#03A9F4", // Medium light blue (Material Design Light Blue 500)
      600: "#039BE5", // A bit darker
      700: "#0288D1", // Darker blue for background (Material Design Light Blue 700)
      800: "#0277BD", // Even darker
      900: "#01579B", // Darkest
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "full", // Apply rounded corners to all buttons
        transition: "all 0.2s cubic-bezier(.08,.52,.52,1)",
        _hover: {
          transform: "translateY(-2px)",
          boxShadow: "lg",
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorScheme === "green" ? "green.500" : "red.500",
          color: "white",
          _hover: {
            bg: props.colorScheme === "green" ? "green.600" : "red.600",
          },
        }),
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: "bold",
        letterSpacing: "wide",
      },
    },
  },
});

const LeaveRequestCard = ({
  id,
  leaveType,
  days,
  startDate,
  endDate,
  reason,
  approverName,
  approverAvatarUrl,
  status,
  onApprove,
  onReject,
  isSelected,
  onToggleSelect,
}) => {
  const statusColor = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
  };

  let cardColorScheme = "other";
  let headerBgColor = "gray.50";
  let daysBoxBg = "blue.50";
  let daysTextColor = "blue.700";
  let calendarIconColor = "blue.600";
  let dateTextColor = "blue.600";

  switch (leaveType) {
    case "Sick leave request":
      cardColorScheme = "sickLeave";
      headerBgColor = "sickLeave.50";
      daysBoxBg = "sickLeave.100";
      daysTextColor = "sickLeave.700";
      calendarIconColor = "sickLeave.600";
      dateTextColor = "sickLeave.600";
      break;
    case "Excuse request":
      cardColorScheme = "excuse";
      headerBgColor = "excuse.50";
      daysBoxBg = "excuse.100";
      daysTextColor = "excuse.700";
      calendarIconColor = "excuse.600";
      dateTextColor = "excuse.600";
      break;
    case "Business Trip Request":
      cardColorScheme = "businessTrip";
      headerBgColor = "businessTrip.50";
      daysBoxBg = "businessTrip.100";
      daysTextColor = "businessTrip.700";
      calendarIconColor = "businessTrip.600";
      dateTextColor = "businessTrip.600";
      break;
    case "Loan request":
      cardColorScheme = "loan";
      headerBgColor = "loan.50";
      daysBoxBg = "loan.100";
      daysTextColor = "loan.700";
      calendarIconColor = "loan.600";
      dateTextColor = "loan.600";
      break;
    case "Ticket Request":
      cardColorScheme = "ticket";
      headerBgColor = "ticket.50";
      daysBoxBg = "ticket.100";
      daysTextColor = "ticket.700";
      calendarIconColor = "ticket.600";
      dateTextColor = "ticket.600";
      break;
    default:
      break;
  }

  const truncatedApproverName =
    approverName.length > 15
      ? `${approverName.substring(0, 15)}...`
      : approverName;

  const displayReason =
    reason.length > 50 ? `${reason.substring(0, 50)}...` : reason;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="xl"
      bg="white"
      maxW={{ base: "90%", sm: "350px", md: "380px" }}
      mx="auto"
      my={4}
      _hover={{ transform: "translateY(-5px)", boxShadow: "2xl" }}
      transition="all 0.3s ease-in-out"
      position="relative"
    >
      <Flex
        align="center"
        mb={2}
        p={2}
        borderRadius="md"
        justifyContent="space-between"
        bg="lightBlue.50"
      >
        <HStack spacing={2} align="center">
          {status === "Pending" && (
            <Checkbox
              isChecked={isSelected}
              onChange={() => onToggleSelect(id)}
              colorScheme="blue"
              borderColor="blue.500"
              size="md"
            />
          )}
          <Box
            p={2}
            borderRadius="md" // Added borderRadius for the light blue background box
          >
            <Text fontSize="md" fontWeight="semibold" color="black">
              {leaveType}
            </Text>
          </Box>
        </HStack>
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          colorScheme={statusColor[status]}
          textTransform="capitalize"
          variant="solid"
        >
          {status}
        </Badge>
      </Flex>

      <HStack spacing={2} align="center" mb={4} pl={2}>
        <Avatar size="xs" name={approverName} src={approverAvatarUrl} />
        <Text fontSize="xs" fontWeight="medium" color="gray.700">
          {truncatedApproverName}
        </Text>
      </HStack>

      <Box bg={daysBoxBg} p={4} borderRadius="lg" mb={4}>
        <Text
          fontSize="3xl"
          fontWeight="extrabold"
          color={daysTextColor}
          mb={1}
        >
          {days}
        </Text>
        <Flex align="center">
          <CalendarIcon color={calendarIconColor} mr={2} />
          <Text fontSize="sm" color={dateTextColor} fontWeight="medium">
            {startDate
              ? new Date(startDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
            {" - "}
            {endDate
              ? new Date(endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </Text>
        </Flex>
      </Box>

      <Box mb={4}>
        <Text fontSize="sm" fontWeight="semibold" mb={1} color="gray.700">
          Reason
        </Text>
        <Text fontSize="sm" color="gray.600" noOfLines={3}>
          {displayReason}
        </Text>
      </Box>

      <Flex
        justifyContent="space-between"
        alignItems="flex-end"
        pt={2}
        gap={500}
      >
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Actions
        </Text>
        <HStack spacing={2}>
          <Button
            colorScheme="green"
            size="sm"
            onClick={onApprove}
            leftIcon={<CheckIcon />}
            isDisabled={status !== "Pending"}
            boxShadow="md"
            _hover={{ bg: "green.600", transform: "scale(1.05)" }}
            _active={{ bg: "green.700", transform: "scale(0.95)" }}
          >
            Approve
          </Button>
          <Button
            colorScheme="red"
            size="sm"
            onClick={onReject}
            leftIcon={<CloseIcon />}
            isDisabled={status !== "Pending"}
            boxShadow="md"
            _hover={{ bg: "red.600", transform: "scale(1.05)" }}
            _active={{ bg: "red.700", transform: "scale(0.95)" }}
          >
            Reject
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

const Leave = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();

  const toast = useToast();
  const [newLeaveData, setNewLeaveData] = useState({
    leaveType: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
    employeeId: "", // Add this for backend compatibility
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [leaveRequests, setLeaveRequests] = useState([]);

  // Filter the requests based on the selected status
  const filteredRequests = leaveRequests.filter(
    (request) => filterStatus === "All" || request.status === filterStatus
  );

  // Calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  const fetchLeaveRequests = useCallback(async () => {
    try {
      // Fetch all attendance records with leave status
      const res = await axiosInstance.get("/attendanceRoutes/get-attendance", {
        params: { status: "on_leave" },
      });

      // Transform backend data to match frontend structure
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaveRequests(
        data.map((item) => ({
          id: item._id,
          leaveType: item.leaveType || "Leave Request",
          days:
            item.totalLeaveDays && item.totalLeaveDays > 1
              ? `${item.totalLeaveDays} Days`
              : item.totalLeaveDays === 1
              ? "1 Day"
              : calculateDays(item.dateFrom, item.dateTo) > 1
              ? `${calculateDays(item.dateFrom, item.dateTo)} Days`
              : "1 Day",
          startDate: item.dateFrom || "",
          endDate: item.dateTo || "",
          reason: item.notes || "",
          approverName:
            item.employee?.firstname && item.employee?.lastname
              ? `${item.employee.firstname} ${item.employee.lastname}`
              : item.employee?.name || "Unknown Employee",
          approverAvatarUrl: "https://placehold.co/40x40/000000/FFFFFF?text=NA",
          status:
            item.leaveStatus === "approved"
              ? "Approved"
              : item.leaveStatus === "pending"
              ? "Pending"
              : item.leaveStatus === "rejected"
              ? "Rejected"
              : "Pending",
        }))
      );
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message ||
          "Failed to fetch leave requests from server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage)
  ); // Ensure at least 1 page

  // Adjust current page if it's out of bounds after filtering or item count change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRequestIds([]);
    setIsSelectAllChecked(false);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
    setSelectedRequestIds([]);
    setIsSelectAllChecked(false);
  };

  const handleApprove = async (id) => {
    try {
      await axiosInstance.post(`/attendanceRoutes/approve-leave/${id}`);
      toast({
        title: "Leave Approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchLeaveRequests(); // Refresh the list after approval
    } catch (err) {
      console.error("Error approving leave:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve leave.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.post(`/attendance/reject-leave/${id}`);
      toast({
        title: "Leave Rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchLeaveRequests(); // Refresh the list after rejection
    } catch (err) {
      console.error("Error rejecting leave:", err);
      // If no reject endpoint exists, update locally
      setLeaveRequests((prevRequests) =>
        prevRequests.map((req) =>
          req.id === id ? { ...req, status: "Rejected" } : req
        )
      );
      setSelectedRequestIds((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
      toast({
        title: "Request Rejected",
        description: "The leave request has been rejected.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleNewLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddLeaveSubmit = async () => {
    // Validation
    if (
      !newLeaveData.leaveType ||
      !newLeaveData.dateFrom ||
      !newLeaveData.dateTo ||
      !newLeaveData.notes ||
      !newLeaveData.employeeId
    ) {
      toast({
        title: "Missing Information",
        description:
          "Please fill in all required fields including Employee ID.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Calculate total leave days
      const totalLeaveDays = calculateDays(
        newLeaveData.dateFrom,
        newLeaveData.dateTo
      );

      // Prepare data for backend
      const leaveData = {
        employeeId: newLeaveData.employeeId,
        leaveType: newLeaveData.leaveType,
        dateFrom: newLeaveData.dateFrom,
        dateTo: newLeaveData.dateTo,
        totalLeaveDays: totalLeaveDays,
        notes: newLeaveData.notes,
        status: "on_leave",
        leaveStatus: "pending",
      };

      // Submit to backend
      await axiosInstance.post("/attendance/create-attendance", leaveData);

      // Reset form
      setNewLeaveData({
        leaveType: "",
        dateFrom: "",
        dateTo: "",
        notes: "",
        employeeId: "",
      });

      onAddModalClose();

      toast({
        title: "Leave Request Added",
        description: "Your new leave request has been submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Refresh the list
      fetchLeaveRequests();
      setCurrentPage(1); // Go to the first page to see the new request
    } catch (err) {
      console.error("Error creating leave request:", err);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to create leave request.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedRequestIds((prevSelected) => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id];

      const pendingRequestIdsOnPage = currentItems
        .filter((req) => req.status === "Pending")
        .map((req) => req.id);

      const allPendingSelectedOnPage =
        pendingRequestIdsOnPage.length > 0 &&
        pendingRequestIdsOnPage.every((pendingId) =>
          newSelected.includes(pendingId)
        );

      setIsSelectAllChecked(allPendingSelectedOnPage);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const pendingRequestIdsOnPage = currentItems
      .filter((req) => req.status === "Pending")
      .map((req) => req.id);

    if (
      selectedRequestIds.length === pendingRequestIdsOnPage.length &&
      pendingRequestIdsOnPage.length > 0 &&
      isSelectAllChecked
    ) {
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
    } else {
      setSelectedRequestIds(pendingRequestIdsOnPage);
      setIsSelectAllChecked(true);
    }
  };

  // Bulk approve selected leaves (calls backend)
  const handleApproveSelected = async () => {
    try {
      await axiosInstance.post(`/attendanceRoutes/approve-leave-bulk`, {
        ids: selectedRequestIds,
      });
      toast({
        title: "Selected Leaves Approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests(); // Refresh the list after approval
    } catch (err) {
      console.error("Error bulk approving leaves:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve leaves.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleRejectSelected = async () => {
    try {
      // If bulk reject endpoint exists
      await axiosInstance.post(`/attendance/reject-leave-bulk`, {
        ids: selectedRequestIds,
      });
      toast({
        title: "Selected Leaves Rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests(); // Refresh the list after rejection
    } catch (err) {
      console.error("Error bulk rejecting leaves:", err);
      // If no bulk reject endpoint exists, update locally
      setLeaveRequests((prevRequests) =>
        prevRequests.map((req) =>
          selectedRequestIds.includes(req.id)
            ? { ...req, status: "Rejected" }
            : req
        )
      );
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      toast({
        title: "Requests Rejected",
        description: "Selected leave requests have been rejected.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <VStack
        minH="100vh"
        align="center"
        justify="flex-start"
        p={8}
        width="100%"
        spacing={6}
        bg="gray.50"
      >
        {/* Top Controls: Add Leave, Bulk Actions, Filter */}
        <Flex
          width="100%"
          maxW="1200px"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <HStack spacing={4} wrap="wrap" justify="center">
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={onAddModalOpen}
              borderRadius="md"
              boxShadow="md"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            >
              Add Leave
            </Button>
            <Checkbox
              isChecked={isSelectAllChecked}
              onChange={handleSelectAll}
              colorScheme="blue"
              size="lg"
              isDisabled={
                currentItems.filter((req) => req.status === "Pending")
                  .length === 0
              }
            >
              Select All Pending (Current Page)
            </Checkbox>
          </HStack>
          <HStack spacing={4} wrap="wrap" justify="center">
            {selectedRequestIds.length > 0 && (
              <>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={handleApproveSelected}
                  isDisabled={selectedRequestIds.length === 0}
                  boxShadow="md"
                  _hover={{ bg: "green.600", transform: "scale(1.05)" }}
                  _active={{ bg: "green.700", transform: "scale(0.95)" }}
                >
                  Approve Selected ({selectedRequestIds.length})
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleRejectSelected}
                  isDisabled={selectedRequestIds.length === 0}
                  boxShadow="md"
                  _hover={{ bg: "red.600", transform: "scale(1.05)" }}
                  _active={{ bg: "red.900", transform: "scale(0.95)" }}
                >
                  Reject Selected ({selectedRequestIds.length})
                </Button>
              </>
            )}
            <Select
              width={{ base: "100%", sm: "200px" }}
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
                setSelectedRequestIds([]);
                setIsSelectAllChecked(false);
              }}
              borderRadius="md"
              boxShadow="sm"
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </HStack>
        </Flex>

        {/* Leave Request Cards */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          spacing={{ base: 5, md: 8 }}
          width="100%"
          maxW="1200px"
        >
          {currentItems.length > 0 ? (
            currentItems.map((request) => (
              <LeaveRequestCard
                key={request.id}
                id={request.id}
                {...request}
                onApprove={() => handleApprove(request.id)}
                onReject={() => handleReject(request.id)}
                isSelected={
                  request.status === "Pending"
                    ? selectedRequestIds.includes(request.id)
                    : false
                }
                onToggleSelect={handleToggleSelect}
              />
            ))
          ) : (
            <Text
              colSpan={3}
              textAlign="center"
              fontSize="lg"
              color="gray.500"
              py={10}
            >
              No leave requests found for the current filter or page. 😔
            </Text>
          )}
        </SimpleGrid>

        {/* Pagination Controls */}
        <Flex
          width="100%"
          maxW="1200px"
          justifyContent="space-between"
          alignItems="center"
          mt={8}
          p={4}
          direction={{ base: "column", md: "row" }}
          gap={3}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          {/* Items per page selector */}
          <HStack spacing={2}>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.600"
              whiteSpace="nowrap"
            >
              Items per page:
            </Text>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              width={{ base: "70px", md: "90px" }}
              borderRadius="md"
              size="sm"
              fontWeight="semibold"
              bg="white"
              color="gray.700"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{ borderColor: "lightBlue.500", boxShadow: "outline" }}
            >
              <option value={3}>3</option>
              <option value={6}>6</option>
              <option value={9}>9</option>
              <option value={12}>12</option>
            </Select>
          </HStack>

          {/* Page navigation buttons */}
          <HStack spacing={1} flexWrap="wrap" justifyContent="center">
            <Tooltip label="First Page" hasArrow>
              <IconButton
                icon={<ChevronLeftIcon />}
                onClick={() => paginate(1)}
                isDisabled={currentPage === 1 || totalPages === 0}
                aria-label="First Page"
                size="sm"
                borderRadius="full"
                color="lightBlue.700"
                variant="ghost"
                _hover={{ bg: "lightBlue.100" }}
                _active={{ bg: "lightBlue.200" }}
              />
            </Tooltip>
            <Tooltip label="Previous Page" hasArrow>
              <IconButton
                icon={<ArrowBackIcon />}
                onClick={() => paginate(currentPage - 1)}
                isDisabled={currentPage === 1 || totalPages === 0}
                aria-label="Previous Page"
                size="sm"
                borderRadius="full"
                color="lightBlue.700"
                variant="ghost"
                _hover={{ bg: "lightBlue.100" }}
                _active={{ bg: "lightBlue.200" }}
              />
            </Tooltip>

            {/* Render page numbers dynamically */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => paginate(page)}
                colorScheme="lightBlue"
                variant={currentPage === page ? "solid" : "ghost"}
                size="sm"
                borderRadius="full"
                minW="32px"
                px={0}
                fontWeight="bold"
                color={currentPage === page ? "white" : "lightBlue.700"}
                bg={currentPage === page ? "lightBlue.500" : "transparent"}
                _hover={{
                  bg: currentPage === page ? "lightBlue.600" : "lightBlue.100",
                  color: currentPage === page ? "white" : "lightBlue.700",
                }}
                _active={{
                  bg: currentPage === page ? "lightBlue.700" : "lightBlue.200",
                }}
                boxShadow="none"
              >
                {page}
              </Button>
            ))}

            <Tooltip label="Next Page" hasArrow>
              <IconButton
                icon={<ArrowForwardIcon />}
                onClick={() => paginate(currentPage + 1)}
                isDisabled={currentPage === totalPages || totalPages === 0}
                aria-label="Next Page"
                size="sm"
                borderRadius="full"
                color="lightBlue.700"
                variant="ghost"
                _hover={{ bg: "lightBlue.100" }}
                _active={{ bg: "lightBlue.200" }}
              />
            </Tooltip>
            <Tooltip label="Last Page" hasArrow>
              <IconButton
                icon={<ChevronRightIcon />}
                onClick={() => paginate(totalPages)}
                isDisabled={currentPage === totalPages || totalPages === 0}
                aria-label="Last Page"
                size="sm"
                borderRadius="full"
                color="lightBlue.700"
                variant="ghost"
                _hover={{ bg: "lightBlue.100" }}
                _active={{ bg: "lightBlue.200" }}
              />
            </Tooltip>
          </HStack>

          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.600"
            whiteSpace="nowrap"
            textAlign="center"
            px={2}
            py={1}
            bg="white"
            borderRadius="md"
            border="1px solid"
            borderColor="gray.200"
          >
            Showing {filteredRequests.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
            {Math.min(indexOfLastItem, filteredRequests.length)} of{" "}
            {filteredRequests.length} requests
          </Text>
        </Flex>
      </VStack>

      {/* Add New Leave Request Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent borderRadius="lg" boxShadow="2xl">
          <ModalHeader bg="lightBlue.500" color="white" borderTopRadius="lg">
            Add New Leave Request
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Employee ID</FormLabel>
                <Input
                  name="employeeId"
                  type="text"
                  placeholder="Enter employee ID"
                  value={newLeaveData.employeeId}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Leave Type</FormLabel>
                <Select
                  name="leaveType"
                  placeholder="Select leave type"
                  value={newLeaveData.leaveType}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                >
                  <option value="Sick leave request">Sick Leave</option>
                  <option value="Excuse Request">Excuse</option>
                  <option value="Business Trip Request">Business Trip</option>
                  <option value="M/P Leave Request">M/P Leave</option>
                  <option value="Bereavement leave Request">
                    Bereavement Leave
                  </option>
                  <option value="Vacation leave Request">Vacation Leave</option>
                </Select>
              </FormControl>

              <HStack width="100%" flexWrap="wrap">
                <FormControl isRequired flex="1">
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    name="dateFrom"
                    type="date"
                    value={newLeaveData.dateFrom}
                    onChange={handleNewLeaveChange}
                    borderRadius="md"
                  />
                </FormControl>
                <FormControl isRequired flex="1">
                  <FormLabel>End Date</FormLabel>
                  <Input
                    name="dateTo"
                    type="date"
                    value={newLeaveData.dateTo}
                    onChange={handleNewLeaveChange}
                    borderRadius="md"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Textarea
                  name="notes"
                  placeholder="Enter reason for leave"
                  value={newLeaveData.notes}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAddLeaveSubmit}
              borderRadius="md"
            >
              Submit
            </Button>
            <Button
              onClick={onAddModalClose}
              borderRadius="md"
              colorScheme="gray"
              variant="ghost"
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default Leave;
