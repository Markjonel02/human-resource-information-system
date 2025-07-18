// --- UpcomingSchedule Component ---
import React from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Flex,
  Spacer,
  Button,
  Tag,
  Avatar,
  Tooltip,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaEllipsisV } from "react-icons/fa"; // Using FaEllipsisV for the three dots icon

const UpcomingSchedule = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const schedules = [
    {
      id: 1,
      type: "Critical",
      title: "Team Briefing",
      description: "Discuss priorities for the week",
      assignee: {
        name: "Ethan Miller",
        avatar: "https://placehold.co/40x40/FF5733/white?text=EM",
      },
      time: "09:00 AM - 09:30 AM",
      tagColor: "red",
    },
    {
      id: 2,
      type: "Urgent",
      title: "Compensation Review",
      description: "Review and update salary structures",
      assignee: {
        name: "Emily Johnson",
        avatar: "https://placehold.co/40x40/33FF57/white?text=EJ",
      },
      time: "10:30 AM - 12:00 PM",
      tagColor: "orange",
    },
    {
      id: 3,
      type: "Routine",
      title: "Administrative Tasks",
      description: "Handle paperwork and documentation",
      assignee: {
        name: "Olivia Carter",
        avatar: "https://placehold.co/40x40/3357FF/white?text=OC",
      },
      time: "12:00 PM - 01:00 PM",
      tagColor: "green",
    },
  ];

  return (
    <Box
      p={6}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="md"
      bg={cardBg}
      // Responsive width
    >
      <Flex mb={4} alignItems="center">
        <Heading as="h2" size="md" color={textColor}>
          Upcoming Schedule
        </Heading>
        <Spacer />
        <Button
          leftIcon={<FaCalendarAlt />}
          size="sm"
          variant="outline"
          colorScheme="gray"
          color={subTextColor}
          _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
        >
          Today
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {schedules.map((schedule, index) => (
          <Box key={schedule.id}>
            <Flex alignItems="center" mb={2}>
              <Tag
                size="sm"
                variant="subtle"
                colorScheme={schedule.tagColor}
                borderRadius="full"
                mr={2}
              >
                {schedule.type}
              </Tag>
              <Spacer />
              <Button variant="ghost" size="sm" p={0}>
                <FaEllipsisV color={subTextColor} />
              </Button>
            </Flex>
            <Box
              pl={3}
              borderLeft={`3px solid ${
                schedule.tagColor === "red"
                  ? "red.500"
                  : schedule.tagColor === "orange"
                  ? "orange.500"
                  : "green.500"
              }`}
              pb={2}
            >
              <Text fontWeight="semibold" fontSize="md" color={textColor}>
                {schedule.title}
              </Text>
              <Text fontSize="sm" color={subTextColor} mb={2}>
                {schedule.description}
              </Text>
              <HStack spacing={2} alignItems="center">
                <Avatar
                  size="xs"
                  name={schedule.assignee.name}
                  src={schedule.assignee.avatar}
                />
                <Tooltip label={schedule.assignee.name}>
                  <Text fontSize="sm" color={subTextColor}>
                    {`${schedule.assignee.name.substring(0, 5)}...`}
                  </Text>
                </Tooltip>
                <Spacer />
                <HStack spacing={1} alignItems="center">
                  <Text fontSize="sm" color={subTextColor}>
                    <FaCalendarAlt size="12px" />
                  </Text>
                  <Text fontSize="sm" color={subTextColor}>
                    {schedule.time}
                  </Text>
                </HStack>
              </HStack>
            </Box>
            {index < schedules.length - 1 && (
              <Divider mt={2} borderColor={borderColor} />
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default UpcomingSchedule;
