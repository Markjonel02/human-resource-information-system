import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
  HStack,
  useToast,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Box,
  Textarea,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const EditPayslipModal = ({ isOpen, onClose, payslipId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [formData, setFormData] = useState({
    customStartDate: "",
    customEndDate: "",
    daysWorked: "",
    generalAllowance: "",
    notes: "",
  });
  const toast = useToast();

  useEffect(() => {
    if (isOpen && payslipId) {
      fetchPayslip();
    }
  }, [isOpen, payslipId]);

  const fetchPayslip = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/payroll/${payslipId}`);
      setPayslip(data.data);

      // Pre-fill form
      setFormData({
        customStartDate:
          data.data.payrollPeriod?.startDate?.split("T")[0] || "",
        customEndDate: data.data.payrollPeriod?.endDate?.split("T")[0] || "",
        daysWorked: data.data.earnings?.basicRegular?.unit || "",
        generalAllowance: data.data.earnings?.generalAllowance?.amount || "",
        notes: data.data.notes || "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch payslip details",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await axiosInstance.put(`/payroll/${payslipId}`, formData);

      toast({
        title: "Success",
        description: "Payslip updated successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update payslip",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!payslip && !loading) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Payslip</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {payslip && (
              <Card bg="purple.50" borderColor="purple.200" variant="outline">
                <CardBody>
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color="purple.900"
                    mb={2}
                  >
                    Employee Information
                  </Text>
                  <SimpleGrid columns={2} spacing={2} fontSize="sm">
                    <Box>
                      <Text color="gray.600">Name:</Text>
                      <Text fontWeight="600">
                        {payslip.employeeInfo?.firstname}{" "}
                        {payslip.employeeInfo?.lastname}
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.600">Employee ID:</Text>
                      <Text fontWeight="600">
                        {payslip.employeeInfo?.employeeId}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}

            <FormControl>
              <FormLabel fontSize="sm">Payroll Period</FormLabel>
              <HStack>
                <Input
                  type="date"
                  value={formData.customStartDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customStartDate: e.target.value,
                    })
                  }
                />
                <Text>to</Text>
                <Input
                  type="date"
                  value={formData.customEndDate}
                  onChange={(e) =>
                    setFormData({ ...formData, customEndDate: e.target.value })
                  }
                />
              </HStack>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Days Worked</FormLabel>
              <NumberInput
                value={formData.daysWorked}
                onChange={(value) =>
                  setFormData({ ...formData, daysWorked: value })
                }
                min={0}
                max={31}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">General Allowance</FormLabel>
              <NumberInput
                value={formData.generalAllowance}
                onChange={(value) =>
                  setFormData({ ...formData, generalAllowance: value })
                }
                min={0}
                precision={2}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Notes</FormLabel>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Add notes..."
                rows={3}
              />
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="purple"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditPayslipModal;
