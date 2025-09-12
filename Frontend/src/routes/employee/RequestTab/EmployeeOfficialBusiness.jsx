import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Button,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Container,
  Heading,
  IconButton,
  Tooltip,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCalendar,
} from "react-icons/fi";
import AddOfficialBusinessModal from "../../../components/AddOfficialBusinessModal";
import axiosInstance from "../../../lib/axiosInstance";
import useDebounce from "../../../hooks/useDebounce";
const STATUS_COLORS = {
  approved: "green",
  pending: "orange",
  rejected: "red",
};
import EmployeeOfficialBusinessDeleteModal from "../../../components/EmployeeOffiicialBusinessDeleteModal";
import EditOfficialBusinessModal from "../../../components/EmployeeEditOfficialBusinessModal";
const EmployeeOfficialBusiness = () => {
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedItem, setSelectedItem] = useState(null);
  const [officialBusinessData, setOfficialBusinessData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  /* state for deletemodal */
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const bgColor = useColorModeValue("white");
  const cardBg = useColorModeValue("white", "gray.50");
  const headerBg = useColorModeValue(
    "linear(to-r, blue.500, purple.600)",
    "linear(to-r, blue.600, purple.700)"
  );

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const fetchOfficialBusinessData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "/officialBusiness/getOfficialBusiness",
        {
          withCredentials: true,
        }
      );

      const data = response.data.data || [];

      const transformedData = data.map((item) => ({
        id: item._id,
        name:
          `${item.employee?.firstname || ""} ${
            item.employee?.lastname || ""
          }`.trim() || "N/A",
        employeeId: item.employee?.employeeId || item.employee?._id || "N/A",
        dateFrom: new Date(item.dateFrom).toISOString().split("T")[0],
        dateTo: new Date(item.dateTo).toISOString().split("T")[0],
        reason: item.reason,
        status: item.status?.toLowerCase() || "pending",
        approvedBy: item.approvedBy
          ? `${item.approvedBy.firstname} ${item.approvedBy.lastname}`
          : null,
        rejectedBy: item.rejectedBy
          ? `${item.rejectedBy.firstname} ${item.rejectedBy.lastname}`
          : null,
        originalData: item,
      }));

      setOfficialBusinessData(transformedData);
    } catch (error) {
      console.error("Error fetching official business data:", error);
      setError("Failed to fetch official business data");
      toast({
        title: "Error",
        description: "Failed to fetch official business data",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficialBusinessData();
  }, []);

  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || "gray";
  };

  const handleAddOfficialBusiness = () => {
    fetchOfficialBusinessData();
    onAddClose();
  };

  const handleConfirmDelete = async (id) => {
    try {
      setDeleteLoading(true);
      await axiosInstance.delete(`/officialBusiness/delete_OB/${id}`);
      toast({
        title: "Deleted",
        description: "Official business request has been deleted.",
        status: "success",
        position: "top",
        duration: 3000,
        isClosable: true,
      });
      fetchOfficialBusinessData(); // Refresh table
      onClose(); // ✅ Fixed typo
    } catch (err) {
      console.error("Error deleting request:", err);
      toast({
        title: "Error",
        description: "Failed to delete official business request",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  };
  const handleEditClick = (item) => {
    setEditItem(item);
    onEditOpen();
  };
  const debouncedSearchTerm = useDebounce(search, 500);
  const filteredAndSortedData = officialBusinessData
    .filter(
      (item) =>
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.employeeId
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "status":
          return a.status.localeCompare(b.status);
        case "date":
        default:
          return new Date(b.dateFrom) - new Date(a.dateFrom);
      }
    });

  if (isLoading) {
    return (
      <Box
        bg={bgColor}
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600" fontSize="lg">
            Loading official business data...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8} bg={bgColor} minH="100vh">
        <Alert status="error" borderRadius="xl" shadow="lg">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">{error}</Text>
            <Button
              colorScheme="red"
              size="sm"
              onClick={fetchOfficialBusinessData}
            >
              Try Again
            </Button>
          </VStack>
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Controls */}
        <Card mb={6} shadow="lg" borderRadius="xl" bg={cardBg}>
          <CardBody p={6}>
            <Flex
              justify="space-between"
              align="center"
              direction={{ base: "column", lg: "row" }}
              gap={6}
            >
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="sm"
                borderRadius="xl"
                shadow="lg"
                onClick={onAddOpen}
                _hover={{
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                transition="all 0.2s"
                bgGradient="linear(to-r, blue.500, purple.600)"
                _active={{
                  bgGradient: "linear(to-r, blue.600, purple.700)",
                }}
              >
                Add Official Business
              </Button>

              <HStack spacing={4}>
                <Box
                  bg={useColorModeValue("gray.50", "gray.700")}
                  borderRadius="xl"
                  px={4}
                  py={2}
                  shadow="md"
                  border="2px"
                  borderColor="transparent"
                  _focusWithin={{
                    borderColor: "blue.400",
                    shadow: "sm",
                  }}
                >
                  <HStack>
                    <Icon as={SearchIcon} color="blue.400" />
                    <Input
                      placeholder="Search by name, ID, or reason..."
                      variant="unstyled"
                      value={search}
                      size="sm"
                      onChange={(e) => setSearch(e.target.value)}
                      minW="250px"
                    />
                  </HStack>
                </Box>

                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  w="180px"
                  borderRadius="md"
                  shadow="md"
                  focusBorderColor="blue.400"
                  bg={useColorModeValue("white", "gray.700")}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="status">Sort by Status</option>
                </Select>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
        {/* Table */}
        <Card shadow="md" borderRadius="xl" bg={cardBg}>
          <Box overflowX="auto">
            <Table variant="simple" size="lg">
              <Thead bg="linear(to-r, blue.50, purple.50)">
                <Tr>
                  <Th color="gray.700" fontSize="sm" fontWeight="bold" py={4}>
                    <HStack>
                      <Icon as={FiUser} />
                      <Text>Employee</Text>
                    </HStack>
                  </Th>
                  <Th
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="bold"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    <HStack>
                      <Icon as={FiCalendar} />
                      <Text>Date From</Text>
                    </HStack>
                  </Th>
                  <Th
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="bold"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    <HStack>
                      <Icon as={FiCalendar} />
                      <Text>Date To</Text>
                    </HStack>
                  </Th>
                  <Th
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="bold"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Reason
                  </Th>
                  <Th
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="bold"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Status
                  </Th>
                  <Th
                    color="gray.700"
                    fontSize="sm"
                    fontWeight="bold"
                    textAlign="center"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAndSortedData.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} textAlign="center" py={12}>
                      <VStack spacing={3}>
                        <Icon as={FiUser} size="3xl" color="gray.300" />
                        <Text color="gray.500" fontSize="lg">
                          No official business requests found
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          Try adjusting your search criteria
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ) : (
                  filteredAndSortedData.map((item, index) => (
                    <Tr
                      key={item.id}
                      _hover={{
                        bg: useColorModeValue("blue.50", "gray.600"),
                      }}
                      transition="all 0.2s"
                      bg={
                        index % 2 === 0
                          ? useColorModeValue("gray.25", "gray.750")
                          : "transparent"
                      }
                    >
                      <Td py={6}>
                        <VStack align="start" spacing={1}>
                          <Text
                            fontWeight="bold"
                            fontSize="md"
                            color={useColorModeValue("gray.800", "white")}
                          >
                            {item.name}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            ID: {item.employeeId}
                          </Text>
                        </VStack>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <Badge
                          colorScheme="blue"
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {item.dateFrom}
                        </Badge>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <Badge
                          colorScheme="purple"
                          variant="subtle"
                          px={3}
                          py={1}
                          borderRadius="md"
                        >
                          {item.dateTo}
                        </Badge>
                      </Td>
                      <Td
                        maxW="200px"
                        display={{ base: "none", md: "table-cell" }}
                      >
                        <Tooltip label={item.reason}>
                          <Text
                            noOfLines={2}
                            fontSize="sm"
                            isTruncated
                            maxW="100px"
                          >
                            {item.reason}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td display={{ base: "none", md: "table-cell" }}>
                        <VStack align="start" spacing={2}>
                          <Badge
                            colorScheme={getStatusColor(item.status)}
                            px={3}
                            py={1}
                            borderRadius="md"
                            fontSize="xs"
                            fontWeight="bold"
                            textTransform="capitalize"
                          >
                            {item.status}
                          </Badge>
                          {(item.approvedBy || item.rejectedBy) && (
                            <Text fontSize="xs" color="gray.500">
                              by {item.approvedBy || item.rejectedBy}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td textAlign="center">
                        <Menu>
                          <Tooltip label="More actions">
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreVertical />}
                              variant="ghost"
                              size="sm"
                              borderRadius="full"
                              _hover={{
                                bg: useColorModeValue("gray.100", "gray.600"),
                                transform: "scale(1.1)",
                              }}
                              transition="all 0.2s"
                            />
                          </Tooltip>
                          <MenuList borderRadius="xl" shadow="xl">
                            <MenuItem
                              icon={<FiEye />}
                              _hover={{ bg: "blue.50" }}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              icon={<FiEdit2 />}
                              _hover={{ bg: "yellow.50" }}
                              onClick={() => handleEditClick(item)}
                            >
                              Edit Request
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              color="red.500"
                              onClick={() => handleDeleteClick(item)}
                            >
                              Delete Request
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Card>
        {/* Add Official Business Modal */}
        <AddOfficialBusinessModal
          isOpen={isAddOpen}
          onClose={onAddClose}
          onSubmit={handleAddOfficialBusiness}
        />
        {/* delete Business modal */}
        <EmployeeOfficialBusinessDeleteModal
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={handleConfirmDelete}
          itemId={selectedItem?.id}
          itemName={`${selectedItem?.name} (${selectedItem?.dateFrom} to ${selectedItem?.dateTo})`}
          itemType="request"
          isLoading={deleteLoading}
        />
        <EditOfficialBusinessModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          item={editItem}
          onSubmit={fetchOfficialBusinessData}
        />
      </Container>
    </Box>
  );
};

export default EmployeeOfficialBusiness;
