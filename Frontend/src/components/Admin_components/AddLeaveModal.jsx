import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  HStack,
  Box,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import axiosInstance from "../../lib/axiosInstance";

const AddLeaveModal = ({
  isOpen,
  onClose,
  onSubmit,
  newLeaveData,
  setNewLeaveData,
  handleNewLeaveChange,
}) => {
  const [employeeResults, setEmployeeResults] = useState([]);

  // search API call
  const handleSearch = async (query) => {
    if (!query) {
      setEmployeeResults([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/adminLeave/search?query=${query}`);
      setEmployeeResults(res.data || []);
    } catch (err) {
      console.error("Error searching employee:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="2xl">
        <ModalHeader bg="lightBlue.500" color="white">
          Add New Leave Request
        </ModalHeader>
        <ModalCloseButton color="white" />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            {/* 🔎 Search Employee */}
            <FormControl isRequired>
              <FormLabel>Search Employee</FormLabel>
              <Input
                type="text"
                placeholder="Type name, email, or ID"
                onChange={(e) => handleSearch(e.target.value)}
                borderRadius="md"
              />
              {employeeResults.length > 0 && (
                <Box
                  border="1px solid #ccc"
                  borderRadius="md"
                  mt={2}
                  maxH="150px"
                  overflowY="auto"
                >
                  {employeeResults.map((emp) => (
                    <Box
                      key={emp._id}
                      px={3}
                      py={2}
                      _hover={{ bg: "blue.50", cursor: "pointer" }}
                      onClick={() => {
                        setNewLeaveData((prev) => ({
                          ...prev,
                          employeeId: emp.employeeId,
                        }));
                        setEmployeeResults([]);
                      }}
                    >
                      <Text fontWeight="medium">
                        {emp.firstname} {emp.lastname} ({emp.employeeId})
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {emp.email}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </FormControl>

            {/* Leave Type */}
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

            {/* Dates */}
            <HStack width="100%" flexWrap="wrap">
              <FormControl isRequired flex="1">
                <FormLabel>Start Date</FormLabel>
                <Input
                  name="dateFrom"
                  type="date"
                  value={newLeaveData.dateFrom}
                  onChange={handleNewLeaveChange}
                />
              </FormControl>
              <FormControl isRequired flex="1">
                <FormLabel>End Date</FormLabel>
                <Input
                  name="dateTo"
                  type="date"
                  value={newLeaveData.dateTo}
                  onChange={handleNewLeaveChange}
                />
              </FormControl>
            </HStack>

            {/* Notes */}
            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                name="notes"
                placeholder="Enter reason for leave"
                value={newLeaveData.notes}
                onChange={handleNewLeaveChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onSubmit}>
            Submit
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddLeaveModal;
