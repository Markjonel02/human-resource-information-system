import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
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
  Card,
  CardBody,
  CardHeader,
  IconButton,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Grid,
  GridItem,
  Divider,
  Tag,
  TagLabel,
  TagCloseButton,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import {
  SearchIcon,
  AddIcon,
  DownloadIcon,
  ViewIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  TimeIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import CreatePayslipComponent from "./CreatePayslip";
import axiosInstance from "../../lib/axiosInstance";

export default function PayslipAdminSystem() {
  const [activeTab, setActiveTab] = useState(0);
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [periodInfo, setPeriodInfo] = useState(null);
  const toast = useToast();

  // Create form state
  const [createForm, setCreateForm] = useState({
    employeeId: "",
    customStartDate: "",
    customEndDate: "",
    daysWorked: "",
    generalAllowance: 0,
    otherDeductions: [],
  });

  // Batch create state
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedEmployeeNames, setSelectedEmployeeNames] = useState([]);

  useEffect(() => {
    fetchPeriodInfo();
    fetchPayslips();
  }, [currentPage, filters]);

  const fetchPeriodInfo = async () => {
    try {
      const { data } = await axiosInstance.get("/payroll/period-info");
      setPeriodInfo(data.data);
    } catch (error) {
      console.error("Error fetching period info:", error);
    }
  };

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...filters,
      });
      const { data } = await axiosInstance.get(`/payroll/all?${params}`);
      setPayslips(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching payslips:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payslips",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const searchEmployees = async (query) => {
    if (!query || query.length < 2) return;
    try {
      const { data } = await axiosInstance.get(
        `/payroll//search-employees?query=${query}`
      );
      setEmployees(data.data || []);
    } catch (error) {
      console.error("Error searching employees:", error);
    }
  };

  const handleBatchCreate = async () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one employee",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/payroll/create-batch", {
        employeeIds: selectedEmployees,
        customStartDate: createForm.customStartDate,
        customEndDate: createForm.customEndDate,
        generalAllowance: createForm.generalAllowance,
      });

      toast({
        title: "Success",
        description: `Created ${response.data.data.created} payslips successfully!`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setActiveTab(0);
      fetchPayslips();
      setSelectedEmployees([]);
      setSelectedEmployeeNames([]);
      resetCreateForm();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Error creating batch payslips",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      employeeId: "",
      customStartDate: "",
      customEndDate: "",
      daysWorked: "",
      generalAllowance: 0,
      otherDeductions: [],
    });
    setSearchQuery("");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return CheckCircleIcon;
      case "pending":
        return TimeIcon;
      case "cancelled":
        return CloseIcon;
      default:
        return CalendarIcon;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      minH="100vh"
      py={8}
    >
      <Container maxW="8xl">
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Card bg="white" boxShadow="xl" borderRadius="2xl">
            <CardBody p={8}>
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Box>
                  <Heading size="xl" color="gray.800" mb={2}>
                    💼 Payslip Management
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    Admin Dashboard
                  </Text>
                </Box>

                {periodInfo && (
                  <Card
                    bg="purple.50"
                    borderRadius="xl"
                    border="2px"
                    borderColor="purple.200"
                  >
                    <CardBody p={4}>
                      <HStack spacing={3}>
                        <Icon
                          as={CalendarIcon}
                          w={5}
                          h={5}
                          color="purple.600"
                        />
                        <Box>
                          <Text
                            fontSize="xs"
                            fontWeight="bold"
                            color="purple.600"
                            mb={1}
                          >
                            CURRENT PERIOD
                          </Text>
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            color="purple.900"
                          >
                            {periodInfo.currentPeriod?.label}
                          </Text>
                        </Box>
                      </HStack>
                    </CardBody>
                  </Card>
                )}
              </Flex>
            </CardBody>
          </Card>
        </VStack>

        {/* Main Tabs */}
        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          variant="enclosed"
          colorScheme="purple"
        >
          <TabList
            mb={6}
            bg="white"
            borderRadius="xl"
            boxShadow="lg"
            p={2}
            border="none"
          >
            <Tab
              _selected={{
                color: "white",
                bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "lg",
              }}
              fontWeight="bold"
              fontSize="md"
            >
              📋 View Payslips
            </Tab>
            <Tab
              _selected={{
                color: "white",
                bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "lg",
              }}
              fontWeight="bold"
              fontSize="md"
            >
              ➕ Create Payslip
            </Tab>
            <Tab
              _selected={{
                color: "white",
                bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "lg",
              }}
              fontWeight="bold"
              fontSize="md"
            >
              👥 Batch Create
            </Tab>
          </TabList>

          <TabPanels>
            {/* List View */}
            <TabPanel p={0}>
              <VStack spacing={6} align="stretch">
                {/* Filters */}
                <Card boxShadow="lg" borderRadius="xl">
                  <CardHeader bg="gray.50" borderBottomWidth="1px">
                    <HStack>
                      <Icon as={SearchIcon} color="purple.600" />
                      <Heading size="md">Filters & Search</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Grid
                      templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(4, 1fr)",
                      }}
                      gap={4}
                    >
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Status
                        </Text>
                        <Select
                          value={filters.status}
                          onChange={(e) =>
                            setFilters({ ...filters, status: e.target.value })
                          }
                          placeholder="All Status"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="processed">Processed</option>
                          <option value="paid">Paid</option>
                        </Select>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Department
                        </Text>
                        <Input
                          value={filters.department}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              department: e.target.value,
                            })
                          }
                          placeholder="Enter department"
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Start Date
                        </Text>
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(e) =>
                            setFilters({
                              ...filters,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          End Date
                        </Text>
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(e) =>
                            setFilters({ ...filters, endDate: e.target.value })
                          }
                        />
                      </GridItem>
                    </Grid>
                  </CardBody>
                </Card>

                {/* Payslips Table */}
                <Card boxShadow="lg" borderRadius="xl" overflow="hidden">
                  {loading ? (
                    <Center h="400px">
                      <VStack spacing={4}>
                        <Spinner size="xl" color="purple.500" thickness="4px" />
                        <Text color="gray.600">Loading payslips...</Text>
                      </VStack>
                    </Center>
                  ) : payslips.length === 0 ? (
                    <Center h="400px">
                      <VStack spacing={4}>
                        <Text fontSize="6xl">📄</Text>
                        <Heading size="md" color="gray.400">
                          No payslips found
                        </Heading>
                        <Text color="gray.500">
                          Try adjusting your filters or create a new payslip
                        </Text>
                      </VStack>
                    </Center>
                  ) : (
                    <>
                      <Box overflowX="auto">
                        <Table variant="simple">
                          <Thead bg="gray.50">
                            <Tr>
                              <Th>Employee</Th>
                              <Th>Period</Th>
                              <Th>Payment Date</Th>
                              <Th isNumeric>Net Pay</Th>
                              <Th>Status</Th>
                              <Th textAlign="center">Actions</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {payslips.map((payslip) => (
                              <Tr key={payslip._id} _hover={{ bg: "gray.50" }}>
                                <Td>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="bold">
                                      {payslip.employeeInfo?.firstname}{" "}
                                      {payslip.employeeInfo?.lastname}
                                    </Text>
                                    <Text fontSize="xs" color="gray.500">
                                      {payslip.employeeInfo?.employeeId}
                                    </Text>
                                  </VStack>
                                </Td>
                                <Td fontSize="sm">
                                  {payslip.payrollPeriod?.startDate &&
                                    formatDate(
                                      payslip.payrollPeriod.startDate
                                    )}{" "}
                                  -
                                  {payslip.payrollPeriod?.endDate &&
                                    formatDate(payslip.payrollPeriod.endDate)}
                                </Td>
                                <Td>
                                  {payslip.paymentDate &&
                                    formatDate(payslip.paymentDate)}
                                </Td>
                                <Td
                                  isNumeric
                                  fontWeight="bold"
                                  color="green.600"
                                  fontSize="md"
                                >
                                  {formatCurrency(
                                    payslip.summary?.netPayThisPay
                                  )}
                                </Td>
                                <Td>
                                  <Badge
                                    colorScheme={getStatusColor(payslip.status)}
                                    px={3}
                                    py={1}
                                    borderRadius="full"
                                    display="flex"
                                    alignItems="center"
                                    gap={2}
                                    w="fit-content"
                                  >
                                    <Icon as={getStatusIcon(payslip.status)} />
                                    {payslip.status?.toUpperCase()}
                                  </Badge>
                                </Td>
                                <Td>
                                  <HStack justify="center" spacing={2}>
                                    <IconButton
                                      icon={<ViewIcon />}
                                      size="sm"
                                      colorScheme="blue"
                                      variant="ghost"
                                      aria-label="View"
                                    />
                                    <IconButton
                                      icon={<DownloadIcon />}
                                      size="sm"
                                      colorScheme="green"
                                      variant="ghost"
                                      aria-label="Download"
                                    />
                                  </HStack>
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>

                      {/* Pagination */}
                      <Box bg="gray.50" px={6} py={4} borderTopWidth="1px">
                        <Flex justify="space-between" align="center">
                          <Text fontSize="sm" color="gray.700">
                            Page <strong>{currentPage}</strong> of{" "}
                            <strong>{totalPages}</strong>
                          </Text>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<ChevronLeftIcon />}
                              size="sm"
                              onClick={() =>
                                setCurrentPage(Math.max(1, currentPage - 1))
                              }
                              isDisabled={currentPage === 1}
                              aria-label="Previous page"
                            />
                            <IconButton
                              icon={<ChevronRightIcon />}
                              size="sm"
                              onClick={() =>
                                setCurrentPage(
                                  Math.min(totalPages, currentPage + 1)
                                )
                              }
                              isDisabled={currentPage === totalPages}
                              aria-label="Next page"
                            />
                          </HStack>
                        </Flex>
                      </Box>
                    </>
                  )}
                </Card>
              </VStack>
            </TabPanel>

            {/* Create Single Payslip */}
            <TabPanel p={0}>
              <CreatePayslipComponent
                onPayslipCreated={(payslip) => {
                  toast({
                    title: "Success",
                    description: "Payslip created successfully!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                  });
                  setActiveTab(0);
                  fetchPayslips();
                }}
              />
            </TabPanel>

            {/* Batch Create */}
            <TabPanel p={0}>
              <Card boxShadow="lg" borderRadius="xl">
                <CardHeader bg="purple.50" borderBottomWidth="1px">
                  <Heading size="md" color="purple.900">
                    Batch Create Payslips
                  </Heading>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    {/* Employee Search */}
                    <Box>
                      <Text fontSize="sm" fontWeight="bold" mb={2}>
                        Search Employees
                      </Text>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <SearchIcon color="gray.400" />
                        </InputLeftElement>
                        <Input
                          value={searchQuery}
                          onChange={(e) => {
                            setSearchQuery(e.target.value);
                            searchEmployees(e.target.value);
                          }}
                          placeholder="Search by name or employee ID..."
                          size="lg"
                        />
                      </InputGroup>

                      {employees.length > 0 && (
                        <Card
                          mt={2}
                          maxH="200px"
                          overflowY="auto"
                          variant="outline"
                        >
                          <VStack spacing={0} align="stretch">
                            {employees.map((emp) => (
                              <Box
                                key={emp._id}
                                p={3}
                                cursor="pointer"
                                _hover={{ bg: "gray.50" }}
                                borderBottomWidth="1px"
                                onClick={() => {
                                  if (!selectedEmployees.includes(emp._id)) {
                                    setSelectedEmployees([
                                      ...selectedEmployees,
                                      emp._id,
                                    ]);
                                    setSelectedEmployeeNames([
                                      ...selectedEmployeeNames,
                                      `${emp.firstname} ${emp.lastname}`,
                                    ]);
                                  }
                                  setSearchQuery("");
                                  setEmployees([]);
                                }}
                              >
                                <Text fontWeight="bold">
                                  {emp.firstname} {emp.lastname}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {emp.employeeId} • {emp.department}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Card>
                      )}
                    </Box>

                    {/* Selected Employees */}
                    {selectedEmployees.length > 0 && (
                      <Card
                        bg="purple.50"
                        variant="outline"
                        borderColor="purple.200"
                      >
                        <CardBody>
                          <Flex justify="space-between" align="center" mb={3}>
                            <Text fontWeight="bold" color="purple.900">
                              Selected Employees ({selectedEmployees.length})
                            </Text>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="purple"
                              onClick={() => {
                                setSelectedEmployees([]);
                                setSelectedEmployeeNames([]);
                              }}
                            >
                              Clear All
                            </Button>
                          </Flex>
                          <Flex flexWrap="wrap" gap={2}>
                            {selectedEmployeeNames.map((name, index) => (
                              <Tag
                                key={index}
                                size="lg"
                                borderRadius="full"
                                variant="solid"
                                colorScheme="purple"
                              >
                                <TagLabel>{name}</TagLabel>
                                <TagCloseButton
                                  onClick={() => {
                                    setSelectedEmployees(
                                      selectedEmployees.filter(
                                        (_, i) => i !== index
                                      )
                                    );
                                    setSelectedEmployeeNames(
                                      selectedEmployeeNames.filter(
                                        (_, i) => i !== index
                                      )
                                    );
                                  }}
                                />
                              </Tag>
                            ))}
                          </Flex>
                        </CardBody>
                      </Card>
                    )}

                    <Divider />

                    <Grid
                      templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
                      gap={6}
                    >
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Custom Start Date
                        </Text>
                        <Input
                          type="date"
                          value={createForm.customStartDate}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              customStartDate: e.target.value,
                            })
                          }
                          size="lg"
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          Custom End Date
                        </Text>
                        <Input
                          type="date"
                          value={createForm.customEndDate}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              customEndDate: e.target.value,
                            })
                          }
                          size="lg"
                        />
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="bold" mb={2}>
                          General Allowance
                        </Text>
                        <Input
                          type="number"
                          value={createForm.generalAllowance}
                          onChange={(e) =>
                            setCreateForm({
                              ...createForm,
                              generalAllowance: parseFloat(e.target.value) || 0,
                            })
                          }
                          placeholder="0.00"
                          size="lg"
                        />
                      </GridItem>
                    </Grid>

                    <HStack spacing={4} pt={4}>
                      <Button
                        leftIcon={<AddIcon />}
                        colorScheme="purple"
                        size="lg"
                        flex={1}
                        onClick={handleBatchCreate}
                        isLoading={loading}
                        isDisabled={selectedEmployees.length === 0}
                      >
                        Create {selectedEmployees.length} Payslips
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => {
                          setActiveTab(0);
                          resetCreateForm();
                          setSelectedEmployees([]);
                          setSelectedEmployeeNames([]);
                        }}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
