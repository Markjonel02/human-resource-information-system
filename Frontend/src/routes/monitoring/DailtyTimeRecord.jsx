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
  useToast,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const DailyTimeRecord = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAttendanceData();
  }, [year, month]);

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      // call server route as defined in Server routes: /api/attendance/my-dtr
      const resp = await axiosInstance.get("/Dtr/my-dtr", {
        params: { year, month },
      });

      // server returns { success: true, data: { year, month, records, summary } }
      const payload = resp?.data;
      if (!payload) {
        setAttendanceData([]);
        setError("Empty response from server.");
        return;
      }

      if (payload.success === false) {
        setAttendanceData([]);
        setError(payload.message || "Failed to load DTR.");
        return;
      }

      const data = payload.data || {};
      const records = Array.isArray(data.records) ? data.records : [];

      // map server record shape to the UI fields used in the table
      const normalize = (rec) => {
        const def = (v) => (v === null || v === undefined ? "." : v);
        return {
          date: def(rec.date),
          day: def(rec.day),
          scheduleIn: def(rec.scheduleIn) === "." ? "." : def(rec.scheduleIn),
          scheduleOut:
            def(rec.scheduleOut) === "." ? "." : def(rec.scheduleOut),
          dataIn: def(rec.checkIn || rec.check_in),
          dataOut: def(rec.checkOut || rec.check_out),
          hours: def(
            rec.totalHours ||
              rec.total_hours ||
              rec.totalHoursRendered ||
              rec.hours
          ),
          late: def(rec.late),
          ut: def(rec.ut),
          absent: rec.isAbsent ? "1" : def(rec.absent),
          vl: def(rec.vl),
          sl: def(rec.sl),
          fl: def(rec.fl),
          mlpl: def(rec.mlpl),
          lwop: def(rec.lwop),
          reg: def(rec.reg),
          nd: def(rec.nd),
          ot: def(rec.ot),
          otNd: def(rec.otNd),
          sus: def(rec.sus),
        };
      };

      setAttendanceData(records.map(normalize));

      // if employee info is included in response, set it
      if (data.employeeInfo) {
        setEmployeeInfo(data.employeeInfo);
      }
    } catch (err) {
      console.error("fetchAttendanceData error:", err);
      setAttendanceData([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load attendance data."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    fetchAttendanceData();
  };

  const handleRefresh = () => {
    fetchAttendanceData();
  };

  const getRowColor = (record) => {
    return "blue.50";
  };

  const getTextColor = (record) => {
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
      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          <Thead bg="blue.400">
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
              <Th color="white" fontSize="xs" textAlign="center" colSpan={2}>
                DATA
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                HOURS
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" colSpan={3}>
                TARDINES
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" colSpan={5}>
                LEAVE
              </Th>
              <Th color="white" fontSize="xs" textAlign="center" colSpan={5}>
                TIME RECORD
              </Th>
            </Tr>
            <Tr>
              <Th color="white" fontSize="xs"></Th>
              <Th color="white" fontSize="xs"></Th>
              <Th color="white" fontSize="xs" textAlign="center">
                IN
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                OUT
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
                IN
              </Th>
              <Th color="white" fontSize="xs" textAlign="center">
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
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.scheduleIn || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.scheduleOut || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.dataIn || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
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
            {attendanceData.length === 0 && (
              <Tr>
                <Td colSpan={21} textAlign="center" py={6}>
                  <Text color="gray.600">
                    No records for selected month/year.
                  </Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DailyTimeRecord;
