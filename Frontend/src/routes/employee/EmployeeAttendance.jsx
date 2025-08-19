import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  Alert,
  AlertIcon,
  useDisclosure,
  useToast,
  Badge,
  Text,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const LEAVE_TYPES = [
  { key: "VL", label: "Vacation Leave" },
  { key: "SL", label: "Sick Leave" },
  { key: "LWOP", label: "Leave Without Pay" },
  { key: "BL", label: "Bereavement Leave" },
  { key: "OS", label: "Offset" },
  { key: "CL", label: "Calamity Leave" },
];

const LeaveCreditsPanel = ({ credits }) => (
  <Box bg="white" p={4} borderRadius="lg" shadow="md" mb={6}>
    <Heading size="sm" mb={2} color="blue.700">
      Leave Credits
    </Heading>
    <HStack spacing={4}>
      {LEAVE_TYPES.map((type) => (
        <VStack key={type.key} align="center">
          <Badge colorScheme="blue">{type.label}</Badge>
          <Text
            fontWeight="bold"
            color={
              credits?.credits[type.key]?.remaining === 0
                ? "red.500"
                : "blue.700"
            }
          >
            {credits?.credits[type.key]?.remaining ?? 0} /{" "}
            {credits?.credits[type.key]?.total ?? 5}
          </Text>
        </VStack>
      ))}
    </HStack>
  </Box>
);

const EmployeeAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [leaveCredits, setLeaveCredits] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "present",
    checkIn: "08:00 AM",
    checkOut: "05:00 PM",
    leaveType: "",
    notes: "",
  });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch own attendance and leave credits
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [att, credits] = await Promise.all([
          axiosInstance.get("/attendance/my"),
          axiosInstance.get("/attendance/my-leave-credits"),
        ]);
        setAttendance(att.data);
        setLeaveCredits(credits.data);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load data",
          status: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  // Check if leaveType selected has credits
  const leaveTypeHasCredits = useMemo(() => {
    if (!newRecord.leaveType) return true;
    return leaveCredits?.credits[newRecord.leaveType]?.remaining > 0;
  }, [newRecord.leaveType, leaveCredits]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRecord((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "status" && value === "on_leave"
        ? { checkIn: "", checkOut: "" }
        : {}),
      ...(name === "status" && value !== "on_leave" ? { leaveType: "" } : {}),
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const payload = {
        ...newRecord,
        status: newRecord.status,
        leaveType:
          newRecord.status === "on_leave" ? newRecord.leaveType : undefined,
      };
      await axiosInstance.post("/attendance/my", payload);
      toast({
        title: "Success",
        description: "Attendance filed!",
        status: "success",
      });
      onClose();
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        status: "present",
        checkIn: "08:00 AM",
        checkOut: "05:00 PM",
        leaveType: "",
        notes: "",
      });
      // Refresh data
      const att = await axiosInstance.get("/attendance/my");
      setAttendance(att.data);
      const credits = await axiosInstance.get("/attendance/my-leave-credits");
      setLeaveCredits(credits.data);
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to file attendance",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" p={6} bg="gray.50">
      <Heading mb={4} color="blue.800">
        My Attendance
      </Heading>
      <LeaveCreditsPanel credits={leaveCredits} />
      <Button colorScheme="blue" onClick={onOpen} mb={4}>
        File Attendance / Leave
      </Button>
      <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
        <Table>
          <Thead>
            <Tr>
              <Th>Date</Th>
              <Th>Status</Th>
              <Th>Check-in</Th>
              <Th>Check-out</Th>
              <Th>Leave Type</Th>
              <Th>Notes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {attendance.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  No attendance records found.
                </Td>
              </Tr>
            ) : (
              attendance.map((rec) => (
                <Tr key={rec._id}>
                  <Td>{new Date(rec.date).toLocaleDateString()}</Td>
                  <Td>
                    <Tag
                      colorScheme={
                        rec.status === "Present"
                          ? "green"
                          : rec.status === "Late"
                          ? "orange"
                          : rec.status === "Absent"
                          ? "red"
                          : rec.status === "On_leave"
                          ? "blue"
                          : "gray"
                      }
                    >
                      {rec.status}
                    </Tag>
                  </Td>
                  <Td>{rec.checkIn}</Td>
                  <Td>{rec.checkOut}</Td>
                  <Td>{rec.leaveType || "-"}</Td>
                  <Td>{rec.notes || "-"}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal for filing attendance/leave */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>File Attendance / Leave</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={newRecord.date}
                  onChange={handleChange}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={newRecord.status}
                  onChange={handleChange}
                >
                  <option value="present">Present</option>
                  <option value="late">Late</option>
                  <option value="absent">Absent</option>
                  <option value="on_leave">On Leave</option>
                </Select>
              </FormControl>
              {newRecord.status === "on_leave" && (
                <FormControl isRequired>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    name="leaveType"
                    value={newRecord.leaveType}
                    onChange={handleChange}
                  >
                    <option value="">Select Leave Type</option>
                    {LEAVE_TYPES.map((type) => (
                      <option
                        key={type.key}
                        value={type.key}
                        disabled={
                          leaveCredits?.credits[type.key]?.remaining === 0
                        }
                      >
                        {type.label} (
                        {leaveCredits?.credits[type.key]?.remaining ?? 0} left)
                      </option>
                    ))}
                  </Select>
                  {newRecord.leaveType &&
                    leaveCredits?.credits[newRecord.leaveType]?.remaining ===
                      0 && (
                      <Alert status="error" mt={2}>
                        <AlertIcon />
                        You cannot file leave: no credits left.
                      </Alert>
                    )}
                </FormControl>
              )}
              {(newRecord.status === "present" ||
                newRecord.status === "late") && (
                <>
                  <FormControl>
                    <FormLabel>Check-in</FormLabel>
                    <Input
                      name="checkIn"
                      value={newRecord.checkIn}
                      onChange={handleChange}
                      placeholder="08:00 AM"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Check-out</FormLabel>
                    <Input
                      name="checkOut"
                      value={newRecord.checkOut}
                      onChange={handleChange}
                      placeholder="05:00 PM"
                    />
                  </FormControl>
                </>
              )}
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={newRecord.notes}
                  onChange={handleChange}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={isLoading}
              isDisabled={
                newRecord.status === "on_leave" &&
                (!newRecord.leaveType ||
                  leaveCredits?.credits[newRecord.leaveType]?.remaining === 0)
              }
            >
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EmployeeAttendance;
