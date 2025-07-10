import { useState } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Text,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { PlusCircle } from "lucide-react"; // Using lucide-react for the icon

const AddEmployeeButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // State for form inputs (example)
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");

  const handleSubmit = () => {
    // In a real application, you would send this data to a backend
    console.log("New Employee:", { name: employeeName, email: employeeEmail });

    // Show a success toast
    toast({
      title: "Employee Added!",
      description: `Employee ${employeeName} has been added.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

    // Clear form and close modal
    setEmployeeName("");
    setEmployeeEmail("");
    onClose();
  };

  return (
    <Flex
      align="center"
      justify="center"
      bg="gray.50"
      fontFamily="Inter, sans-serif"
    >
      <Button
        onClick={onOpen}
        colorScheme="blue"
        size="sm"
        leftIcon={<PlusCircle size={20} />}
        borderRadius="lg"
        px={4}
        py={5}
        boxShadow="lg"
        _hover={{
          boxShadow: "xl",
          transform: "translateY(-2px)",
        }}
        transition="all 0.2s ease-in-out"
      >
        <Text fontSize="sm" fontWeight="500">
          Add Employee
        </Text>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent
          borderRadius="xl"
          boxShadow="2xl"
          p={6}
          bg="white"
          maxW="md"
          mx={4}
        >
          <ModalHeader fontSize="2xl" fontWeight="bold" pb={2}>
            Add New Employee
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl id="employee-name" isRequired>
                <FormLabel>Employee Name</FormLabel>
                <Input
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="employee-email" isRequired>
                <FormLabel>Employee Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Enter employee email"
                  value={employeeEmail}
                  onChange={(e) =>
                    e.target.value.includes("@")
                      ? setEmployeeEmail(e.target.value)
                      : null
                  } // Basic email validation
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter pt={6}>
            <Button
              variant="ghost"
              onClick={onClose}
              mr={3}
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              borderRadius="lg"
              px={6}
              _hover={{
                boxShadow: "md",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s ease-in-out"
              isDisabled={!employeeName || !employeeEmail}
            >
              Save Employee
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AddEmployeeButton;
