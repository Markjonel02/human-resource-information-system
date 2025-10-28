import React, { useState, useRef, useCallback, useEffect } from "react";
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
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FaFileAlt,
  FaExclamationTriangle,
  FaBan,
  FaPlusCircle,
} from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";
import OffenseSection from "../components/documents/offenses/OffenseSection";
import SuspensionSection from "../components/documents/suspended/SuspentionSection";
// --- Local Components ---
import DocumentSection from "../components/documents/DocumentSection";
import PolicyForm from "../components/documents/PolicyForm";
import AddOffenseModal from "../components/documents/offenses/AddOffenseModal";
import AddSuspensionModal from "../components/documents/suspended/AddSuspensionModal";

const Documents = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [policyData, setPolicyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const [offenseData, setOffenseData] = useState([]);
  const [suspensionData, setSuspensionData] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeName: "",
    employeeDepartment: "",
    offenseDetails: "",
  });

  // --- Fetch Offenses ---
  const fetchOffenses = async () => {
    try {
      const res = await axiosInstance.get("/offense/get-all-offense");
      setOffenseData(res.data.offenses || res.data || []);
    } catch (err) {
      console.error("Failed to fetch offenses:", err);
      setOffenseData([]);
    }
  };

  // --- Fetch Offenses for Logged-in Employee ---
  const fetchMyOffenses = async (offenseId) => {
    try {
      if (!offenseId) {
        console.warn("No offenseId provided for fetchMyOffenses");
        return;
      }

      const res = await axiosInstance.get(`/offense/offenses/${offenseId}`);
      console.log("Fetched offense by ID:", res.data);

      const offense = res.data.offense || res.data;
      setOffenseData(offense ? [offense] : []);
    } catch (err) {
      console.error("Failed to fetch offense by ID:", err);
      setOffenseData([]);
    }
  };

  // --- Fetch Suspensions ---
  const fetchSuspensions = async () => {
    try {
      console.log("Fetching suspensions...");
      const res = await axiosInstance.get("/Suspension/suspension-all");
      console.log("Response:", res);
      console.log("Response data:", res.data);
      console.log("Response data.data:", res.data.data);

      setSuspensionData(res.data.data || res.data || []);
      console.log("Suspension data set:", res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch suspensions:", err);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.response?.data?.message);
      setSuspensionData([]);
    }
  };

  // --- Refresh Handlers ---
  const handleOffenseRefresh = async () => {
    await fetchOffenses();
  };

  const handleSuspensionRefresh = async () => {
    await fetchSuspensions();
  };

  // --- Fetch Offenses and Suspensions on Mount ---
  useEffect(() => {
    const role = localStorage.getItem("role");
    const employeeId = localStorage.getItem("employeeId");

    if (role === "admin") {
      fetchOffenses();
    } else if (role === "employee" && employeeId) {
      fetchMyOffenses(employeeId);
    } else {
      console.warn(
        "No valid role or employeeId found, fetching all offenses by default"
      );
      fetchOffenses();
    }

    fetchSuspensions();
  }, []);

  // --- Fetch all uploaded policy PDFs ---
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/policy/get-policy");

      console.log("Full response:", res.data);

      const data = res.data.policies || res.data || [];

      console.log("Extracted policies:", data);

      setPolicyData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch policies:", err);
      console.error("Error response:", err.response);
      setPolicyData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch once on mount ---
  useEffect(() => {
    fetchPolicies();
  }, []);

  // --- Refresh after successful upload ---
  const handleSuccessUpload = async () => {
    await fetchPolicies();
    onClose(); // Close modal after success
    resetForm();
  };

  // --- Refresh after successful update ---
  const handleDataRefresh = async () => {
    await fetchPolicies();
  };

  // --- Handle Offense Success ---
  const handleOffenseSuccess = async () => {
    await fetchOffenses();
    onClose(); // Close modal after success
    resetForm();
  };

  // --- Handle Suspension Success ---
  const handleSuspensionSuccess = async () => {
    await fetchSuspensions();
    onClose(); // Close modal after success
    resetForm();
  };

  // --- Debounce for name suggestions ---
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
                borderBottom: "2px orange.600",
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
              {isLoading ? (
                <Center py={10}>
                  <Spinner size="lg" color="blue.500" />
                </Center>
              ) : policyData.length === 0 ? (
                <Center py={10}>
                  <Text color="gray.500">No policies uploaded yet.</Text>
                </Center>
              ) : (
                <DocumentSection
                  data={policyData.map((item) => ({
                    _id: item._id,
                    title: item.title,
                    description: item.description || "No description provided.",
                    filePath: item.filePath,
                  }))}
                  color="blue.700"
                  refreshData={handleDataRefresh}
                />
              )}
            </TabPanel>

            <TabPanel>
              <OffenseSection
                data={offenseData}
                color="red.700"
                refreshData={handleOffenseRefresh}
                isEmployeeView={false}
              />
            </TabPanel>

            <TabPanel>
              <SuspensionSection
                data={suspensionData}
                color="orange.700"
                refreshData={handleSuspensionRefresh}
              />
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
              <PolicyForm
                formData={formData}
                setFormData={setFormData}
                onClose={onClose}
                onSuccess={handleSuccessUpload}
              />
            )}
            {tabIndex === 1 && (
              <AddOffenseModal
                isOpen={isOpen}
                onClose={onClose}
                onSuccess={handleOffenseSuccess}
              />
            )}
            {tabIndex === 2 && (
              <AddSuspensionModal
                isOpen={isOpen}
                onClose={onClose}
                onSuspensionAdded={handleSuspensionSuccess}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Documents;
