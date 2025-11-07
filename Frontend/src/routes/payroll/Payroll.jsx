import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
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
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon, ViewIcon, CalendarIcon } from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";

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
  const toast = useToast();

  // ✅ Fetch next payroll release date on mount
  useEffect(() => {
    fetchNextReleaseDate();
  }, []);

  const fetchNextReleaseDate = async () => {
    try {
      const { data } = await axiosInstance.get("/payroll/release-date/next");
      setNextReleaseDate(data.data);
    } catch (error) {
      console.error("Error fetching release date:", error);
    }
  };

  // ✅ Fetch payrolls
  const fetchPayrolls = async () => {
    if (!employeeId && !startDate && !endDate) {
      toast({
        title: "Missing filters",
        description: "Please enter employee ID or date range",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      let res;
      if (startDate || endDate) {
        const params = new URLSearchParams();
        if (startDate) params.append("startDate", startDate);
        if (endDate) params.append("endDate", endDate);
        res = await axiosInstance.get(`/payroll/period/list?${params}`);
      } else {
        res = await axiosInstance.get(`/payroll/employee/${employeeId}`);
      }

      const data = res.data.data || [];
      setPayrolls(applySort(data));
      toast({
        title: "Loaded successfully",
        description: `${data.length} payslips found.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      toast({
        title: "Error fetching payrolls",
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
    return sorted;
  };

  // ✅ Download single payslip PDF
  const downloadPayslip = async (payrollId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/payroll/${payrollId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Payslip_${payrollId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "Payslip PDF downloaded successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error downloading PDF",
        description: error.response?.data?.message || error.message,
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

  // ✅ Helpers
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value || 0);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
        {/* HEADER */}
        <VStack spacing={6} align="stretch" mb={8}>
          <Box bg="white" p={8} borderRadius="xl" boxShadow="lg">
            <Heading color="gray.800" mb={2}>
              💼 Payslip Management System
            </Heading>
            <Text color="gray.600">View and download your payslips</Text>
          </Box>

          {nextReleaseDate && (
            <Card bg="white" boxShadow="lg" borderRadius="xl">
              <CardBody>
                <HStack spacing={4}>
                  <Box
                    p={4}
                    bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
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
                    <Heading size="lg" color="gray.800">
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

        {/* MAIN CONTENT */}
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
            {/* Payslip List */}
            <TabPanel>
              <VStack spacing={6}>
                {/* Filters */}
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
                          />
                        </Box>
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" mb={2}>
                            Sort By
                          </Text>
                          <Select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
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
                      >
                        🔎 Search Payslips
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>

                {/* Table */}
                <Card w="full" boxShadow="lg" borderRadius="xl">
                  {payrolls.length === 0 ? (
                    <Box p={12} textAlign="center">
                      <Heading size="md" color="gray.400" mb={2}>
                        No payslips found
                      </Heading>
                      <Text color="gray.500">Try adjusting your filters</Text>
                    </Box>
                  ) : (
                    <Box overflowX="auto">
                      <Table>
                        <Thead bg="gray.100">
                          <Tr>
                            <Th>Employee</Th>
                            <Th>Period</Th>
                            <Th>Payment Date</Th>
                            <Th isNumeric>Gross</Th>
                            <Th isNumeric>Deductions</Th>
                            <Th isNumeric>Net</Th>
                            <Th>Status</Th>
                            <Th textAlign="center">Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {payrolls.map((p) => (
                            <Tr key={p._id}>
                              <Td>
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="bold">
                                    {p.employeeInfo.firstname}{" "}
                                    {p.employeeInfo.lastname}
                                  </Text>
                                  <Text fontSize="xs" color="gray.500">
                                    {p.employeeInfo.employeeId}
                                  </Text>
                                </VStack>
                              </Td>
                              <Td fontSize="sm">
                                {formatDate(p.payrollPeriod.startDate)} -{" "}
                                {formatDate(p.payrollPeriod.endDate)}
                              </Td>
                              <Td>{formatDate(p.paymentDate)}</Td>
                              <Td isNumeric color="blue.600">
                                {formatCurrency(p.summary.grossThisPay)}
                              </Td>
                              <Td isNumeric color="red.600">
                                {formatCurrency(
                                  p.summary.totalDeductionsThisPay
                                )}
                              </Td>
                              <Td isNumeric fontWeight="bold" color="green.600">
                                {formatCurrency(p.summary.netPayThisPay)}
                              </Td>
                              <Td>
                                <Badge colorScheme={getStatusColor(p.status)}>
                                  {p.status.toUpperCase()}
                                </Badge>
                              </Td>
                              <Td>
                                <HStack justify="center">
                                  <Button
                                    size="sm"
                                    leftIcon={<ViewIcon />}
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => viewPayslip(p)}
                                  >
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    leftIcon={<DownloadIcon />}
                                    variant="ghost"
                                    colorScheme="green"
                                    onClick={() => downloadPayslip(p._id)}
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
              </VStack>
            </TabPanel>

            {/* Payslip Details */}
            {selectedPayslip && (
              <TabPanel>
                {/* reuse your detailed view logic here — unchanged */}
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
}
