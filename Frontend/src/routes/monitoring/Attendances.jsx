import React, { useState, useMemo } from "react";
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
  SimpleGrid, // For grid layout of summary cards
  Stat,
  StatLabel,
  StatNumber, // For summary statistics
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure, // For modal control
  Avatar,
  Divider,
  Icon, // For custom icons
  Button, // For export CSV
  Modal, // For edit record modal
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  FormControl,
  ModalCloseButton,
  FormLabel,
} from "@chakra-ui/react";
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarIcon,
  TimeIcon,
  InfoOutlineIcon, // For general info
  DownloadIcon, // For export CSV
  SettingsIcon, // For actions menu
  CheckCircleIcon, // For active status
  WarningIcon, // For late status
  CloseIcon, // For inactive/absent status
  MinusIcon, // For general placeholder
} from "@chakra-ui/icons";
import {
  FaUserTie,
  FaBriefcase,
  FaClock,
  FaClipboardList,
  FaFileAlt,
} from "react-icons/fa"; // For employment icons

// Helper function to parse time (e.g., "08:55 AM") into minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "-") return null;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0; // Midnight
  }
  return hours * 60 + minutes;
};

// Sample attendance data with scheduledCheckIn for tardiness calculation
const initialAttendanceData = [
  {
    id: 1,
    employeeName: "Floyd Miles",
    date: "Jul. 10, 2025",
    status: "Present",
    checkIn: "08:55 AM",
    checkOut: "05:00 PM",
    scheduledCheckIn: "09:00 AM", // Added for tardiness calculation
    leaveType: null,
    employeeId: "EMP12345",
    department: "Design",
    role: "Lead Designer",
    employmentType: "Full Time",
    avgWorkHours: "9hrs 43mins",
    avgOvertime: "1hrs 30mins",
    attendanceLog: [
      {
        date: "May 1st 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "2hrs 30min",
        location: "Withston Street, Ware...",
        status: "Late",
      },
      {
        date: "May 2nd 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "-",
        location: "Withston Street, Ware...",
        status: "Early",
      },
      {
        date: "May 3rd 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "2hrs 30min",
        location: "Withston Street, Ware...",
        status: "Late",
      },
      {
        date: "May 4th 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "-",
        location: "Withston Street, Ware...",
        status: "Late",
      },
      {
        date: "May 5th 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "-",
        location: "Withston Street, Ware...",
        status: "Early",
      },
      {
        date: "May 6th 2025",
        clock: "7:30 AM - 3:30 PM",
        overtime: "-",
        location: "Withston Street, Ware...",
        status: "Early",
      },
    ],
    summary: {
      yearOfEmployment: "2021",
      totalPresentsDays: "1,298 days",
      totalAbsentDays: "30 Days",
      totalLeaveDays: "423 Days",
    },
  },
  {
    id: 2,
    employeeName: "Savannah Nguyen",
    date: "Jul. 10, 2025",
    status: "Absent",
    checkIn: "-",
    checkOut: "-",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12346",
    department: "Research",
    role: "Researcher",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2022",
      totalPresentsDays: "500 days",
      totalAbsentDays: "15 Days",
      totalLeaveDays: "20 Days",
    },
  },
  {
    id: 3,
    employeeName: "Cameron Williamson",
    date: "Jul. 10, 2025",
    status: "Late",
    checkIn: "09:15 AM",
    checkOut: "05:05 PM",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12347",
    department: "Development",
    role: "Software Engineer",
    employmentType: "Full Time",
    avgWorkHours: "9hrs 00mins",
    avgOvertime: "1hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2023",
      totalPresentsDays: "300 days",
      totalAbsentDays: "5 Days",
      totalLeaveDays: "10 Days",
    },
  },
  {
    id: 4,
    employeeName: "Darrell Steward",
    date: "Jul. 10, 2025",
    status: "Present",
    checkIn: "08:45 AM",
    checkOut: "04:50 PM",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12348",
    department: "AI & ML",
    role: "ML Engineer",
    employmentType: "Full Time",
    avgWorkHours: "9hrs 30mins",
    avgOvertime: "0hrs 45mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2024",
      totalPresentsDays: "150 days",
      totalAbsentDays: "2 Days",
      totalLeaveDays: "5 Days",
    },
  },
  {
    id: 5,
    employeeName: "Laura Bran",
    date: "Jul. 09, 2025",
    status: "Present",
    checkIn: "08:50 AM",
    checkOut: "05:00 PM",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12349",
    department: "Design",
    role: "UX Designer",
    employmentType: "Part Time",
    avgWorkHours: "4hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2023",
      totalPresentsDays: "200 days",
      totalAbsentDays: "3 Days",
      totalLeaveDays: "7 Days",
    },
  },
  {
    id: 6,
    employeeName: "Alfred Frook",
    date: "Jul. 09, 2025",
    status: "Absent",
    checkIn: "-",
    checkOut: "-",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12350",
    department: "Design",
    role: "Graphic Designer",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2022",
      totalPresentsDays: "600 days",
      totalAbsentDays: "20 Days",
      totalLeaveDays: "30 Days",
    },
  },
  {
    id: 7,
    employeeName: "Biren Singh",
    date: "Jul. 09, 2025",
    status: "Present",
    checkIn: "08:58 AM",
    checkOut: "05:02 PM",
    scheduledCheckIn: "09:00 AM",
    leaveType: null,
    employeeId: "EMP12351",
    department: "Design",
    role: "Product Designer",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2021",
      totalPresentsDays: "1000 days",
      totalAbsentDays: "25 Days",
      totalLeaveDays: "50 Days",
    },
  },
  // Adding some leave data for demonstration
  {
    id: 8,
    employeeName: "Alice Johnson",
    date: "Jul. 08, 2025",
    status: "Leave",
    checkIn: "-",
    checkOut: "-",
    scheduledCheckIn: "09:00 AM",
    leaveType: "VL", // Vacation Leave
    employeeId: "EMP12352",
    department: "HR",
    role: "HR Manager",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2020",
      totalPresentsDays: "1500 days",
      totalAbsentDays: "40 Days",
      totalLeaveDays: "80 Days",
    },
  },
  {
    id: 9,
    employeeName: "Bob Williams",
    date: "Jul. 08, 2025",
    status: "Leave",
    checkIn: "-",
    checkOut: "-",
    scheduledCheckIn: "09:00 AM",
    leaveType: "SL", // Sick Leave
    employeeId: "EMP12353",
    department: "Sales",
    role: "Sales Representative",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2021",
      totalPresentsDays: "1100 days",
      totalAbsentDays: "35 Days",
      totalLeaveDays: "60 Days",
    },
  },
  {
    id: 10,
    employeeName: "Charlie Brown",
    date: "Jul. 08, 2025",
    status: "Leave",
    checkIn: "-",
    checkOut: "-",
    scheduledCheckIn: "09:00 AM",
    leaveType: "LWOP", // Leave Without Pay
    employeeId: "EMP12354",
    department: "Marketing",
    role: "Marketing Specialist",
    employmentType: "Full Time",
    avgWorkHours: "8hrs 00mins",
    avgOvertime: "0hrs 00mins",
    attendanceLog: [],
    summary: {
      yearOfEmployment: "2022",
      totalPresentsDays: "700 days",
      totalAbsentDays: "10 Days",
      totalLeaveDays: "25 Days",
    },
  },
];

