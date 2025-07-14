import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
  extendTheme,
  Modal, // Import Modal components
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure, // Import useDisclosure hook
} from "@chakra-ui/react";

// Custom Chakra UI theme for "Inter" font and rounded corners
const theme = extendTheme({
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md", // Apply rounded corners to buttons
      },
    },
    Input: {
      baseStyle: {
        borderRadius: "md", // Apply rounded corners to inputs
      },
    },
    NumberInput: {
      baseStyle: {
        field: {
          // Target the input field within NumberInput
          borderRadius: "md",
        },
      },
    },
    Box: {
      baseStyle: {
        borderRadius: "md", // Apply rounded corners to general boxes
      },
    },
    Flex: {
      baseStyle: {
        borderRadius: "md", // Apply rounded corners to flex containers
      },
    },
    // You can add more component base styles here if needed
  },
});

// This component now contains the actual calculator UI, the button to open it, and the modal logic
const PayrollCalculatorContent = () => {
  // State variables for user inputs
  const [basicSalary, setBasicSalary] = useState("");
  const [otherAllowances, setOtherAllowances] = useState("");
  const [otherDeductions, setOtherDeductions] = useState("");

  // State variables for calculated payroll components
  const [grossPay, setGrossPay] = useState(0);
  const [sssContribution, setSssContribution] = useState(0);
  const [philhealthContribution, setPhilhealthContribution] = useState(0);
  const [pagibigContribution, setPagibigContribution] = useState(0);
  const [withholdingTax, setWithholdingTax] = useState(0);
  const [totalDeductions, setTotalDeductions] = useState(0);
  const [netPay, setNetPay] = useState(0);

  const toast = useToast(); // Initialize toast for notifications
  const { isOpen, onOpen, onClose } = useDisclosure(); // Hook to manage modal state

  // Function to calculate SSS (Social Security System) contribution
  // This uses a simplified calculation based on a maximum Monthly Salary Credit (MSC)
  const calculateSss = (salary) => {
    const sssMaxMsc = 25000; // Max Monthly Salary Credit for contribution calculation
    const sssRate = 0.045; // Employee share rate (4.5% of MSC)

    // MSC is capped at sssMaxMsc
    const msc = Math.min(salary, sssMaxMsc);
    // Employee contribution is capped at PHP 1125 (4.5% of 25,000)
    return Math.min(msc * sssRate, 1125);
  };

  // Function to calculate PhilHealth (Philippine Health Insurance Corporation) contribution
  // This uses a simplified calculation based on a maximum basic salary
  const calculatePhilhealth = (salary) => {
    const philhealthMaxSalary = 90000; // Max basic salary for contribution calculation
    const philhealthRate = 0.0225; // Employee share rate (2.25% of basic salary, half of 4.5% total)

    // Contribution base is capped at philhealthMaxSalary
    const contributionBase = Math.min(salary, philhealthMaxSalary);
    return contributionBase * philhealthRate;
  };

  // Function to calculate Pag-IBIG (Home Development Mutual Fund) contribution
  // This uses a simplified calculation with a fixed maximum contribution
  const calculatePagibig = (salary) => {
    const pagibigMaxSalary = 5000; // Max basic salary for contribution calculation
    const pagibigRate = 0.02; // Employee share rate (2% of basic salary)

    // Contribution base is capped at pagibigMaxSalary
    const contributionBase = Math.min(salary, pagibigMaxSalary);
    // Employee contribution is capped at PHP 100 (2% of 5,000)
    return Math.min(contributionBase * pagibigRate, 100);
  };

  // Function to calculate Withholding Tax (BIR) - HIGHLY SIMPLIFIED
  // This is an illustrative example and not meant for actual, accurate payroll.
  // Actual BIR tax tables are complex and depend on various factors like filing status,
  // and other deductions/exemptions.
  const calculateWithholdingTax = (taxableIncome) => {
    if (taxableIncome <= 20833) {
      return 0;
    } else if (taxableIncome <= 33333) {
      return 0.2 * (taxableIncome - 20833);
    } else if (taxableIncome <= 66667) {
      return 2500 + 0.25 * (taxableIncome - 33333);
    } else if (taxableIncome <= 166667) {
      return 10833.33 + 0.3 * (taxableIncome - 66667);
    } else {
      return 200833.33 + 0.35 * (taxableIncome - 666667);
    }
  };

  // useEffect hook to re-calculate payroll whenever input values change
  useEffect(() => {
    // Parse input values, defaulting to 0 if empty or invalid
    const salary = parseFloat(basicSalary) || 0;
    const allowances = parseFloat(otherAllowances) || 0;
    const deductions = parseFloat(otherDeductions) || 0;

    // Calculate Gross Pay
    const currentGrossPay = salary + allowances;
    setGrossPay(currentGrossPay);

    // Calculate mandatory contributions based on basic salary
    const sss = calculateSss(salary);
    setSssContribution(sss);

    const philhealth = calculatePhilhealth(salary);
    setPhilhealthContribution(philhealth);

    const pagibig = calculatePagibig(salary);
    setPagibigContribution(pagibig);

    // Calculate Taxable Income for Withholding Tax (Gross Pay - Mandatory Contributions)
    const taxableIncome = currentGrossPay - sss - philhealth - pagibig;
    // Ensure taxable income is not negative before calculating tax
    const tax = calculateWithholdingTax(Math.max(0, taxableIncome));
    setWithholdingTax(tax);

    // Calculate Total Deductions (Mandatory + Other Deductions + Withholding Tax)
    const currentTotalDeductions =
      sss + philhealth + pagibig + tax + deductions;
    setTotalDeductions(currentTotalDeductions);

    // Calculate Net Pay
    const currentNetPay = currentGrossPay - currentTotalDeductions;
    setNetPay(currentNetPay);
  }, [basicSalary, otherAllowances, otherDeductions]); // Dependencies: re-run when these state variables change

  // Handler for the "Calculate Payroll" button click
  const handleCalculate = () => {
    // Basic validation for basic salary input
    if (!basicSalary || isNaN(parseFloat(basicSalary))) {
      toast({
        title: "Input Error",
        description: "Please enter a valid Basic Monthly Salary.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    // Since calculations are handled by useEffect on input change,
    // this button primarily serves to provide a success notification.
    toast({
      title: "Payroll Calculated",
      description: "Payroll details have been updated below.",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  };

  return (
    <ChakraProvider theme={theme}>
      <Box
        position="relative" // Make this box a positioning context for its children
        height="100vh" // Take full viewport height
        bg="gray.50" // Light background for the page
      >
        <Button
          position="absolute" // Position button absolutely within the parent Box
          top="4" // 16px from top
          right="4" // 16px from right
          colorScheme="teal"
          size="md"
          onClick={onOpen} // Open the modal when button is clicked
          boxShadow="lg"
          _hover={{ transform: "translateY(-3px)", boxShadow: "xl" }}
          _active={{ transform: "translateY(-1px)" }}
          transition="all 0.3s ease-in-out"
        >
          Payroll Calculator
        </Button>

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
          scrollBehavior="inside"
        >
          {" "}
          {/* size="xl" for a moderately large modal */}
          <ModalOverlay />
          <ModalContent borderRadius="lg">
            <ModalHeader>Philippine Payroll Calculator</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {/* The actual calculator content */}
              <Box
                p={{ base: 4, md: 6 }} // Responsive padding
                bg="white" // White background
              >
                <Heading
                  as="h1"
                  size={{ base: "lg", md: "xl" }}
                  mb={6}
                  textAlign="center"
                  color="blue.700"
                >
                  🇵🇭 Philippine Payroll Calculator
                </Heading>

                {/* Informational alert about the simplified nature of the calculator */}
                <Alert status="info" mb={6} borderRadius="md">
                  <AlertIcon />
                  <AlertDescription fontSize={{ base: "sm", md: "md" }}>
                    This calculator provides a **simplified estimate** of net
                    pay based on common Philippine mandatory contributions (SSS,
                    PhilHealth, Pag-IBIG) and a **highly illustrative
                    withholding tax calculation**. Actual payroll calculations
                    can be more complex due to varying rates, specific company
                    policies, and detailed BIR tax tables. Consult official
                    sources or a payroll professional for accurate figures.
                  </AlertDescription>
                </Alert>

                {/* Input section for salary, allowances, and deductions */}
                <VStack spacing={5} align="stretch" mb={8}>
                  <FormControl id="basic-salary" isRequired>
                    <FormLabel fontWeight="bold">
                      Basic Monthly Salary (PHP)
                    </FormLabel>
                    <NumberInput
                      value={basicSalary}
                      onChange={(valueString) => setBasicSalary(valueString)}
                      min={0} // Minimum value is 0
                      precision={2} // Allow two decimal places for currency
                      step={100} // Step increment for number input
                    >
                      <NumberInputField placeholder="e.g., 25,000.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl id="other-allowances">
                    <FormLabel fontWeight="bold">
                      Other Allowances / Benefits (PHP)
                    </FormLabel>
                    <NumberInput
                      value={otherAllowances}
                      onChange={(valueString) =>
                        setOtherAllowances(valueString)
                      }
                      min={0}
                      precision={2}
                      step={100}
                    >
                      <NumberInputField placeholder="e.g., 5,000.00" />
                    </NumberInput>
                  </FormControl>

                  <FormControl id="other-deductions">
                    <FormLabel fontWeight="bold">
                      Other Deductions (PHP)
                    </FormLabel>
                    <NumberInput
                      value={otherDeductions}
                      onChange={(valueString) =>
                        setOtherDeductions(valueString)
                      }
                      min={0}
                      precision={2}
                      step={100}
                    >
                      <NumberInputField placeholder="e.g., 1,000.00 (e.g., loans, absences, tardiness)" />
                    </NumberInput>
                  </FormControl>

                  {/* Calculate Button */}
                  <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleCalculate}
                    // Enhance button appearance with hover and active states
                    _hover={{
                      bg: "blue.600",
                      transform: "translateY(-2px)",
                      boxShadow: "md",
                    }}
                    _active={{ bg: "blue.800" }}
                    transition="all 0.2s" // Smooth transition for hover/active effects
                  >
                    Calculate Payroll
                  </Button>
                </VStack>

                {/* Payroll Summary Section */}
                <Box mt={8}>
                  <Heading as="h2" size="lg" mb={4} color="blue.600">
                    Payroll Summary
                  </Heading>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr bg="gray.100">
                        <Th>Description</Th>
                        <Th isNumeric>Amount (PHP)</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {/* Gross Pay */}
                      <Tr>
                        <Td fontWeight="semibold">Gross Pay</Td>
                        <Td isNumeric>
                          {grossPay.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      {/* Mandatory Contributions */}
                      <Tr>
                        <Td pl={8}>SSS Contribution</Td>
                        <Td isNumeric>
                          -
                          {sssContribution.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td pl={8}>PhilHealth Contribution</Td>
                        <Td isNumeric>
                          -
                          {philhealthContribution.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      <Tr>
                        <Td pl={8}>Pag-IBIG Contribution</Td>
                        <Td isNumeric>
                          -
                          {pagibigContribution.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      {/* Withholding Tax */}
                      <Tr>
                        <Td pl={8}>Withholding Tax (BIR)</Td>
                        <Td isNumeric>
                          -
                          {withholdingTax.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      {/* Other Deductions */}
                      <Tr>
                        <Td pl={8}>Other Deductions</Td>
                        <Td isNumeric>
                          -
                          {parseFloat(otherDeductions || 0).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}
                        </Td>
                      </Tr>
                      {/* Total Deductions */}
                      <Tr bg="blue.50" fontWeight="bold">
                        <Td>Total Deductions</Td>
                        <Td isNumeric>
                          -
                          {totalDeductions.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                      {/* Net Pay */}
                      <Tr bg="green.50" fontWeight="bold" fontSize="lg">
                        <Td>Net Pay</Td>
                        <Td isNumeric>
                          {netPay.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={onClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default PayrollCalculatorContent;
