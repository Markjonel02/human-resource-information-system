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
  Checkbox,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  ButtonGroup,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import { AddIcon, SearchIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";
import {
  FiMoreVertical,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiFileText,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiFilter,
} from "react-icons/fi";
import AddOfficialBusinessModal from "../../components/Admin_components/AddOfficialBusinessModal";
import axiosInstance from "../../lib/axiosInstance";
import useDebounce from "../../hooks/useDebounce";

const STATUS_COLORS = {
  approved: "green",
  pending: "orange",
  rejected: "red",
};
import EditOfficialBusinessModal from "../../components/Admin_components/EditAdminOfficialBusiness";
/* 
import EmployeeOfficialBusinessDeleteModal from "../../../components/EmployeeOffiicialBusinessDeleteModal";

import OfficialBusinessDetailModal from "../../../components/EmployeeOfficialBusinessDetailsModal"; */

const AdminOfficialBusiness = () => {
  const [editItem, setEditItem] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [selectedItem, setSelectedItem] = useState(null);
  const [officialBusinessData, setOfficialBusinessData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const toast = useToast();

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  /* state for deletemodal */
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Bulk confirmation modal
  const {
    isOpen: isBulkOpen,
    onOpen: onBulkOpen,
    onClose: onBulkClose,
  } = useDisclosure();
  const [bulkAction, setBulkAction] = useState("");

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
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
  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();

  const fetchOfficialBusinessData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        "/adminOfficialBusiness/getAll_OB",
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

      // Calculate statistics
      const newStats = {
        total: transformedData.length,
        approved: transformedData.filter((item) => item.status === "approved")
          .length,
        pending: transformedData.filter((item) => item.status === "pending")
          .length,
        rejected: transformedData.filter((item) => item.status === "rejected")
          .length,
      };
      setStats(newStats);
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
      fetchOfficialBusinessData();
      onClose();
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

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredAndSortedData.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (itemId) => {
    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter((id) => id !== itemId)
      : [...selectedItems, itemId];

    setSelectedItems(newSelected);
    setSelectAll(newSelected.length === filteredAndSortedData.length);
  };

  // Bulk actions
  const handleBulkAction = (action) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to perform bulk actions",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setBulkAction(action);
    onBulkOpen();
  };

  const confirmBulkAction = async () => {
    try {
      setBulkActionLoading(true);

      if (bulkAction === "delete") {
        await Promise.all(
          selectedItems.map((id) =>
            axiosInstance.delete(`/officialBusiness/delete_OB/${id}`)
          )
        );
        toast({
          title: "Success",
          description: `${selectedItems.length} requests deleted successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (bulkAction === "approve") {
        await Promise.all(
          selectedItems.map((id) =>
            axiosInstance.patch(`/officialBusiness/approve/${id}`)
          )
        );
        toast({
          title: "Success",
          description: `${selectedItems.length} requests approved successfully`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      setSelectedItems([]);
      setSelectAll(false);
      fetchOfficialBusinessData();
      onBulkClose();
    } catch (error) {
      console.error("Bulk action error:", error);
      toast({
        title: "Error",
        description: `Failed to ${bulkAction} selected items`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const debouncedSearchTerm = useDebounce(search, 500);
  const filteredAndSortedData = officialBusinessData
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.reason.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        item.employeeId
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
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
        {/* Header */}
        <VStack spacing={6} mb={8}>
          <Heading
            size="xl"
            bgGradient="linear(to-r, blue.500, purple.600)"
            bgClip="text"
            textAlign="center"
            fontWeight="bold"
          >
            Official Business Admin Dashboard
          </Heading>

          {/* Statistics Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} w="full">
            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor="blue.100"
            >
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    <HStack>
                      <Icon as={FiFileText} color="blue.500" />
                      <Text>Total Requests</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="blue.600">
                    {stats.total}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    All time requests
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor="green.100"
            >
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    <HStack>
                      <Icon as={FiCheckCircle} color="green.500" />
                      <Text>Approved</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="green.600"
                  >
                    {stats.approved}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    <StatArrow type="increase" />
                    {stats.total > 0
                      ? Math.round((stats.approved / stats.total) * 100)
                      : 0}
                    % of total
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor="orange.100"
            >
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    <HStack>
                      <Icon as={FiClock} color="orange.500" />
                      <Text>Pending</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="orange.600"
                  >
                    {stats.pending}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Awaiting review
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              shadow="xl"
              borderRadius="2xl"
              border="1px"
              borderColor="red.100"
            >
              <CardBody p={6}>
                <Stat>
                  <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                    <HStack>
                      <Icon as={FiXCircle} color="red.500" />
                      <Text>Rejected</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color="red.600">
                    {stats.rejected}
                  </StatNumber>
                  <StatHelpText fontSize="xs" color="gray.500">
                    Declined requests
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </VStack>
        {/* Controls */}
        <Card
          mb={6}
          shadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          border="1px"
          borderColor="gray.100"
        >
          <CardBody p={6}>
            <VStack spacing={6}>
              {/* Action Buttons */}
              <Flex
                justify="space-between"
                align="center"
                w="full"
                direction={{ base: "column", lg: "row" }}
                gap={4}
              >
                <HStack spacing={4}>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="md"
                    borderRadius="xl"
                    shadow="lg"
                    onClick={onAddOpen}
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "2xl",
                    }}
                    transition="all 0.2s"
                    bgGradient="linear(to-r, blue.500, purple.600)"
                    _active={{
                      bgGradient: "linear(to-r, blue.600, purple.700)",
                    }}
                  >
                    Add Official Business
                  </Button>

                  <ButtonGroup variant="outline" spacing={2}>
                    <Button
                      leftIcon={<CheckIcon />}
                      colorScheme="green"
                      size="md"
                      borderRadius="xl"
                      onClick={() => handleBulkAction("approve")}
                      isDisabled={selectedItems.length === 0}
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "md",
                      }}
                      transition="all 0.2s"
                    >
                      Bulk Approve ({selectedItems.length})
                    </Button>

                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      size="md"
                      borderRadius="xl"
                      onClick={() => handleBulkAction("delete")}
                      isDisabled={selectedItems.length === 0}
                      _hover={{
                        transform: "translateY(-1px)",
                        shadow: "md",
                      }}
                      transition="all 0.2s"
                    >
                      Bulk Delete ({selectedItems.length})
                    </Button>
                  </ButtonGroup>
                </HStack>

                <HStack spacing={4}>
                  {/* Search */}
                  <Box
                    bg={useColorModeValue("gray.50", "gray.700")}
                    borderRadius="xl"
                    px={4}
                    py={3}
                    shadow="md"
                    border="2px"
                    borderColor="transparent"
                    _focusWithin={{
                      borderColor: "blue.400",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    <HStack>
                      <Icon as={SearchIcon} color="blue.400" />
                      <Input
                        placeholder="Search requests..."
                        variant="unstyled"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        minW="100px"
                        fontSize="sm"
                      />
                    </HStack>
                  </Box>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    w="100px"
                    borderRadius="xl"
                    shadow="md"
                    focusBorderColor="blue.400"
                    bg={useColorModeValue("white", "gray.700")}
                    fontSize="sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Select>

                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    w="160px"
                    borderRadius="xl"
                    shadow="md"
                    focusBorderColor="blue.400"
                    bg={useColorModeValue("white", "gray.700")}
                    fontSize="sm"
                  >
                    <option value="all">All Status</option>
                    <option value="date">Sort by Date</option>
                    <option value="status">Sort by Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Select>
                </HStack>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
        {/* Table */}
        <Card
          shadow="xl"
          borderRadius="2xl"
          bg={cardBg}
          border="1px"
          borderColor="gray.100"
        >
          <Box overflowX="auto">
            <Table variant="simple" size="md">
              <Thead bg="linear(to-r, blue.50, purple.50)">
                <Tr>
                  <Th py={6} borderRadius="tl-2xl">
                    <Checkbox
                      isChecked={selectAll}
                      onChange={handleSelectAll}
                      colorScheme="blue"
                      size="lg"
                    />
                  </Th>
                  <Th color="gray.700" fontSize="sm" fontWeight="bold" py={6}>
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
                    display={{ base: "none", lg: "table-cell" }}
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
                    borderRadius="tr-2xl"
                  >
                    Actions
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredAndSortedData.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={16}>
                      <VStack spacing={4}>
                        <Icon as={FiUsers} size="4xl" color="gray.300" />
                        <Text
                          color="gray.500"
                          fontSize="xl"
                          fontWeight="medium"
                        >
                          No official business requests found
                        </Text>
                        <Text color="gray.400" fontSize="sm">
                          Try adjusting your search criteria or filters
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
                        selectedItems.includes(item.id)
                          ? useColorModeValue("blue.100", "blue.800")
                          : index % 2 === 0
                          ? useColorModeValue("gray.25", "gray.750")
                          : "transparent"
                      }
                    >
                      <Td py={6}>
                        <Checkbox
                          isChecked={selectedItems.includes(item.id)}
                          onChange={() => handleSelectItem(item.id)}
                          colorScheme="blue"
                          size="lg"
                        />
                      </Td>
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
                          fontSize="xs"
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
                          fontSize="xs"
                        >
                          {item.dateTo}
                        </Badge>
                      </Td>
                      <Td
                        maxW="200px"
                        display={{ base: "none", lg: "table-cell" }}
                      >
                        <Tooltip label={item.reason}>
                          <Text
                            noOfLines={2}
                            fontSize="sm"
                            isTruncated
                            maxW="180px"
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
                          <MenuList borderRadius="xl" shadow="2xl" p={2}>
                            <MenuItem
                              icon={<FiEye />}
                              borderRadius="lg"
                              _hover={{ bg: "blue.50" }}
                              onClick={() => {
                                setSelectedItem(item);
                                onDetailOpen();
                              }}
                            >
                              View Details
                            </MenuItem>
                            <MenuItem
                              icon={<FiEdit2 />}
                              borderRadius="lg"
                              _hover={{ bg: "yellow.50" }}
                              onClick={() => handleEditClick(item)}
                            >
                              Edit Request
                            </MenuItem>
                            <MenuItem
                              icon={<FiTrash2 />}
                              borderRadius="lg"
                              color="red.500"
                              _hover={{ bg: "red.50" }}
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
        {/* Modals */}
        <AddOfficialBusinessModal
          isOpen={isAddOpen}
          onClose={onAddClose}
          onSubmit={handleAddOfficialBusiness}
        />{" "}
        <EditOfficialBusinessModal
          isOpen={isEditOpen}
          onClose={onEditClose}
          item={editItem}
          onSubmit={fetchOfficialBusinessData}
        />
        {/*  
        <EmployeeOfficialBusinessDeleteModal
          isOpen={isOpen}
          onClose={onClose}
          onConfirm={handleConfirmDelete}
          itemId={selectedItem?.id}
          itemName={`${selectedItem?.name} (${selectedItem?.dateFrom} to ${selectedItem?.dateTo})`}
          itemType="request"
          isLoading={deleteLoading}
        />

       

        <OfficialBusinessDetailModal
          isOpen={isDetailOpen}
          onClose={onDetailClose}
          officialBusiness={selectedItem}
        /> */}
        {/* Bulk Action Confirmation Modal */}
        <Modal isOpen={isBulkOpen} onClose={onBulkClose} size="lg">
          <ModalOverlay backdropFilter="blur(4px)" />
          <ModalContent borderRadius="2xl">
            <ModalHeader>
              <HStack>
                <Icon
                  as={bulkAction === "approve" ? FiCheckCircle : FiTrash2}
                  color={bulkAction === "approve" ? "green.500" : "red.500"}
                />
                <Text>
                  Confirm Bulk{" "}
                  {bulkAction === "approve" ? "Approval" : "Deletion"}
                </Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Alert
                  status={bulkAction === "approve" ? "success" : "warning"}
                  borderRadius="xl"
                >
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">
                      Are you sure you want to {bulkAction}{" "}
                      {selectedItems.length} selected requests?
                    </Text>
                    <Text fontSize="sm">
                      {bulkAction === "approve"
                        ? "This will approve all selected pending requests."
                        : "This action cannot be undone."}
                    </Text>
                  </VStack>
                </Alert>

                <Box>
                  <Text fontWeight="semibold" mb={2} color="gray.600">
                    Selected Requests:
                  </Text>
                  <VStack spacing={2} maxH="200px" overflowY="auto">
                    {selectedItems.map((id) => {
                      const item = officialBusinessData.find(
                        (item) => item.id === id
                      );
                      return item ? (
                        <Box
                          key={id}
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.700")}
                          borderRadius="md"
                          w="full"
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium" fontSize="sm">
                                {item.name}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {item.dateFrom} to {item.dateTo}
                              </Text>
                            </VStack>
                            <Badge
                              colorScheme={getStatusColor(item.status)}
                              fontSize="xs"
                            >
                              {item.status}
                            </Badge>
                          </HStack>
                        </Box>
                      ) : null;
                    })}
                  </VStack>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onBulkClose} borderRadius="lg">
                  Cancel
                </Button>
                <Button
                  colorScheme={bulkAction === "approve" ? "green" : "red"}
                  onClick={confirmBulkAction}
                  isLoading={bulkActionLoading}
                  loadingText={
                    bulkAction === "approve" ? "Approving..." : "Deleting..."
                  }
                  borderRadius="lg"
                  leftIcon={
                    <Icon
                      as={bulkAction === "approve" ? FiCheckCircle : FiTrash2}
                    />
                  }
                >
                  {bulkAction === "approve" ? "Approve" : "Delete"}{" "}
                  {selectedItems.length} Items
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default AdminOfficialBusiness;
