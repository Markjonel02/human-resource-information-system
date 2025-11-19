import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Button,
  Grid,
  GridItem,
  Badge,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";

const DailyTimeRecord = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const toast = useToast();

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchAttendanceData();
  }, [year, month]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // Mock employee info
      setEmployeeInfo({
        name: "RELLES, MARK JONEL DAEP",
        idNumber: "1240606",
        position: "JUNIOR WEB DEVELOPER",
        employmentStatus: "REGULAR",
      });

      // Mock attendance data
      const mockData = generateMockData();
      setAttendanceData(mockData);
      setLoading(false);
    }, 1000);
  };

  const generateMockData = () => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const data = [];
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
      const isWeekend = dayOfWeek === "Sat" || dayOfWeek === "Sun";

      let record = {
        date: `${monthNames[month - 1].substring(0, 3)}-${String(day).padStart(
          2,
          "0"
        )}-${String(year).substring(2)}`,
        day: dayOfWeek,
        scheduleIn: isWeekend
          ? dayOfWeek === "Sat"
            ? "08:00"
            : "00:00"
          : "08:00",
        scheduleOut: isWeekend
          ? dayOfWeek === "Sat"
            ? "12:00"
            : "00:00"
          : "17:00",
        dataIn: null,
        dataOut: null,
        hours: null,
        late: null,
        ut: null,
        absent: null,
        vl: null,
        sl: null,
        fl: null,
        mlpl: null,
        lwop: null,
        reg: null,
        nd: null,
        ot: null,
        otNd: null,
        sus: null,
        isWeekend: isWeekend,
        isAbsent: false,
      };

      // Add some sample data for working days
      if (!isWeekend && day <= 18 && ![6, 7, 8, 10, 13, 15].includes(day)) {
        const inTime = new Date(date);
        inTime.setHours(7, 30 + Math.floor(Math.random() * 60), 0);
        const outTime = new Date(date);
        outTime.setHours(17, Math.floor(Math.random() * 5), 0);

        record.dataIn = inTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });
        record.dataOut = outTime.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        const totalMinutes = Math.floor((outTime - inTime) / 60000) - 60; // minus lunch break
        record.hours = `${String(Math.floor(totalMinutes / 60)).padStart(
          2,
          "0"
        )}:${String(totalMinutes % 60).padStart(2, "0")}`;

        if (inTime.getHours() === 8 && inTime.getMinutes() > 0) {
          record.late = `00:${String(inTime.getMinutes()).padStart(2, "0")}`;
        }

        record.reg = "08:00";
      } else if ([6, 7, 8, 10, 13, 15].includes(day) && !isWeekend) {
        record.isAbsent = true;
        record.absent = "1";
      }

      data.push(record);
    }

    return data;
  };

  const handleUpdate = () => {
    fetchAttendanceData();
    toast({
      title: "Data Updated",
      description: "Daily time record has been refreshed",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  const getRowColor = (record) => {
    if (record.isAbsent) return "red.500";
    if (record.isWeekend) {
      return record.day === "Sun" ? "yellow.400" : "red.500";
    }
    return "white";
  };

  const getTextColor = (record) => {
    if (record.isAbsent || record.isWeekend) return "white";
    return "gray.800";
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text color="gray.600">Loading attendance data...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <Box p={6} bg="white">
      {/* Header Section */}
      <VStack align="stretch" spacing={4} mb={6}>
        <Heading size="lg" color="blue.800">
          Daily Time Record
        </Heading>

        {/* Employee Information */}
        {employeeInfo && (
          <Grid
            templateColumns="repeat(2, 1fr)"
            gap={4}
            p={4}
            bg="gray.50"
            borderRadius="md"
          >
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                EMPLOYEE NAME:
              </Text>
              <Text fontSize="sm">{employeeInfo.name}</Text>
            </GridItem>
            <GridItem textAlign="right">
              <Text fontSize="sm" fontWeight="bold">
                LEGEND:
              </Text>
            </GridItem>
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                ID NUMBER:
              </Text>
              <Text fontSize="sm">{employeeInfo.idNumber}</Text>
            </GridItem>
            <GridItem></GridItem>
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                POSITION:
              </Text>
              <Text fontSize="sm">{employeeInfo.position}</Text>
            </GridItem>
            <GridItem></GridItem>
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                EMPLOYMENT STATUS:
              </Text>
              <Text fontSize="sm">{employeeInfo.employmentStatus}</Text>
            </GridItem>
          </Grid>
        )}

        {/* Controls */}
        <HStack spacing={4} justify="space-between">
          <HStack spacing={2}>
            <Text fontSize="sm" fontWeight="bold">
              YEAR:
            </Text>
            <Select
              size="sm"
              w="120px"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Text fontSize="sm" fontWeight="bold" ml={4}>
              MONTH:
            </Text>
            <Select
              size="sm"
              w="140px"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </Select>
            <Button size="sm" colorScheme="blue" onClick={handleUpdate}>
              Update
            </Button>
          </HStack>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </HStack>
      </VStack>

      {/* Table */}
      <Box
        overflowX="auto"
        border="1px"
        borderColor="gray.200"
        borderRadius="md"
      >
        <Table variant="simple" size="sm">
          <Thead bg="red.600">
            <Tr>
              <Th color="white" fontSize="xs" textAlign="center">
                DATE
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                DAY
              </Th>
              <Th
                color="white"
                fontSize="xs"
                textAlign="center"
                colSpan={2}
                borderLeft="1px"
                borderColor="white"
              >
                SCHEDULE
              </Th>
              <Th
                color="white"
                fontSize="xs"
                textAlign="center"
                colSpan={2}
                bg="blue.600"
              >
                DATA
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" bg="green.500">
                HOURS
              </Th>
              <Th
                color="white"
                fontSize="xs"
                textAlign="center"
                colSpan={3}
                bg="orange.400"
              >
                TARDINES
              </Th>
              <Th
                color="white"
                fontSize="xs"
                textAlign="center"
                colSpan={5}
                bg="red.400"
              >
                LEAVE
              </Th>
              <Th
                color="white"
                fontSize="xs"
                textAlign="center"
                colSpan={5}
                bg="purple.500"
              >
                TIME RECORD
              </Th>
            </Tr>
            <Tr>
              <Th color="white" fontSize="xs"></Th>
              <Th color="white" fontSize="xs"></Th>
              <Th color="white" fontSize="xs" textAlign="center" bg="blue.600">
                IN
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" bg="blue.600">
                OUT
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" bg="green.500">
                IN
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" bg="green.500">
                OUT
              </Th>
              <Th color="white" fontSize="xs"></Th>
              <Th color="white" fontSize="xs" textAlign="center">
                LATE
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                *
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                UT
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                ABSENT
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                VL
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                SL
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                FL
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                MLPL
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                LWOP
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                REG
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                ND
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                OT
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                OT/ND
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                SUS
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {attendanceData.map((record, index) => (
              <Tr
                key={index}
                bg={getRowColor(record)}
                color={getTextColor(record)}
              >
                <Td fontSize="xs" textAlign="center">
                  {record.date}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.day}
                </Td>
                <Td
                  fontSize="xs"
                  textAlign="center"
                  bg={record.isWeekend ? getRowColor(record) : "blue.100"}
                >
                  {record.scheduleIn}
                </Td>
                <Td
                  fontSize="xs"
                  textAlign="center"
                  bg={record.isWeekend ? getRowColor(record) : "blue.100"}
                >
                  {record.scheduleOut}
                </Td>
                <Td
                  fontSize="xs"
                  textAlign="center"
                  bg={record.isWeekend ? getRowColor(record) : "green.100"}
                >
                  {record.dataIn || "."}
                </Td>
                <Td
                  fontSize="xs"
                  textAlign="center"
                  bg={record.isWeekend ? getRowColor(record) : "green.100"}
                >
                  {record.dataOut || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.hours || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.late || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.late ? "1" : "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.ut || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.absent || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.vl || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.sl || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.fl || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.mlpl || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.lwop || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.reg || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.nd || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.ot || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.otNd || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.sus || "."}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DailyTimeRecord;
