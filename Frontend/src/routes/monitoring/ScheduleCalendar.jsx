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

const ScheduleCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toast = useToast();

  useEffect(() => {
    fetchScheduleData();
  }, [year, month]);

  const fetchScheduleData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Adjust this endpoint based on your backend schedule routes
      const resp = await axiosInstance.get("/Dtr/my-schedule", {
        params: { year, month },
      });

      if (!resp.data || resp.data.success === false) {
        setError(resp.data?.message || "Failed to load schedule data.");
        setEvents([]);
        return;
      }

      const schedules = resp.data.data.schedules || [];

      // Convert schedules into FullCalendar events
      const formatted = schedules.map((schedule) => {
        // Extract time from schedule (assuming scheduleIn and scheduleOut are time strings)
        const timeIn = schedule.scheduleIn || "00:00";
        const timeOut = schedule.scheduleOut || "00:00";

        return {
          title: `${timeIn} - ${timeOut}`,
          date: schedule.date,
          backgroundColor: schedule.isRestDay ? "#94a3b8" : "#3b82f6",
          borderColor: "#1e40af",
          textColor: "white",
          extendedProps: {
            scheduleIn: timeIn,
            scheduleOut: timeOut,
            isRestDay: schedule.isRestDay || false,
            shiftType: schedule.shiftType || "Regular",
          },
        };
      });

      setEvents(formatted);
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err.response?.data?.message || "Unable to fetch schedule data.");
      setEvents([]);
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Unable to fetch schedule data.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchScheduleData();
    toast({
      title: "Refreshed",
      description: "Schedule data has been reloaded",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      {/* Error Alert */}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <VStack align="stretch" spacing={4} mb={4}>
        <HStack justify="space-between" align="center">
          <Text fontSize="2xl" fontWeight="bold" color="blue.800">
            Work Schedule Calendar
          </Text>
          <Button
            size="sm"
            colorScheme="blue"
            variant="outline"
            onClick={handleRefresh}
            isLoading={loading}
          >
            Refresh
          </Button>
        </HStack>

        <Text fontSize="sm" color="gray.600">
          View your assigned work schedule and shift timings for the selected
          month.
        </Text>

        {/* Year + Month Controls */}
        <HStack spacing={4} justify="space-between" flexWrap="wrap">
          {/* Year Selector */}
          <HStack spacing={2}>
            <Text fontWeight="bold" fontSize="sm">
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
          </HStack>

          {/* Horizontal Month Selector */}
          <HStack
            spacing={2}
            overflowX="auto"
            py={1}
            px={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="gray.50"
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

        {/* Legend */}
        <HStack spacing={4} fontSize="sm" pt={2}>
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#3b82f6" borderRadius="md" />
            <Text>Work Day</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#94a3b8" borderRadius="md" />
            <Text>Rest Day</Text>
          </HStack>
        </HStack>
      </VStack>

      {/* Loading Spinner */}
      {loading ? (
        <Center py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text color="gray.600">Loading schedule...</Text>
          </VStack>
        </Center>
      ) : (
        <Box
          bg="white"
          p={4}
          borderRadius="md"
          boxShadow="lg"
          border="1px"
          borderColor="gray.200"
        >
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            height="auto"
            events={events}
            fixedWeekCount={false}
            showNonCurrentDates={false}
            headerToolbar={false}
            initialDate={`${year}-${String(month).padStart(2, "0")}-01`}
            eventContent={(eventInfo) => {
              return (
                <Box
                  fontSize="xs"
                  fontWeight="semibold"
                  p={1}
                  textAlign="center"
                  whiteSpace="normal"
                  wordBreak="break-word"
                >
                  {eventInfo.event.title}
                </Box>
              );
            }}
            dayCellClassNames="hover:bg-gray-50"
          />
        </Box>
      )}
    </Box>
  );
};

export default ScheduleCalendar;
