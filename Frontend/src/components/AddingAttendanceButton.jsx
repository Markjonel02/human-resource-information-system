import React, { useState } from "react";
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  Textarea,
  useDisclosure,
  SimpleGrid,
} from "@chakra-ui/react";
import { CalendarIcon } from "@chakra-ui/icons";
import axios from "axios";
import axiosInstance from "../lib/axiosInstance";
const AddingAttendanceButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [formData, setFormData] = useState({
    employeeId: "",
    employeeEmail: "",
    date: "",
    status: "",
    checkIn: "",
    checkOut: "",
    leaveType: "",
    notes: "",
    dateFrom: "",
    dateTo: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.employeeId && !formData.employeeEmail) {
      alert("Please provide either Employee ID or Employee Email.");
      return;
    }

    try {
      // ✅ Send request to backend with only provided ID or Email
      const payload = {
        employeeId: formData.employeeId || undefined,
        employeeEmail: formData.employeeEmail || undefined,
        date: formData.date,
        status: formData.status,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        leaveType: formData.leaveType,
        notes: formData.notes,
        dateFrom:
          formData.status === "on_leave" ? formData.dateFrom : undefined,
        dateTo: formData.status === "on_leave" ? formData.dateTo : undefined,
      };

      await axios.post("/create-attendance", payload);
      alert("Attendance created successfully!");
      onClose();
      setFormData({
        employeeId: "",
        employeeEmail: "",
        date: "",
        status: "",
        checkIn: "",
        checkOut: "",
        leaveType: "",
        notes: "",
        dateFrom: "",
        dateTo: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error creating attendance.");
    }
  };

  return (
    <>
      {/* Calendar Icon Button */}
      <Box
        display={{ base: "none", md: "none", lg: "block" }}
        borderRadius="md"
        bg="blue.50"
        px={4}
        py={2}
        cursor="pointer"
        marginRight={5}
        transition="all 0.3s"
        _hover={{
          bg: "blue.50",
          boxShadow: "md",
          transform: "scale(1.05)",
        }}
        onClick={onOpen}
      >
        <CalendarIcon color="blue.500" />
      </Box>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Attendance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Employee ID</FormLabel>
                <Input
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="e.g. EMP123"
                  pattern="^EMP\\d{3,4}$"
                  title="Format: EMP followed by 3-4 digits"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Employee Email</FormLabel>
                <Input
                  type="email"
                  name="employeeEmail"
                  value={formData.employeeEmail}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Status</FormLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="">Select status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="on_leave">On Leave</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Check In</FormLabel>
                <Input
                  type="time"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Check Out</FormLabel>
                <Input
                  type="time"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                />
              </FormControl>

              {formData.status === "on_leave" && (
                <>
                  <FormControl>
                    <FormLabel>Leave Type</FormLabel>
                    <Select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
                      <option value="VL">VL</option>
                      <option value="SL">SL</option>
                      <option value="LWOP">LWOP</option>
                      <option value="BL">BL</option>
                      <option value="OS">OS</option>
                      <option value="CL">CL</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Leave Date From</FormLabel>
                    <Input
                      type="date"
                      name="dateFrom"
                      value={formData.dateFrom}
                      onChange={handleChange}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Leave Date To</FormLabel>
                    <Input
                      type="date"
                      name="dateTo"
                      value={formData.dateTo}
                      onChange={handleChange}
                    />
                  </FormControl>
                </>
              )}
            </SimpleGrid>

            <FormControl mt={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddingAttendanceButton;
