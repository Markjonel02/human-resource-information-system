import { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  Select,
  SimpleGrid,
  Text,
  Badge,
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
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

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

const OvertimeCard = ({ overtime }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const statusColor = {
    Pending: "orange",
    Approved: "green",
    Rejected: "red",
  };

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="2xl"
      boxShadow="md"
      transition="all 0.2s"
      _hover={{ transform: "translateY(-4px)", boxShadow: "lg" }}
    >
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontWeight="bold">{new Date(overtime.date).toDateString()}</Text>
        <Badge colorScheme={statusColor[overtime.status]}>
          {overtime.status}
        </Badge>
      </Flex>
      <Text fontSize="sm" color="gray.500">
        Hours Rendered
      </Text>
      <Text fontSize="xl" fontWeight="bold" mb={2}>
        {overtime.hours} hrs
      </Text>
      <Text fontSize="sm" color="gray.600" noOfLines={2}>
        {overtime.reason}
      </Text>
    </Box>
  );
};

export default function OvertimeUI() {
  const [sortBy, setSortBy] = useState("date");
  const [overtimes, setOvertimes] = useState(mockOvertimes);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    date: "",
    hours: "",
    reason: "",
  });

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
            leftIcon={<AddIcon />}
            colorScheme="blue"
            borderRadius="xl"
            boxShadow="sm"
            _hover={{ boxShadow: "md" }}
            onClick={onOpen}
          >
            New Overtime
          </Button>
        </Flex>
      </Flex>

      {/* Overtime Cards Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {overtimes.map((overtime) => (
          <OvertimeCard key={overtime.id} overtime={overtime} />
        ))}
      </SimpleGrid>

      {/* Add Overtime Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl" boxShadow="2xl" p={2}>
          <ModalHeader>Add New Overtime</ModalHeader>
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
              Submit Overtime
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
