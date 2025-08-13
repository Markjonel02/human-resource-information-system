import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  HStack,
  VStack,
  Select,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Avatar,
  Divider,
  Icon,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  ModalCloseButton,
  FormLabel,
  Alert,
  AlertIcon,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  InfoOutlineIcon,
  DownloadIcon,
  SettingsIcon,
} from "@chakra-ui/icons";
import {
  FaUserTie,
  FaBriefcase,
  FaClock,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa";
import axiosInstance from "../../lib/axiosInstance";

// Helper function to parse time
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "-") return null;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

const Attendances = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const toast = useToast();

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        const params = {
          month: selectedMonth,
          year: selectedYear,
          status: searchTerm.match(/present|absent|late|leave/i)?.[0],
          employee: searchTerm,
        };

        const response = await axiosInstance.get("/get-attendance", { params });
        setAttendanceRecords(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to fetch attendance data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendance();
  }, [searchTerm, selectedMonth, selectedYear]);

  const handleSaveRecord = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.put(
        `/update-attendance/${editingRecord._id}`,
        editingRecord
      );
      setAttendanceRecords((prev) =>
        prev.map((rec) => (rec._id === editingRecord._id ? response.data : rec))
      );
      toast({
        title: "Record updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onModalClose();
    } catch (err) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to update record",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setIsLoading(true);
        await axiosInstance.delete(`/delete-attendance/${id}`);
        setAttendanceRecords((prev) => prev.filter((rec) => rec._id !== id));
        toast({
          title: "Record deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete record",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();

      const matchesSearch =
        `${record.employee?.firstname} ${record.employee?.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth =
        !selectedMonth ||
        String(recordMonth).padStart(2, "0") === selectedMonth;
      const matchesYear = !selectedYear || String(recordYear) === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [searchTerm, selectedMonth, selectedYear, attendanceRecords]);

  const { totalMinLate, numLate, numAbsent, leaveCounts } = useMemo(() => {
    let totalMinLate = 0;
    let numLate = 0;
    let numAbsent = 0;
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };

    filteredAttendance.forEach((record) => {
      if (record.status === "Late" && record.checkIn) {
        const checkInMinutes = parseTimeToMinutes(record.checkIn);
        const scheduledCheckInMinutes = 9 * 60; // 9:00 AM in minutes
        if (checkInMinutes !== null) {
          const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
          if (lateMinutes > 0) {
            totalMinLate += lateMinutes;
            numLate++;
          }
        }
      } else if (record.status === "Absent") {
        numAbsent++;
      } else if (record.status === "Leave" && record.leaveType) {
        if (leaveCounts.hasOwnProperty(record.leaveType)) {
          leaveCounts[record.leaveType]++;
        }
      }
    });

    return { totalMinLate, numLate, numAbsent, leaveCounts };
  }, [filteredAttendance]);

  const getStatusColorScheme = (status) => {
    switch (status) {
      case "Present":
        return "green";
      case "Absent":
        return "red";
      case "Late":
        return "orange";
      case "Leave":
        return "blue";
      default:
        return "gray";
    }
  };

  const calculateHoursRendered = (checkIn, checkOut) => {
    if (checkIn === "-" || checkOut === "-") return "-";

    const checkInMinutes = parseTimeToMinutes(checkIn);
    const checkOutMinutes = parseTimeToMinutes(checkOut);

    if (
      checkInMinutes === null ||
      checkOutMinutes === null ||
      checkOutMinutes < checkInMinutes
    ) {
      return "-";
    }

    const totalMinutes = checkOutMinutes - checkInMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const getTardiness = (record) => {
    if (record.status === "Late" && record.checkIn) {
      const checkInMinutes = parseTimeToMinutes(record.checkIn);
      const scheduledCheckInMinutes = 9 * 60; // 9:00 AM in minutes
      if (checkInMinutes !== null) {
        const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
        if (lateMinutes > 0) {
          return `${lateMinutes} min late`;
        }
      }
    }
    return "-";
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    onDrawerOpen();
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    onModalOpen();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => {
      const updatedRecord = { ...prev, [name]: value };

      if (name === "status") {
        if (value === "Absent" || value === "Leave") {
          updatedRecord.checkIn = "-";
          updatedRecord.checkOut = "-";
        } else if (prev.status === "Absent" || prev.status === "Leave") {
          updatedRecord.checkIn = "09:00 AM";
          updatedRecord.checkOut = "05:00 PM";
        }
      }
      if (name === "status" && value !== "Leave") {
        updatedRecord.leaveType = null;
      }

      return updatedRecord;
    });
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <Box
      minH="100vh"
      p={{ base: 4, sm: 6, lg: 8 }}
      bg="gray.50"
      fontFamily="sans-serif"
    >
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.500"
          zIndex={9999}
        >
          <Spinner size="xl" color="blue.500" />
        </Flex>
      )}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Flex
        direction={{ base: "column", md: "row" }}
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        mb={6}
      >
        <Heading
          as="h1"
          fontSize={{ base: "2xl", sm: "3xl" }}
          fontWeight="bold"
          color="gray.800"
          mb={{ base: 4, md: 0 }}
        >
          Attendance Tracking
        </Heading>
        <HStack
          spacing={4}
          direction={{ base: "column", sm: "row" }}
          w={{ base: "full", md: "auto" }}
        >
          <InputGroup w={{ base: "full", sm: "auto" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search employee or status"
              pl={10}
              pr={4}
              py={2}
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="lg"
              focusBorderColor="blue.500"
              _focus={{ boxShadow: "outline" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <HStack spacing={2} w={{ base: "full", sm: "auto" }}>
            <Select
              placeholder="Select Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="lg"
              focusBorderColor="blue.500"
              _focus={{ boxShadow: "outline" }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </Select>
            <Select
              placeholder="Select Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              borderWidth="1px"
              borderColor="gray.300"
              borderRadius="lg"
              focusBorderColor="blue.500"
              _focus={{ boxShadow: "outline" }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>
          </HStack>
        </HStack>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">
            Tardiness
          </Heading>
          <VStack align="flex-start" spacing={3}>
            <Stat>
              <StatLabel color="gray.600">Min/Hrs Late</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {Math.floor(totalMinLate / 60)}h {totalMinLate % 60}m
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Number of Late Entries</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {numLate}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Number of Absences</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {numAbsent}
              </StatNumber>
            </Stat>
          </VStack>
        </Box>

        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Heading size="md" mb={4} color="gray.700">
            Leave
          </Heading>
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={3}>
            <Stat>
              <StatLabel color="gray.600">Vacation Leave (VL)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.VL}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Sick Leave (SL)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.SL}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Leave Without Pay (LWOP)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.LWOP}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Bereavement Leave (BL)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.BL}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Offset (OS)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.OS}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel color="gray.600">Calamity Leave (CL)</StatLabel>
              <StatNumber fontSize="xl" fontWeight="bold">
                {leaveCounts.CL}
              </StatNumber>
            </Stat>
          </SimpleGrid>
        </Box>
      </SimpleGrid>

      <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
        <Table variant="simple" minW="full" borderCollapse="collapse">
          <Thead bg="gray.50">
            <Tr>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Employee Name
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{
                  base: "none",
                  md: "none",
                  lg: "none",
                  xl: "table-cell",
                }}
              >
                Date
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Status
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{
                  base: "none",
                  md: "none",
                  lg: "none",
                  xl: "table-cell",
                }}
              >
                Check-in
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{
                  base: "none",
                  md: "none",
                  lg: "none",
                  xl: "table-cell",
                }}
              >
                Check-out
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", lg: "table-cell" }}
              >
                Hours Rendered
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", lg: "table-cell" }}
              >
                Tardiness
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
                display={{ base: "none", lg: "table-cell" }}
              >
                Leave Type
              </Th>
              <Th
                py={3}
                px={4}
                textAlign="left"
                fontSize="xs"
                fontWeight="medium"
                color="gray.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody bg="white" borderBottomWidth="1px" borderColor="gray.200">
            {filteredAttendance.map((record) => (
              <Tr key={record._id}>
                <Td px={4} py={4} whiteSpace="nowrap">
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {record.employee?.firstname} {record.employee?.lastname}
                  </Text>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{
                    base: "none",
                    md: "none",
                    lg: "none",
                    xl: "table-cell",
                  }}
                >
                  <HStack spacing={1} display="inline-flex" alignItems="center">
                    <CalendarIcon w={3} h={3} color="gray.500" />
                    <Text fontSize="sm" color="gray.900">
                      {formatDate(record.date)}
                    </Text>
                  </HStack>
                </Td>
                <Td px={4} py={4} whiteSpace="nowrap">
                  <Tag
                    size="md"
                    variant="subtle"
                    colorScheme={getStatusColorScheme(record.status)}
                  >
                    {record.status}
                  </Tag>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{
                    base: "none",
                    md: "none",
                    lg: "none",
                    xl: "table-cell",
                  }}
                >
                  <HStack spacing={1} display="inline-flex" alignItems="center">
                    <TimeIcon w={3} h={3} color="gray.500" />
                    <Text fontSize="sm" color="gray.900">
                      {record.checkIn}
                    </Text>
                  </HStack>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{
                    base: "none",
                    md: "none",
                    lg: "none",
                    xl: "table-cell",
                  }}
                >
                  <HStack spacing={1} display="inline-flex" alignItems="center">
                    <TimeIcon w={3} h={3} color="gray.500" />
                    <Text fontSize="sm" color="gray.900">
                      {record.checkOut}
                    </Text>
                  </HStack>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{ base: "none", lg: "table-cell" }}
                >
                  <Text fontSize="sm" color="gray.900">
                    {calculateHoursRendered(record.checkIn, record.checkOut)}
                  </Text>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{ base: "none", lg: "table-cell" }}
                >
                  <Text fontSize="sm" color="gray.900">
                    {getTardiness(record)}
                  </Text>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  display={{ base: "none", lg: "table-cell" }}
                >
                  <Text fontSize="sm" color="gray.900">
                    {record.leaveType || "-"}
                  </Text>
                </Td>
                <Td
                  px={4}
                  py={4}
                  whiteSpace="nowrap"
                  textAlign="right"
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      aria-label="Options"
                      icon={<ChevronDownIcon />}
                      variant="ghost"
                      colorScheme="gray"
                    />
                    <MenuList>
                      <MenuItem onClick={() => handleEditRecord(record)}>
                        Edit Record
                      </MenuItem>
                      <MenuItem onClick={() => handleViewDetails(record)}>
                        View Details
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteRecord(record._id)}>
                        Delete Record
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Employee Details Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size={{ base: "full", md: "lg", lg: "xl" }}
      >
        <DrawerOverlay bg="blackAlpha.300" />
        <DrawerContent bg="white" shadow="xl">
          <DrawerCloseButton />
          <DrawerHeader
            borderBottomWidth="1px"
            fontSize="xl"
            fontWeight="extrabold"
            color="gray.800"
            py={4}
            px={6}
          >
            EMPLOYEE ATTENDANCE DETAILS
          </DrawerHeader>

          <DrawerBody p={6}>
            {selectedEmployee && (
              <VStack align="stretch" spacing={6}>
                <Flex
                  align="center"
                  justify="space-between"
                  pb={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  flexWrap="wrap"
                >
                  <HStack spacing={4} flex="1" minW="200px">
                    <Avatar
                      size="xl"
                      name={`${selectedEmployee.employee?.firstname} ${selectedEmployee.employee?.lastname}`}
                      src={`https://placehold.co/100x100/A0D9B1/000000?text=${selectedEmployee.employee?.firstname?.charAt(
                        0
                      )}${selectedEmployee.employee?.lastname?.charAt(0)}`}
                    />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="md" color="gray.500" fontWeight="medium">
                        EMP ID: {selectedEmployee.employee?.employeeId || "N/A"}
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="extrabold"
                        color="gray.800"
                      >
                        {selectedEmployee.employee?.firstname}{" "}
                        {selectedEmployee.employee?.lastname}
                      </Text>
                      <Text fontSize="md" color="gray.600">
                        {selectedEmployee.employee?.role || "N/A"}
                      </Text>
                      <Tag
                        size="md"
                        colorScheme={
                          selectedEmployee.status === "Present"
                            ? "green"
                            : "red"
                        }
                        mt={2}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {selectedEmployee.status === "Present"
                          ? "Active"
                          : "Inactive"}
                      </Tag>
                    </VStack>
                  </HStack>
                </Flex>

                <Box bg="blue.50" p={4} borderRadius="md" shadow="sm">
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    <HStack>
                      <Icon as={FaBriefcase} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Department:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.department || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaUserTie} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Role:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.role || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaFileAlt} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Employment:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employee?.employmentType || "N/A"}
                        </Text>
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </Box>

                <Divider borderColor="gray.300" />

                <Box bg="green.50" p={4} borderRadius="md" shadow="sm">
                  <Heading size="md" mb={4} color="gray.700">
                    Attendance Summary
                  </Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.600">Date</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="green.700"
                      >
                        {formatDate(selectedEmployee.date)}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.600">Status</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="green.700"
                      >
                        {selectedEmployee.status}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.600">Hours Worked</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="green.700"
                      >
                        {calculateHoursRendered(
                          selectedEmployee.checkIn,
                          selectedEmployee.checkOut
                        )}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Edit Record Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Attendance Record</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {editingRecord && (
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Employee Name</FormLabel>
                  <Input
                    value={`${editingRecord.employee?.firstname} ${editingRecord.employee?.lastname}`}
                    isReadOnly
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input value={formatDate(editingRecord.date)} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={editingRecord.status}
                    onChange={handleEditChange}
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Late">Late</option>
                    <option value="Leave">Leave</option>
                  </Select>
                </FormControl>

                {(editingRecord.status === "Present" ||
                  editingRecord.status === "Late") && (
                  <>
                    <FormControl>
                      <FormLabel>Check-in</FormLabel>
                      <Input
                        type="time"
                        name="checkIn"
                        value={
                          editingRecord.checkIn === "-"
                            ? ""
                            : editingRecord.checkIn
                        }
                        onChange={handleEditChange}
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Check-out</FormLabel>
                      <Input
                        type="time"
                        name="checkOut"
                        value={
                          editingRecord.checkOut === "-"
                            ? ""
                            : editingRecord.checkOut
                        }
                        onChange={handleEditChange}
                      />
                    </FormControl>
                  </>
                )}

                {editingRecord.status === "Leave" && (
                  <FormControl>
                    <FormLabel>Leave Type</FormLabel>
                    <Select
                      name="leaveType"
                      value={editingRecord.leaveType || ""}
                      onChange={handleEditChange}
                      placeholder="Select Leave Type"
                    >
                      <option value="VL">Vacation Leave (VL)</option>
                      <option value="SL">Sick Leave (SL)</option>
                      <option value="LWOP">Leave Without Pay (LWOP)</option>
                      <option value="BL">Bereavement Leave (BL)</option>
                      <option value="OS">Offset (OS)</option>
                      <option value="CL">Calamity Leave (CL)</option>
                    </Select>
                  </FormControl>
                )}
              </VStack>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={onModalClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              ml={3}
              onClick={handleSaveRecord}
              isLoading={isLoading}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Attendances;
