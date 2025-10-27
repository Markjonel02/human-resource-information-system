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
  const [policyData, setPolicyData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suspensionData, setSuspensionData] = useState([]);
  const debounceTimeout = useRef(null);

  // --- Fetch all uploaded policy PDFs ---
  const fetchPolicies = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching policies...");
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
  const handleDataRefresh = async () => {
    await fetchPolicies();
  };

  const handleSuspensionRefresh = async () => {
    await fetchSuspensions();
  };

  // --- Fetch once on mount ---
  useEffect(() => {
    console.log("EmployeeDocuments mounted, fetching initial data...");
    fetchPolicies();
    fetchSuspensions();
  }, []);

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
            {/* --- POLICIES TAB --- */}
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

            {/* --- OFFENSES TAB --- */}
            <TabPanel>
              {/* EmployeeOffenseSection handles its own data fetching from /employee/my-offenses */}
              <EmployeeOffenseSection color="red.700" isEmployeeView={true} />
            </TabPanel>

            {/* --- SUSPENSIONS TAB --- */}
            <TabPanel>
              {suspensionData.length === 0 ? (
                <Center py={10}>
                  <Text color="gray.500">No suspensions recorded.</Text>
                </Center>
              ) : (
                <Text>
                  Suspensions section - Add SuspensionSection component here
                </Text>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default EmployeeDocuments;
