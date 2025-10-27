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
import axiosInstance from "../../../lib/axiosInstance";
import EmployeeOffenseSection from "../../../components/documents/employee/employee_offenses/EmployeeOffenseSection";
import EmployeeDocumentsSection from "../../../components/documents/employee/EmployeeDocuments";
const EmployeeDocuments = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tabIndex, setTabIndex] = useState(0);
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [policyData, setPolicyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef(null);
  const [offenseData, setOffenseData] = useState([]);
  const [suspensionData, setSuspensionData] = useState([]);
  const [offenseLoading, setOffenseLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    employeeName: "",
    employeeDepartment: "",
    offenseDetails: "",
  });

  // --- Fetch All Offenses for Logged-in Employee ---
  /*   const fetchMyOffenses = async () => {
    try {
      setOffenseLoading(true);
      console.log("Fetching my offenses...");

      const res = await axiosInstance.get("/employee/my-offenses");
      console.log("Fetched my offenses:", res.data);

      // Get all offense IDs
      const offenseIds = res.data.offenses?.map((offense) => offense._id) || [];
      console.log("Offense IDs:", offenseIds);

      // Fetch detailed data for each offense
      const detailedOffenses = await Promise.all(
        offenseIds.map(async (id) => {
          try {
            const offenseRes = await axiosInstance.get(
              `/employee/offenses/${id}`
            );
            return offenseRes.data.offense;
          } catch (err) {
            console.error(`Failed to fetch offense ${id}:`, err);
            return null;
          }
        })
      );

      // Filter out any null values and set data
      const validOffenses = detailedOffenses.filter(
        (offense) => offense !== null
      );
      console.log("Detailed offenses:", validOffenses);
      setOffenseData(validOffenses);
    } catch (err) {
      console.error("Failed to fetch my offenses:", err);
      console.error("Error status:", err.response?.status);
      console.error("Error message:", err.response?.data?.message);
      setOffenseData([]);
    } finally {
      setOffenseLoading(false);
    }
  }; */

  // --- Fetch Specific Offense by ID (if needed) ---
  const fetchOffenseById = async (offenseId) => {
    try {
      if (!offenseId) {
        console.warn("No offenseId provided");
        return null;
      }

      console.log("Fetching offense by ID:", offenseId);
      const res = await axiosInstance.get(`/employee/offenses/${offenseId}`);
      console.log("Fetched offense by ID:", res.data);

      return res.data.offense || res.data;
    } catch (err) {
      console.error("Failed to fetch offense by ID:", err);
      return null;
    }
  };

  // --- Fetch Suspensions ---
  const fetchSuspensions = async () => {
    try {
      console.log("Fetching suspensions...");
      const res = await axiosInstance.get("/Suspension/suspension-all");
      console.log("Response:", res);

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
    await fetchOffenseById();
  };

  const handleSuspensionRefresh = async () => {
    await fetchSuspensions();
  };

  // --- Fetch Offenses and Suspensions on Mount ---
  useEffect(() => {
    const role = localStorage.getItem("role");
    const employeeId = localStorage.getItem("employeeId");

    // For employees, fetch their own offenses
    // For admins, you can create a separate admin endpoint
    if (role === "employee") {
      fetchMyOffenses();
    } else if (role === "admin") {
      // TODO: Create an admin endpoint to fetch all offenses
      fetchMyOffenses(); // For now, fallback to employee endpoint
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
  const handleSuccessUpload = () => {
    fetchPolicies();
  };

  // --- Refresh after successful update ---
  const handleDataRefresh = async () => {
    await fetchPolicies();
  };

  // --- Debounce for name suggestions ---
  const filterNameSuggestions = useCallback((value) => {
    if (value.length > 1) {
      // TODO: Replace with actual employees data from your backend
      const employees = [];
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
                <EmployeeDocumentsSection
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
              {offenseLoading ? (
                <Center py={10}>
                  <Spinner size="lg" color="red.500" />
                </Center>
              ) : offenseData.length === 0 ? (
                <Center py={10}>
                  <Text color="gray.500">No offenses recorded for you.</Text>
                </Center>
              ) : (
                <EmployeeOffenseSection
                  data={offenseData}
                  color="red.700"
                  refreshData={handleOffenseRefresh}
                />
              )}
            </TabPanel>

            <TabPanel>
              {/*    <SuspensionSection
                data={suspensionData}
                color="orange.700"
                refreshData={handleSuspensionRefresh}
              /> */}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default EmployeeDocuments;
