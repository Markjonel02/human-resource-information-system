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

  useEffect(() => {
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
        return;
      }

      const schedules = resp.data.data.schedules || [];
      const summaryData = resp.data.data.summary || null;
      setSummary(summaryData);

      const formatted = schedules.map((schedule) => {
        const timeIn = schedule.scheduleIn || "00:00";
        const timeOut = schedule.scheduleOut || "00:00";

        // Parse the date to check day of week
        const scheduleDate = new Date(schedule.date + "T00:00:00"); // Force local timezone
        const dayOfWeek = scheduleDate.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat

        // CRITICAL: Only Saturday (6) and Sunday (0) are weekends
        // Monday=1, Tuesday=2, Wednesday=3, Thursday=4, Friday=5 are ALL work days
        const isActualWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        console.log(
          `📅 Date: ${
            schedule.date
          }, DayOfWeek: ${dayOfWeek}, IsWeekend: ${isActualWeekend}, Holiday: ${
            schedule.holiday?.name || "None"
          }`
        );

        let title, backgroundColor, textColor, borderColor;

        // PRIORITY ORDER:
        // 1. Holiday (highest priority - overrides everything)
        // 2. Weekend (Saturday/Sunday ONLY)
        // 3. Regular work day (Monday-Friday)

        if (schedule.holiday) {
          // Holiday - RED (even if it falls on a weekday like Friday)
          title = `🎉 ${schedule.holiday.name}`;
          backgroundColor = "#dc2626"; // Red
          borderColor = "#991b1b"; // Dark red
          textColor = "white";
        } else if (isActualWeekend) {
          // Weekend (ONLY Saturday=6 or Sunday=0) - GRAY
          title = `Weekend`;
          backgroundColor = "#94a3b8"; // Gray
          borderColor = "#64748b"; // Dark gray
          textColor = "white";
        } else {
          // Regular working day (Monday=1 to Friday=5) - BLUE with time
          // This includes ALL Fridays that are NOT holidays
          title = `${timeIn} - ${timeOut}`;
          backgroundColor = "#3b82f6"; // Blue
          borderColor = "#1e40af"; // Dark blue
          textColor = "white";
        }

        return {
          title: title,
          date: schedule.date,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          textColor: textColor,
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

      toast({
        title: "Schedule Loaded",
        description: `Loaded ${formatted.length} days`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
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

        {/* Summary Stats */}
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
                  fontSize={isHoliday ? "xs" : "xs"}
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
