import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons";

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
    // Custom light blue for titles
    lightBlue: {
      50: "#E0F7FA", // Very light blue for background
      100: "#B2EBF2", // Lighter blue for background
      500: "#81D4FA", // A light blue shade (original for text)
      700: "#00BCD4", // A slightly darker blue for text if needed
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
  id, // Pass id for selection
  leaveType,
  days,
  startDate,
  endDate,
  reason,
  approverName,
  approverAvatarUrl,
  status, // 'Approved', 'Pending', 'Rejected'
  onApprove,
  onReject,
  isSelected, // New prop for selection state
  onToggleSelect, // New prop for toggling selection
  onCardClick, // New prop for card click handler
}) => {
  const statusColor = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
  };

  // Determine card specific colors based on leaveType for eye-catching effect
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
      // Default to a neutral color scheme
      break;
  }

  // Truncate approver name if it's too long
  const truncatedApproverName =
    approverName.length > 15
      ? `${approverName.substring(0, 15)}...`
      : approverName;

  // Truncate reason text if it's too long
  const displayReason =
    reason.length > 100 ? `${reason.substring(0, 100)}...` : reason;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl" // More rounded corners
      overflow="hidden"
      boxShadow="xl" // Stronger shadow
      bg="white"
      maxW={{ base: "90%", sm: "350px", md: "380px" }} // Adjusted responsive width
      mx="auto" // Center the card
      my={4}
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "2xl",
        cursor: "pointer",
      }} // Hover effect and cursor
      transition="all 0.3s ease-in-out"
      onClick={() =>
        onCardClick({
          id,
          leaveType,
          days,
          startDate,
          endDate,
          reason,
          approverName,
          approverAvatarUrl,
          status,
        })
      } // Pass all card data on click
    >
      {/* Header Section */}
      <Flex align="center" mb={2} p={2} bg="lightBlue.100" borderRadius="md">
        <HStack spacing={2} align="center">
          {" "}
          {/* HStack for checkbox and title */}
          {status === "Pending" && ( // Only show checkbox for pending items
            <Checkbox
              isChecked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(id);
              }} // Stop propagation to prevent card click
              colorScheme="blue"
              size="md"
            />
          )}
          <Text fontSize="md" fontWeight="semibold" color="black">
            {leaveType}
          </Text>
        </HStack>
        <Spacer />
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

      {/* Approver Name and Avatar (moved to top) */}
      <HStack spacing={2} align="center" mb={4} pl={2}>
        <Avatar size="xs" name={approverName} src={approverAvatarUrl} />
        <Text fontSize="xs" fontWeight="medium" color="gray.700">
          {truncatedApproverName}
        </Text>
      </HStack>

      {/* Days/Hours and Date */}
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

      {/* Reason */}
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="semibold" mb={1} color="gray.700">
          Reason
        </Text>
        <Text fontSize="sm" color="gray.600" noOfLines={3}>
          {displayReason} {/* Use truncated reason */}
        </Text>
      </Box>

      {/* Action Buttons at bottom right */}
      <Flex justifyContent="space-between" alignItems="flex-end" pt={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Actions
        </Text>
        <HStack spacing={2}>
          <Button
            colorScheme="green"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onApprove();
            }} // Stop propagation
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
            onClick={(e) => {
              e.stopPropagation();
              onReject();
            }} // Stop propagation
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
  // State for filtering
  const [filterStatus, setFilterStatus] = useState("All");
  // State for selected requests
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  // State for "Select All" checkbox
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  // Modal state for Add Leave
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const toast = useToast(); // Initialize useToast
  const [newLeaveData, setNewLeaveData] = useState({
    leaveType: "",
    days: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  // Modal state for viewing card details
  const {
    isOpen: isDetailsModalOpen,
    onOpen: onDetailsModalOpen,
    onClose: onDetailsModalClose,
  } = useDisclosure();
  const [currentCardDetails, setCurrentCardDetails] = useState(null); // State to hold details of the clicked card

  // Example data for various leave requests
  const [leaveRequests, setLeaveRequests] = useState([
    // Use state for leave requests to allow status updates
    {
      id: 1,
      leaveType: "Sick leave request",
      days: "2 Days", // Ensure consistent format
      startDate: "March 27",
      endDate: "March 28 2018",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/FF5733/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 2,
      leaveType: "Excuse request",
      days: "2.5 Hours", // Ensure consistent format
      startDate: "March 27",
      endDate: "2018",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal Long Name Here", // Long name example
      approverAvatarUrl: "https://placehold.co/40x40/6633FF/FFFFFF?text=AA",
      status: "Approved",
    },
    {
      id: 3,
      leaveType: "Business Trip Request",
      days: "3 Days", // Ensure consistent format
      startDate: "March 27",
      endDate: "March 28 2018",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/33FF57/FFFFFF?text=AA",
      status: "Rejected",
    },
    {
      id: 4,
      leaveType: "Loan request",
      days: "5000.00", // Example for loan amount, no "Days" suffix
      startDate: "March 31",
      endDate: "2018",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/FF3366/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 5,
      leaveType: "Ticket Request",
      days: "2 Tickets", // Example for tickets, custom suffix
      startDate: "March 27",
      endDate: "March 28 2018",
      reason:
        "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      approverName: "Aman Aggarwal",
      approverAvatarUrl: "https://placehold.co/40x40/3366FF/FFFFFF?text=AA",
      status: "Pending",
    },
    {
      id: 6,
      leaveType: "Vacation leave",
      days: "7 Days", // Ensure consistent format
      startDate: "April 10",
      endDate: "April 17 2025",
      reason:
        "Planning a relaxing trip to the mountains to unwind and recharge.",
      approverName: "Jane Doe",
      approverAvatarUrl: "https://placehold.co/40x40/33FFCC/FFFFFF?text=JD",
      status: "Pending",
    },
  ]);

  // Filter the requests based on the selected status
  const filteredRequests = leaveRequests.filter(
    (request) => filterStatus === "All" || request.status === filterStatus
  );

  const handleApprove = (id) => {
    console.log(`Approve clicked for request ID: ${id}`);
    // Update the status of the specific request
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: "Approved" } : req
      )
    );
  };

  const handleReject = (id) => {
    console.log(`Reject clicked for request ID: ${id}`);
    // Update the status of the specific request
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        req.id === id ? { ...req, status: "Rejected" } : req
      )
    );
  };

  const handleNewLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddLeaveSubmit = () => {
    // Basic validation
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

    console.log("New Leave Data:", newLeaveData);
    const newId = Math.max(...leaveRequests.map((req) => req.id)) + 1;

    let formattedDays = newLeaveData.days;
    // Apply formatting based on leave type for consistent display
    if (newLeaveData.leaveType.toLowerCase().includes("hours")) {
      formattedDays = `${newLeaveData.days} Hours`;
    } else if (
      newLeaveData.leaveType.toLowerCase().includes("request") ||
      newLeaveData.leaveType.toLowerCase().includes("leave")
    ) {
      // Exclude 'Loan request' from getting 'Days' suffix if it's meant to be an amount
      if (
        newLeaveData.leaveType.toLowerCase() !== "loan request" &&
        newLeaveData.leaveType.toLowerCase() !== "ticket request"
      ) {
        formattedDays = `${newLeaveData.days} Days`;
      } else if (newLeaveData.leaveType.toLowerCase() === "ticket request") {
        formattedDays = `${newLeaveData.days} Tickets`;
      }
    }

    const newRequest = {
      id: newId,
      leaveType: newLeaveData.leaveType,
      days: formattedDays, // Use the formatted days
      startDate: newLeaveData.startDate,
      endDate: newLeaveData.endDate,
      reason: newLeaveData.reason,
      approverName: "New Applicant", // Default for new requests
      approverAvatarUrl: "https://placehold.co/40x40/000000/FFFFFF?text=NA", // Default avatar
      status: "Pending", // New requests are pending by default
    };
    setLeaveRequests((prevRequests) => [...prevRequests, newRequest]);
    setNewLeaveData({
      // Reset form
      leaveType: "",
      days: "",
      startDate: "",
      endDate: "",
      reason: "",
    });
    onAddModalClose(); // Close the modal
    toast({
      title: "Leave Request Added",
      description: "Your new leave request has been submitted.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleToggleSelect = (id) => {
    setSelectedRequestIds((prevSelected) => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id];

      // Check if all pending requests are now selected
      const pendingRequestIds = filteredRequests
        .filter((req) => req.status === "Pending")
        .map((req) => req.id);

      const allPendingSelected =
        pendingRequestIds.length > 0 &&
        pendingRequestIds.every((pendingId) => newSelected.includes(pendingId));

      setIsSelectAllChecked(allPendingSelected);
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const pendingRequestIds = filteredRequests
      .filter((req) => req.status === "Pending")
      .map((req) => req.id);

    if (
      selectedRequestIds.length === pendingRequestIds.length &&
      pendingRequestIds.length > 0
    ) {
      // If all pending are currently selected, deselect all
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
    } else {
      // Select all pending requests
      setSelectedRequestIds(pendingRequestIds);
      setIsSelectAllChecked(true);
    }
  };

  const handleApproveSelected = () => {
    console.log("Approving selected requests:", selectedRequestIds);
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        selectedRequestIds.includes(req.id)
          ? { ...req, status: "Approved" }
          : req
      )
    );
    setSelectedRequestIds([]); // Clear selection after action
    setIsSelectAllChecked(false); // Uncheck select all
    toast({
      title: "Requests Approved",
      description: "Selected leave requests have been approved.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRejectSelected = () => {
    console.log("Rejecting selected requests:", selectedRequestIds);
    setLeaveRequests((prevRequests) =>
      prevRequests.map((req) =>
        selectedRequestIds.includes(req.id)
          ? { ...req, status: "Rejected" }
          : req
      )
    );
    setSelectedRequestIds([]); // Clear selection after action
    setIsSelectAllChecked(false); // Uncheck select all
    toast({
      title: "Requests Rejected",
      description: "Selected leave requests have been rejected.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCardClick = (cardData) => {
    setCurrentCardDetails(cardData);
    onDetailsModalOpen();
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
        // Removed bg="gray.50"
      >
        {/* Top bar with Add Leave button and Sorting Option */}
        <Flex
          width="100%"
          maxW="1200px"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <HStack spacing={4}>
            <Button
              colorScheme="blue"
              leftIcon={<AddIcon />}
              onClick={onAddModalOpen} // Open Add Leave modal on click
              borderRadius="md"
              boxShadow="md"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            >
              Add Leave
            </Button>
            {/* Select All Checkbox */}
            <Checkbox
              isChecked={isSelectAllChecked}
              onChange={handleSelectAll}
              colorScheme="blue"
              size="lg"
              isDisabled={
                filteredRequests.filter((req) => req.status === "Pending")
                  .length === 0
              } // Disable if no pending requests
            >
              Select All Pending
            </Checkbox>
          </HStack>
          <HStack spacing={4}>
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
                  _active={{ bg: "red.700", transform: "scale(0.95)" }}
                >
                  Reject Selected ({selectedRequestIds.length})
                </Button>
              </>
            )}
            <Select
              placeholder="Filter by Status"
              width={{ base: "100%", sm: "200px" }}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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

        <SimpleGrid
          columns={{ base: 1, sm: 2, md: 3 }}
          spacing={8}
          width="100%"
          maxW="1200px"
        >
          {filteredRequests.map((request) => (
            <LeaveRequestCard
              key={request.id}
              id={request.id} // Pass ID to the card
              {...request}
              onApprove={() => handleApprove(request.id)}
              onReject={() => handleReject(request.id)}
              isSelected={selectedRequestIds.includes(request.id)} // Pass selection state
              onToggleSelect={handleToggleSelect} // Pass toggle handler
              onCardClick={handleCardClick} // Pass card click handler
            />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Add New Leave Modal */}
      <Modal isOpen={isAddModalOpen} onClose={onAddModalClose}>
        <ModalOverlay />
        <ModalContent borderRadius="lg" boxShadow="2xl">
          <ModalHeader bg="blue.500" color="white" borderTopRadius="lg">
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
                  <option value="Sick leave request">Sick leave request</option>
                  <option value="Excuse request">Excuse request</option>
                  <option value="Business Trip Request">
                    Business Trip Request
                  </option>
                  <option value="Loan request">Loan request</option>
                  <option value="Ticket Request">Ticket Request</option>
                  <option value="Vacation leave">Vacation leave</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Days/Hours</FormLabel>
                <Input
                  name="days"
                  type="text" // Can be number or text for "2.5 hours"
                  placeholder="e.g., 2 or 2.5"
                  value={newLeaveData.days}
                  onChange={handleNewLeaveChange}
                  borderRadius="md"
                />
              </FormControl>

              <HStack width="100%">
                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    value={newLeaveData.startDate}
                    onChange={handleNewLeaveChange}
                    borderRadius="md"
                  />
                </FormControl>
                <FormControl isRequired>
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

      {/* View Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={onDetailsModalClose}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg" boxShadow="2xl">
          <ModalHeader bg="blue.500" color="white" borderTopRadius="lg">
            {currentCardDetails?.leaveType || "Leave Details"}
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody pb={6}>
            {currentCardDetails && (
              <VStack align="flex-start" spacing={3}>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Status:
                  </Text>{" "}
                  <Badge
                    colorScheme={statusColor[currentCardDetails.status]}
                    textTransform="capitalize"
                  >
                    {currentCardDetails.status}
                  </Badge>
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Days/Hours:
                  </Text>{" "}
                  {currentCardDetails.days}
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Dates:
                  </Text>{" "}
                  {currentCardDetails.startDate} - {currentCardDetails.endDate}
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Approver:
                  </Text>{" "}
                  <HStack spacing={2}>
                    <Avatar
                      size="xs"
                      name={currentCardDetails.approverName}
                      src={currentCardDetails.approverAvatarUrl}
                    />
                    <Text>{currentCardDetails.approverName}</Text>
                  </HStack>
                </Text>
                <Text>
                  <Text as="span" fontWeight="semibold">
                    Reason:
                  </Text>{" "}
                  {currentCardDetails.reason} {/* Full reason here */}
                </Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={onDetailsModalClose}
              borderRadius="md"
              colorScheme="blue"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default Leave;
