import React, { useState, useRef, useCallback } from "react";
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
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaFileAlt,
  FaExclamationTriangle,
  FaBan,
  FaPlusCircle,
} from "react-icons/fa";

// --- Local Components ---
import DocumentSection from "../components/documents/DocumentSection";
import PolicyForm from "../components/documents/PolicyForm";
import OffenseForm from "../components/documents/OffenseForm";
import SuspensionForm from "../components/documents/SuspensionForm";

// --- Sample Employee Data ---
const employees = [
  { id: "12345", name: "John Doe", department: "Engineering" },
  { id: "67890", name: "Jane Smith", department: "Human Resources" },
  { id: "11223", name: "Peter Jones", department: "Marketing" },
  { id: "44556", name: "Alice Brown", department: "Sales" },
  { id: "77889", name: "Bob White", department: "Engineering" },
];

const Documents = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const debounceTimeout = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeName: "",
    employeeDepartment: "",
    offenseDetails: "",
  });

  // --- Debounced Suggestion Logic ---
  const filterNameSuggestions = useCallback((value) => {
    if (value.length > 1) {
      const filtered = employees.filter((employee) =>
        employee.name.toLowerCase().includes(value.toLowerCase())
      );
      setNameSuggestions(filtered);
    } else {
      setNameSuggestions([]);
    }
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, employeeName: value }));
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(
      () => filterNameSuggestions(value),
      300
    );
  };

  const handleSelectName = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employeeName: employee.name,
      employeeDepartment: employee.department,
    }));
    setNameSuggestions([]);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      employeeName: "",
      employeeDepartment: "",
      offenseDetails: "",
    });
    setNameSuggestions([]);
  };

  const handleSubmit = () => {
    console.log("Submitted Data:", { tabIndex, ...formData });
    resetForm();
    onClose();
  };

  // --- Mock Data ---
  const policyData = [
    {
      title: "Employee Handbook V2.0",
      description:
        "Updated guidelines on remote work policy and leave applications.",
    },
    {
      title: "Q3 Performance Review Memo",
      description:
        "Details regarding performance review cycle and submission deadlines.",
    },
  ];

  const offenseData = [
    {
      title: "Late Submission - Project Alpha",
      description:
        "Employee ID: 12345. Deliverables submitted 3 days past deadline.",
    },
  ];

  const suspendedData = [
    {
      title: "John Doe - Administrative Leave",
      description:
        "Employee ID: 11223. On administrative leave pending investigation.",
    },
  ];

  return (
    <Box
      mt={10}
      p={{ base: 4, md: 10 }}
      minH="100vh"
      fontFamily="Inter, sans-serif"
      display="flex"
      justifyContent="center"
      alignItems="flex-start"
    >
      <Box w="100%" maxW="1200px" bg="white" p={{ base: 4, md: 8 }}>
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
            onClick={onOpen}
          >
            Add New
          </Button>
        </Flex>

        <Tabs
          isFitted
          variant="unstyled"
          index={tabIndex}
          onChange={setTabIndex}
        >
          <TabList mb="1em" borderBottom="2px solid" borderColor="gray.200">
            <Tab
              _selected={{
                color: "blue.600",
                borderBottom: "2px solid blue.600",
              }}
            >
              <Tooltip label="Policies & Memos">
                <HStack spacing={2}>
                  <Icon as={FaFileAlt} />
                  <Text display={{ base: "none", md: "inline" }}>Policies</Text>
                </HStack>
              </Tooltip>
            </Tab>
            <Tab
              _selected={{
                color: "red.600",
                borderBottom: "2px solid red.600",
              }}
            >
              <Tooltip label="Offenses">
                <HStack spacing={2}>
                  <Icon as={FaExclamationTriangle} />
                  <Text display={{ base: "none", md: "inline" }}>Offenses</Text>
                </HStack>
              </Tooltip>
            </Tab>
            <Tab
              _selected={{
                color: "orange.600",
                borderBottom: "2px solid orange.600",
              }}
            >
              <Tooltip label="Suspended Employees">
                <HStack spacing={2}>
                  <Icon as={FaBan} />
                  <Text display={{ base: "none", md: "inline" }}>
                    Suspended
                  </Text>
                </HStack>
              </Tooltip>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <DocumentSection data={policyData} color="blue.700" />
            </TabPanel>
            <TabPanel>
              <DocumentSection data={offenseData} color="red.700" />
            </TabPanel>
            <TabPanel>
              <DocumentSection data={suspendedData} color="orange.700" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* --- Modal --- */}
      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          resetForm();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {tabIndex === 0 && "Add New Policy/Memo"}
            {tabIndex === 1 && "Add New Offense Record"}
            {tabIndex === 2 && "Add New Suspension Record"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {tabIndex === 0 && (
              <PolicyForm formData={formData} setFormData={setFormData} />
            )}
            {tabIndex === 1 && (
              <OffenseForm
                formData={formData}
                setFormData={setFormData}
                nameSuggestions={nameSuggestions}
                handleNameChange={handleNameChange}
                handleSelectName={handleSelectName}
              />
            )}
            {tabIndex === 2 && (
              <SuspensionForm
                formData={formData}
                setFormData={setFormData}
                nameSuggestions={nameSuggestions}
                handleNameChange={handleNameChange}
                handleSelectName={handleSelectName}
              />
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              onClick={() => {
                onClose();
                resetForm();
              }}
              mr={3}
            >
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
