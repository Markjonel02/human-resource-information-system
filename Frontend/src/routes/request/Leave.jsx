import React, { useState, useEffect } from "react";
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
            {startDate} - {endDate}
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
    days: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      leaveType: "Sick leave request",
      days: "2 Days",
      startDate: "2018-03-27",
      endDate: "2018-03-28",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/FF5733/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 2,
      leaveType: "Excuse request",
      days: "2.5 Hours",
      startDate: "2018-03-27",
      endDate: "2018-03-27",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal Long Name Here",
      approverAvatarUrl: "https://placehold.co/40x40/6633FF/FFFFFF?text=AA",
      status: "Approved",
    },
    {
      id: 3,
      leaveType: "Business Trip Request",
      days: "3 Days",
      startDate: "2018-03-27",
      endDate: "2018-03-29",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/33FF57/FFFFFF?text=AA",
      status: "Rejected",
    },
    {
      id: 4,
      leaveType: "Loan request",
      days: "5000.00",
      startDate: "2018-03-31",
      endDate: "2018-03-31",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/FF3366/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 5,
      leaveType: "Ticket Request",
      days: "2 Tickets",
      startDate: "2018-03-27",
      endDate: "2018-03-28",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/3366FF/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 6,
      leaveType: "Vacation leave",
      days: "7 Days",
      startDate: "2025-04-10",
      endDate: "2025-04-17",
      reason:
        "Planning a relaxing trip to the mountains to unwind and recharge. This is a longer reason to test the truncation functionality and ensure the modal displays the full text correctly.",
      approverName: "Jane Doe",
      approverAvatarUrl: "https://placehold.co/40x40/33FFCC/FFFFFF?text=JD",
      status: "Pending",
    },
    {
      id: 7,
      leaveType: "Sick leave request",
      days: "1 Day",
      startDate: "2025-05-01",
      endDate: "2025-05-01",
      reason: "Feeling unwell, need a day to recover.",
      approverName: "John Smith",
      approverAvatarUrl: "https://placehold.co/40x40/FFCC33/FFFFFF?text=JS",
      status: "Approved",
    },
    {
      id: 8,
      leaveType: "Business Trip Request",
      days: "4 Days",
      startDate: "2025-06-10",
      endDate: "2025-06-13",
      reason: "Attending annual industry conference in New York.",
      approverName: "Emily White",
      approverAvatarUrl: "https://placehold.co/40x40/CC33FF/FFFFFF?text=EW",
      status: "Pending",
    },
    {
      id: 9,
      leaveType: "Excuse request",
      days: "4 Hours",
      startDate: "2025-07-05",
      endDate: "2025-07-05",
      reason: "Urgent personal appointment.",
      approverName: "David Brown",
      approverAvatarUrl: "https://placehold.co/40x40/3399FF/FFFFFF?text=DB",
      status: "Rejected",
    },
    {
      id: 10,
      leaveType: "Vacation leave",
      days: "5 Days",
      startDate: "2025-08-01",
      endDate: "2025-08-05",
      reason: "Family vacation to the beach.",
      approverName: "Sarah Green",
      approverAvatarUrl: "https://placehold.co/40x40/FF6633/FFFFFF?text=SG",
      status: "Pending",
    },
    {
      id: 11,
      leaveType: "Sick leave request",
      days: "3 Days",
      startDate: "2025-08-15",
      endDate: "2025-08-17",
      reason: "Recovering from minor surgery.",
      approverName: "Michael Blue",
      approverAvatarUrl: "https://placehold.co/40x40/8A2BE2/FFFFFF?text=MB",
      status: "Pending",
    },
    {
      id: 12,
      leaveType: "Excuse request",
      days: "8 Hours",
      startDate: "2025-09-01",
      endDate: "2025-09-01",
      reason: "Attending a sibling's graduation.",
      approverName: "Olivia Red",
      approverAvatarUrl: "https://placehold.co/40x40/DC143C/FFFFFF?text=OR",
      status: "Approved",
    },
  ]);

  // Filter the requests based on the selected status
  const filteredRequests = leaveRequests.filter(
    (request) => filterStatus === "All" || request.status === filterStatus
  );

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

  const handleApprove = (id) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
    setSelectedRequestIds((prev) =>
      prev.filter((selectedId) => selectedId !== id)
    );
    toast({
      title: "Request Approved",
      description: "The leave request has been approved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReject = (id) => {
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
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleNewLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddLeaveSubmit = () => {
    if (
      !newLeaveData.leaveType ||
      !newLeaveData.days ||
      !newLeaveData.startDate ||
      !newLeaveData.endDate ||
      !newLeaveData.reason
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newId =
      leaveRequests.length > 0
        ? Math.max(...leaveRequests.map((req) => req.id)) + 1
        : 1;

    let formattedDays = newLeaveData.days;
    // Format dates to a more readable string like "Month Day Year" if they are valid date inputs
    const formatDate = (dateString) => {
      try {
        const date = new Date(dateString);
        // Example: "March 27, 2018"
        return date.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      } catch (e) {
        return dateString; // Return as is if invalid date
      }
    };

    const formattedStartDate = formatDate(newLeaveData.startDate);
    const formattedEndDate = formatDate(newLeaveData.endDate);

    if (newLeaveData.leaveType.includes("Hours")) {
      formattedDays = `${newLeaveData.days} Hours`;
    } else if (
      newLeaveData.leaveType.includes("request") ||
      newLeaveData.leaveType.includes("leave")
    ) {
      if (
        newLeaveData.leaveType !== "Loan request" &&
        newLeaveData.leaveType !== "Ticket Request"
      ) {
        formattedDays = `${newLeaveData.days} Days`;
      } else if (newLeaveData.leaveType === "Ticket Request") {
        formattedDays = `${newLeaveData.days} Tickets`;
      }
    }

    const newRequest = {
      id: newId,
      leaveType: newLeaveData.leaveType,
      days: formattedDays,
      startDate: formattedStartDate, // Use formatted date
      endDate: formattedEndDate, // Use formatted date
      reason: newLeaveData.reason,
      approverName: "New Applicant",
      approverAvatarUrl: "https://placehold.co/40x40/000000/FFFFFF?text=NA",
      status: "Pending",
    };
    setLeaveRequests((prevRequests) => [...prevRequests, newRequest]);
    setNewLeaveData({
      leaveType: "",
      days: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    onAddModalClose();
    toast({
      title: "Leave Request Added",
      description: "Your new leave request has been submitted.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    setCurrentPage(1); // Go to the first page to see the new request
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

  const handleApproveSelected = () => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        selectedRequestIds.includes(req.id)
          ? { ...req, status: "Approved" }
          : req
      )
    );
    setSelectedRequestIds([]);
    setIsSelectAllChecked(false);
    toast({
      title: "Requests Approved",
      description: "Selected leave requests have been approved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRejectSelected = () => {
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
      status: "error",
      duration: 3000,
      isClosable: true,
    });
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
        --- ## Leave Request Cards
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
        --- ## Pagination Controls
        <Flex
          width="100%"
          maxW="1200px"
          justifyContent="space-between"
          alignItems="center"
          mt={8}
          p={4}
          // Removed bg, borderRadius, and boxShadow for a flat look
          direction={{ base: "column", md: "row" }}
          gap={3}
          borderTop="1px solid" // Added a subtle top border for definition
          borderColor="gray.200" // Light gray border
        >
          {/* Items per page selector */}
          <HStack spacing={2}>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color="gray.600"
              whiteSpace="nowrap"
            >
              {" "}
              {/* Changed text color to darker gray */}
              Items per page:
            </Text>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              width={{ base: "70px", md: "90px" }}
              borderRadius="md"
              size="sm"
              fontWeight="semibold"
              bg="white" // White background for flat look
              color="gray.700" // Darker text color
              borderColor="gray.300" // Light gray border
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
                color="lightBlue.700" // Light blue icon color
                variant="ghost"
                _hover={{ bg: "lightBlue.100" }} // Light blue hover
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
                // Adjusted colors for flat look
                color={currentPage === page ? "white" : "lightBlue.700"} // White text for active, lightBlue for others
                bg={currentPage === page ? "lightBlue.500" : "transparent"} // lightBlue bg for active, transparent for others
                _hover={{
                  bg: currentPage === page ? "lightBlue.600" : "lightBlue.100", // Darker lightBlue for active hover, light fill for others
                  color: currentPage === page ? "white" : "lightBlue.700",
                }}
                _active={{
                  bg: currentPage === page ? "lightBlue.700" : "lightBlue.200",
                }}
                boxShadow="none" // Removed box shadow for flat look
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
            color="gray.600" // Changed text color to darker gray
            whiteSpace="nowrap"
            textAlign="center"
            px={2} // Add some horizontal padding
            py={1} // Add some vertical padding
            bg="white" // White background for the text
            borderRadius="md" // Slightly rounded corners
            border="1px solid" // Subtle border
            borderColor="gray.200" // Light gray border color
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
                <FormLabel>Leave Type</FormLabel>
                <Select
                  name="leaveType"
                  placeholder="Select leave type"
                  value={newLeaveData.leaveType}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                >
                  <option value="Sick leave request">Sick leave </option>
                  <option value="Excuse Request">Excuse </option>
                  <option value="Business Trip Request">Business Trip</option>
                  <option value="M/P Leave  Request">M/P Leave </option>
                  <option value="Bereavement leave Request">
                    Bereavement leave
                  </option>
                  <option value="Vacation leave Request">Vacation leave</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Days/Hours</FormLabel>
                <Input
                  name="days"
                  type="text"
                  placeholder="e.g., 2, 2.5 hours, 5000.00"
                  value={newLeaveData.days}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                />
              </FormControl>

              <HStack width="100%" flexWrap="wrap">
                <FormControl isRequired flex="1">
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    value={newLeaveData.startDate}
                    onChange={handleNewLeaveChange}
                    borderRadius="md"
                  />
                </FormControl>
                <FormControl isRequired flex="1">
                  <FormLabel>End Date</FormLabel>
                  <Input
                    name="endDate"
                    type="date"
                    value={newLeaveData.endDate}
                    onChange={handleNewLeaveChange}
                    borderRadius="md"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Textarea
                  name="reason"
                  placeholder="Enter reason for leave"
                  value={newLeaveData.reason}
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
