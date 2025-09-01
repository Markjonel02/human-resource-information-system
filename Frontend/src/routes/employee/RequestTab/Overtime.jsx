import { useState } from "react";
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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import {
  FiMoreVertical,
  FiEye,
  FiEdit,
  FiTrash2,
  FiArrowDown,
} from "react-icons/fi";

// Mock overtime data
const mockOvertimes = [
  {
    id: 1,
    date: "2025-08-30",
    hours: 4,
    status: "Pending",
    reason: "Project deadline",
  },
  {
    id: 2,
    date: "2025-08-28",
    hours: 3,
    status: "Approved",
    reason: "Server maintenance",
  },
  {
    id: 3,
    date: "2025-08-25",
    hours: 6,
    status: "Rejected",
    reason: "Not urgent",
  },
];

export default function OvertimeUI() {
  const [sortBy, setSortBy] = useState("date");
  const [overtimes, setOvertimes] = useState(mockOvertimes);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    reason: "",
  });

  const statusColor = {
    Pending: "orange",
    Approved: "green",
    Rejected: "red",
  };

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

  const handleSubmit = () => {
    if (!formData.date || !formData.hours || !formData.reason) return;

    const newOvertime = {
      id: overtimes.length + 1,
      date: formData.date,
      hours: Number(formData.hours),
      reason: formData.reason,
      status: "Pending",
    };

    setOvertimes([newOvertime, ...overtimes]);
    setFormData({ date: "", hours: "", reason: "" });
    onClose();
    toast({
      title: "Overtime Added",
      status: "success",
      duration: 2500,
      isClosable: true,
      position: "top",
    });
  };

  const handleView = (ot) => {
    toast({
      title: "Viewing Overtime",
      description: `${ot.date} - ${ot.hours} hrs (${ot.status})`,
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  const handleEdit = (ot) => {
    setFormData({ date: ot.date, hours: ot.hours, reason: ot.reason });
    onOpen();
    toast({
      title: "Edit Mode",
      description: "Make your changes in the modal.",
      status: "warning",
      duration: 2000,
      position: "top",
    });
  };

  const handleDelete = (id) => {
    setOvertimes(overtimes.filter((ot) => ot.id !== id));
    toast({
      title: "Overtime Deleted",
      status: "error",
      duration: 2500,
      position: "top",
    });
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      {/* Header Section */}
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
          <Button
            colorScheme="blue"
            px={10}
            py={2.5}
            fontWeight="semibold"
            fontSize="sm"
            borderRadius="lg"
            boxShadow="base"
            transition="all 0.2s ease-in-out"
            _hover={{
              boxShadow: "md",
              transform: "translateY(-1px)",
            }}
            _active={{
              boxShadow: "sm",
              transform: "scale(0.98)",
            }}
            onClick={onOpen}
          >
            + New Overtime
          </Button>
        </Flex>
      </Flex>

      {/* Overtime Table */}
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
              <Tr
                key={overtime.id}
                _hover={{ bg: useColorModeValue("gray.50", "gray.800") }}
              >
                <Td>{new Date(overtime.date).toLocaleDateString()}</Td>
                <Td>{overtime.hours} hrs</Td>
                <Td maxW="250px" isTruncated>
                  {overtime.reason}
                </Td>
                <Td>
                  <Badge colorScheme={statusColor[overtime.status]}>
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
                      aria-label="Options"
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
                        onClick={() => handleDelete(overtime.id)}
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

      {/* Add / Edit Overtime Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="2xl" p={2}>
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
                placeholder="Enter number of hours"
                value={formData.hours}
                onChange={(e) =>
                  setFormData({ ...formData, hours: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={2} isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                placeholder="Explain why you worked overtime..."
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" borderRadius="xl" onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" borderRadius="xl" onClick={handleSubmit}>
              {formData.id ? "Update Overtime" : "Submit Overtime"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
