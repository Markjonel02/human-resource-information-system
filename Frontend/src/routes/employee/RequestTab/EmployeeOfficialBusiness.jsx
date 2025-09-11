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
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddOfficialBusinessModal from "../../../components/AddOfficialBusinessModal";
import axiosInstance from "../../../lib/axiosInstance"; // Adjust path as needed

const EmployeeOfficialBusiness = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [officialBusinessData, setOfficialBusinessData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Modal control
  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // Fetch official business data
  const fetchOfficialBusinessData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get("/officialBusiness/get_OB", {
        withCredentials: true,
      });

      const data = response.data.data || response.data;

      const transformedData = data.map((item) => ({
        id: item._id,
        name:
          `${item.employee?.firstname || ""} ${
            item.employee?.lastname || ""
          }`.trim() || "N/A",
        dateFrom: new Date(item.dateFrom).toISOString().split("T")[0],
        dateTo: new Date(item.dateTo).toISOString().split("T")[0],
        reason: item.reason,
        status: item.status || "Pending",
        by: item.approvedBy
          ? `${item.approvedBy.firstname} ${item.approvedBy.lastname}`
          : item.rejectedBy
          ? `${item.rejectedBy.firstname} ${item.rejectedBy.lastname}`
          : "",
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
    switch (status) {
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "yellow";
    }
  };

  // ✅ Called when new OB is added
  const handleAddOfficialBusiness = () => {
    fetchOfficialBusinessData();
    onAddClose();
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/delete_OB/${id}`, {
        withCredentials: true,
      });

      setOfficialBusinessData((prev) => prev.filter((item) => item.id !== id));

      toast({
        title: "Success",
        description: "Official business request deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting official business:", error);
      toast({
        title: "Error",
        description: "Failed to delete official business request",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredAndSortedData = officialBusinessData
    .filter(
      (item) =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase())
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
        p={6}
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={6} minH="100vh">
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={fetchOfficialBusinessData}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box p={6} minH="100vh">
      {/* Top Actions */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          variant="solid"
          size="md"
          borderRadius="xl"
          shadow="md"
          onClick={onAddOpen}
        >
          Add Official Business
        </Button>

        <HStack spacing={3}>
          <Flex
            align="center"
            bg={useColorModeValue("white", "gray.700")}
            borderRadius="full"
            px={3}
            py={1}
            shadow="sm"
          >
            <Icon as={SearchIcon} color="blue.400" />
            <Input
              placeholder="Search employee or reason..."
              variant="unstyled"
              ml={2}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Flex>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            w="150px"
            borderRadius="xl"
            shadow="sm"
            focusBorderColor="blue.400"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </Select>
        </HStack>
      </Flex>

      {/* Table */}
      <Box
        overflowX="auto"
        borderRadius="xl"
        shadow="md"
        bg={useColorModeValue("white", "gray.700")}
      >
        <Table variant="simple">
          <Thead bg={useColorModeValue("blue.50", "blue.400")}>
            <Tr>
              <Th color="black">Employee Name</Th>
              <Th color="black">Date From</Th>
              <Th color="black">Date To</Th>
              <Th color="black">Reason</Th>
              <Th color="black">Status</Th>
              <Th color="black" textAlign="center">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAndSortedData.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={8}>
                  <Text color="gray.500">
                    No official business requests found
                  </Text>
                </Td>
              </Tr>
            ) : (
              filteredAndSortedData.map((item) => (
                <Tr
                  key={item.id}
                  _hover={{ bg: useColorModeValue("blue.50", "gray.600") }}
                >
                  <Td fontWeight="medium">{item.name}</Td>
                  <Td>{item.dateFrom}</Td>
                  <Td>{item.dateTo}</Td>
                  <Td>{item.reason}</Td>
                  <Td>
                    <Badge
                      colorScheme={getStatusColor(item.status)}
                      px={3}
                      py={1}
                      borderRadius="md"
                    >
                      {item.status}
                    </Badge>
                    {item.by && (
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        {item.status === "Approved"
                          ? `by ${item.by}`
                          : item.status === "Rejected"
                          ? ` by ${item.by}`
                          : ""}
                      </Text>
                    )}
                  </Td>
                  <Td textAlign="center">
                    <Menu>
                      <MenuButton
                        as={Button}
                        variant="ghost"
                        size="sm"
                        rounded="full"
                      >
                        <FiMoreVertical />
                      </MenuButton>
                      <MenuList>
                        <MenuItem icon={<FiEye />}>View</MenuItem>
                        <MenuItem icon={<FiEdit2 />}>Edit</MenuItem>
                        <MenuItem
                          icon={<FiTrash2 />}
                          color="red.500"
                          onClick={() => handleDelete(item.id)}
                        >
                          Delete
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

      {/* ✅ Add Official Business Modal */}
      <AddOfficialBusinessModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSubmit={handleAddOfficialBusiness}
      />
    </Box>
  );
};

export default EmployeeOfficialBusiness;
