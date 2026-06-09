import React, { useState, useEffect, useCallback } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
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
} from "@chakra-ui/react";
import {
  ArrowBackIcon,
  ArrowForwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";
import { theme } from "../../constants/themeConstants";
import { LeaveRequestTable } from "./LeaveRequestTable"; // Ensure this path is correct
import { useAuth } from "../../context/AuthContext";
import AddLeaveModal from "../../components/Admin_components/AddLeaveModal";

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

  // Calculate days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
    return diffDays;
  };

  // 1. FIRST: Define fetchLeaveRequests so it exists in memory
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
        })),
      );
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  }, []);

  // 2. SECOND: Call it when the component loads
  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  // 3. THIRD: dynamically calculate Leave Breakdown (ONLY Approved leaves)
  useEffect(() => {
    // Step 1: Pre-fill the standard leave types so they ALWAYS show up on screen
    const counts = {
      SL: 0,
      BL: 0,
      LWOP: 0,
      MLPL: 0,
      VL: 0,
    };

    // Step 2: Initialize any *other* dynamic types that might exist in the database
    leaveRequests.forEach((request) => {
      const type = request.leaveType;
      if (counts[type] === undefined) {
        counts[type] = 0;
      }
    });

    // Step 3: Only add 1 to the breakdown if the leave is explicitly "Approved"
    leaveRequests.forEach((request) => {
      if (request.status === "Approved") {
        const type = request.leaveType;
        if (counts[type] !== undefined) {
          counts[type] += 1;
        }
      }
    });

    setLeaveCounts(counts);
  }, [leaveRequests]);

  // Filter the requests based on the selected status
  const filteredRequests = leaveRequests.filter(
    (request) => filterStatus === "All" || request.status === filterStatus,
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage),
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
      await axiosInstance.post(`/adminLeave/approve-leave/${id}`);
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
        `/adminLeave/reject-leave/${id}`,
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
          req._id === id ? { ...req, status: "Rejected" } : req,
        ),
      );
      setSelectedRequestIds((prev) =>
        prev.filter((selectedId) => selectedId !== id),
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
    setNewLeaveData((prev) => ({ ...prev, [name]: value }));
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
        newLeaveData.dateTo,
      );

      // Prepare data for backend (leave only, no attendance)
      const leaveData = {
        employeeId: newLeaveData.employeeId,
        leaveType: newLeaveData.leaveType,
        dateFrom: newLeaveData.dateFrom,
        dateTo: newLeaveData.dateTo,
        totalLeaveDays,
        notes: newLeaveData.notes,
        leaveStatus: "pending", // you can keep statuses strictly for leaves
      };

      await axiosInstance.post("/adminLeave/create-leave", leaveData);

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
      setCurrentPage(1);
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
          newSelected.includes(pendingId),
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
        `/adminLeave/approve-leave-bulk`,
        {
          ids: selectedRequestIds,
        },
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
      await axiosInstance.post(`/adminLeave/reject-leave-bulk`, {
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
            <Button colorScheme="blue" onClick={() => onAddModalOpen()}>
              Add Leave
            </Button>
            <AddLeaveModal
              isOpen={isAddModalOpen}
              onClose={onAddModalClose}
              onSubmit={handleAddLeaveSubmit}
              newLeaveData={newLeaveData}
              setNewLeaveData={setNewLeaveData}
              handleNewLeaveChange={handleNewLeaveChange}
            />

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
        <Box
          bg="white"
          p={4}
          borderRadius="lg"
          shadow="sm"
          mb={6}
          w="100%"
          maxW="1200px"
        >
          <Heading size="md" mb={4} color="gray.700" textAlign="left">
            Leave Breakdown
          </Heading>

          <SimpleGrid columns={{ base: 2, sm: 2, md: 5 }} spacing={4} w="100%">
            {Object.entries(leaveCounts).map(([type, count]) => (
              <VStack key={type} bg="blue.50" p={3} borderRadius="md" w="100%">
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

        {/* Leave Requests Display Area */}
        <Box width="100%" maxW="1200px">
          {currentItems.length > 0 ? (
            <LeaveRequestTable
              requests={currentItems}
              selectedIds={selectedRequestIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleSelectAll}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ) : (
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
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
                No leave requests found
              </Text>
              <Text fontSize="sm" color="gray.500">
                Try adjusting your filters or check back later
              </Text>
            </Flex>
          )}
        </Box>

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
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
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
                  <option value="SL">Sick Leave</option>
                  <option value="BL">Bereavement Leave</option>
                  <option value="LWOP">Leave without pay</option>
                  <option value="MLPL">Maternity/Paternity Leave</option>
                  <option value="VL">Vacation Leave</option>
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
