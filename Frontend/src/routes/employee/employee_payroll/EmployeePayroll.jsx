// ==================== FILE: components/payroll/EmployeePayslips.jsx ====================
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
  IconButton,
  useToast,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  Icon,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  ViewIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import {
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaChartLine,
} from "react-icons/fa";
import axiosInstance from "../../../lib/axiosInstance";

export default function EmployeePayslips() {
  const [payslips, setPayslips] = useState([]);
  const [summary, setSummary] = useState(null);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    status: "approved",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const toast = useToast();

  useEffect(() => {
    fetchSummary();
    fetchYears();
  }, []);

  useEffect(() => {
    fetchPayslips();
  }, [currentPage, filters]);

  const fetchSummary = async () => {
    try {
      const { data } = await axiosInstance.get("/payroll/employee/summary");
      setSummary(data.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchYears = async () => {
    try {
      const { data } = await axiosInstance.get("/payroll/employee/years");
      setYears(data.data || []);
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const fetchPayslips = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...filters,
      });
      const { data } = await axiosInstance.get(
        `/payroll/employee/my-payslips?${params}`
      );
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

  const handleDownloadPDF = async (payslipId) => {
    try {
      const response = await axiosInstance.get(
        `/payroll/employee/my-payslips/${payslipId}/download-pdf`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Payslip-${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Payslip downloaded successfully!",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to download PDF",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleViewPDF = (payslipId) => {
    window.open(
      `/payroll/employee/my-payslips/${payslipId}/view-pdf`,
      "_blank"
    );
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

  const getStatusColor = (status) => {
    const colors = {
      approved: "green",
      processed: "blue",
      paid: "teal",
    };
    return colors[status] || "gray";
  };

  return (
    <Box minH="100vh" bg="gray.50" py={8}>
      <Container maxW="7xl">
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Card bg="white" boxShadow="xl" borderRadius="2xl">
            <CardBody p={8}>
              <Heading size="lg" color="gray.800" mb={2}>
                My Payslips
              </Heading>
              <Text color="gray.600" fontSize="lg">
                View and download your payment history
              </Text>
            </CardBody>
          </Card>
        </VStack>

        {/* Summary Cards */}
        {summary && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
            <Card
              boxShadow="lg"
              borderRadius="xl"
              bg="gradient-to-br from-blue-500 to-blue-600"
            >
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text
                      color="blue.200"
                      fontSize="sm"
                      fontWeight="600"
                      mb={1}
                    >
                      YEAR-TO-DATE EARNINGS
                    </Text>
                    <Heading size="lg" color="blue.200">
                      {formatCurrency(summary.yearToDate.totalGross)}
                    </Heading>
                    <Text color="blue.300" fontSize="xs" mt={2}>
                      {summary.yearToDate.payslipCount} payslips in{" "}
                      {summary.yearToDate.year}
                    </Text>
                  </Box>
                  <Icon as={FaMoneyBillWave} boxSize={12} color="blue.300" />
                </Flex>
              </CardBody>
            </Card>

            <Card
              boxShadow="lg"
              borderRadius="xl"
              bg="gradient-to-br from-red-500 to-red-600"
            >
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text color="red.200" fontSize="sm" fontWeight="600" mb={1}>
                      TOTAL DEDUCTIONS
                    </Text>
                    <Heading size="lg" color="red.200">
                      {formatCurrency(summary.yearToDate.totalDeductions)}
                    </Heading>
                    <Text color="red.300" fontSize="xs" mt={2}>
                      SSS, PhilHealth, Pag-IBIG, Tax
                    </Text>
                  </Box>
                  <Icon as={FaChartLine} boxSize={12} color="red.300" />
                </Flex>
              </CardBody>
            </Card>

            <Card
              boxShadow="lg"
              borderRadius="xl"
              bg="gradient-to-br from-green-500 to-green-600"
            >
              <CardBody p={6}>
                <Flex align="center" justify="space-between">
                  <Box>
                    <Text
                      color="green.200"
                      fontSize="sm"
                      fontWeight="600"
                      mb={1}
                    >
                      NET PAY YTD
                    </Text>
                    <Heading size="lg" color="green.200">
                      {formatCurrency(summary.yearToDate.totalNet)}
                    </Heading>
                    {summary.latestPayslip && (
                      <Text color="green.300" fontSize="xs" mt={2}>
                        Last payment:{" "}
                        {formatCurrency(summary.latestPayslip.netPay)}
                      </Text>
                    )}
                  </Box>
                  <Icon
                    as={FaFileInvoiceDollar}
                    boxSize={12}
                    color="green.300"
                  />
                </Flex>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* Filters */}
        <Card boxShadow="lg" borderRadius="xl" mb={6}>
          <CardBody>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={4}
            >
              <GridItem>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Year
                </Text>
                <Select
                  value={filters.year}
                  onChange={(e) =>
                    setFilters({ ...filters, year: e.target.value })
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Select>
              </GridItem>
              <GridItem>
                <Text fontSize="sm" fontWeight="bold" mb={2}>
                  Status
                </Text>
                <Select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                >
                  <option value="approved">Approved</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                  <option value="all">All</option>
                </Select>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Payslips Table */}
        <Card boxShadow="lg" borderRadius="xl" overflow="hidden">
          {loading ? (
            <Center h="400px">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" thickness="4px" />
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
                  You don't have any payslips for the selected period
                </Text>
              </VStack>
            </Center>
          ) : (
            <>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
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
                    {payslips.map((payslip) => (
                      <Tr key={payslip._id} _hover={{ bg: "gray.50" }}>
                        <Td fontSize="sm">
                          {formatDate(payslip.payrollPeriod.startDate)} -{" "}
                          {formatDate(payslip.payrollPeriod.endDate)}
                        </Td>
                        <Td>{formatDate(payslip.paymentDate)}</Td>
                        <Td isNumeric color="blue.600" fontWeight="600">
                          {formatCurrency(payslip.summary.grossThisPay)}
                        </Td>
                        <Td isNumeric color="red.600" fontWeight="600">
                          {formatCurrency(
                            payslip.summary.totalDeductionsThisPay
                          )}
                        </Td>
                        <Td
                          isNumeric
                          fontWeight="bold"
                          color="green.600"
                          fontSize="md"
                        >
                          {formatCurrency(payslip.summary.netPayThisPay)}
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(payslip.status)}
                            px={3}
                            py={1}
                            borderRadius="full"
                          >
                            {payslip.status.toUpperCase()}
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
                              onClick={() => handleViewPDF(payslip._id)}
                              title="View PDF"
                            />
                            <IconButton
                              icon={<DownloadIcon />}
                              size="sm"
                              colorScheme="green"
                              variant="ghost"
                              aria-label="Download"
                              onClick={() => handleDownloadPDF(payslip._id)}
                              title="Download PDF"
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
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
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
      </Container>
    </Box>
  );
}
