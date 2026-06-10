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
  Checkbox,
  Badge,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import axiosInstance from "../../lib/axiosInstance";

const AddLeaveModal = ({
  isOpen,
  onClose,
  onSubmit,
  newLeaveData,
  setNewLeaveData,
  handleNewLeaveChange,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeResults, setEmployeeResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isForSelf, setIsForSelf] = useState(false);

  // ⏱️ Debounced Search Logic
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 3) {
      setEmployeeResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        console.log("🔍 Sending search request for query:", searchTerm.trim());

        const res = await axiosInstance.get(
          `/adminLeave/search-employees?q=${encodeURIComponent(searchTerm.trim())}`,
        );

        console.log("📦 Server Raw Response Data:", res.data);

        if (Array.isArray(res.data)) {
          setEmployeeResults(res.data);
        } else if (res.data && Array.isArray(res.data.employees)) {
          setEmployeeResults(res.data.employees);
        } else {
          console.warn(
            "⚠️ Server response is not a recognizable array:",
            res.data,
          );
          setEmployeeResults([]);
        }
      } catch (err) {
        console.error("❌ Error searching employee:", err);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleClose = () => {
    setIsForSelf(false);
    setSearchTerm("");
    setEmployeeResults([]);
    setSelectedEmployee(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent borderRadius="lg" boxShadow="2xl">
        <ModalHeader bg="blue.500" color="white">
          Add New Leave Request
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody pb={6}>
          <VStack spacing={4} align="stretch" mt={2}>
            <Checkbox
              isChecked={isForSelf}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsForSelf(checked);

                if (checked) {
                  // 💡 CRITICAL: Ensure fallback to currentUser.employeeId or .id if ._id doesn't exist
                  const targetId =
                    currentUser?._id ||
                    currentUser?.employeeId ||
                    currentUser?.id ||
                    "";

                  setNewLeaveData((prev) => ({
                    ...prev,
                    employeeId: targetId,
                  }));

                  setSelectedEmployee({
                    firstname: currentUser?.firstname || "Admin",
                    lastname: currentUser?.lastname || "",
                    employeeId: currentUser?.employeeId || "Admin",
                  });

                  setSearchTerm("");
                  setEmployeeResults([]);
                } else {
                  setNewLeaveData((prev) => ({ ...prev, employeeId: "" }));
                  setSelectedEmployee(null);
                }
              }}
              colorScheme="blue"
              fontWeight="bold"
            >
              Apply leave for myself
            </Checkbox>

            {/* Search Employee (Hidden if applying for self) */}
            {!isForSelf && (
              <FormControl
                isRequired={!newLeaveData.employeeId}
                position="relative"
              >
                <FormLabel>Search Employee</FormLabel>
                <Input
                  type="text"
                  placeholder="Type name, email, or ID (min. 3 characters)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                />
                {/* Your existing search dropdown results mapping layout here... */}
              </FormControl>
            )}

            {/* Visual Feedback Badge */}
            {selectedEmployee && (
              <Box
                mt={2}
                p={3}
                border="1px solid"
                borderColor="green.200"
                borderRadius="md"
                bg="green.50"
              >
                <Text fontSize="xs" color="gray.600" mb={1} fontWeight="bold">
                  Leave Beneficiary:
                </Text>
                <Badge
                  colorScheme="green"
                  p={2}
                  borderRadius="md"
                  w="100%"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text isTruncated fontSize="sm">
                    {selectedEmployee.firstname} {selectedEmployee.lastname} (
                    {selectedEmployee.employeeId})
                  </Text>
                  {!isForSelf && (
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setNewLeaveData((prev) => ({
                          ...prev,
                          employeeId: "",
                        }));
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </Badge>
              </Box>
            )}

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
                <option value="SL">Sick Leave (SL)</option>
                <option value="MLPL">M/P Leave (MLPL)</option>
                <option value="BL">Bereavement Leave (BL)</option>
                <option value="LWOP">Leave Without Pay (LWOP)</option>
                <option value="CL">Calamity Leave (CL)</option>
                <option value="VL">Vacation Leave (VL)</option>
              </Select>
            </FormControl>

            {/* Dates */}
            <HStack width="100%" spacing={4}>
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  name="dateFrom"
                  type="date"
                  value={newLeaveData.dateFrom}
                  onChange={handleNewLeaveChange}
                />
              </FormControl>
              <FormControl isRequired>
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
                placeholder="Enter formal reason for leave assignment..."
                value={newLeaveData.notes}
                onChange={handleNewLeaveChange}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter borderTop="1px solid" borderColor="gray.100">
          <Button
            colorScheme="blue"
            mr={3}
            onClick={onSubmit}
            isDisabled={
              !newLeaveData.employeeId ||
              !newLeaveData.leaveType ||
              !newLeaveData.dateFrom ||
              !newLeaveData.dateTo ||
              !newLeaveData.notes
            }
          >
            Submit Request
          </Button>
          <Button onClick={handleClose} variant="ghost">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddLeaveModal;
