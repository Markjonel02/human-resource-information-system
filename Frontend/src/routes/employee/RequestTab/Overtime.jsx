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
} from "@chakra-ui/react";
import {
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
  FiClock,
  FiCalendar,
  FiUser,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { AddIcon } from "@chakra-ui/icons";
import axiosInstance from "../../../lib/axiosInstance";

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

const INITIAL_FORM_DATA = {
  id: null,
  date: new Date().toISOString().split("T")[0],
  hours: "",
  reason: "",
  overtimeType: "regular",
};

// Main Overtime Component
const OvertimeUI = () => {
  // State management
  const [overtimes, setOvertimes] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [statusFilter, setStatusFilter] = useState("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const { isOpen, onOpen, onClose } = useDisclosure();
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

  // Function to fetch data, wrapped in useCallback to prevent infinite loop
  const loadOvertimeData = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/overtime/getEmployeeOvertime");
      const data = Array.isArray(response.data.data) ? response.data.data : [];
      setOvertimes(data);
    } catch (error) {
      handleApiError(error, "Failed to fetch overtime records");
      setOvertimes([]);
    } finally {
      setIsInitialLoading(false);
    }
  }, [handleApiError]);

  // useEffect to call the data fetching function on component mount
  useEffect(() => {
    loadOvertimeData();
  }, [loadOvertimeData]);

  // Memoized filtered and sorted data
  const processedOvertimes = useMemo(() => {
    let filtered = statusFilter
      ? overtimes.filter((ot) => ot.status === statusFilter)
      : overtimes;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "hours":
          return parseFloat(b.hours) - parseFloat(a.hours);
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return sorted;
  }, [overtimes, statusFilter, sortBy]);

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

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Validation helper
  const validateForm = useCallback(() => {
    if (!formData.date || !formData.hours || !formData.reason) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return false;
    }

    const hours = parseFloat(formData.hours);
    if (hours <= 0 || hours > 24) {
      toast({
        title: "Invalid Hours",
        description: "Hours must be between 1 and 24",
        status: "warning",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return false;
    }

    return true;
  }, [formData, toast]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const submitData = {
        date: formData.date,
        hours: parseFloat(formData.hours),
        reason: formData.reason,
        overtimeType: formData.overtimeType,
      };

      if (formData.id) {
        await axiosInstance.put(
          `/overtime/editOvertime/${formData.id}`,
          submitData
        );
      } else {
        await axiosInstance.post("/overtime/addOvertime", submitData);
      }

      await loadOvertimeData(); // Re-fetch data to update the table

      toast({
        title: "Success",
        description: `Overtime request ${
          formData.id ? "updated" : "submitted"
        } successfully`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      handleCloseModal();
    } catch (error) {
      handleApiError(
        error,
        `Failed to ${formData.id ? "update" : "submit"} overtime request`
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    validateForm,
    isSubmitting,
    formData,
    loadOvertimeData,
    toast,
    handleCloseModal,
    handleApiError,
  ]);

  // Handle view overtime details
  const handleView = useCallback(
    (overtime) => {
      const formatDate = (date) => new Date(date).toLocaleDateString();

      toast({
        title: "Overtime Details",
        description: `${formatDate(overtime.date)} - ${overtime.hours} hours (${
          overtime.status
        })`,
        status: "info",
        duration: 4000,
        position: "top",
        isClosable: true,
      });
    },
    [toast]
  );

  // Handle edit overtime
  const handleEdit = useCallback(
    (overtime) => {
      if (overtime.status !== "pending") {
        toast({
          title: "Cannot Edit",
          description: "Only pending overtime requests can be edited",
          status: "warning",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
        return;
      }

      setFormData({
        id: overtime._id,
        date: overtime.date.split("T")[0],
        hours: overtime.hours.toString(),
        reason: overtime.reason,
        overtimeType: overtime.overtimeType || "regular",
      });
      onOpen();
    },
    [onOpen, toast]
  );

  // Handle delete overtime
  const handleDelete = useCallback(
    async (id) => {
      const overtime = overtimes.find((ot) => ot._id === id);

      if (overtime?.status !== "pending") {
        toast({
          title: "Cannot Delete",
          description: "Only pending overtime requests can be deleted",
          status: "warning",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
        return;
      }

      if (
        !window.confirm(
          "Are you sure you want to delete this overtime request?"
        )
      ) {
        return;
      }

      try {
        await axiosInstance.delete(`/overtime/deleteOvertime/${id}`);
        await loadOvertimeData();

        toast({
          title: "Success",
          description: "Overtime request deleted successfully",
          status: "success",
          duration: 3000,
          position: "top",
          isClosable: true,
        });
      } catch (error) {
        handleApiError(error, "Failed to delete overtime record");
      }
    },
    [overtimes, toast, loadOvertimeData, handleApiError]
  );

  // Handle new overtime request
  const handleNewRequest = useCallback(() => {
    resetForm();
    onOpen();
  }, [resetForm, onOpen]);

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

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <Heading size="lg" color="gray.800">
            My Overtime Requests
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleNewRequest}
            isDisabled={isSubmitting}
          >
            New Overtime Request
          </Button>
        </Flex>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
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
              <Icon as={FiUser} mr={1} />
              All time
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
            <option value="date">Sort by Date</option>
            <option value="hours">Sort by Hours</option>
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
        </HStack>

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
              {statusFilter
                ? `No ${statusFilter} overtime requests found.`
                : "You haven't submitted any overtime requests yet."}
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
                  <Th>Date</Th>
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
                      <HStack>
                        <Icon as={FiCalendar} color="gray.400" />
                        <Text>
                          {new Date(overtime.date).toLocaleDateString()}
                        </Text>
                      </HStack>
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
                    <Td maxW="250px">
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
                    </Td>
                    <Td textAlign="center">
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                          isDisabled={isSubmitting}
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleView(overtime)}
                          >
                            View Details
                          </MenuItem>
                          <MenuItem
                            icon={<FiEdit />}
                            onClick={() => handleEdit(overtime)}
                            isDisabled={
                              overtime.status !== "pending" || isSubmitting
                            }
                          >
                            Edit
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDelete(overtime._id)}
                            isDisabled={
                              overtime.status !== "pending" || isSubmitting
                            }
                          >
                            Delete
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Form Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {formData.id ? "Edit Overtime Request" : "New Overtime Request"}
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Hours</FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    name="hours"
                    placeholder="e.g., 2.5"
                    value={formData.hours}
                    onChange={handleInputChange}
                    isDisabled={isSubmitting}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Overtime Type</FormLabel>
                <Select
                  name="overtimeType"
                  value={formData.overtimeType}
                  onChange={handleInputChange}
                  isDisabled={isSubmitting}
                >
                  {OVERTIME_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Textarea
                  name="reason"
                  placeholder="Please explain the reason for overtime..."
                  value={formData.reason}
                  onChange={handleInputChange}
                  resize="vertical"
                  rows={4}
                  isDisabled={isSubmitting}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={handleCloseModal}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              loadingText={formData.id ? "Updating..." : "Submitting..."}
              isDisabled={!formData.date || !formData.hours || !formData.reason}
            >
              {formData.id ? "Update Request" : "Submit Request"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OvertimeUI;
