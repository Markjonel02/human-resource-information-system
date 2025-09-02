import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { FiMoreVertical, FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import axiosInstance from "../../../lib/axiosInstance";
const OvertimeUI = () => {
  const [sortBy, setSortBy] = useState("date");
  const [overtimes, setOvertimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    id: null,
    date: "",
    hours: "",
    reason: "",
  });

  const statusColor = {
    pending: "orange",
    approved: "green",
    rejected: "red",
  };

  // Load data on mount
  // Load data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get(
          "/overtime/getEmployeeOvertime"
        );
        setOvertimes(response.data);
      } catch (err) {
        // Check if the error is a 404 with a specific message from the server
        if (err.response && err.response.status === 404) {
          // Handle the "No records found" case gracefully
          setOvertimes([]); // Set an empty array to render the empty state
          toast({
            title: "No overtime records found.",
            description: "You haven't submitted any overtime requests yet.",
            status: "info",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else {
          // Handle all other types of errors
          const errorMessage =
            err.response?.data?.message || "Error loading overtime records.";
          toast({
            title: "Failed to load records",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]); // Add toast to dependency array

  const handleSort = (criteria) => {
    setSortBy(criteria);
    const sorted = [...overtimes].sort((a, b) => {
      if (criteria === "date") return new Date(b.date) - new Date(a.date);
      if (criteria === "hours") return b.hours - a.hours;
      if (criteria === "status") return a.status.localeCompare(b.status);
      return 0;
    });
    setOvertimes(sorted);
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.hours || !formData.reason) return;

    try {
      if (formData.id) {
        // Edit mode
        const updated = await axiosInstance.put(
          `/employeeOvertime/editOvertime/${formData.id}`,
          {
            date: formData.date,
            hours: formData.hours,
            reason: formData.reason,
          }
        );
        setOvertimes((prev) =>
          prev.map((ot) =>
            ot._id === formData.id ? updated.overtimeRequest : ot
          )
        );
        toast({ title: "Overtime updated", status: "success" });
      } else {
        // Add new
        const newRecord = await addOvertime({
          date: formData.date,
          hours: formData.hours,
          reason: formData.reason,
        });
        setOvertimes((prev) => [newRecord.overtimeRequest, ...prev]);
        toast({ title: "Overtime added", status: "success" });
      }
      setFormData({ id: null, date: "", hours: "", reason: "" });
      onClose();
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Error submitting overtime",
        status: "error",
      });
    }
  };

  const handleView = (ot) => {
    toast({
      title: "Overtime Details",
      description: `${ot.date.split("T")[0]} - ${ot.hours} hrs (${ot.status})`,
      status: "info",
      duration: 3000,
      position: "top",
    });
  };

  const handleEdit = (ot) => {
    setFormData({
      id: ot._id,
      date: ot.date.split("T")[0],
      hours: ot.hours,
      reason: ot.reason,
    });
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await deleteOvertime(id);
      setOvertimes((prev) => prev.filter((ot) => ot._id !== id));
      toast({ title: "Overtime deleted", status: "success" });
    } catch (err) {
      toast({
        title: err.response?.data?.message || "Error deleting overtime",
        status: "error",
      });
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Heading size="lg">Overtime Requests</Heading>
        <Flex gap={3}>
          <Select
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            maxW="200px"
            borderRadius="xl"
          >
            <option value="date">Sort by Date</option>
            <option value="hours">Sort by Hours</option>
            <option value="status">Sort by Status</option>
          </Select>
          <Button colorScheme="blue" onClick={onOpen}>
            + New Overtime
          </Button>
        </Flex>
      </Flex>

      {/* Table */}
      <Box
        borderWidth="1px"
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="md"
      >
        <Table variant="simple">
          <Thead bg={useColorModeValue("gray.100", "gray.700")}>
            <Tr>
              <Th>Date</Th>
              <Th>Hours</Th>
              <Th>Reason</Th>
              <Th>Status</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {overtimes.map((overtime) => (
              <Tr key={overtime._id}>
                <Td>{new Date(overtime.date).toLocaleDateString()}</Td>
                <Td>{overtime.hours} hrs</Td>
                <Td maxW="250px" isTruncated>
                  {overtime.reason}
                </Td>
                <Td>
                  <Badge
                    colorScheme={statusColor[overtime.status] || "gray"}
                    fontWeight={500}
                  >
                    {overtime.status}
                  </Badge>
                </Td>
                <Td textAlign="center">
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      borderRadius="full"
                    />
                    <MenuList>
                      <MenuItem
                        icon={<FiEye />}
                        onClick={() => handleView(overtime)}
                      >
                        View
                      </MenuItem>
                      <MenuItem
                        icon={<FiEdit />}
                        onClick={() => handleEdit(overtime)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem
                        icon={<FiTrash2 />}
                        color="red.500"
                        onClick={() => handleDelete(overtime._id)}
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

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {formData.id ? "Edit Overtime" : "Add New Overtime"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4} isRequired>
              <FormLabel>Date</FormLabel>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={4} isRequired>
              <FormLabel>Hours</FormLabel>
              <Input
                type="number"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              {formData.id ? "Update" : "Submit"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OvertimeUI;
