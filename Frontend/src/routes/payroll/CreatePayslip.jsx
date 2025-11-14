import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Textarea,
  Select,
  useToast,
  Spinner,
  Badge,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";

export default function CreatePayslipComponent({ onPayslipCreated }) {
  const [step, setStep] = useState("search"); // search, select, create
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payrollPeriodInfo, setPayrollPeriodInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customStartDate: "",
    customEndDate: "",
    daysWorked: "",
    generalAllowance: "",
    otherDeductions: [],
  });

  const [deductionInput, setDeductionInput] = useState({
    description: "",
    amount: "",
  });

  const toast = useToast();

  // Fetch payroll period info
  const fetchPayrollPeriodInfo = async () => {
    try {
      const response = await axiosInstance.get("/payroll/admin/period-info");
      setPayrollPeriodInfo(response.data.data.currentPeriod);
    } catch (error) {
      console.error("Error fetching period info:", error);
      toast({
        title: "Error",
        description: "Failed to fetch payroll period info",
        status: "error",
        duration: 2,
        isClosable: true,
      });
    }
  };

  // Search employees
  const searchEmployees = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search query",
        status: "error",
        duration: 2,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/payroll/admin/search/employees",
        { params: { query: searchQuery } }
      );
      setSearchResults(response.data.data || []);

      if (response.data.data.length === 0) {
        toast({
          title: "No Results",
          description: "No employees found matching your search",
          status: "info",
          duration: 2,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error searching employees:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Search failed",
        status: "error",
        duration: 2,
        isClosable: true,
      });
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Select employee
  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    fetchPayrollPeriodInfo();
    setStep("create");
  };

  // Add deduction
  const addDeduction = () => {
    if (!deductionInput.description.trim() || !deductionInput.amount) {
      toast({
        title: "Error",
        description: "Please fill in description and amount",
        status: "error",
        duration: 2,
        isClosable: true,
      });
      return;
    }

    setFormData({
      ...formData,
      otherDeductions: [
        ...formData.otherDeductions,
        {
          description: deductionInput.description,
          amount: parseFloat(deductionInput.amount),
        },
      ],
    });

    setDeductionInput({ description: "", amount: "" });
    toast({
      title: "Success",
      description: "Deduction added",
      status: "success",
      duration: 1,
      isClosable: true,
    });
  };

  // Remove deduction
  const removeDeduction = (index) => {
    setFormData({
      ...formData,
      otherDeductions: formData.otherDeductions.filter((_, i) => i !== index),
    });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast({
        title: "Error",
        description: "Please select an employee",
        status: "error",
        duration: 2,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        employeeId: selectedEmployee._id,
        generalAllowance: formData.generalAllowance
          ? parseFloat(formData.generalAllowance)
          : 0,
      };

      if (formData.daysWorked)
        payload.daysWorked = parseInt(formData.daysWorked);
      if (formData.customStartDate)
        payload.customStartDate = formData.customStartDate;
      if (formData.customEndDate)
        payload.customEndDate = formData.customEndDate;
      if (formData.otherDeductions.length > 0) {
        payload.otherDeductions = formData.otherDeductions;
      }

      const response = await axiosInstance.post("/payroll/create", payload);

      toast({
        title: "Success",
        description: response.data.message,
        status: "success",
        duration: 3,
        isClosable: true,
      });

      // Reset form
      resetForm();

      // Callback to parent
      if (onPayslipCreated) {
        onPayslipCreated(response.data.data);
      }
    } catch (error) {
      console.error("Error creating payslip:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create payslip",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setStep("search");
    setSelectedEmployee(null);
    setSearchQuery("");
    setSearchResults([]);
    setPayrollPeriodInfo(null);
    setFormData({
      customStartDate: "",
      customEndDate: "",
      daysWorked: "",
      generalAllowance: "",
      otherDeductions: [],
    });
    setDeductionInput({ description: "", amount: "" });
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

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
    >
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="700" color="gray.900">
            Create New Payslip
          </Text>
          {selectedEmployee && (
            <Button size="sm" variant="outline" onClick={resetForm}>
              Start Over
            </Button>
          )}
        </HStack>

        <Divider />

        {/* Step 1: Search Employee */}
        {step === "search" && (
          <VStack spacing={4} align="stretch">
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.700" mb={2}>
                Step 1: Search Employee
              </Text>
            </Box>

            <FormControl>
              <FormLabel fontSize="sm" fontWeight="600">
                Employee Name or ID
              </FormLabel>
              <HStack>
                <Input
                  placeholder="e.g., John Doe or EMP001"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") searchEmployees();
                  }}
                />
                <Button
                  leftIcon={<SearchIcon />}
                  colorScheme="blue"
                  onClick={searchEmployees}
                  isLoading={loading}
                  minW="120px"
                >
                  Search
                </Button>
              </HStack>
            </FormControl>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Box p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="600" mb={3}>
                  Found {searchResults.length} employee(s)
                </Text>
                <VStack spacing={2} align="stretch">
                  {searchResults.map((emp) => (
                    <Card
                      key={emp._id}
                      _hover={{ bg: "white" }}
                      cursor="pointer"
                    >
                      <CardBody p={3}>
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="600" fontSize="sm">
                              {emp.firstname} {emp.lastname}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                              {emp.employeeId} • {emp.department} • Salary: PHP{" "}
                              {(emp.salaryRate || 0).toLocaleString()}
                            </Text>
                          </VStack>
                          <Button
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleSelectEmployee(emp)}
                          >
                            Select
                          </Button>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>
            )}
          </VStack>
        )}

        {/* Step 2: Configure Payslip */}
        {step === "create" && selectedEmployee && (
          <VStack spacing={4} align="stretch">
            {/* Selected Employee Info */}
            <Card bg="blue.50" border="1px solid" borderColor="blue.200">
              <CardBody>
                <VStack align="start" spacing={2}>
                  <Text fontSize="sm" fontWeight="600" color="blue.900">
                    ✓ Selected Employee
                  </Text>
                  <Text fontWeight="600">
                    {selectedEmployee.firstname} {selectedEmployee.lastname}
                  </Text>
                  <SimpleGrid columns={2} spacing={2} w="full" fontSize="xs">
                    <Box>
                      <Text color="gray.600">Employee ID</Text>
                      <Text fontWeight="600">
                        {selectedEmployee.employeeId}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.600">Department</Text>
                      <Text fontWeight="600">
                        {selectedEmployee.department}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.600">Position</Text>
                      <Text fontWeight="600">
                        {selectedEmployee.jobposition}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.600">Monthly Salary</Text>
                      <Text fontWeight="600">
                        PHP{" "}
                        {(selectedEmployee.salaryRate || 0).toLocaleString()}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>

            {/* Current Period Info */}
            {payrollPeriodInfo && (
              <Card bg="gray.50">
                <CardBody>
                  <VStack align="start" spacing={1} fontSize="sm">
                    <Text fontWeight="600">Current Payroll Period</Text>
                    <Badge colorScheme="blue">{payrollPeriodInfo.label}</Badge>
                    <Text color="gray.700">
                      {formatDate(payrollPeriodInfo.startDate)} -{" "}
                      {formatDate(payrollPeriodInfo.endDate)}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      ({payrollPeriodInfo.daysInMonth} days in month)
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Form Fields */}
            <Divider />
            <Box>
              <Text fontSize="sm" fontWeight="600" color="gray.700" mb={4}>
                Step 2: Configure Payslip
              </Text>

              {/* Custom Period */}
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Custom Period (Optional)
                  </FormLabel>
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Leave empty to use current period
                  </Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Box>
                      <Text fontSize="xs" fontWeight="500" mb={1}>
                        Start Date
                      </Text>
                      <Input
                        type="date"
                        value={formData.customStartDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customStartDate: e.target.value,
                          })
                        }
                        size="sm"
                      />
                    </Box>
                    <Box>
                      <Text fontSize="xs" fontWeight="500" mb={1}>
                        End Date
                      </Text>
                      <Input
                        type="date"
                        value={formData.customEndDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customEndDate: e.target.value,
                          })
                        }
                        size="sm"
                      />
                    </Box>
                  </SimpleGrid>
                </FormControl>

                {/* Days Worked */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    Days Worked (Optional)
                  </FormLabel>
                  <Text fontSize="xs" color="gray.600" mb={2}>
                    Leave empty to auto-calculate from attendance
                  </Text>
                  <NumberInput
                    value={formData.daysWorked}
                    onChange={(value) =>
                      setFormData({ ...formData, daysWorked: value })
                    }
                    min={0}
                    max={31}
                    step={0.5}
                  >
                    <NumberInputField placeholder="0" size="sm" />
                  </NumberInput>
                </FormControl>

                {/* General Allowance */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600">
                    General Allowance (Optional)
                  </FormLabel>
                  <NumberInput
                    value={formData.generalAllowance}
                    onChange={(value) =>
                      setFormData({ ...formData, generalAllowance: value })
                    }
                    min={0}
                    precision={2}
                  >
                    <NumberInputField placeholder="0.00" size="sm" />
                  </NumberInput>
                </FormControl>

                {/* Other Deductions */}
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="600" mb={3}>
                    Other Deductions (Optional)
                  </FormLabel>

                  {formData.otherDeductions.length > 0 && (
                    <VStack spacing={2} mb={4} align="stretch">
                      {formData.otherDeductions.map((ded, index) => (
                        <Card key={index} size="sm" bg="yellow.50">
                          <CardBody p={3}>
                            <HStack justify="space-between" align="center">
                              <VStack align="start" spacing={0}>
                                <Text fontSize="sm" fontWeight="600">
                                  {ded.description}
                                </Text>
                                <Text fontSize="xs" color="gray.600">
                                  {formatCurrency(ded.amount)}
                                </Text>
                              </VStack>
                              <Button
                                size="xs"
                                colorScheme="red"
                                variant="ghost"
                                onClick={() => removeDeduction(index)}
                              >
                                Remove
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  )}

                  <VStack spacing={2} align="stretch" mb={3}>
                    <Input
                      placeholder="Description (e.g., Loan, Uniform)"
                      size="sm"
                      value={deductionInput.description}
                      onChange={(e) =>
                        setDeductionInput({
                          ...deductionInput,
                          description: e.target.value,
                        })
                      }
                    />
                    <HStack>
                      <NumberInput
                        flex={1}
                        value={deductionInput.amount}
                        onChange={(value) =>
                          setDeductionInput({
                            ...deductionInput,
                            amount: value,
                          })
                        }
                        min={0}
                        precision={2}
                      >
                        <NumberInputField placeholder="0.00" size="sm" />
                      </NumberInput>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={addDeduction}
                      >
                        Add
                      </Button>
                    </HStack>
                  </VStack>
                </FormControl>
              </VStack>
            </Box>

            {/* Action Buttons */}
            <Divider />
            <HStack spacing={3} justify="flex-end">
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="green"
                onClick={handleSubmit}
                isLoading={loading}
              >
                Create Payslip
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
