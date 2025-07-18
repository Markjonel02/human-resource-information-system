import React, { useState, useRef, useCallback } from "react"; // Import useRef and useCallback
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  VStack,
  HStack,
  Icon,
  Flex,
  Spacer,
  Button,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaFileAlt,
  FaExclamationTriangle,
  FaBan,
  FaPlusCircle,
} from "react-icons/fa";

// Sample Data for Autocomplete
const employees = [
  { id: "12345", name: "John Doe", department: "Engineering" },
  { id: "67890", name: "Jane Smith", department: "Human Resources" },
  { id: "11223", name: "Peter Jones", department: "Marketing" },
  { id: "44556", name: "Alice Brown", department: "Sales" },
  { id: "77889", name: "Bob White", department: "Engineering" },
];

// Main Documents component
const Documents = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeDepartment, setEmployeeDepartment] = useState("");
  const [offenseDetails, setOffenseDetails] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState([]);

  // useRef to store the timeout ID
  const debounceTimeout = useRef(null);

  const handleTabChange = (index) => {
    setTabIndex(index);
    if (isOpen) {
      setEmployeeName("");
      setEmployeeDepartment("");
      setOffenseDetails("");
      setNameSuggestions([]);
    }
  };

  // Debounced function to filter suggestions
  // useCallback is used to memoize the function, preventing unnecessary re-creations
  const filterNameSuggestions = useCallback((value) => {
    if (value.length > 1) {
      const filteredSuggestions = employees.filter((employee) =>
        employee.name.toLowerCase().includes(value.toLowerCase())
      );
      setNameSuggestions(filteredSuggestions);
    } else {
      setNameSuggestions([]);
    }
  }, []); // Empty dependency array means this function is created once

  const handleNameChange = (e) => {
    const value = e.target.value;
    setEmployeeName(value);

    // Clear the previous timeout if it exists
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new timeout
    debounceTimeout.current = setTimeout(() => {
      filterNameSuggestions(value);
    }, 300); // 300ms debounce delay
  };

  const handleSelectName = (employee) => {
    setEmployeeName(employee.name);
    setEmployeeDepartment(employee.department);
    setNameSuggestions([]);
    // Clear any pending debounce timeout immediately when a selection is made
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting for tab index:", tabIndex);
    if (tabIndex === 0) {
      console.log("Adding new Policy/Memo (details not implemented yet)");
    } else if (tabIndex === 1) {
      console.log("New Offense:", {
        employeeName,
        employeeDepartment,
        offenseDetails,
      });
    } else if (tabIndex === 2) {
      console.log("New Suspension:", {
        employeeName,
        employeeDepartment,
        offenseDetails,
      });
    }
    onClose();
    setEmployeeName("");
    setEmployeeDepartment("");
    setOffenseDetails("");
    setNameSuggestions([]);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
  };

  return (
    <Box
      mt={10}
      p={{ base: 4, md: 10, lg: 0 }}
      minH="100vh"
      fontFamily="Inter, sans-serif"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Box
        w={{ base: "100%", md: "100%", lg: "100%" }}
        maxW="1200px"
        bg="white"
        p={{ base: 4, md: 8, lg: 0 }}
        borderRadius="none"
        shadow="none"
      >
        <Flex mb={6} alignItems="center">
          <Text
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="gray.800"
          >
            Company Documents
          </Text>
          <Spacer />
          <Button
            leftIcon={<FaPlusCircle />}
            colorScheme="blue"
            size={{ base: "sm", md: "md" }}
            borderRadius="md"
            shadow="none"
            _hover={{ bg: "blue.500" }}
            onClick={onOpen}
          >
            Add New
          </Button>
        </Flex>

        <Tabs
          isFitted
          variant="unstyled"
          colorScheme="blue"
          index={tabIndex}
          onChange={handleTabChange}
        >
          <TabList mb="1em" borderBottom="2px solid" borderColor="gray.200">
            <Tab
              py={3}
              _selected={{
                color: "blue.600",
                borderBottom: "2px solid",
                borderColor: "blue.600",
                bg: "transparent",
                fontWeight: "semibold",
              }}
              _hover={{ bg: "gray.100" }}
              borderRadius="none"
              fontSize={{ base: "sm", md: "md" }}
            >
              {" "}
              <Tooltip label="Policies & Memos">
                <HStack spacing={2} justify="center">
                  <Icon as={FaFileAlt} />

                  <Text display={{ base: "none", md: "inline" }}>
                    Policies & Memos
                  </Text>

                  <Text display={{ base: "inline", md: "none" }}>Polic...</Text>
                </HStack>
              </Tooltip>
            </Tab>
            <Tab
              py={3}
              _selected={{
                color: "red.600",
                borderBottom: "2px solid",
                borderColor: "red.600",
                bg: "transparent",
                fontWeight: "semibold",
              }}
              _hover={{ bg: "gray.100" }}
              borderRadius="none"
              fontSize={{ base: "sm", md: "md" }}
            >
              <Tooltip label="Offenses">
                <HStack spacing={2} justify="center">
                  <Icon as={FaExclamationTriangle} />
                  <Text display={{ base: "none", md: "inline" }}>Offenses</Text>
                  <Text display={{ base: "inline", md: "none" }}>Offen...</Text>
                </HStack>
              </Tooltip>
            </Tab>
            <Tab
              py={3}
              _selected={{
                color: "orange.600",
                borderBottom: "2px solid",
                borderColor: "orange.600",
                bg: "transparent",
                fontWeight: "semibold",
              }}
              _hover={{ bg: "gray.100" }}
              borderRadius="none"
              fontSize={{ base: "sm", md: "md" }}
            >
              <Tooltip label="Suspended">
                <HStack spacing={2} justify="center">
                  <Icon as={FaBan} />
                  <Text display={{ base: "none", md: "inline" }}>
                    Suspended
                  </Text>
                  <Text display={{ base: "inline", md: "none" }}>Suspe...</Text>
                </HStack>
              </Tooltip>
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2} color="blue.700">
                    Employee Handbook V2.0
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Updated guidelines on remote work policy and leave
                    applications. Effective July 1, 2025.
                  </Text>
                </Box>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2} color="blue.700">
                    Q3 Performance Review Memo
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Details regarding the upcoming performance review cycle and
                    submission deadlines.
                  </Text>
                </Box>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2} color="blue.700">
                    New Travel Policy
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Revised travel expense reimbursement policy. Please review
                    before any business travel.
                  </Text>
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2} color="red.700">
                    Late Submission - Project Alpha
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Employee ID: 12345. Project Alpha deliverables submitted 3
                    days past deadline.
                  </Text>
                </Box>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text fontWeight="bold" fontSize="lg" mb={2} color="red.700">
                    Policy Violation - Data Security
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Employee ID: 67890. Unauthorized access attempt on sensitive
                    company data.
                  </Text>
                </Box>
              </VStack>
            </TabPanel>

            <TabPanel>
              <VStack align="stretch" spacing={4}>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={2}
                    color="orange.700"
                  >
                    John Doe - Administrative Leave
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Employee ID: 11223. On administrative leave pending
                    investigation.
                  </Text>
                </Box>
                <Box
                  p={5}
                  shadow="none"
                  borderWidth="1px"
                  borderColor="gray.200"
                  borderRadius="none"
                  bg="white"
                >
                  <Text
                    fontWeight="bold"
                    fontSize="lg"
                    mb={2}
                    color="orange.700"
                  >
                    Jane Smith - Temporary Suspension
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Employee ID: 44556. Suspended for 5 business days due to
                    attendance issues.
                  </Text>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Add New Document Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {tabIndex === 0 && "Add New Policy/Memo"}
            {tabIndex === 1 && "Add New Offense Record"}
            {tabIndex === 2 && "Add New Suspension Record"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Form for Policies & Memos */}
            {tabIndex === 0 && (
              <VStack spacing={4}>
                <FormControl id="document-title">
                  <FormLabel>Document Title</FormLabel>
                  <Input placeholder="e.g., New Remote Work Policy" />
                </FormControl>
                <FormControl id="document-description">
                  <FormLabel>Description</FormLabel>
                  <Textarea placeholder="Brief description of the document" />
                </FormControl>
                {/* Add other fields relevant to policies/memos */}
              </VStack>
            )}

            {/* Form for Offenses and Suspensions */}
            {(tabIndex === 1 || tabIndex === 2) && (
              <VStack spacing={4}>
                <FormControl id="employee-name">
                  <FormLabel>Employee Name</FormLabel>
                  <Input
                    placeholder="Type employee name..."
                    value={employeeName}
                    onChange={handleNameChange} // Debounced handler
                  />
                  {nameSuggestions.length > 0 && (
                    <Box
                      borderWidth="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      mt={1}
                      maxH="150px"
                      overflowY="auto"
                      zIndex="dropdown"
                      bg="white"
                    >
                      {nameSuggestions.map((employee) => (
                        <Text
                          key={employee.id}
                          p={2}
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => handleSelectName(employee)}
                        >
                          {employee.name}
                        </Text>
                      ))}
                    </Box>
                  )}
                </FormControl>
                <FormControl id="employee-department">
                  <FormLabel>Department</FormLabel>
                  <Select
                    placeholder="Select Department"
                    value={employeeDepartment}
                    onChange={(e) => setEmployeeDepartment(e.target.value)}
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Finance">Finance</option>
                  </Select>
                </FormControl>
                <FormControl id="offense-details">
                  <FormLabel>
                    {tabIndex === 1 ? "Offense Details" : "Suspension Details"}
                  </FormLabel>
                  <Textarea
                    placeholder={
                      tabIndex === 1
                        ? "Describe the offense..."
                        : "Describe the reason for suspension and duration..."
                    }
                    value={offenseDetails}
                    onChange={(e) => setOffenseDetails(e.target.value)}
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Documents;
