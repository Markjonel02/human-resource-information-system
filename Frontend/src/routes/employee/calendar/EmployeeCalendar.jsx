import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  useColorModeValue,
  Avatar,
  AvatarGroup,
  useToast,
} from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../../../lib/axiosInstance";
import { useAuth } from "../../../context/AuthContext";

const EmployeeCalendar = () => {
  const [events, setEvents] = useState([]);
  const toast = useToast();
  const { authState } = useAuth();
  const currentUser = authState?.user;

  const headerBg = useColorModeValue("gray.100", "gray.700");
  const rowHover = useColorModeValue("gray.50", "gray.600");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get(
        "/employeeCalendar/employee-get-events"
      );

      const mappedEvents = res.data.map((e) => {
        let bgColor = "#3182CE"; // default blue
        if (e.priority === "high") bgColor = "#E53E3E"; // red
        else if (e.priority === "medium") bgColor = "#DD6B20"; // orange
        else if (e.priority === "low") bgColor = "#38A169"; // green

        return {
          id: e._id,
          title: e.title,
          start: `${e.date}T${e.time}`,
          end: e.endDate ? `${e.endDate}T${e.time}` : null,
          backgroundColor: bgColor,
          borderColor: bgColor,
          textColor: "white",
          extendedProps: {
            ...e,
            participants: e.participants || [],
          },
        };
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Load events error:", err);
      toast({ title: "Error loading events", status: "error" });
    }
  };

  // Helper function to sort participants with current user first
  const sortParticipants = (participants) => {
    if (!participants || participants.length === 0) return [];

    // Handle different possible structures of currentUser
    const currentUserId = currentUser?._id || currentUser?.id || currentUser;

    const currentUserParticipant = participants.find(
      (p) =>
        p._id === currentUserId ||
        p.id === currentUserId ||
        p._id === currentUser ||
        p.id === currentUser
    );
    const otherParticipants = participants.filter(
      (p) =>
        !(
          p._id === currentUserId ||
          p.id === currentUserId ||
          p._id === currentUser ||
          p.id === currentUser
        )
    );

    return currentUserParticipant
      ? [currentUserParticipant, ...otherParticipants]
      : participants;
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg"> My Calendar</Heading>
        </HStack>

        {/* FullCalendar */}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth"
          events={events}
          height="100vh"
        />

        {/* Event List */}
        <Box
          bg={useColorModeValue("white", "gray.800")}
          rounded="2xl"
          shadow="lg"
          p={6}
          overflowX="auto"
        >
          <Heading size="md" mb={6} color="blue.600">
            Event List
          </Heading>

          <Table variant="striped" colorScheme="blue" size="md">
            <Thead bg={headerBg}>
              <Tr>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
                <Th>Participants</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.map((e) => {
                const sortedParticipants = sortParticipants(
                  e.extendedProps.participants
                );

                return (
                  <Tr
                    key={e.id}
                    _hover={{ bg: rowHover, transform: "scale(1.01)" }}
                    transition="all 0.2s"
                  >
                    <Td>
                      <Text fontWeight="semibold" color="blue.700">
                        {e.title}
                      </Text>
                    </Td>
                    <Td>{e.extendedProps.date}</Td>
                    <Td>{e.extendedProps.time}</Td>
                    <Td>
                      <Badge
                        px={3}
                        py={1}
                        rounded="full"
                        colorScheme={
                          e.extendedProps.type === "meeting"
                            ? "purple"
                            : e.extendedProps.type === "call"
                            ? "blue"
                            : e.extendedProps.type === "review"
                            ? "orange"
                            : "gray"
                        }
                      >
                        {e.extendedProps.type}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        px={3}
                        py={1}
                        rounded="full"
                        colorScheme={
                          e.extendedProps.priority === "high"
                            ? "red"
                            : e.extendedProps.priority === "medium"
                            ? "yellow"
                            : "green"
                        }
                      >
                        {e.extendedProps.priority}
                      </Badge>
                    </Td>
                    <Td>
                      {sortedParticipants.length > 0 ? (
                        <AvatarGroup size="sm" max={3}>
                          {sortedParticipants.map((p, i) => {
                            // Handle different possible structures of currentUser
                            const currentUserId =
                              currentUser?._id ||
                              currentUser?.id ||
                              currentUser;
                            const isCurrentUser =
                              p._id === currentUserId ||
                              p.id === currentUserId ||
                              p._id === currentUser ||
                              p.id === currentUser;

                            return (
                              <Avatar
                                key={i}
                                size="sm"
                                fontSize="0.8em"
                                name={
                                  isCurrentUser
                                    ? "You"
                                    : `${p.firstname} ${p.lastname}`
                                }
                              />
                            );
                          })}
                        </AvatarGroup>
                      ) : (
                        <Text color="gray.500" fontSize="sm">
                          No participants
                        </Text>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Box>
  );
};

export default EmployeeCalendar;
