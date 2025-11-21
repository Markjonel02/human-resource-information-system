import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  HStack,
  Button,
  Select,
  VStack,
  Text,
  Spinner,
  Center,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

// Month Labels
const months = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
];

const DailyTimeRecordCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await axiosInstance.get("/Dtr/my-dtr", {
        params: { year, month },
      });

      if (!resp.data || resp.data.success === false) {
        setError(resp.data?.message || "Failed to load data.");
        setEvents([]);
        return;
      }

      const records = resp.data.data.records || [];

      // Convert DTR into FullCalendar events
      const formatted = records.map((rec) => ({
        title: `IN: ${rec.checkIn || "."}  OUT: ${rec.checkOut || "."}`,
        date: rec.date,
        backgroundColor: rec.isAbsent ? "#f87171" : "#60a5fa",
        borderColor: "#1d4ed8",
        textColor: "white",
      }));

      setEvents(formatted);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch calendar data.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={6}>
      {/* Error */}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <VStack align="stretch" spacing={4} mb={4}>
        <Text fontSize="2xl" fontWeight="bold">
          Daily Time Record Calendar
        </Text>

        {/* Year + Month Controls */}
        <HStack spacing={4} justify="space-between">
          {/* Year Selector */}
          <HStack spacing={2}>
            <Text fontWeight="bold">YEAR:</Text>
            <Select
              size="sm"
              w="120px"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </Select>
          </HStack>

          {/* Horizontal Month Selector */}
          <HStack
            spacing={2}
            overflowX="auto"
            py={1}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
          >
            {months.map((m) => (
              <Button
                key={m.value}
                size="sm"
                variant={month === m.value ? "solid" : "outline"}
                colorScheme={month === m.value ? "blue" : "gray"}
                onClick={() => setMonth(m.value)}
                minW="90px"
              >
                {m.name}
              </Button>
            ))}
          </HStack>
        </HStack>
      </VStack>

      {/* Loading Spinner */}
      {loading ? (
        <Center py={20}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      ) : (
        <Box bg="white" p={4} borderRadius="md" boxShadow="md">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            events={events}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            headerToolbar={false}
            initialDate={`${year}-${String(month).padStart(2, "0")}-01`}
          />
        </Box>
      )}
    </Box>
  );
};

export default DailyTimeRecordCalendar;
