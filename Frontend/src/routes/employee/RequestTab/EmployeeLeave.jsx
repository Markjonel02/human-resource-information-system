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
  IconButton,
} from "@chakra-ui/react";
import { FiEdit, FiPlusCircle } from "react-icons/fi"; // Chakra's recommended icon library
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [newLeave, setNewLeave] = useState({
    leaveType: "",
    dateFrom: "",
    dateTo: "",
    notes: "",
  });
  const toast = useToast();

  const fetchLeaveCredits = async () => {
    try {
      const res = await axiosInstance.get("/employeeLeave/my-leave-credits");
      setLeaveCredits(res.data.credits || res.data);
    } catch (error) {
      console.error("Error fetching leave credits:", error);
      setLeaveCredits({});
    }
  };

  const fetchLeaveHistory = async () => {
    try {
      const res = await axiosInstance.get("/employeeLeave/getemp-leaves");
      setLeaveHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching leave history:", error);
      setLeaveHistory([]);
    }
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
        position: "top",
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
        position: "top",
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
        position: "top",
      });
    }
  };

  const openEditModal = (leave) => {
    setEditingLeave({ ...leave });
    setIsEditModalOpen(true);
  };

  const handleUpdateLeave = async () => {
    if (
      !editingLeave.leaveType ||
      !editingLeave.dateFrom ||
      !editingLeave.dateTo ||
      !editingLeave.notes
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    try {
      await axiosInstance.put(
        `/employeeLeave/edit-leave/${editingLeave._id}`,
        editingLeave
      );
      toast({
        title: "Leave Request Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      setIsEditModalOpen(false);
      setEditingLeave(null);
      fetchLeaveHistory();
      fetchLeaveCredits();
      await refreshData(); // Refresh both credits and history
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to update leave request.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
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

      {/* Leave Credits */}
      <Card mb={6}>
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Text fontWeight="bold" fontSize="lg">
              Remaining Leave Credits
            </Text>
            <Text fontSize="sm" color="gray.500">
              Updated: {new Date().toLocaleDateString()}
            </Text>
          </Flex>
        </CardHeader>
        <CardBody>
          {Object.keys(leaveCredits).length > 0 ? (
            <SimpleGrid columns={{ base: 2, sm: 2, md: 3, lg: 5 }} spacing={4}>
              {Object.entries(leaveCredits).map(([type, credit]) => (
                <VStack
                  key={type}
                  bg={credit.remaining > 0 ? "#EBF8FF" : "#FEB2B2"}
                  p={3}
                  borderRadius="md"
                  align="flex-start"
                  border={
                    credit.remaining === 0
                      ? "2px solid #E53E3E"
                      : "1px solid #BEE3F8"
                  }
                >
                  <Text
                    fontSize="sm"
                    color={credit.remaining > 0 ? "blue.600" : "red.600"}
                    fontWeight="semibold"
                  >
                    {LEAVE_TYPE_LABELS[type] || type}
                  </Text>
                  <Text
                    fontSize="md"
                    color={credit.remaining > 0 ? "blue.700" : "red.700"}
                    fontWeight="bold"
                  >
                    {credit.remaining} / {credit.total}
                  </Text>
                  {credit.remaining === 0 && (
                    <Text fontSize="xs" color="red.600" fontWeight="medium">
                      No credits left
                    </Text>
                  )}
                </VStack>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.500" textAlign="center">
              No leave credits data available
            </Text>
          )}
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
        <Button
          colorScheme="blue"
          fontWeight={"md"}
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<FiPlusCircle />}
        >
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
                <Th>Actions</Th>
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
                        size="sm"
                        colorScheme={
                          STATUS_COLOR[item.leaveStatus || "pending"]
                        }
                        borderRadius="md"
                        px={3}
                        py={1}
                        fontWeight="bold"
                        textTransform="capitalize"
                      >
                        {item.leaveStatus || "Pending"}
                      </Tag>
                    </Td>
                    <Td>
                      <IconButton
                        icon={<FiEdit />}
                        size="sm"
                        aria-label="Edit leave"
                        onClick={() => openEditModal(item)}
                      />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={7} textAlign="center" py={8}>
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

      {/* Edit Leave Modal */}
      {editingLeave && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Leave Request</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    name="leaveType"
                    placeholder="Select leave type"
                    value={editingLeave.leaveType}
                    onChange={(e) =>
                      setEditingLeave((prev) => ({
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
                      value={
                        editingLeave.dateFrom
                          ? new Date(editingLeave.dateFrom)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLeave((prev) => ({
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
                      value={
                        editingLeave.dateTo
                          ? new Date(editingLeave.dateTo)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLeave((prev) => ({
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
                    value={editingLeave.notes}
                    onChange={(e) =>
                      setEditingLeave((prev) => ({
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
              <Button
                colorScheme="blue"
                variant="outline"
                mr={3}
                onClick={handleUpdateLeave}
              >
                Update
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default EmployeeLeave;
