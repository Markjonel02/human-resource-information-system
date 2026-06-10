import React, { useState, useEffect, useCallback } from "react";
import {
  ChakraProvider,
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Select,
  Checkbox,
  Heading,
  useDisclosure,
  useToast,
  IconButton,
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
import { LeaveRequestTable } from "./LeaveRequestTable";
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
    employeeId: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [leaveRequests, setLeaveRequests] = useState([]);

  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const fetchLeaveRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/employeeLeave/getemp-leaves");
      const data = Array.isArray(res.data) ? res.data : [];

      setLeaveRequests(
        data.map((item) => {
          const rawStatus = (item.leaveStatus || "").toLowerCase().trim();

          let normalizedStatus = "Pending";
          if (rawStatus === "approved") normalizedStatus = "Approved";
          if (rawStatus === "rejected") normalizedStatus = "Rejected";

          return {
            id: item._id,
            leaveType: item.leaveType || "Leave Request",
            days: item.totalLeaveDays
              ? `${item.totalLeaveDays} Days`
              : `${calculateDays(item.dateFrom, item.dateTo)} Days`,
            startDate: item.dateFrom || "",
            endDate: item.dateTo || "",
            reason: item.notes || "",
            requesterName:
              item.employee?.firstname && item.employee?.lastname
                ? `${item.employee.firstname} ${item.employee.lastname}`
                : item.employee?.name || "Unknown Employee",
            requesterAvatarUrl: `https://placehold.co/40x40/000000/FFFFFF?text=${item.employee?.firstname?.[0] || ""}${item.employee?.lastname?.[0] || ""}`,
            status: normalizedStatus,
          };
        }),
      );
    } catch (err) {
      console.error("Error fetching leave requests:", err);
    }
  }, []);

  useEffect(() => {
    fetchLeaveRequests();
  }, [fetchLeaveRequests]);

  useEffect(() => {
    const counts = { SL: 0, BL: 0, LWOP: 0, MLPL: 0, VL: 0 };
    leaveRequests.forEach((request) => {
      if (counts[request.leaveType] === undefined)
        counts[request.leaveType] = 0;
      if (request.status === "Approved") counts[request.leaveType] += 1;
    });
    setLeaveCounts(counts);
  }, [leaveRequests]);

  const filteredRequests = leaveRequests.filter(
    (request) => filterStatus === "All" || request.status === filterStatus,
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / itemsPerPage),
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRequestIds([]);
    setIsSelectAllChecked(false);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
    setSelectedRequestIds([]);
    setIsSelectAllChecked(false);
  };

  const handleApprove = async (id) => {
    try {
      const res = await axiosInstance.post(`/adminLeave/approve-leave/${id}`);
      console.log("Approve response:", res.data); // add this
      toast({
        title: "Leave Approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchLeaveRequests();
    } catch (err) {
      console.error("Approve error:", err.response?.status, err.response?.data); // add this
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.post(`/adminLeave/reject-leave/${id}`);
      toast({
        title: "Leave Rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      fetchLeaveRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNewLeaveChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddLeaveSubmit = async () => {
    // 🔍 1. Safe Extraction Check for database Object ID
    const targetEmployeeId =
      newLeaveData.employeeId === "Admin" || !newLeaveData.employeeId
        ? currentUser?._id || currentUser?.id
        : newLeaveData.employeeId;

    if (
      !newLeaveData.leaveType ||
      !newLeaveData.dateFrom ||
      !newLeaveData.dateTo ||
      !newLeaveData.notes ||
      !targetEmployeeId
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields with valid user profiles.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    try {
      const totalLeaveDays = calculateDays(
        newLeaveData.dateFrom,
        newLeaveData.dateTo,
      );

      const leaveData = {
        employeeId: targetEmployeeId, // Send verified DB ObjectID string
        leaveType: newLeaveData.leaveType,
        dateFrom: newLeaveData.dateFrom,
        dateTo: newLeaveData.dateTo,
        totalLeaveDays,
        notes: newLeaveData.notes,
        leaveStatus: "pending",
      };

      await axiosInstance.post("/adminLeave/create-leave-request", leaveData);

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
        duration: 3000,
        status: "success",
        position: "top",
        isClosable: true,
      });
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
        ? prevSelected.filter((sid) => sid !== id)
        : [...prevSelected, id];
      const pendingIds = currentItems
        .filter((req) => req.status === "Pending")
        .map((req) => req.id);
      setIsSelectAllChecked(
        pendingIds.length > 0 &&
          pendingIds.every((pid) => newSelected.includes(pid)),
      );
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    const pendingIds = currentItems
      .filter((req) => req.status === "Pending")
      .map((req) => req.id);
    if (selectedRequestIds.length === pendingIds.length && isSelectAllChecked) {
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
    } else {
      setSelectedRequestIds(pendingIds);
      setIsSelectAllChecked(true);
    }
  };

  const handleApproveSelected = async () => {
    try {
      await axiosInstance.post(`/adminLeave/approve-leave-bulk`, {
        ids: selectedRequestIds,
      });
      toast({
        title: "Bulk Approval Completed",
        status: "success",
        position: "top",
        duration: 3000,
        isClosable: true,
      });
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests();
    } catch (err) {
      console.error(err);
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
        position: "top",
        isClosable: true,
      });
      setSelectedRequestIds([]);
      setIsSelectAllChecked(false);
      fetchLeaveRequests();
    } catch (err) {
      console.error(err);
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
            <Button colorScheme="blue" onClick={onAddModalOpen}>
              Add Leave
            </Button>

            <AddLeaveModal
              isOpen={isAddModalOpen}
              onClose={onAddModalClose}
              onSubmit={handleAddLeaveSubmit}
              newLeaveData={newLeaveData}
              setNewLeaveData={setNewLeaveData}
              handleNewLeaveChange={handleNewLeaveChange}
              currentUser={currentUser}
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
                >
                  Approve Selected ({selectedRequestIds.length})
                </Button>
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={handleRejectSelected}
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
            >
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </Select>
          </HStack>
        </Flex>

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
            >
              <Box bg="blue.50" borderRadius="full" p={4} mb={4}>
                <InfoOutlineIcon boxSize={10} color="blue.500" />
              </Box>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
                No leave requests found
              </Text>
            </Flex>
          )}
        </Box>

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
          <HStack spacing={2}>
            <Text fontSize="sm" color="gray.600">
              Items per page:
            </Text>
            <Select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              width="90px"
              size="sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Select>
          </HStack>

          <HStack spacing={1}>
            <IconButton
              icon={<ChevronLeftIcon />}
              onClick={() => paginate(1)}
              isDisabled={currentPage === 1}
              size="sm"
              variant="ghost"
            />
            <IconButton
              icon={<ArrowBackIcon />}
              onClick={() => paginate(currentPage - 1)}
              isDisabled={currentPage === 1}
              size="sm"
              variant="ghost"
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => paginate(page)}
                colorScheme="blue"
                variant={currentPage === page ? "solid" : "ghost"}
                size="sm"
                borderRadius="full"
              >
                {page}
              </Button>
            ))}
            <IconButton
              icon={<ArrowForwardIcon />}
              onClick={() => paginate(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="ghost"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              onClick={() => paginate(totalPages)}
              isDisabled={currentPage === totalPages}
              size="sm"
              variant="ghost"
            />
          </HStack>
          <Text
            fontSize="sm"
            color="gray.600"
            p={1}
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
    </ChakraProvider>
  );
};

export default Leave;
