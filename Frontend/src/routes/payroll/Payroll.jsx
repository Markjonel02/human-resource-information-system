import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  VStack,
  HStack,
  Text,
  Divider,
  Spinner,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  InputGroup,
  InputLeftElement,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Checkbox,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  ViewIcon,
  SearchIcon,
  CalendarIcon,
  AddIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance"; // Your axios instance
import CreatePayslipComponent from "../payroll/CreatePayslip"; // Import the new component

export default function PayslipFrontend() {
  // Employee/User role from auth context or state
  const userRole = localStorage.getItem("userRole");

  // Payroll List State
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [nextReleaseDate, setNextReleaseDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Admin Features State
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollPeriodInfo, setPayrollPeriodInfo] = useState(null);
  const [daysWorked, setDaysWorked] = useState("");
  const [generalAllowance, setGeneralAllowance] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [selectedEmployeesForBatch, setSelectedEmployeesForBatch] = useState(
    []
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Fetch next release date
  useEffect(() => {
    fetchNextReleaseDate();
    if (userRole === "admin" || userRole === "hr") {
      fetchPayrollPeriodInfo();
    }
  }, []);

  const fetchNextReleaseDate = async () => {
    try {
      const response = await axiosInstance.get("/payroll/release-date/next");
      setNextReleaseDate(response.data.data);
    } catch (error) {
      console.error("Error fetching release date:", error);
    }
  };

  const fetchPayrollPeriodInfo = async () => {
    try {
      const response = await axiosInstance.get("/payslip/admin/period-info");
      setPayrollPeriodInfo(response.data.data.currentPeriod);
    } catch (error) {
      console.error("Error fetching payroll period info:", error);
    }
  };

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      let url;
      let response;

      if (userRole === "admin" || userRole === "hr") {
        // Admin/HR view all payslips
        url = "/payslip/admin/all";
        const params = {
          page: 1,
          limit: 50,
        };
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        response = await axiosInstance.get(url, { params });
        const data = response.data.data || [];
        setPayrolls(data);
        applySort(data);
      } else {
        // Employee view own payslips
        if (!employeeId) {
          toast({
            title: "Error",
            description: "Employee ID is required",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          setLoading(false);
          return;
        }

        url = `/payroll/employee/${employeeId}`;
        const params = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        response = await axiosInstance.get(url, { params });
        const data = response.data.data || [];
        setPayrolls(data);
        applySort(data);
      }

      toast({
        title: "Success",
        description: `Loaded ${response.data.data?.length || 0} payslips`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const applySort = (data) => {
    let sorted = [...data];

    switch (sortBy) {
      case "date-desc":
        sorted.sort(
          (a, b) => new Date(b.paymentDate) - new Date(a.paymentDate)
        );
        break;
      case "date-asc":
        sorted.sort(
          (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate)
        );
        break;
      case "amount-high":
        sorted.sort(
          (a, b) =>
            (b.summary?.netPayThisPay || 0) - (a.summary?.netPayThisPay || 0)
        );
        break;
      case "amount-low":
        sorted.sort(
          (a, b) =>
            (a.summary?.netPayThisPay || 0) - (b.summary?.netPayThisPay || 0)
        );
        break;
      default:
        break;
    }

    setPayrolls(sorted);
  };

  // Handle when a new payslip is created
  const handlePayslipCreated = (newPayslip) => {
    // Refresh the payroll list
    fetchPayrolls();
    // Close the modal
    onClose();
    // Show success message
    toast({
      title: "Success",
      description: "Payslip created successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  // Admin: Create batch payslips
  const createBatchPayslips = async () => {
    if (selectedEmployeesForBatch.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one employee",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        employeeIds: selectedEmployeesForBatch.map((emp) => emp._id),
        generalAllowance: generalAllowance ? parseFloat(generalAllowance) : 0,
      };

      if (customStartDate) payload.customStartDate = customStartDate;
      if (customEndDate) payload.customEndDate = customEndDate;

      const response = await axiosInstance.post(
        "/payslip/admin/create-batch",
        payload
      );

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Reset
      setSelectedEmployeesForBatch([]);
      setGeneralAllowance("");
      setOtherDeductions("");
      setCustomStartDate("");
      setCustomEndDate("");
      onClose();

      // Refresh
      fetchPayrolls();
    } catch (error) {
      console.error("Error creating batch payslips:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create payslips",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadPayslip = async (payrollId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/payroll/${payrollId}/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_${payrollId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Payslip downloaded successfully",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to download",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const viewPayslip = (payroll) => {
    setSelectedPayslip(payroll);
    setActiveTab(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "gray",
      pending: "yellow",
      approved: "green",
      processed: "blue",
      paid: "teal",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  return (
    <Box bg="white" minH="100vh" py={8}>
      <Container maxW="6xl">
        {/* Header */}
        <VStack spacing={8} align="stretch" mb={12}>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading as="h1" size="2xl" color="gray.900" mb={2}>
                Payroll Slips
              </Heading>
              <Text color="gray.600" fontSize="md">
                {userRole === "admin" || userRole === "hr"
                  ? "Manage payroll slips"
                  : "View and download your payroll slips"}
              </Text>
            </Box>
            {(userRole === "admin" || userRole === "hr") && (
              <Button
                leftIcon={<AddIcon />}
                bg="gray.900"
                color="white"
                fontWeight="600"
                onClick={onOpen}
                _hover={{ bg: "gray.800" }}
              >
                Create Payslip
              </Button>
            )}
          </Flex>

          {/* Next Release Date */}
          {nextReleaseDate && (
            <Card bg="blue.50" border="1px solid" borderColor="blue.200">
              <CardBody>
                <HStack spacing={4} align="center">
                  <Box color="blue.600" fontSize="2xl">
                    📅
                  </Box>
                  <Box>
                    <Text
                      fontSize="sm"
                      color="blue.600"
                      fontWeight="500"
                      mb={1}
                    >
                      Next Payroll Release
                    </Text>
                    <Heading size="md" color="blue.700">
                      {formatDate(nextReleaseDate.nextReleaseDate)}
                    </Heading>
                    <Text fontSize="xs" color="blue.600" mt={1}>
                      Period:{" "}
                      {formatDate(nextReleaseDate.payrollPeriod?.startDate)} to{" "}
                      {formatDate(nextReleaseDate.payrollPeriod?.endDate)}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList mb={8} borderBottomWidth="2px" borderBottomColor="gray.200">
            <Tab
              pb={3}
              px={0}
              mr={8}
              fontWeight="600"
              color="gray.600"
              _selected={{
                color: "gray.900",
                borderBottomColor: "gray.900",
                borderBottomWidth: "2px",
              }}
              _focus={{ outline: "none" }}
            >
              Payroll Slips
            </Tab>
            {selectedPayslip && (
              <Tab
                pb={3}
                px={0}
                fontWeight="600"
                color="gray.600"
                _selected={{
                  color: "gray.900",
                  borderBottomColor: "gray.900",
                  borderBottomWidth: "2px",
                }}
                _focus={{ outline: "none" }}
              >
                Details
              </Tab>
            )}
          </TabList>

          <TabPanels>
            {/* List Tab */}
            <TabPanel px={0}>
              <VStack spacing={8} align="stretch">
                {/* Search Section */}
                <Box
                  bg="gray.50"
                  p={6}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Heading size="sm" mb={6} color="gray.900">
                    Search & Filter
                  </Heading>

                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(4, 1fr)",
                    }}
                    gap={4}
                    mb={6}
                  >
                    {!(userRole === "admin" || userRole === "hr") && (
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="600"
                          color="gray.700"
                          mb={2}
                        >
                          Employee ID
                        </Text>
                        <InputGroup>
                          <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.400" />
                          </InputLeftElement>
                          <Input
                            placeholder="Enter employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            bg="white"
                            border="1px solid"
                            borderColor="gray.300"
                            _focus={{
                              borderColor: "gray.500",
                              boxShadow: "none",
                            }}
                            _placeholder={{ color: "gray.500" }}
                          />
                        </InputGroup>
                      </Box>
                    )}

                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.700"
                        mb={2}
                      >
                        Start Date
                      </Text>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "gray.500",
                          boxShadow: "none",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.700"
                        mb={2}
                      >
                        End Date
                      </Text>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "gray.500",
                          boxShadow: "none",
                        }}
                      />
                    </Box>

                    <Box>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color="gray.700"
                        mb={2}
                      >
                        Sort By
                      </Text>
                      <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.300"
                        _focus={{
                          borderColor: "gray.500",
                          boxShadow: "none",
                        }}
                      >
                        <option value="date-desc">Newest First</option>
                        <option value="date-asc">Oldest First</option>
                        <option value="amount-high">
                          Amount (High to Low)
                        </option>
                        <option value="amount-low">Amount (Low to High)</option>
                      </Select>
                    </Box>
                  </Grid>

                  <Button
                    w={{ base: "full", md: "auto" }}
                    bg="gray.900"
                    color="white"
                    fontWeight="600"
                    onClick={fetchPayrolls}
                    isLoading={loading}
                    _hover={{ bg: "gray.800" }}
                    _active={{ bg: "gray.900" }}
                  >
                    Search
                  </Button>
                </Box>

                {/* Payslips Table */}
                <Box
                  overflowX="auto"
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                >
                  {loading ? (
                    <Box p={12} textAlign="center">
                      <Spinner size="xl" mb={4} />
                      <Text fontSize="md" color="gray.500">
                        Loading payslips...
                      </Text>
                    </Box>
                  ) : payrolls.length === 0 ? (
                    <Box p={12} textAlign="center">
                      <Text fontSize="md" color="gray.500" mb={2}>
                        No payslips found
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Try adjusting your search filters
                      </Text>
                    </Box>
                  ) : (
                    <Table>
                      <Thead
                        bg="gray.50"
                        borderBottomWidth="1px"
                        borderBottomColor="gray.200"
                      >
                        <Tr>
                          <Th fontSize="sm" fontWeight="600" color="gray.700">
                            Employee
                          </Th>
                          <Th fontSize="sm" fontWeight="600" color="gray.700">
                            Period
                          </Th>
                          <Th fontSize="sm" fontWeight="600" color="gray.700">
                            Payment Date
                          </Th>
                          <Th
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            isNumeric
                          >
                            Gross Pay
                          </Th>
                          <Th
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            isNumeric
                          >
                            Deductions
                          </Th>
                          <Th
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            isNumeric
                          >
                            Net Pay
                          </Th>
                          <Th fontSize="sm" fontWeight="600" color="gray.700">
                            Status
                          </Th>
                          <Th
                            fontSize="sm"
                            fontWeight="600"
                            color="gray.700"
                            textAlign="center"
                          >
                            Actions
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {payrolls.map((payroll) => (
                          <Tr
                            key={payroll._id}
                            borderBottomWidth="1px"
                            borderBottomColor="gray.200"
                            _hover={{ bg: "gray.50" }}
                          >
                            <Td>
                              <VStack align="start" spacing={0}>
                                <Text
                                  fontWeight="600"
                                  color="gray.900"
                                  fontSize="sm"
                                >
                                  {payroll.employeeInfo?.firstname || "N/A"}{" "}
                                  {payroll.employeeInfo?.lastname || ""}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {payroll.employeeInfo?.employeeId || "N/A"}
                                </Text>
                              </VStack>
                            </Td>
                            <Td fontSize="sm" color="gray.700">
                              {formatDate(payroll.payrollPeriod?.startDate)} –{" "}
                              {formatDate(payroll.payrollPeriod?.endDate)}
                            </Td>
                            <Td fontSize="sm" color="gray.700" fontWeight="500">
                              {formatDate(payroll.paymentDate)}
                            </Td>
                            <Td
                              isNumeric
                              fontSize="sm"
                              color="gray.900"
                              fontWeight="600"
                            >
                              {formatCurrency(payroll.summary?.grossThisPay)}
                            </Td>
                            <Td isNumeric fontSize="sm" color="gray.700">
                              {formatCurrency(
                                payroll.summary?.totalDeductionsThisPay
                              )}
                            </Td>
                            <Td
                              isNumeric
                              fontSize="sm"
                              fontWeight="600"
                              color="gray.900"
                            >
                              {formatCurrency(payroll.summary?.netPayThisPay)}
                            </Td>
                            <Td>
                              <Badge
                                fontSize="xs"
                                fontWeight="600"
                                colorScheme={getStatusColor(payroll.status)}
                                variant="subtle"
                              >
                                {payroll.status?.charAt(0).toUpperCase() +
                                  payroll.status?.slice(1) || "Unknown"}
                              </Badge>
                            </Td>
                            <Td>
                              <HStack spacing={2} justify="center">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  leftIcon={<ViewIcon />}
                                  color="gray.700"
                                  fontWeight="600"
                                  fontSize="xs"
                                  onClick={() => viewPayslip(payroll)}
                                  _hover={{ bg: "gray.100" }}
                                >
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  leftIcon={<DownloadIcon />}
                                  color="gray.700"
                                  fontWeight="600"
                                  fontSize="xs"
                                  onClick={() => downloadPayslip(payroll._id)}
                                  isLoading={loading}
                                  _hover={{ bg: "gray.100" }}
                                >
                                  PDF
                                </Button>
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </Box>

                {!loading && (
                  <Text fontSize="sm" color="gray.600">
                    Showing {payrolls.length} payslip
                    {payrolls.length !== 1 ? "s" : ""}
                  </Text>
                )}
              </VStack>
            </TabPanel>

            {/* Details Tab */}
            <TabPanel px={0}>
              {selectedPayslip ? (
                <VStack spacing={8} align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="flex-start">
                    <Box>
                      <Heading size="lg" color="gray.900" mb={1}>
                        {selectedPayslip.employeeInfo?.firstname || "N/A"}{" "}
                        {selectedPayslip.employeeInfo?.lastname || ""}
                      </Heading>
                      <Text color="gray.600" fontSize="sm">
                        {selectedPayslip.employeeInfo?.employeeId || "N/A"}
                      </Text>
                    </Box>
                    <Button
                      leftIcon={<DownloadIcon />}
                      bg="gray.900"
                      color="white"
                      fontWeight="600"
                      onClick={() => downloadPayslip(selectedPayslip._id)}
                      isLoading={loading}
                      _hover={{ bg: "gray.800" }}
                    >
                      Download PDF
                    </Button>
                  </HStack>

                  {/* Key Metrics */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Card border="1px solid" borderColor="gray.200">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.600"
                            fontSize="sm"
                            fontWeight="500"
                          >
                            Gross Pay
                          </StatLabel>
                          <StatNumber fontSize="2xl" color="gray.900" mt={2}>
                            {formatCurrency(
                              selectedPayslip.summary?.grossThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card border="1px solid" borderColor="gray.200">
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.600"
                            fontSize="sm"
                            fontWeight="500"
                          >
                            Deductions
                          </StatLabel>
                          <StatNumber fontSize="2xl" color="gray.900" mt={2}>
                            {formatCurrency(
                              selectedPayslip.summary?.totalDeductionsThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card
                      bg="gray.900"
                      border="1px solid"
                      borderColor="gray.900"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel
                            color="gray.300"
                            fontSize="sm"
                            fontWeight="500"
                          >
                            Net Pay
                          </StatLabel>
                          <StatNumber fontSize="2xl" color="white" mt={2}>
                            {formatCurrency(
                              selectedPayslip.summary?.netPayThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Employee & Period Info */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    <Card border="1px solid" borderColor="gray.200">
                      <CardHeader
                        borderBottomWidth="1px"
                        borderBottomColor="gray.200"
                        pb={4}
                      >
                        <Heading size="sm" color="gray.900">
                          Employee Information
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Flex justify="space-between">
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                            >
                              Position
                            </Text>
                            <Text
                              color="gray.900"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              {selectedPayslip.employeeInfo?.jobPosition ||
                                "N/A"}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                            >
                              Department
                            </Text>
                            <Text
                              color="gray.900"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              {selectedPayslip.employeeInfo?.department ||
                                "N/A"}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                            >
                              Business Unit
                            </Text>
                            <Text
                              color="gray.900"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              {selectedPayslip.employeeInfo?.businessUnit ||
                                "N/A"}
                            </Text>
                          </Flex>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card border="1px solid" borderColor="gray.200">
                      <CardHeader
                        borderBottomWidth="1px"
                        borderBottomColor="gray.200"
                        pb={4}
                      >
                        <Heading size="sm" color="gray.900">
                          Payroll Period
                        </Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="stretch" spacing={4}>
                          <Box>
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                              mb={1}
                            >
                              Period
                            </Text>
                            <Text
                              color="gray.900"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              {formatDate(
                                selectedPayslip.payrollPeriod?.startDate
                              )}{" "}
                              –{" "}
                              {formatDate(
                                selectedPayslip.payrollPeriod?.endDate
                              )}
                            </Text>
                          </Box>
                          <Box>
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                              mb={1}
                            >
                              Payment Date
                            </Text>
                            <Text
                              color="gray.900"
                              fontSize="sm"
                              fontWeight="600"
                            >
                              {formatDate(selectedPayslip.paymentDate)}
                            </Text>
                          </Box>
                          <Box>
                            <Text
                              color="gray.600"
                              fontSize="sm"
                              fontWeight="500"
                              mb={1}
                            >
                              Status
                            </Text>
                            <Badge
                              fontSize="xs"
                              fontWeight="600"
                              colorScheme={getStatusColor(
                                selectedPayslip.status
                              )}
                              variant="subtle"
                              w="fit-content"
                            >
                              {selectedPayslip.status?.charAt(0).toUpperCase() +
                                selectedPayslip.status?.slice(1) || "Unknown"}
                            </Badge>
                          </Box>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Earnings */}
                  <Card border="1px solid" borderColor="gray.200">
                    <CardHeader
                      borderBottomWidth="1px"
                      borderBottomColor="gray.200"
                      pb={4}
                    >
                      <Heading size="sm" color="gray.900">
                        Earnings
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={0}>
                        <Flex
                          justify="space-between"
                          py={3}
                          borderBottomWidth="1px"
                          borderBottomColor="gray.100"
                        >
                          <Text fontSize="sm" color="gray.700">
                            Basic Regular (
                            {selectedPayslip.earnings?.basicRegular?.unit || 0}{" "}
                            days)
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.900">
                            {formatCurrency(
                              selectedPayslip.earnings?.basicRegular?.amount
                            )}
                          </Text>
                        </Flex>
                        {(selectedPayslip.earnings?.sickLeave?.unit || 0) >
                          0 && (
                          <Flex
                            justify="space-between"
                            py={3}
                            borderBottomWidth="1px"
                            borderBottomColor="gray.100"
                          >
                            <Text fontSize="sm" color="gray.700">
                              Sick Leave (
                              {selectedPayslip.earnings?.sickLeave?.unit} days)
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="600"
                              color="gray.900"
                            >
                              {formatCurrency(
                                selectedPayslip.earnings?.sickLeave?.amount
                              )}
                            </Text>
                          </Flex>
                        )}
                        {(selectedPayslip.earnings?.generalAllowance?.amount ||
                          0) > 0 && (
                          <Flex
                            justify="space-between"
                            py={3}
                            borderBottomWidth="1px"
                            borderBottomColor="gray.100"
                          >
                            <Text fontSize="sm" color="gray.700">
                              General Allowance
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="600"
                              color="gray.900"
                            >
                              {formatCurrency(
                                selectedPayslip.earnings?.generalAllowance
                                  ?.amount
                              )}
                            </Text>
                          </Flex>
                        )}
                        {(selectedPayslip.earnings?.absences?.amount || 0) !==
                          0 && (
                          <Flex justify="space-between" py={3}>
                            <Text fontSize="sm" color="red.600">
                              Absences (
                              {selectedPayslip.earnings?.absences?.unit || 0}{" "}
                              days)
                            </Text>
                            <Text
                              fontSize="sm"
                              fontWeight="600"
                              color="red.600"
                            >
                              {formatCurrency(
                                selectedPayslip.earnings?.absences?.amount
                              )}
                            </Text>
                          </Flex>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Deductions */}
                  <Card border="1px solid" borderColor="gray.200">
                    <CardHeader
                      borderBottomWidth="1px"
                      borderBottomColor="gray.200"
                      pb={4}
                    >
                      <Heading size="sm" color="gray.900">
                        Deductions
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={0}>
                        <Flex
                          justify="space-between"
                          py={3}
                          borderBottomWidth="1px"
                          borderBottomColor="gray.100"
                        >
                          <Text fontSize="sm" color="gray.700">
                            SSS
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.900">
                            {formatCurrency(
                              selectedPayslip.deductions?.sss?.deducted
                            )}
                          </Text>
                        </Flex>
                        <Flex
                          justify="space-between"
                          py={3}
                          borderBottomWidth="1px"
                          borderBottomColor="gray.100"
                        >
                          <Text fontSize="sm" color="gray.700">
                            PhilHealth
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.900">
                            {formatCurrency(
                              selectedPayslip.deductions?.philhealth?.deducted
                            )}
                          </Text>
                        </Flex>
                        <Flex
                          justify="space-between"
                          py={3}
                          borderBottomWidth="1px"
                          borderBottomColor="gray.100"
                        >
                          <Text fontSize="sm" color="gray.700">
                            Pag-IBIG
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.900">
                            {formatCurrency(
                              selectedPayslip.deductions?.pagIbig?.deducted
                            )}
                          </Text>
                        </Flex>
                        <Flex justify="space-between" py={3}>
                          <Text fontSize="sm" color="gray.700">
                            Withholding Tax
                          </Text>
                          <Text fontSize="sm" fontWeight="600" color="gray.900">
                            {formatCurrency(
                              selectedPayslip.deductions?.withholdingTax
                                ?.deducted
                            )}
                          </Text>
                        </Flex>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Leave Balance */}
                  <Card border="1px solid" borderColor="gray.200">
                    <CardHeader
                      borderBottomWidth="1px"
                      borderBottomColor="gray.200"
                      pb={4}
                    >
                      <Heading size="sm" color="gray.900">
                        Leave Balance
                      </Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                        {selectedPayslip.leaveEntitlements &&
                          Object.entries(selectedPayslip.leaveEntitlements).map(
                            ([key, value]) => (
                              <Box
                                key={key}
                                p={4}
                                bg="gray.50"
                                borderRadius="md"
                                textAlign="center"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Text
                                  fontSize="xs"
                                  fontWeight="600"
                                  color="gray.600"
                                  mb={2}
                                  textTransform="uppercase"
                                >
                                  {key === "VL"
                                    ? "Vacation"
                                    : key === "SL"
                                    ? "Sick"
                                    : key === "LWOP"
                                    ? "LWOP"
                                    : key === "BL"
                                    ? "Bereavement"
                                    : "Christmas"}
                                </Text>
                                <Text
                                  fontSize="2xl"
                                  fontWeight="700"
                                  color="gray.900"
                                >
                                  {value.balance}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  of {value.total}
                                </Text>
                              </Box>
                            )
                          )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              ) : (
                <Box textAlign="center" py={12}>
                  <Text color="gray.500">No payslip selected</Text>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Create Payslip Modal - Now using the new component */}
        <Modal isOpen={isOpen} onClose={onClose} size="3xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader bg="gray.900" color="white">
              Create New Payslip
            </ModalHeader>
            <ModalCloseButton color="white" />
            <ModalBody p={0}>
              <CreatePayslipComponent onPayslipCreated={handlePayslipCreated} />
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}
