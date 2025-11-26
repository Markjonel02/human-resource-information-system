import React, { useState, useEffect, useRef } from "react";
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

const months = [
  { name: "Jan", value: 1 },
  { name: "Feb", value: 2 },
  { name: "Mar", value: 3 },
  { name: "Apr", value: 4 },
  { name: "May", value: 5 },
  { name: "Jun", value: 6 },
  { name: "Jul", value: 7 },
  { name: "Aug", value: 8 },
  { name: "Sep", value: 9 },
  { name: "Oct", value: 10 },
  { name: "Nov", value: 11 },
  { name: "Dec", value: 12 },
];

const ScheduleCalendar = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const toast = useToast();

  // Prevent duplicate toasts (Strict Mode double mount)
  const toastRef = useRef(false);

  useEffect(() => {
    toastRef.current = false; // reset toast guard when filters change
    fetchScheduleData();
  }, [year, month]);

  const fetchScheduleData = async () => {
    setLoading(true);
    setError(null);

    try {
      const resp = await axiosInstance.get("/Dtr/my-schedule", {
        params: { year, month },
      });

      if (!resp.data || resp.data.success === false) {
        setError(resp.data?.message || "Failed to load schedule data.");
        setEvents([]);

        if (!toastRef.current) {
          toastRef.current = true;
          toast({
            title: "Error",
            description: resp.data?.message || "Failed to load schedule data.",
            status: "error",
            duration: 5000,
            position: "top",
            isClosable: true,
          });
        }

        return;
      }

      const schedules = resp.data.data.schedules || [];
      const summaryData = resp.data.data.summary || null;
      setSummary(summaryData);

      const formatted = schedules.map((schedule) => {
        const timeIn = schedule.scheduleIn || "00:00";
        const timeOut = schedule.scheduleOut || "00:00";

        const scheduleDate = new Date(schedule.date + "T00:00:00");
        const dayOfWeek = scheduleDate.getDay();

        const isActualWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        let title, backgroundColor, textColor, borderColor;

        if (schedule.holiday) {
          title = `🎉 ${schedule.holiday.name}`;
          backgroundColor = "#dc2626";
          borderColor = "#991b1b";
          textColor = "white";
        } else if (isActualWeekend) {
          title = `Weekend`;
          backgroundColor = "#94a3b8";
          borderColor = "#64748b";
          textColor = "white";
        } else {
          title = `${timeIn} - ${timeOut}`;
          backgroundColor = "#3b82f6";
          borderColor = "#1e40af";
          textColor = "white";
        }

        return {
          title,
          date: schedule.date,
          backgroundColor,
          borderColor,
          textColor,
          extendedProps: {
            scheduleIn: timeIn,
            scheduleOut: timeOut,
            isRestDay: schedule.isRestDay || false,
            isWeekend: isActualWeekend,
            shiftType: schedule.shiftType || "Regular",
            holiday: schedule.holiday || null,
            dayNumber: dayOfWeek,
          },
        };
      });

      setEvents(formatted);

      if (!toastRef.current) {
        toastRef.current = true;
        toast({
          title: "Schedule Loaded",
          description: `Loaded ${formatted.length} days`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError(err.response?.data?.message || "Unable to fetch schedule data.");
      setEvents([]);

      if (!toastRef.current) {
        toastRef.current = true;
        toast({
          title: "Error",
          description:
            err.response?.data?.message || "Unable to fetch schedule data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    toastRef.current = false; // allow toast again on manual refresh
    fetchScheduleData();
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
          View your assigned work schedule, shift timings, and holidays for the
          selected month.
        </Text>

        {/* Year Selector */}
        <HStack spacing={4}>
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
        </HStack>

        {/* Month Selector */}
        <HStack spacing={2} overflowX="auto" py={1}>
          {months.map((m) => (
            <Button
              key={m.value}
              size="sm"
              variant={month === m.value ? "solid" : "outline"}
              colorScheme={month === m.value ? "blue" : "gray"}
              onClick={() => setMonth(m.value)}
              minW="70px"
            >
              {m.name}
            </Button>
          ))}
        </HStack>

        {/* Legend */}
        <HStack spacing={4} fontSize="sm" pt={2} flexWrap="wrap">
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#3b82f6" borderRadius="md" />
            <Text>Work Day</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#94a3b8" borderRadius="md" />
            <Text>Weekend</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#dc2626" borderRadius="md" />
            <Text>Holiday</Text>
          </HStack>
          <HStack spacing={2}>
            <Box w="20px" h="20px" bg="#cbd5e1" borderRadius="md" />
            <Text>Rest Day</Text>
          </HStack>
        </HStack>

        {/* Summary */}
        {summary && (
          <HStack spacing={6} p={4} bg="white" borderRadius="md" shadow="sm">
            <VStack spacing={0} align="center">
              <Text fontSize="xs" color="gray.600">
                Total Days
              </Text>
              <Text fontSize="xl" fontWeight="bold">
                {summary.totalDays}
              </Text>
            </VStack>
            <VStack spacing={0} align="center">
              <Text fontSize="xs" color="gray.600">
                Work Days
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {summary.workDays}
              </Text>
            </VStack>
            <VStack spacing={0} align="center">
              <Text fontSize="xs" color="gray.600">
                Weekends
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="gray.600">
                {summary.weekends}
              </Text>
            </VStack>
            <VStack spacing={0} align="center">
              <Text fontSize="xs" color="gray.600">
                Holidays
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="red.600">
                {summary.holidays}
              </Text>
            </VStack>
          </HStack>
        )}
      </VStack>

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
              const isHoliday = eventInfo.event.extendedProps.holiday !== null;
              return (
                <Box
                  fontSize="xs"
                  fontWeight="semibold"
                  p={1}
                  textAlign="center"
                  whiteSpace="normal"
                  wordBreak="break-word"
                  lineHeight="1.2"
                >
                  {eventInfo.event.title}
                </Box>
              );
            }}
            dayCellClassNames="hover:bg-gray-50"
            eventClassNames="cursor-pointer"
          />
        </Box>
      )}
    </Box>
  );
};

export default ScheduleCalendar;
