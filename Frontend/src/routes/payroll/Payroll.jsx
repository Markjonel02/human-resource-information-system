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
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  ViewIcon,
  TimeIcon,
  CalendarIcon,
  AttachmentIcon,
} from "@chakra-ui/icons";

export default function PayslipFrontend() {
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [nextReleaseDate, setNextReleaseDate] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Get next release date on mount
  useEffect(() => {
    fetchNextReleaseDate();
  }, []);

  const fetchNextReleaseDate = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/payroll/release-date/next",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      setNextReleaseDate(data.data);
    } catch (error) {
      console.error("Error fetching release date:", error);
    }
  };

  // Fetch payrolls
  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/payroll/employee/${employeeId}`;

      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        url = `http://localhost:5000/api/payroll/period/list?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch payrolls");

      const data = await response.json();
      setPayrolls(data.data || []);
      applySort(data.data || []);

      toast({
        title: "Success",
        description: `Loaded ${data.data?.length || 0} payslips`,
        status: "success",
        duration: 2,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3,
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
          (a, b) => b.summary.netPayThisPay - a.summary.netPayThisPay
        );
        break;
      case "amount-low":
        sorted.sort(
          (a, b) => a.summary.netPayThisPay - b.summary.netPayThisPay
        );
        break;
      default:
        break;
    }

    setPayrolls(sorted);
  };

  // Download PDF
  const downloadPayslip = async (payrollId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/payroll/${payrollId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to download");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
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
        duration: 2,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3,
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
    <Box
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      minH="100vh"
      py={8}
    >
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
            <Heading color="gray.800" mb={2}>
              💼 Payslip Management System
            </Heading>
            <Text color="gray.600">View and download your payslips</Text>
          </Box>

          {/* Next Release Date Info */}
          {nextReleaseDate && (
            <Card bg="white" boxShadow="lg" borderRadius="xl" overflow="hidden">
              <CardBody>
                <HStack spacing={4} align="start">
                  <Box
                    p={4}
                    bg="gradient(135deg, #667eea 0%, #764ba2 100%)"
                    borderRadius="lg"
                  >
                    <CalendarIcon w={8} h={8} color="white" />
                  </Box>
                  <Box flex={1}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.500"
                      mb={2}
                    >
                      📅 NEXT PAYROLL RELEASE
                    </Text>
                    <Heading size="lg" color="gray.800" mb={1}>
                      {formatDate(nextReleaseDate.nextReleaseDate)}
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                      {nextReleaseDate.adjustedReason === "weekend"
                        ? "⏰ Adjusted for weekend"
                        : nextReleaseDate.adjustedReason ===
                          "Philippine holiday"
                        ? "🎉 Adjusted for holiday"
                        : "✅ Regular release date"}
                    </Text>
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          )}
        </VStack>

        {/* Main Content Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList
            mb={6}
            bg="white"
            p={0}
            borderRadius="xl"
            boxShadow="lg"
            border="none"
          >
            <Tab
              _selected={{
                color: "white",
                bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
              fontWeight="bold"
            >
              📋 Payslip List
            </Tab>
            {selectedPayslip && (
              <Tab
                _selected={{
                  color: "white",
                  bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                }}
                fontWeight="bold"
              >
                📄 Payslip Details
              </Tab>
            )}
          </TabList>

          <TabPanels>
            {/* List Tab */}
            <TabPanel>
              <VStack spacing={6}>
                {/* Search & Filter Card */}
                <Card w="full" boxShadow="lg" borderRadius="xl">
                  <CardHeader bg="gray.50" borderBottomWidth="1px">
                    <Heading size="md">🔍 Search & Filter</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4}>
                      <Grid
                        templateColumns={{
                          base: "1fr",
                          md: "repeat(2, 1fr)",
                          lg: "repeat(4, 1fr)",
                        }}
                        gap={4}
                        w="full"
                      >
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Employee ID
                          </Text>
                          <Input
                            placeholder="Enter employee ID"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            bg="gray.50"
                            border="2px"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "purple.400",
                              boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.1)",
                            }}
                          />
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Start Date
                          </Text>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            bg="gray.50"
                            border="2px"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "purple.400",
                              boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.1)",
                            }}
                          />
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            End Date
                          </Text>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            bg="gray.50"
                            border="2px"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "purple.400",
                              boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.1)",
                            }}
                          />
                        </Box>

                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Sort By
                          </Text>
                          <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            bg="gray.50"
                            border="2px"
                            borderColor="gray.200"
                            _focus={{
                              borderColor: "purple.400",
                              boxShadow: "0 0 0 1px rgba(102, 126, 234, 0.1)",
                            }}
                          >
                            <option value="date-desc">📅 Newest First</option>
                            <option value="date-asc">📅 Oldest First</option>
                            <option value="amount-high">
                              💰 Amount (High)
                            </option>
                            <option value="amount-low">💰 Amount (Low)</option>
                          </Select>
                        </Box>
                      </Grid>

                      <Button
                        w="full"
                        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        color="white"
                        fontWeight="bold"
                        size="lg"
                        onClick={fetchPayrolls}
                        isLoading={loading}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg",
                        }}
                        transition="all 0.3s"
                      >
                        🔎 Search Payslips
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Payslips Table */}
                <Card
                  w="full"
                  boxShadow="lg"
                  borderRadius="xl"
                  overflow="hidden"
                >
                  {payrolls.length === 0 ? (
                    <Box p={12} textAlign="center">
                      <Heading size="md" color="gray.400" mb={2}>
                        No payslips found
                      </Heading>
                      <Text color="gray.500">
                        Try adjusting your search filters
                      </Text>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table>
                        <Thead bg="gray.100">
                          <Tr>
                            <Th>Employee</Th>
                            <Th>Period</Th>
                            <Th>Payment Date</Th>
                            <Th isNumeric>Gross Pay</Th>
                            <Th isNumeric>Deductions</Th>
                            <Th isNumeric>Net Pay</Th>
                            <Th>Status</Th>
                            <Th textAlign="center">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {payrolls.map((payroll) => (
                            <Tr key={payroll._id} _hover={{ bg: "gray.50" }}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold">
                                    {payroll.employeeInfo.firstname}{" "}
                                    {payroll.employeeInfo.lastname}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {payroll.employeeInfo.employeeId}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td fontSize="sm">
                                {formatDate(payroll.payrollPeriod.startDate)} -{" "}
                                {formatDate(payroll.payrollPeriod.endDate)}
                              </Td>
                              <Td fontSize="sm" fontWeight="bold">
                                {formatDate(payroll.paymentDate)}
                              </Td>
                              <Td isNumeric fontWeight="bold" color="blue.600">
                                {formatCurrency(payroll.summary.grossThisPay)}
                              </Td>
                              <Td isNumeric color="red.600">
                                {formatCurrency(
                                  payroll.summary.totalDeductionsThisPay
                                )}
                              </Td>
                              <Td
                                isNumeric
                                fontWeight="bold"
                                fontSize="lg"
                                color="green.600"
                              >
                                {formatCurrency(payroll.summary.netPayThisPay)}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={getStatusColor(payroll.status)}
                                >
                                  {payroll.status.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack spacing={2} justify="center">
                                  <Button
                                    size="sm"
                                    leftIcon={<ViewIcon />}
                                    colorScheme="blue"
                                    variant="ghost"
                                    onClick={() => viewPayslip(payroll)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    leftIcon={<DownloadIcon />}
                                    colorScheme="green"
                                    variant="ghost"
                                    onClick={() => downloadPayslip(payroll._id)}
                                    isLoading={loading}
                                  >
                                    PDF
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Card>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Showing {payrolls.length} payslips
                </Text>
              </VStack>
            </TabPanel>

            {/* Details Tab */}
            <TabPanel>
              {selectedPayslip && (
                <VStack spacing={6}>
                  {/* Header with Download */}
                  <HStack w="full" justify="space-between" align="start">
                    <VStack align="start" spacing={2}>
                      <Heading size="lg">
                        {selectedPayslip.employeeInfo.firstname}{" "}
                        {selectedPayslip.employeeInfo.lastname}
                      </Heading>
                      <Text color="gray.600">
                        {selectedPayslip.employeeInfo.employeeId}
                      </Text>
                    </VStack>
                    <Button
                      leftIcon={<DownloadIcon />}
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                      color="white"
                      fontWeight="bold"
                      onClick={() => downloadPayslip(selectedPayslip._id)}
                      isLoading={loading}
                    >
                      Download PDF
                    </Button>
                  </HStack>

                  {/* Key Stats */}
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} w="full">
                    <Card boxShadow="md" borderRadius="lg">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">Gross Pay</StatLabel>
                          <StatNumber color="blue.600">
                            {formatCurrency(
                              selectedPayslip.summary.grossThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card boxShadow="md" borderRadius="lg">
                      <CardBody>
                        <Stat>
                          <StatLabel color="gray.600">
                            Total Deductions
                          </StatLabel>
                          <StatNumber color="red.600">
                            -
                            {formatCurrency(
                              selectedPayslip.summary.totalDeductionsThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>

                    <Card
                      boxShadow="md"
                      borderRadius="lg"
                      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    >
                      <CardBody>
                        <Stat>
                          <StatLabel color="white">Net Pay</StatLabel>
                          <StatNumber color="white" fontSize="2xl">
                            {formatCurrency(
                              selectedPayslip.summary.netPayThisPay
                            )}
                          </StatNumber>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Employee & Period Info */}
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                    <Card boxShadow="md" borderRadius="lg">
                      <CardHeader bg="gray.50" borderBottomWidth="1px">
                        <Heading size="sm">👤 Employee Information</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Position:</Text>
                            <Text fontWeight="bold">
                              {selectedPayslip.employeeInfo.jobPosition}
                            </Text>
                          </HStack>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Department:</Text>
                            <Text fontWeight="bold">
                              {selectedPayslip.employeeInfo.department}
                            </Text>
                          </HStack>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Business Unit:</Text>
                            <Text fontWeight="bold">
                              {selectedPayslip.employeeInfo.businessUnit}
                            </Text>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>

                    <Card boxShadow="md" borderRadius="lg">
                      <CardHeader bg="gray.50" borderBottomWidth="1px">
                        <Heading size="sm">📅 Payroll Period</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack align="start" spacing={3}>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Period:</Text>
                            <Text fontWeight="bold">
                              {formatDate(
                                selectedPayslip.payrollPeriod.startDate
                              )}{" "}
                              -{" "}
                              {formatDate(
                                selectedPayslip.payrollPeriod.endDate
                              )}
                            </Text>
                          </HStack>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Payment Date:</Text>
                            <Text fontWeight="bold">
                              {formatDate(selectedPayslip.paymentDate)}
                            </Text>
                          </HStack>
                          <HStack w="full" justify="space-between">
                            <Text color="gray.600">Status:</Text>
                            <Badge
                              colorScheme={getStatusColor(
                                selectedPayslip.status
                              )}
                            >
                              {selectedPayslip.status.toUpperCase()}
                            </Badge>
                          </HStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  {/* Earnings */}
                  <Card w="full" boxShadow="md" borderRadius="lg">
                    <CardHeader bg="gray.50" borderBottomWidth="1px">
                      <Heading size="sm">💵 Earnings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack
                          justify="space-between"
                          py={2}
                          borderBottomWidth="1px"
                        >
                          <Text>
                            Basic Regular (
                            {selectedPayslip.earnings.basicRegular.unit} days)
                          </Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPayslip.earnings.basicRegular.amount
                            )}
                          </Text>
                        </HStack>
                        {selectedPayslip.earnings.sickLeave.unit > 0 && (
                          <HStack
                            justify="space-between"
                            py={2}
                            borderBottomWidth="1px"
                          >
                            <Text>
                              Sick Leave (
                              {selectedPayslip.earnings.sickLeave.unit} days)
                            </Text>
                            <Text fontWeight="bold">
                              {formatCurrency(
                                selectedPayslip.earnings.sickLeave.amount
                              )}
                            </Text>
                          </HStack>
                        )}
                        {selectedPayslip.earnings.generalAllowance.amount >
                          0 && (
                          <HStack
                            justify="space-between"
                            py={2}
                            borderBottomWidth="1px"
                          >
                            <Text>General Allowance</Text>
                            <Text fontWeight="bold">
                              {formatCurrency(
                                selectedPayslip.earnings.generalAllowance.amount
                              )}
                            </Text>
                          </HStack>
                        )}
                        {selectedPayslip.earnings.absences.amount !== 0 && (
                          <HStack justify="space-between" py={2}>
                            <Text color="red.600">
                              Absences ({selectedPayslip.earnings.absences.unit}{" "}
                              days)
                            </Text>
                            <Text fontWeight="bold" color="red.600">
                              {formatCurrency(
                                selectedPayslip.earnings.absences.amount
                              )}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Deductions */}
                  <Card w="full" boxShadow="md" borderRadius="lg">
                    <CardHeader bg="gray.50" borderBottomWidth="1px">
                      <Heading size="sm">📊 Deductions</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack align="stretch" spacing={3}>
                        <HStack
                          justify="space-between"
                          py={2}
                          borderBottomWidth="1px"
                        >
                          <Text>SSS (Social Security System)</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPayslip.deductions.sss.deducted
                            )}
                          </Text>
                        </HStack>
                        <HStack
                          justify="space-between"
                          py={2}
                          borderBottomWidth="1px"
                        >
                          <Text>PhilHealth</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPayslip.deductions.philhealth.deducted
                            )}
                          </Text>
                        </HStack>
                        <HStack
                          justify="space-between"
                          py={2}
                          borderBottomWidth="1px"
                        >
                          <Text>Pag-IBIG</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPayslip.deductions.pagIbig.deducted
                            )}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" py={2}>
                          <Text>Withholding Tax</Text>
                          <Text fontWeight="bold">
                            {formatCurrency(
                              selectedPayslip.deductions.withholdingTax.deducted
                            )}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>

                  {/* Leave Balance */}
                  <Card w="full" boxShadow="md" borderRadius="lg">
                    <CardHeader bg="gray.50" borderBottomWidth="1px">
                      <Heading size="sm">🏖️ Leave Balance</Heading>
                    </CardHeader>
                    <CardBody>
                      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
                        {Object.entries(selectedPayslip.leaveEntitlements).map(
                          ([key, value]) => (
                            <Box
                              key={key}
                              p={3}
                              bg="gray.50"
                              borderRadius="md"
                              textAlign="center"
                            >
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                color="gray.600"
                                mb={2}
                              >
                                {key === "VL"
                                  ? "Vacation Leave"
                                  : key === "SL"
                                  ? "Sick Leave"
                                  : key}
                              </Text>
                              <Text
                                fontSize="2xl"
                                fontWeight="bold"
                                color="purple.600"
                              >
                                {value.balance}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                of {value.total}
                              </Text>
                            </Box>
                          )
                        )}
                      </SimpleGrid>
                    </CardBody>
                  </Card>
                </VStack>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