const Attendances = () => {
  const [attendanceRecords, setAttendanceRecords] = useState(
    initialAttendanceData
  );
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

  const months = [
    { value: "Jan", label: "January" },
    { value: "Feb", label: "February" },
    { value: "Mar", label: "March" },
    { value: "Apr", label: "April" },
    { value: "May", label: "May" },
    { value: "Jun", label: "June" },
    { value: "Jul", label: "July" },
    { value: "Aug", label: "August" },
    { value: "Sep", label: "September" },
    { value: "Oct", label: "October" },
    { value: "Nov", label: "November" },
    { value: "Dec", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  // Filter attendance records based on search term, selected year, and month
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const recordMonth = months[recordDate.getMonth()].value;
      const recordYear = String(recordDate.getFullYear());

      const matchesSearch =
        record.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth =
        selectedMonth === "" || recordMonth === selectedMonth;
      const matchesYear = selectedYear === "" || recordYear === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [searchTerm, selectedMonth, selectedYear, attendanceRecords]);

  // Calculate summary statistics
  const { totalMinLate, numLate, numAbsent, leaveCounts } = useMemo(() => {
    let totalMinLate = 0;
    let numLate = 0;
    let numAbsent = 0;
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };

    filteredAttendance.forEach((record) => {
      if (
        record.status === "Late" &&
        record.checkIn &&
        record.scheduledCheckIn
      ) {
        const checkInMinutes = parseTimeToMinutes(record.checkIn);
        const scheduledCheckInMinutes = parseTimeToMinutes(
          record.scheduledCheckIn
        );
        if (checkInMinutes !== null && scheduledCheckInMinutes !== null) {
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

  // Function to get status color scheme for Chakra Tag
  const getStatusColorScheme = (status) => {
    switch (status) {
      case "Present":
        return "green";
      case "Absent":
        return "red";
      case "Late":
        return "orange";
      case "Leave":
        return "blue"; // For general leave status
      default:
        return "gray";
    }
  };

  // Function to calculate hours rendered
  const calculateHoursRendered = (checkIn, checkOut) => {
    if (checkIn === "-" || checkOut === "-") return "-";

    const checkInMinutes = parseTimeToMinutes(checkIn);
    const checkOutMinutes = parseTimeToMinutes(checkOut);

    if (
      checkInMinutes === null ||
      checkOutMinutes === null ||
      checkOutMinutes < checkInMinutes
    ) {
      return "-"; // Invalid times
    }

    const totalMinutes = checkOutMinutes - checkInMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  // Calculate tardiness for a specific record
  const getTardiness = (record) => {
    if (record.status === "Late" && record.checkIn && record.scheduledCheckIn) {
      const checkInMinutes = parseTimeToMinutes(record.checkIn);
      const scheduledCheckInMinutes = parseTimeToMinutes(
        record.scheduledCheckIn
      );
      if (checkInMinutes !== null && scheduledCheckInMinutes !== null) {
        const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
        if (lateMinutes > 0) {
          return `${lateMinutes} min late`;
        }
      }
    }
    return "-";
  };

  // Handler for "View Details" button
  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    onDrawerOpen(); // Open the drawer
  };

  // Handler for "Edit Record" button
  const handleEditRecord = (record) => {
    setEditingRecord({ ...record }); // Create a copy to edit
    onModalOpen();
  };

  // Handler for saving edited record
  const handleSaveRecord = () => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((rec) =>
        rec.id === editingRecord.id ? editingRecord : rec
      )
    );
    onModalClose();
    setEditingRecord(null);
  };

  // Handle changes in the edit modal form
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => {
      const updatedRecord = { ...prev, [name]: value };

      // Logic for auto-setting check-in/out for Absent status
      if (name === "status") {
        if (value === "Absent" || value === "Leave") {
          updatedRecord.checkIn = "-";
          updatedRecord.checkOut = "-";
        } else if (prev.status === "Absent" || prev.status === "Leave") {
          // If changing from Absent/Leave to Present/Late, reset check-in/out to default/empty
          updatedRecord.checkIn = ""; // Or a default time like '09:00 AM'
          updatedRecord.checkOut = ""; // Or a default time like '05:00 PM'
        }
      }
      // If status is not 'Leave', reset leaveType
      if (name === "status" && value !== "Leave") {
        updatedRecord.leaveType = null;
      }

      return updatedRecord;
    });
  };

  return (
    <Box
      minH="100vh"
      p={{ base: 4, sm: 6, lg: 8 }}
      bg="gray.50"
      fontFamily="sans-serif"
    >
      {/* Header Section */}
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

      {/* Summary Section: Tardiness and Leave */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
        {/* Tardiness Card */}
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

        {/* Leave Card */}
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

      {/* Attendance Table */}
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
                display={{ base: "none", md: "table-cell" }}
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
                display={{ base: "none", md: "table-cell" }}
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
                {" "}
                {/* Hidden on md, visible on lg */}
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
              <Tr key={record.id}>
                <Td px={4} py={4} whiteSpace="nowrap">
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {record.employeeName}
                  </Text>
                </Td>
                <Td px={4} py={4} whiteSpace="nowrap">
                  <HStack spacing={1} display="inline-flex" alignItems="center">
                    <CalendarIcon w={3} h={3} color="gray.500" />
                    <Text fontSize="sm" color="gray.900">
                      {record.date}
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
                  display={{ base: "none", md: "table-cell" }}
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
                  display={{ base: "none", md: "table-cell" }}
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
                      <MenuItem
                        onClick={() =>
                          alert("Delete functionality to be implemented.")
                        }
                      >
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

      {/* Employee Details Drawer (Modal) */}
      <Drawer
        isOpen={isDrawerOpen}
        placement="right"
        onClose={onDrawerClose}
        size={{ base: "full", md: "lg", lg: "xl" }}
      >
        {" "}
        {/* Adjusted width */}
        <DrawerOverlay bg="blackAlpha.300" /> {/* Added overlay */}
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
                {/* Employee Basic Info */}
                <Flex
                  align="center"
                  justify="space-between"
                  pb={4}
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  flexWrap="wrap" // Allow wrapping on small screens
                >
                  <HStack spacing={4} flex="1" minW="200px">
                    <Avatar
                      size="xl"
                      name={selectedEmployee.employeeName}
                      src={`https://placehold.co/100x100/A0D9B1/000000?text=${selectedEmployee.employeeName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}`}
                    />{" "}
                    {/* More colorful placeholder */}
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="md" color="gray.500" fontWeight="medium">
                        EMP ID: {selectedEmployee.employeeId}
                      </Text>
                      <Text
                        fontSize="2xl"
                        fontWeight="extrabold"
                        color="gray.800"
                      >
                        {selectedEmployee.employeeName}
                      </Text>
                      <Text fontSize="md" color="gray.600">
                        Product Designer (Remote)
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
                  <Button
                    size="md"
                    variant="outline"
                    rightIcon={<ChevronDownIcon />}
                    colorScheme="blue"
                    mt={{ base: 4, sm: 0 }}
                  >
                    View Details
                  </Button>
                </Flex>

                {/* Employment Details */}
                <Box bg="blue.50" p={4} borderRadius="md" shadow="sm">
                  {" "}
                  {/* Added background */}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                    <HStack>
                      <Icon as={FaBriefcase} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Department:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.department}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaUserTie} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Role:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.role}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaFileAlt} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Employment:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.employmentType}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={FaClock} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Avg. Work Hours:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.avgWorkHours}
                        </Text>
                      </Text>
                    </HStack>
                    <HStack>
                      <Icon as={TimeIcon} color="blue.600" />
                      <Text fontSize="sm" color="gray.700">
                        Avg. Overtime:{" "}
                        <Text as="span" fontWeight="semibold">
                          {selectedEmployee.avgOvertime}
                        </Text>
                      </Text>
                    </HStack>
                  </SimpleGrid>
                </Box>

                <Divider borderColor="gray.300" />

                {/* Attendance Summary */}
                <Box bg="green.50" p={4} borderRadius="md" shadow="sm">
                  {" "}
                  {/* Added background */}
                  <Heading size="md" mb={4} color="gray.700">
                    Attendance Summary
                  </Heading>
                  <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
                    <Stat>
                      <StatLabel color="gray.600">Year of Employment</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="green.700"
                      >
                        {selectedEmployee.summary.yearOfEmployment}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.600">
                        Total Presents Days
                      </StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="green.700"
                      >
                        {selectedEmployee.summary.totalPresentsDays}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.600">Total Absent Days</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="red.700"
                      >
                        {selectedEmployee.summary.totalAbsentDays}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel color="gray.600">Total Leave Days</StatLabel>
                      <StatNumber
                        fontSize="xl"
                        fontWeight="bold"
                        color="blue.700"
                      >
                        {selectedEmployee.summary.totalLeaveDays}
                      </StatNumber>
                    </Stat>
                  </SimpleGrid>
                </Box>

                <Divider borderColor="gray.300" />

                {/* Detailed Attendance Log */}
                <Box bg="purple.50" p={4} borderRadius="md" shadow="sm">
                  {" "}
                  {/* Added background */}
                  <Flex justify="space-between" align="center" mb={4}>
                    <Heading size="md" color="gray.700">
                      March 2025 Log
                    </Heading>
                    <HStack>
                      <Button
                        leftIcon={<DownloadIcon />}
                        size="sm"
                        variant="outline"
                        colorScheme="purple"
                      >
                        Export CSV
                      </Button>
                      <Button
                        leftIcon={<SettingsIcon />}
                        size="sm"
                        variant="outline"
                        colorScheme="purple"
                      >
                        Filter
                      </Button>
                    </HStack>
                  </Flex>
                  <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Start Date</Th>
                          <Th>Clock In - Out</Th>
                          <Th>Overtime</Th>
                          <Th>Location</Th>
                          <Th>Status</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedEmployee.attendanceLog &&
                          selectedEmployee.attendanceLog.map((log, index) => (
                            <Tr key={index}>
                              <Td>{log.date}</Td>
                              <Td>{log.clock}</Td>
                              <Td>{log.overtime}</Td>
                              <Td>{log.location}</Td>
                              <Td>
                                <Tag
                                  size="sm"
                                  colorScheme={
                                    log.status === "Late"
                                      ? "orange"
                                      : log.status === "Early"
                                      ? "green"
                                      : "gray"
                                  }
                                  borderRadius="full"
                                >
                                  {log.status}
                                </Tag>
                              </Td>
                              <Td>
                                <IconButton
                                  icon={<InfoOutlineIcon />}
                                  aria-label="Log Details"
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="purple"
                                />
                              </Td>
                            </Tr>
                          ))}
                        {selectedEmployee.attendanceLog.length === 0 && (
                          <Tr>
                            <Td
                              colSpan={6}
                              textAlign="center"
                              py={4}
                              color="gray.500"
                            >
                              No detailed attendance log available for this
                              period.
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
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
                  <Input value={editingRecord.employeeName} isReadOnly />
                </FormControl>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input value={editingRecord.date} isReadOnly />
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
            <Button colorScheme="blue" ml={3} onClick={handleSaveRecord}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Attendances;
