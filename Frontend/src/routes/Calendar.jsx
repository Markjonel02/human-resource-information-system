import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Button,
  useToast,
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
  Tooltip,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axiosInstance from "../lib/axiosInstance";
import EventModal from "../components/Admin_components/calendar/CalendarEventModal";
import DeleteConfirm from "../components/Admin_components/calendar/CalendarDeleteConfonfirm";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadEvents();
  }, []);
  const headerBg = useColorModeValue("gray.100", "gray.700");
  const rowHover = useColorModeValue("gray.50", "gray.600");

  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get("/calendar/get-events");

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
            ...e, // keep all original backend fields
            participants: e.participants || [], // ensure array
            _id: e._id, // explicitly store _id in extendedProps
          },
        };
      });

      setEvents(mappedEvents);
    } catch (err) {
      console.error("Load events error:", err);
      /*  toast({ title: "Error loading events", status: "error" }); */
    }
  };

  const handleAddClick = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent(info.event);
    setIsModalOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleSave = async (data) => {
    try {
      if (selectedEvent) {
        // Get the MongoDB _id from extendedProps
        const eventId = selectedEvent.extendedProps._id;
        await axiosInstance.put(`/calendar/update-event/${eventId}`, data);
        toast({ title: "Event updated", status: "success" });
      } else {
        await axiosInstance.post(`/calendar/create-events`, data);
        toast({ title: "Event created", status: "success" });
      }
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error("Save error:", err.response?.data || err.message);
      toast({
        title: "Save failed",
        description: err.response?.data?.error || "An error occurred",
        status: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      // Get the MongoDB _id from extendedProps
      const eventId = selectedEvent.extendedProps._id;
      await axiosInstance.delete(`/calendar/delete-event/${eventId}`);
      toast({ title: "Event deleted", status: "success" });
      setIsDeleteOpen(false);
      setIsModalOpen(false);
      loadEvents();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      toast({
        title: "Delete failed",
        description: err.response?.data?.error || "An error occurred",
        status: "error",
      });
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg"> Team Scheduler</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddClick}
          >
            Add Event
          </Button>
        </HStack>

        <Box
          sx={{
            ".fc .fc-toolbar .fc-button": {
              bg: "blue.500",
              color: "white",
              border: "none",
              _hover: { bg: "blue.600" },
              "&.fc-button-active": { bg: "blue.700" },
            },
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="dayGridMonth"
            selectable
            events={events}
            eventClick={handleEventClick}
            height="100vh"
          />
        </Box>

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
                <Th>Mark Done</Th> {/* ✅ New column */}
              </Tr>
            </Thead>
            <Tbody>
              {events.map((e) => (
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
                    {e.extendedProps.participants?.length > 0 ? (
                      <AvatarGroup size="sm" max={3}>
                        {e.extendedProps.participants.map((p, i) => (
                          <Avatar
                            key={i}
                            name={`${p.firstname} ${p.lastname}`}
                          />
                        ))}
                      </AvatarGroup>
                    ) : (
                      <Text color="gray.500" fontSize="sm">
                        No participants
                      </Text>
                    )}
                  </Td>

                  <Td>
                    {e.extendedProps.done ? (
                      <VStack spacing={1} align="start">
                        <Badge colorScheme="green">Done</Badge>
                        <Text fontSize="xs" color="gray.600">
                          By:{" "}
                          {e.extendedProps.markDoneBy?.firstname
                            ? `${e.extendedProps.markDoneBy.firstname} ${e.extendedProps.markDoneBy.lastname}`
                            : "Unknown"}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {e.extendedProps.markDoneAt
                            ? new Date(
                                e.extendedProps.markDoneAt
                              ).toLocaleString()
                            : ""}
                        </Text>
                      </VStack>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="green"
                        onClick={async () => {
                          try {
                            await axiosInstance.put(
                              `/calendar/mark-done/${e.id}`
                            );
                            toast({
                              title: "Event marked as done",
                              status: "success",
                            });
                            loadEvents(); // refresh
                          } catch (err) {
                            console.error("Mark done error:", err);
                            toast({
                              title: "Failed to mark as done",
                              description:
                                err.response?.data?.error ||
                                "Something went wrong",
                              status: "error",
                            });
                          }
                        }}
                      >
                        Mark Done
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Add/Edit Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        event={selectedEvent}
        onDelete={handleDeleteClick}
      />

      {/* Delete Confirmation */}
      <DeleteConfirm
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </Box>
  );
};

export default Calendar;
