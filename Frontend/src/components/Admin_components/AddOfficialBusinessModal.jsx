import { useState, useEffect } from "react";
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
  Box,
  List,
  ListItem,
  Spinner,
  Text,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";
import useDebounce from "../../hooks/useDebounce";
const AddOfficialBusinessModal = ({ isOpen, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    searchTerm: "", // Changed from 'firstname' to 'searchTerm'
    reason: "",
    dateFrom: "",
    dateTo: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();
  // Debounced value
  const debouncedSearchTerm = useDebounce(formData.searchTerm, 800);
  // Handle input changes

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enhanced employee search that handles both name and ID
  // ✅ remove API call from handleSearchChange
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setFormData((prev) => ({
      ...prev,
      searchTerm: query,
      employeeId: "", // Clear employee ID when typing
    }));

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
    } else {
      setShowResults(true);
    }
  };
  // ✅ only debounce triggers fetch
  useEffect(() => {
    const query = debouncedSearchTerm;

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setIsSearching(true);
        setShowResults(true);
        const { data } = await axiosInstance.get(
          `/adminOfficialBusiness/searchEmployees?q=${encodeURIComponent(
            query
          )}`
        );
        setSearchResults(data || []);
      } catch (error) {
        console.error("Error searching employees:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);
  // Select employee from search result
  const handleSelectEmployee = (employee) => {
    setFormData((prev) => ({
      ...prev,
      employeeId: employee._id,
      searchTerm: `${employee.firstname} ${employee.lastname || ""}`.trim(), // Display full name
    }));
    setSearchResults([]);
    setShowResults(false);
  };

  // Handle input focus to show results if they exist
  const handleInputFocus = () => {
    if (
      searchResults.length > 0 &&
      formData.searchTerm &&
      !formData.employeeId
    ) {
      setShowResults(true);
    }
  };

  // Handle input blur to hide results (with delay to allow clicks)
  const handleInputBlur = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Reset form when modal closes
  const handleClose = () => {
    setFormData({
      employeeId: "",
      searchTerm: "",
      reason: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearchResults([]);
    setShowResults(false);
    onClose();
  };

  const handleAddOfficialBusiness = async (e) => {
    e.preventDefault();

    // Validate that an employee is selected
    if (!formData.employeeId) {
      toast({
        title: "Error",
        description: "Please select a valid employee from the search results",
        status: "error",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axiosInstance.post(
        "/adminOfficialBusiness/addEmp_OB",
        {
          employeeId: formData.employeeId,
          reason: formData.reason,
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
        },
        { withCredentials: true }
      );

      toast({
        title: "Success",
        description:
          res.data.message || "Official Business request created successfully!",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });

      if (onSubmit) onSubmit(res.data);
      handleClose();
    } catch (error) {
      console.error("Error adding Official Business:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create Official Business request";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = useBreakpointValue({ base: 1, md: 2 });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
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
          {/* Employee Search */}
          <FormControl mb={4} position="relative">
            <FormLabel>
              Employee{" "}
              <Box as="span" color="red.200">
                *
              </Box>
            </FormLabel>
            <Input
              name="searchTerm"
              placeholder="Search by employee name or ID"
              value={formData.searchTerm}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              required
              autoComplete="off"
            />

            {isSearching && <Spinner size="sm" mt={2} />}

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left="0"
                right="0"
                mt={1}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                maxH="200px"
                overflowY="auto"
                bg="white"
                zIndex={1000}
                boxShadow="lg"
              >
                <List spacing={0}>
                  {searchResults.map((emp) => (
                    <ListItem
                      key={emp._id}
                      px={3}
                      py={2}
                      _hover={{ bg: "blue.50", cursor: "pointer" }}
                      onClick={() => handleSelectEmployee(emp)}
                      borderBottom="1px solid"
                      borderBottomColor="gray.100"
                      _last={{ borderBottom: "none" }}
                    >
                      <Box>
                        <Box fontWeight="medium">
                          {emp.firstname} {emp.lastname || ""}
                        </Box>
                        <Text fontSize="sm" color="gray.500">
                          ID: {emp.employeeId || emp._id}
                        </Text>
                        {emp.department && (
                          <Text fontSize="xs" color="gray.400">
                            {emp.department}
                          </Text>
                        )}
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Show no results message */}
            {showResults &&
              !isSearching &&
              searchResults.length === 0 &&
              formData.searchTerm && (
                <Box
                  position="absolute"
                  top="100%"
                  left="0"
                  right="0"
                  mt={1}
                  border="1px solid"
                  borderColor="gray.200"
                  borderRadius="md"
                  bg="white"
                  zIndex={1000}
                  boxShadow="lg"
                  px={3}
                  py={2}
                  color="gray.500"
                  fontSize="sm"
                >
                  No employees found matching "{formData.searchTerm}"
                </Box>
              )}
          </FormControl>

          <SimpleGrid columns={columns} spacing={4}>
            <FormControl>
              <FormLabel>
                Date From{" "}
                <Box as="span" color="red.200">
                  *
                </Box>
              </FormLabel>
              <Input
                name="dateFrom"
                type="date"
                value={formData.dateFrom}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>
                Date To{" "}
                <Box as="span" color="red.200">
                  *
                </Box>
              </FormLabel>
              <Input
                name="dateTo"
                type="date"
                value={formData.dateTo}
                onChange={handleInputChange}
                required
              />
            </FormControl>

            <FormControl gridColumn={{ base: "span 1", md: "span 2" }}>
              <FormLabel>
                Reason{" "}
                <Box as="span" color="red.200">
                  *
                </Box>
              </FormLabel>
              <Textarea
                name="reason"
                placeholder="Enter reason for official business"
                value={formData.reason}
                onChange={handleInputChange}
                required
                rows={4}
              />
            </FormControl>
          </SimpleGrid>
        </ModalBody>

        <ModalFooter>
          <Button
            type="submit"
            colorScheme="blue"
            mr={3}
            isLoading={isSubmitting}
            loadingText="Saving..."
          >
            Save
          </Button>
          <Button onClick={handleClose} isDisabled={isSubmitting}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddOfficialBusinessModal;
