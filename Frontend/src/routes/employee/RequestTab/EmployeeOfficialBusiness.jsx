import React, { useState } from "react";
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
} from "@chakra-ui/react";
import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import { FiMoreVertical, FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import AddOfficialBusinessModal from "../../../components/AddOfficialBusinessModal";

const EmployeeOfficialBusiness = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [officialBusinessData, setOfficialBusinessData] = useState([
    {
      id: 1,
      name: "John Doe",
      dateFrom: "2025-09-10",
      dateTo: "2025-09-12",
      reason: "Client Meeting",
      status: "Approved",
      by: "HR Manager",
    },
    {
      id: 2,
      name: "Jane Smith",
      dateFrom: "2025-09-15",
      dateTo: "2025-09-16",
      reason: "Conference",
      status: "Rejected",
      by: "Admin",
    },
  ]);

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

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

  const handleAddOfficialBusiness = (newOB) => {
    setOfficialBusinessData((prev) => [
      ...prev,
      { id: prev.length + 1, status: "Pending", by: "", ...newOB },
    ]);
  };

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
              placeholder="Search employee..."
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
            {officialBusinessData.map((item) => (
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
                      <MenuItem icon={<FiTrash2 />} color="red.500">
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Add Official Business Modal */}
      <AddOfficialBusinessModal
        isOpen={isAddOpen}
        onClose={onAddClose}
        onSubmit={handleAddOfficialBusiness}
      />
    </Box>
  );
};

export default EmployeeOfficialBusiness;
