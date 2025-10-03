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
  Heading,
  Input,
  Textarea,
  useDisclosure,
  useToast,
  IconButton,
  Tooltip,
  GridItem,
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
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";
import { theme } from "../../constants/themeConstants";
import { LeaveRequestCard } from "./LeaveRequestCard";
import { useAuth } from "../../context/AuthContext";
const Leave = () => {
  const { authState } = useAuth();
  const currentUser = authState?.user;

  const [filterStatus, setFilterStatus] = useState("All");
  const [selectedRequestIds, setSelectedRequestIds] = useState([]);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);
  const {
    isOpen: isAddModalOpen,
    onOpen: onAddModalOpen,
    onClose: onAddModalClose,
  } = useDisclosure();
  const [leaveCounts, setLeaveCounts] = useState({});
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

  useEffect(() => {
    const fetchLeaveBreakdown = async () => {
      try {
        const response = await axiosInstance.get(
          "/attendanceRoutes/get-leave-breakdown"
        );
        setLeaveCounts(response.data);
      } catch (error) {
        console.error("Failed to fetch leave breakdown:", error);
      }
    };

    fetchLeaveBreakdown();
  }, []);

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
      const res = await axiosInstance.get("/employeeLeave/getemp-leaves");
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
          requesterName:
            item.employee?.firstname && item.employee?.lastname
              ? `${item.employee.firstname} ${item.employee.lastname}`
              : item.employee?.name || "Unknown Employee",

          requesterAvatarUrl: `https://placehold.co/40x40/000000/FFFFFF?text=${
            item.employee?.firstname?.[0] || ""
          }${item.employee?.lastname?.[0] || ""}`,
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
      const response = await axiosInstance.post(
        `/attendanceRoutes/reject-leave/${id}`
      );
      const rejectedBy = response.data?.leaveRecord?.approvedBy;

      toast({
        title: "Leave Rejected",
        description: rejectedBy
          ? `Rejected by ${rejectedBy.firstname} ${rejectedBy.lastname}`
          : "Leave has been rejected.",
        status: "info",
        position: "top",
        duration: 3000,
        isClosable: true,
      });

      fetchLeaveRequests(); // Refresh the list
    } catch (err) {
      console.error("Error rejecting leave:", err);
      setLeaveRequests((prevRequests) =>
        prevRequests.map((req) =>
          req._id === id ? { ...req, status: "Rejected" } : req
        )
      );
      setSelectedRequestIds((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
      toast({
        title: "Rejection Failed",
        description: err.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 3000,
        position: "top",
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
        position: "top",
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
        position: "top",
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
        position: "top",
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
      const response = await axiosInstance.post(
        `/attendanceRoutes/approve-leave-bulk`,
        {
          ids: selectedRequestIds,
        }
      );

      const approved = response.data?.approved || [];
      const errors = response.data?.errors || [];

      toast({
        title: "Bulk Approval Completed",
        description: `${approved.length} approved, ${errors.length} failed.`,
        status: "success",
        position: "top",
        duration: 4000,
        isClosable: true,
      });

      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests(); // Refresh the list
    } catch (err) {
      console.error("Error bulk approving leaves:", err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to approve leaves.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleRejectSelected = async () => {
    try {
      // If bulk reject endpoint exists
      await axiosInstance.post(`/attendanceRoutes/reject-leave-bulk`, {
        ids: selectedRequestIds,
      });
      toast({
        title: "Selected Leaves Rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests(); // Refresh the list after rejection
    } catch (err) {
      console.error("Error bulk rejecting leaves:", err);
      // If no bulk reject endpoint exists, update locally
      /*     setLeaveRequests((prevRequests) =>
        prevRequests.map((req) =>
          selectedRequestIds.includes(req.id)
            ? { ...req, status: "Rejected" }
            : req
        )
      ); */
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      toast({
        title: "Requests Rejected",
        description: "Selected leave requests have been rejected.",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
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
              isDisabled={currentUser?.role !== "admin"}
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
        {/* Leave Breakdown */}
        <Box bg="white" p={4} borderRadius="lg" shadow="sm" mb={6} w="100%">
          <Heading size="md" mb={4} color="gray.700" textAlign="left">
            Leave Breakdown
          </Heading>

          <SimpleGrid columns={{ base: 2, sm: 2, md: 5 }} spacing={4} w="100%">
            {Object.entries(leaveCounts).map(([type, count]) => (
              <VStack
                key={type}
                bg="blue.50"
                p={3}
                borderRadius="md"
                w="100%" // ✅ Stretch items in grid
              >
                <Text
                  fontSize="xs"
                  color="blue.600"
                  fontWeight="semibold"
                  textAlign="center"
                >
                  {type}
                </Text>
                <Text fontSize="xl" fontWeight="bold" color="blue.700">
                  {count}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </Box>

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
            <GridItem colSpan={{ base: 1, md: 2, lg: 3 }}>
              <Flex
                direction="column"
                align="center"
                justify="center"
                py={20}
                w="100%"
                textAlign="center"
              >
                <Box
                  bg="blue.50"
                  borderRadius="full"
                  p={4}
                  mb={4}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <InfoOutlineIcon boxSize={10} color="blue.500" />
                </Box>
                <Text
                  fontSize="lg"
                  fontWeight="semibold"
                  color="gray.700"
                  mb={2}
                >
                  No leave requests found
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Try adjusting your filters or check back later
                </Text>
              </Flex>
            </GridItem>
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
