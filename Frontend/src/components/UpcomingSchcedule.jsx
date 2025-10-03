// --- Final UpcomingSchedule.jsx with Add Event Modal ---
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
  Divider,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
} from "@chakra-ui/react";
import {
  FaCalendarAlt,
  FaEllipsisV,
  FaClock,
  FaRegEye,
  FaCheck,
} from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";
import ReusableModal from "./EmployeeCalendarModalView"; // View modal
import MarkAsDoneButton from "./MarkAsDoneButton"; // Mark as done button
import { useAuth } from "../context/AuthContext";

const ScheduleMenu = ({ onView, scheduleId, onSuccess }) => {
  return (
    <Menu placement="bottom-start">
      <MenuButton
        as={IconButton}
        icon={<FaEllipsisV />}
        variant="ghost"
        size="sm"
        _hover={{ bg: "gray.100" }}
      />
      <MenuList>
        <MenuItem onClick={onView} icon={<FaRegEye />}>
          View Details
        </MenuItem>

        <Box>
          <MarkAsDoneButton
            id={scheduleId}
            onSuccess={onSuccess}
            variant="ghost"
            size="sm"
            fullWidth={true}
            showConfirm={true}
            label="Mark as Done"
            icon={<FaCheck />}
          />
        </Box>
      </MenuList>
    </Menu>
  );
};

const UpcomingSchedule = () => {
  const { authState } = useAuth();
  const currentUser = authState?.user;
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const toast = useToast();

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  // Separate modals for view and add
  const {
    isOpen: isViewOpen,
    onOpen: onViewOpen,
    onClose: onViewClose,
  } = useDisclosure();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onClose: onAddClose,
  } = useDisclosure();

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
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

  // Get initials
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || "";
    const last = lastName?.charAt(0) || "";
    return (first + last).toUpperCase();
  };

  // Fetch schedules
  const getSchedules = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        "/employeeCalendar/employee-get-events"
      );
      if (!response || !response.data) {
        throw new Error("No data from server");
      }
      setSchedules(response.data);
    } catch (error) {
      console.error("getSchedules error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSchedules();
  }, []);

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleViewSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    onViewOpen();
  };

  return (
    <Box
      p={5}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="lg"
      bg={cardBg}
    >
      {/* Header with Refresh */}
      <Flex mb={4} alignItems="center">
        <Heading as="h3" size="md" color={textColor} fontWeight="600">
          Upcoming Schedule
        </Heading>
        <Spacer />
        <HStack spacing={2}>
          <Button
            leftIcon={<FaCalendarAlt />}
            size="sm"
            variant="outline"
            colorScheme="gray"
            fontSize="sm"
            onClick={getSchedules}
          >
            Refresh
          </Button>
        </HStack>
      </Flex>

      {/* Loading / Empty / List */}
      {loading ? (
        <Flex justify="center" py={6}>
          <Spinner size="lg" color="blue.500" />
        </Flex>
      ) : schedules.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Text color={subTextColor} fontSize="md" mb={4}>
            No upcoming schedules
          </Text>
        </Box>
      ) : (
        <VStack
          spacing={6}
          align="stretch"
          divider={<Divider borderColor={borderColor} />}
        >
          {schedules.map((schedule, index) => (
            <Box
              key={schedule._id || index}
              bg={cardBg}
              borderRadius="md"
              p={4}
              _hover={{ shadow: "md", transform: "translateY(-2px)" }}
              transition="all 0.2s ease-in-out"
            >
              {/* Priority + Actions */}
              <Flex justify="space-between" align="center" mb={3}>
                <Badge
                  colorScheme={getPriorityColor(schedule.priority)}
                  variant="solid"
                  fontSize="xs"
                  px={2}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {schedule.priority || "Medium"}
                </Badge>

                <ScheduleMenu
                  onView={() => handleViewSchedule(schedule)}
                  scheduleId={schedule._id || schedule.id}
                  onSuccess={getSchedules}
                />
              </Flex>

              {/* Main Content */}
              <HStack spacing={3} align="start">
                <Avatar
                  size="sm"
                  name={`${schedule.createdBy?.firstname} ${schedule.createdBy?.lastname}`}
                  bg={`${getPriorityColor(schedule.priority)}.500`}
                  color="white"
                  fontWeight="bold"
                >
                  {getInitials(
                    schedule.createdBy?.firstName,
                    schedule.createdBy?.lastName
                  )}
                </Avatar>

                <Box flex={1} minW={0}>
                  <Text
                    fontWeight="600"
                    fontSize="md"
                    color={textColor}
                    noOfLines={1}
                  >
                    {schedule.title}
                  </Text>

                  <Text
                    fontSize="sm"
                    color={subTextColor}
                    mb={2}
                    noOfLines={2}
                    isTruncated
                  >
                    {schedule.description || "No description provided."}
                  </Text>

                  <HStack spacing={4} fontSize="sm" color={subTextColor} mb={2}>
                    <HStack spacing={1}>
                      <FaCalendarAlt size="12px" />
                      <Text>
                        {schedule.endDate
                          ? `${formatDate(schedule.date)} - ${formatDate(
                              schedule.endDate
                            )}`
                          : formatDate(schedule.date)}
                      </Text>
                    </HStack>

                    <HStack spacing={1}>
                      <FaClock size="12px" />
                      <Text>{schedule.time}</Text>
                    </HStack>
                  </HStack>

                  <Text fontSize="sm" fontWeight="500" color={subTextColor}>
                    {schedule.createdBy
                      ? `${schedule.createdBy.firstname} ${schedule.createdBy.lastname}`
                      : "Unknown"}
                  </Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* View Event Modal */}
      <ReusableModal
        isOpen={isViewOpen}
        onClose={onViewClose}
        event={selectedSchedule}
      />
    </Box>
  );
};

export default UpcomingSchedule;
