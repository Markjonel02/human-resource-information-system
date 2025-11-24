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
  const [leaveCredits, setLeaveCredits] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAttendanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const formatDateReadable = (isoOrDate) => {
    if (!isoOrDate) return null;
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return String(isoOrDate);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yy = String(d.getFullYear()).slice(-2);
    // match previous UI style like "Jan-01-25" if desired; here use YYYY-MM-DD
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  const getWeekdayShort = (isoOrDate) => {
    if (!isoOrDate) return "";
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await axiosInstance.get("/Dtr/my-dtr", {
        params: { year, month },
      });

      const payload = resp?.data?.data ?? resp?.data ?? null;
      if (!payload) {
        setAttendanceData([]);
        setEmployeeInfo(null);
        setLeaveCredits(null);
        setSummary(null);
        setError("Empty response from server.");
        setLoading(false);
        return;
      }

      // get raw records list (server uses data.records)
      const rawRecords = Array.isArray(payload.records) ? payload.records : [];

      // normalize records: ensure date/day/leave flags/late are populated
      const normalized = rawRecords.map((r) => {
        // derive date and day if missing
        const dateIso = r.date || r._id || r.checkIn || null; // fallback options
        const date =
          r.date ||
          (r.date && r.date.split ? r.date.split("T")[0] : null) ||
          dateIso;
        const day =
          r.day || getWeekdayShort(r.date) || getWeekdayShort(r.checkIn);

        // ensure leave flags if backend provided leaveType
        const leaveType = r.leaveType || null;
        const vl = r.vl || (leaveType === "VL" ? "1" : null);
        const sl = r.sl || (leaveType === "SL" ? "1" : null);
        const fl = r.fl || (leaveType === "FL" ? "1" : null);
        const mlpl = r.mlpl || (leaveType === "MLPL" ? "1" : null);
        const lwop = r.lwop || (leaveType === "LWOP" ? "1" : null);

        // late field: backend returns "late" as "HH:MM" or null; keep that
        const late =
          r.late ||
          (r.tardinessMinutes
            ? (() => {
                const m = Number(r.tardinessMinutes || 0);
                if (!m) return null;
                const hh = String(Math.floor(m / 60)).padStart(2, "0");
                const mm = String(m % 60).padStart(2, "0");
                return `${hh}:${mm}`;
              })()
            : null);

        return {
          ...r,
          date: formatDateReadable(r.date) || r.date || ".",
          day: day || ".",
          scheduleIn: r.scheduleIn || r.schedule?.in || "08:00",
          scheduleOut: r.scheduleOut || r.schedule?.out || null,
          dataIn: r.checkIn || r.dataIn || r.check_in || null,
          dataOut: r.checkOut || r.dataOut || r.check_out || null,
          hours:
            r.totalHours ||
            r.hours ||
            r.hoursRendered ||
            r.hours_rendered ||
            null,
          late,
          vl,
          sl,
          fl,
          mlpl,
          lwop,
        };
      });

      setAttendanceData(normalized);
      setEmployeeInfo(payload.employeeInfo || payload.employee || null);
      setLeaveCredits(payload.leaveCredits || null);
      setSummary(payload.summary || null);

      // small user feedback if no records
      if (!normalized.length) {
        toast({
          title: "No records",
          description:
            "No attendance records found for the selected month/year.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("fetchAttendanceData error:", err);
      setAttendanceData([]);
      setEmployeeInfo(null);
      setLeaveCredits(null);
      setSummary(null);
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

  const getRowColor = (record) => "blue.50";
  const getTextColor = (record) => "gray.800";

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
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VStack align="stretch" spacing={4} mb={6}>
        <Heading size="lg" color="blue.800">
          Daily Time Record
        </Heading>

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
              <Text fontSize="sm">
                {employeeInfo.name ||
                  employeeInfo.fullName ||
                  employeeInfo.username}
              </Text>
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
              <Text fontSize="sm">
                {employeeInfo.idNumber || employeeInfo.employeeId || "-"}
              </Text>
            </GridItem>
            <GridItem></GridItem>
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                POSITION:
              </Text>
              <Text fontSize="sm">{employeeInfo.position || "-"}</Text>
            </GridItem>
            <GridItem></GridItem>
            <GridItem>
              <Text fontSize="sm" fontWeight="bold">
                EMPLOYMENT STATUS:
              </Text>
              <Text fontSize="sm">{employeeInfo.employmentStatus || "-"}</Text>
            </GridItem>
          </Grid>
        )}

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
                OT
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
                  {record.date || "."}
                </Td>
                <Td fontSize="xs" textAlign="center">
                  {record.day || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.scheduleIn || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.scheduleOut || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.dataIn || record.checkIn || "."}
                </Td>
                <Td fontSize="xs" textAlign="center" bg="blue.50">
                  {record.dataOut || record.checkOut || "."}
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
                  {record.absent || (record.isAbsent ? "1" : ".")}
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
                  {record.ot || "."}
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
