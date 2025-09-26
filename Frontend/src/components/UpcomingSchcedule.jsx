// --- Enhanced UpcomingSchedule Component ---
import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Flex,
  Spacer,
  Button,
  Avatar,
  VStack,
  HStack,
  useColorModeValue,
  useToast,
  Spinner,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaEllipsisV, FaClock } from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";

const UpcomingSchedule = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Priority color mapping
  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    switch (priorityLower) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return "?";
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  const getSchedules = async () => {
    try {
      const response = await axiosInstance.get(
        "/employeeCalendar/employee-get-events"
      );
      if (!response || !response.data) {
        throw new Error("No data from server");
      }
      console.log("Schedules data:", response.data); // Debug log
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast({
        title: "Error fetching schedules",
        description: error.message || "Something went wrong",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchedules();
  }, []);

  return (
    <Box
      p={5}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="lg"
      bg={cardBg}
    >
      <Flex mb={4} alignItems="center">
        <Heading as="h3" size="md" color={textColor} fontWeight="600">
          Upcoming Schedule
        </Heading>
        <Spacer />
        <Button
          leftIcon={<FaCalendarAlt />}
          size="sm"
          variant="outline"
          colorScheme="gray"
          fontSize="sm"
        >
          Today
        </Button>
      </Flex>

      {loading ? (
        <Flex justify="center" py={6}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : schedules.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Text color={subTextColor} fontSize="md">
            No upcoming schedules
          </Text>
        </Box>
      ) : (
        <VStack spacing={3} align="stretch">
          {schedules.map((schedule, index) => (
            <Box
              key={schedule._id || index}
              position="relative"
              bg={cardBg}
              borderRadius="md"
              overflow="hidden"
            >
              {/* Priority Badge and Menu */}
              <Flex justify="space-between" align="center" mb={3}>
                <Badge
                  colorScheme={getPriorityColor(schedule.priority)}
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="sm"
                  textTransform="capitalize"
                >
                  {schedule.priority || "Medium"}
                </Badge>
                <IconButton
                  icon={<FaEllipsisV />}
                  variant="ghost"
                  size="sm"
                  color={subTextColor}
                  _hover={{ bg: "gray.100" }}
                />
              </Flex>

              {/* Main Content */}
              <HStack spacing={3} align="flex-start">
                {/* Creator Avatar */}
                <Avatar
                  size="sm"
                  name={`${schedule.employee?.firstname || ""} ${
                    schedule.employee?.lastname || ""
                  }`}
                  bg={`${getPriorityColor(schedule.priority)}.500`}
                  color="white"
                  fontWeight="bold"
                >
                  {getInitials(
                    schedule.employee?.firstname,
                    schedule.employee?.lastname
                  )}
                </Avatar>

                {/* Event Details */}
                <Box flex={1} minW={0}>
                  <Text
                    fontWeight="600"
                    fontSize="md"
                    color={textColor}
                    mb={1}
                    noOfLines={1}
                  >
                    {schedule.title}
                  </Text>

                  <Text fontSize="sm" color={subTextColor} mb={2} noOfLines={2}>
                    {schedule.description}
                  </Text>

                  {/* Creator and Time Info */}
                  <HStack spacing={4} fontSize="sm" color={subTextColor}>
                    <Text fontWeight="500">
                      {schedule.employee?.lastname || "Unknown"}...
                    </Text>

                    <HStack spacing={1}>
                      <FaClock size="12px" />
                      <Text>{schedule.time}</Text>
                    </HStack>
                  </HStack>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default UpcomingSchedule;
