import { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  SimpleGrid,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import axiosInstance from "../lib/axiosInstance";
const AddOfficialBusinessModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [] = useState([]);
  const toast = useToast();

  const handleAddOfficialBusiness = async (newOB) => {
    try {
      const res = await axiosInstance.post("/officialBusiness/add_OB", newOB, {
        withCredentials: true,
      });

      const savedOB = res.data.data; // comes with populated employee

      setOfficialBusinessData((prev) => [
        ...prev,
        {
          id: savedOB._id,
          name: savedOB.employee.name, // ✅ show employee name
          dateFrom: savedOB.dateFrom,
          dateTo: savedOB.dateTo,
          reason: savedOB.reason,
          status: "Pending",
          by: "",
        },
      ]);
    } catch (error) {
      console.error("Error adding Official Business:", error);
    }
  };

  // Responsive: on mobile, switch to 1 column
  const columns = useBreakpointValue({ base: 1, md: "none" });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        as="form"
        onSubmit={handleAddOfficialBusiness}
      >
        <ModalHeader>Add Official Business</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <SimpleGrid columns={columns} spacing={4}>
            <FormControl>
              <FormLabel>Employee Name</FormLabel>
              <Input name="name" placeholder="Enter employee name" required />
            </FormControl>

            <FormControl>
              <FormLabel>Department</FormLabel>
              <Input name="name" placeholder="Enter employee name" readOnly />
            </FormControl>

            <FormControl>
              <FormLabel>Date From</FormLabel>
              <Input name="dateFrom" type="date" required />
            </FormControl>

            <FormControl>
              <FormLabel>Date To</FormLabel>
              <Input name="dateTo" type="date" required />
            </FormControl>

            <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
              <FormLabel>Reason</FormLabel>
              <Textarea name="reason" placeholder="Enter reason" required />
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button type="submit" colorScheme="blue" mr={3}>
            Save
          </Button>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOfficialBusinessModal;
