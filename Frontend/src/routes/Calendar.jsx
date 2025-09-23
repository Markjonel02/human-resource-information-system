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

  const loadEvents = async () => {
    try {
      const res = await axiosInstance.get("/calendar/get-events");
      setEvents(
        res.data.map((e) => {
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
            extendedProps: e,
          };
        })
      );
    } catch (err) {
      toast({ title: "Error loading events", status: "error" });
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
        await axiosInstance.put(
          `/calendar/update-event/${selectedEvent.id}`,
          data
        );
        toast({ title: "Event updated", status: "success" });
      } else {
        await axiosInstance.post(`/calendar/create-events`, data);
        toast({ title: "Event created", status: "success" });
      }
      loadEvents();
    } catch (err) {
      toast({ title: "Save failed", status: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      await axiosInstance.delete(`/calendar/delete-event/${selectedEvent.id}`);
      toast({ title: "Event deleted", status: "success" });
      loadEvents();
    } catch (err) {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Heading size="lg">📅 Team Scheduler</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddClick}
          >
            Add Event
          </Button>
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
          selectable
          events={events}
          eventClick={handleEventClick}
          height="75vh"
        />

        {/* Events Table */}
        <Box bg="white" rounded="xl" shadow="md" p={4}>
          <Heading size="md" mb={4}>
            📋 Event List
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Date</Th>
                <Th>Time</Th>
                <Th>Type</Th>
                <Th>Priority</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.map((e) => (
                <Tr key={e.id}>
                  <Td>
                    <Text fontWeight="medium">{e.title}</Text>
                  </Td>
                  <Td>{e.extendedProps.date}</Td>
                  <Td>{e.extendedProps.time}</Td>
                  <Td>
                    <Badge
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
