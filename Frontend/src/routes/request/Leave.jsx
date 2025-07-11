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
  Checkbox, // Import Checkbox for multi-selection
} from "@chakra-ui/react";
import { CalendarIcon, CheckIcon, CloseIcon, AddIcon } from "@chakra-ui/icons"; // Import AddIcon

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
      _hover={{ transform: "translateY(-5px)", boxShadow: "2xl" }} // Hover effect
      transition="all 0.3s ease-in-out"
      position="relative" // For positioning the checkbox
    >
      {/* Checkbox for multi-selection */}
      <Checkbox
        position="absolute"
        top={4}
        left={4}
        isChecked={isSelected}
        onChange={() => onToggleSelect(id)}
        colorScheme="blue"
        size="lg"
      />

      {/* Header Section */}
      <Flex align="center" mb={2} p={2} bg="lightBlue.100" borderRadius="md">
        <Text fontSize="md" fontWeight="semibold" color="black">
          {leaveType}
        </Text>
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
          {days} {leaveType.includes("Hours") ? "Hours" : "Days"}
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
          {reason}
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
  // State for filtering
  const [filterStatus, setFilterStatus] = useState("All");
  // State for selected requests
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);

  // Example data for various leave requests
  const [leaveRequests, setLeaveRequests] = useState([
    // Use state for leave requests to allow status updates
    {
      id: 1,
      leaveType: "Sick leave request",
      days: "2",
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
      days: "2.5",
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
      days: "3",
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
      days: "5000.00", // Example for loan amount
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
      days: "2",
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
      days: "7",
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

  const handleAddLeave = () => {
    console.log("Add Leave button clicked!");
    // In a real app, this would open a form or modal to add a new leave request
  };

  const handleToggleSelect = (id) => {
    setSelectedRequestIds((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((selectedId) => selectedId !== id)
        : [...prevSelected, id]
    );
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
      >
        {/* Top bar with Add Leave button and Sorting Option */}
        <Flex
          width="100%"
          maxW="1200px"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={handleAddLeave}
            borderRadius="md"
            boxShadow="md"
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          >
            Add Leave
          </Button>
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
            />
          ))}
        </SimpleGrid>
      </VStack>
    </ChakraProvider>
  );
};

export default Leave;
