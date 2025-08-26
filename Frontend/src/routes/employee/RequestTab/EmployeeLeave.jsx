import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Select,
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
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Card,
  CardBody,
  CardHeader,
  TableContainer,
} from "@chakra-ui/react";
import axiosInstance from "../../../lib/axiosInstance";

const LEAVE_TYPE_LABELS = {
  VL: "Vacation Leave",
  SL: "Sick Leave",
  LWOP: "Leave Without Pay",
  BL: "Bereavement Leave",
  CL: "Calamity Leave",
};

const STATUS_COLOR = {
  approved: "green",
  pending: "orange",
  rejected: "red",
};

const EmployeeLeave = () => {
  const [leaveCredits, setLeaveCredits] = useState({});
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
  });
  const toast = useToast();

  const fetchLeaveCredits = () => {
    axiosInstance
      .get("/employeeLeave/my-leave-credits")
      .then((res) => setLeaveCredits(res.data.credits || res.data))
      .catch(() => setLeaveCredits({}));
  };

  const fetchLeaveHistory = () => {
    axiosInstance
      .get("/employeeLeave/getemp-leaves")
      .then((res) => {
        setLeaveHistory(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setLeaveHistory([]));
  };

  useEffect(() => {
    fetchLeaveCredits();
    fetchLeaveHistory();
  }, []);

  const handleAddLeave = async () => {
    if (
      !newLeave.leaveType ||
      !newLeave.dateFrom ||
      !newLeave.dateTo ||
      !newLeave.notes
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
    try {
      await axiosInstance.post("/employeeLeave/add-leave", newLeave);
      toast({
        title: "Leave Request Submitted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsAddModalOpen(false);
      setNewLeave({ leaveType: "", dateFrom: "", dateTo: "", notes: "" });
      fetchLeaveHistory();
      fetchLeaveCredits();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to submit leave request.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredHistory =
    filterStatus === "all"
      ? leaveHistory
      : leaveHistory.filter(
          (item) => (item.leaveStatus || "pending") === filterStatus
        );

  return (
    <Box w="full" p={4} mx="auto">
      {/* Leave Credits */}
      <Card mb={6}>
        <CardHeader>
          <Text fontWeight="bold" fontSize="lg">
            Remaining Leave Credits
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 2, sm: 2,md:3, lg: 6 }} spacing={4}>
            {Object.entries(leaveCredits).map(([type, credit]) => (
              <VStack
                key={type}
                bg="#EBF8FF" // Light blue color
                p={3}
                borderRadius="md"
                align="flex-start"
              >
                <Text fontSize="sm" color="blue.600" fontWeight="semibold">
                  {LEAVE_TYPE_LABELS[type] || type}
                </Text>
                <Text fontSize="md" color="blue.700" fontWeight="bold">
                  {credit.remaining} / {credit.total}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Controls */}
      <Flex
        mb={4}
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={4}
      >
        <Button colorScheme="blue" onClick={() => setIsAddModalOpen(true)}>
          Add Leave
        </Button>
        <Select
          w={{ base: "100%", sm: "200px" }}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </Select>
      </Flex>

      {/* Leave History Table */}
      <Card bg="white" borderRadius="lg" boxShadow="md" p={0}>
        <TableContainer>
          <Table variant="striped" colorScheme="blue" size="md">
            <Thead>
              <Tr bg="blue.50">
                <Th>Type</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th isNumeric>Days</Th>
                <Th>Reason</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <Tr key={item._id} _hover={{ bg: "blue.50" }}>
                    <Td>
                      {LEAVE_TYPE_LABELS[item.leaveType] || item.leaveType}
                    </Td>
                    <Td>
                      {item.dateFrom
                        ? new Date(item.dateFrom).toLocaleDateString()
                        : "-"}
                    </Td>
                    <Td>
                      {item.dateTo
                        ? new Date(item.dateTo).toLocaleDateString()
                        : "-"}
                    </Td>
                    <Td isNumeric>
                      {item.totalLeaveDays ||
                        (item.dateFrom && item.dateTo
                          ? Math.ceil(
                              (new Date(item.dateTo) -
                                new Date(item.dateFrom)) /
                                (1000 * 60 * 60 * 24)
                            ) + 1
                          : "-")}
                    </Td>
                    <Td>
                      <Text isTruncated maxW="200px" title={item.notes}>
                        {item.notes}
                      </Text>
                    </Td>
                    <Td>
                      <Tag
                        size="md"
                        colorScheme={
                          STATUS_COLOR[item.leaveStatus || "pending"]
                        }
                        borderRadius="full"
                        px={3}
                        py={1}
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {item.leaveStatus || "Pending"}
                      </Tag>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6} textAlign="center" py={8}>
                    <Text color="gray.500" fontSize="lg" fontWeight="semibold">
                      No leave records found.
                    </Text>
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Leave Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Leave Request</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Leave Type</FormLabel>
                <Select
                  name="leaveType"
                  placeholder="Select leave type"
                  value={newLeave.leaveType}
                  onChange={(e) =>
                    setNewLeave((prev) => ({
                      ...prev,
                      leaveType: e.target.value,
                    }))
                  }
                >
                  <option value="VL">Vacation Leave</option>
                  <option value="SL">Sick Leave</option>
                  <option value="LWOP">Leave Without Pay</option>
                  <option value="BL">Bereavement Leave</option>
                  <option value="CL">Calamity Leave</option>
                </Select>
              </FormControl>
              <HStack w="100%">
                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    name="dateFrom"
                    value={newLeave.dateFrom}
                    onChange={(e) =>
                      setNewLeave((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                      }))
                    }
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    name="dateTo"
                    value={newLeave.dateTo}
                    onChange={(e) =>
                      setNewLeave((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                      }))
                    }
                  />
                </FormControl>
              </HStack>
              <FormControl isRequired>
                <FormLabel>Reason</FormLabel>
                <Textarea
                  name="notes"
                  value={newLeave.notes}
                  onChange={(e) =>
                    setNewLeave((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Enter reason for leave"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddLeave}>
              Submit
            </Button>
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeLeave;
