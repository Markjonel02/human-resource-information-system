import React from "react";
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
} from "@chakra-ui/react";

const AddOfficialBusinessModal = ({ isOpen, onClose, onSubmit }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newOB = {
      name: formData.get("name"),
      dateFrom: formData.get("dateFrom"),
      dateTo: formData.get("dateTo"),
      reason: formData.get("reason"),
    };
    onSubmit(newOB);
    onClose();
  };

  // Responsive: on mobile, switch to 1 column
  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
      <ModalOverlay />
      <ModalContent
        borderRadius="xl"
        shadow="2xl"
        as="form"
        onSubmit={handleSubmit}
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
