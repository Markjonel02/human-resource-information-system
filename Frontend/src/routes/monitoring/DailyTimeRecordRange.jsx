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
  Input,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const DailyTimeRecordRange = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchAttendanceRange = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing date",
        description: "Start date and end date are required.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resp = await axiosInstance.get("/Dtr/my-dtr-range", {
        params: { startDate, endDate },
      });

      const payload = resp?.data;

      if (!payload) {
        setAttendanceData([]);
        setError("Empty response from server.");
        return;
      }

      if (payload.success === false) {
        setAttendanceData([]);
        setError(payload.message || "Failed to load DTR records.");
        return;
      }

      const data = payload.data || {};
      const records = Array.isArray(data.records) ? data.records : [];

      const normalize = (rec) => {
        const def = (v) => (v === null || v === undefined ? "." : v);
        return {
          date: def(rec.date),
          day: def(rec.day),
          scheduleIn: def(rec.scheduleIn),
          scheduleOut: def(rec.scheduleOut),
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

      if (data.employeeInfo) {
        setEmployeeInfo(data.employeeInfo);
      }
    } catch (err) {
      console.error("fetchAttendanceRange error:", err);
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

  const rowColor = "blue.50";
  const textColor = "gray.800";

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" />
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
          Daily Time Record (Date Range)
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

        {/* DATE RANGE CONTROLS */}
        <HStack spacing={4}>
          <VStack align="flex-start">
            <Text fontSize="sm" fontWeight="bold">
              START DATE:
            </Text>
            <Input
              type="date"
              size="sm"
              w="160px"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </VStack>

          <VStack align="flex-start">
            <Text fontSize="sm" fontWeight="bold">
              END DATE:
            </Text>
            <Input
              type="date"
              size="sm"
              w="160px"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </VStack>

          <Button size="sm" colorScheme="blue" onClick={fetchAttendanceRange}>
            Load Records
          </Button>
        </HStack>
      </VStack>

      {/* TABLE */}
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
              <Th color="white" fontSize="xs" textAlign="center" colSpan={2}>
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

            {/* Second row */}
            <Tr>
              <Th></Th>
              <Th></Th>
              <Th textAlign="center">IN</Th>
              <Th textAlign="center">OUT</Th>
              <Th textAlign="center">IN</Th>
              <Th textAlign="center">OUT</Th>
              <Th></Th>
              <Th textAlign="center">LATE</Th>
              <Th textAlign="center">*</Th>
              <Th textAlign="center">UT</Th>
              <Th textAlign="center">ABS</Th>
              <Th textAlign="center">VL</Th>
              <Th textAlign="center">SL</Th>
              <Th textAlign="center">FL</Th>
              <Th textAlign="center">MLPL</Th>
              <Th textAlign="center">LWOP</Th>
              <Th textAlign="center">REG</Th>
              <Th textAlign="center">ND</Th>
              <Th textAlign="center">OT</Th>
              <Th textAlign="center">OT/ND</Th>
              <Th textAlign="center">SUS</Th>
            </Tr>
          </Thead>

          <Tbody>
            {attendanceData.map((record, i) => (
              <Tr key={i} bg={rowColor} color={textColor}>
                <Td textAlign="center">{record.date}</Td>
                <Td textAlign="center">{record.day}</Td>
                <Td bg="blue.50" textAlign="center">
                  {record.scheduleIn}
                </Td>
                <Td bg="blue.50" textAlign="center">
                  {record.scheduleOut}
                </Td>
                <Td bg="blue.50" textAlign="center">
                  {record.dataIn}
                </Td>
                <Td bg="blue.50" textAlign="center">
                  {record.dataOut}
                </Td>
                <Td textAlign="center">{record.hours}</Td>
                <Td textAlign="center">{record.late}</Td>
                <Td textAlign="center">{record.late !== "." ? "1" : "."}</Td>
                <Td textAlign="center">{record.ut}</Td>
                <Td textAlign="center">{record.absent}</Td>
                <Td textAlign="center">{record.vl}</Td>
                <Td textAlign="center">{record.sl}</Td>
                <Td textAlign="center">{record.fl}</Td>
                <Td textAlign="center">{record.mlpl}</Td>
                <Td textAlign="center">{record.lwop}</Td>
                <Td textAlign="center">{record.reg}</Td>
                <Td textAlign="center">{record.nd}</Td>
                <Td textAlign="center">{record.ot}</Td>
                <Td textAlign="center">{record.otNd}</Td>
                <Td textAlign="center">{record.sus}</Td>
              </Tr>
            ))}

            {attendanceData.length === 0 && (
              <Tr>
                <Td colSpan={21} textAlign="center" py={6}>
                  <Text color="gray.600">No results in selected range.</Text>
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DailyTimeRecordRange;
