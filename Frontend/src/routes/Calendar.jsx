import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Badge,
  IconButton,
  Flex,
  Heading,
  useToast,
  Card,
  CardBody,
  Divider,
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  AddIcon,
  EditIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../lib/axiosInstance";
// Mock API functions (replace with actual API calls to your Node.js backend)
const API_BASE = "http://localhost:3001/api";

const mockEvents = [
  {
    id: "1",
    title: "Team Meeting",
    description: "Weekly team sync",
    date: "2025-09-23",
    time: "10:00",
    duration: 60,
    type: "meeting",
    priority: "high",
  },
  {
    id: "2",
    title: "Project Review",
    description: "Quarterly project assessment",
    date: "2025-09-25",
    time: "14:00",
    duration: 90,
    type: "review",
    priority: "medium",
  },
  {
    id: "3",
    title: "Client Call",
    description: "Discussion with client about requirements",
    date: "2025-09-27",
    time: "09:00",
    duration: 45,
    type: "call",
    priority: "high",
  },
];

// API service functions

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    type: "meeting",
    priority: "medium",
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      toast({
        title: "Error loading events",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    try {
      const response = await axiosInstance.post(
        "/calendar/create-events",
        formData
      );
      const data = response.data;
      if (!formData.title || !formData.date || !formData.time) {
        toast({
          title: "Please fill in all required fields",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      if (selectedEvent) {
        await eventService.updateEvent(selectedEvent.id, formData);
        toast({
          title: "Event updated successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        await eventService.createEvent(formData);
        toast({
          title: "Event created successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      loadEvents();
      handleCloseModal();
    } catch (error) {
      toast({
        title: "Error saving event",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await eventService.deleteEvent(id);
      toast({
        title: "Event deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      loadEvents();
    } catch (error) {
      toast({
        title: "Error deleting event",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setSelectedEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        duration: event.duration,
        type: event.type,
        priority: event.priority,
      });
    } else {
      setSelectedEvent(null);
      setFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        time: "09:00",
        duration: 60,
        type: "meeting",
        priority: "medium",
      });
    }
    onOpen();
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: 60,
      type: "meeting",
      priority: "medium",
    });
    onClose();
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return events.filter((event) => event.date === dateStr);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "red";
      case "medium":
        return "yellow";
      case "low":
        return "green";
      default:
        return "gray";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "meeting":
        return "blue";
      case "call":
        return "purple";
      case "review":
        return "teal";
      case "task":
        return "orange";
      default:
        return "gray";
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <Box p={6} bg="gray.50" minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="gray.800">
            Calendar Scheduler
          </Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => handleOpenModal()}
          >
            Add Event
          </Button>
        </Flex>

        {/* Calendar Navigation */}
        <HStack justify="center" spacing={4}>
          <IconButton
            icon={<ChevronLeftIcon />}
            onClick={() => navigateMonth(-1)}
            variant="outline"
          />
          <Heading size="md" minW="200px" textAlign="center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Heading>
          <IconButton
            icon={<ChevronRightIcon />}
            onClick={() => navigateMonth(1)}
            variant="outline"
          />
        </HStack>

        {/* Calendar Grid */}
        <Card>
          <CardBody>
            {/* Day Headers */}
            <Grid templateColumns="repeat(7, 1fr)" gap={1} mb={2}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <GridItem key={day} p={2} textAlign="center">
                  <Text fontWeight="bold" fontSize="sm" color="gray.600">
                    {day}
                  </Text>
                </GridItem>
              ))}
            </Grid>

            <Divider />

            {/* Calendar Days */}
            <Grid templateColumns="repeat(7, 1fr)" gap={1} mt={2}>
              {days.map((day, index) => {
                const dayEvents = getEventsForDate(day);
                const isCurrentMonth =
                  day.getMonth() === currentDate.getMonth();
                const isToday =
                  day.toDateString() === new Date().toDateString();

                return (
                  <GridItem
                    key={index}
                    minH="100px"
                    p={2}
                    border="1px"
                    borderColor="gray.200"
                    bg={isToday ? "blue.50" : "white"}
                    opacity={isCurrentMonth ? 1 : 0.5}
                    _hover={{ bg: isToday ? "blue.100" : "gray.50" }}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight={isToday ? "bold" : "normal"}
                      color={isToday ? "blue.600" : "gray.600"}
                      mb={1}
                    >
                      {day.getDate()}
                    </Text>
                    <VStack spacing={1} align="stretch">
                      {dayEvents.slice(0, 2).map((event) => (
                        <Box
                          key={event.id}
                          bg={`${getTypeColor(event.type)}.100`}
                          p={1}
                          borderRadius="sm"
                          fontSize="xs"
                          cursor="pointer"
                          _hover={{ bg: `${getTypeColor(event.type)}.200` }}
                          onClick={() => handleOpenModal(event)}
                        >
                          <Text
                            fontWeight="medium"
                            color={`${getTypeColor(event.type)}.700`}
                            noOfLines={1}
                          >
                            {event.time} {event.title}
                          </Text>
                        </Box>
                      ))}
                      {dayEvents.length > 2 && (
                        <Text fontSize="xs" color="gray.500" textAlign="center">
                          +{dayEvents.length - 2} more
                        </Text>
                      )}
                    </VStack>
                  </GridItem>
                );
              })}
            </Grid>
          </CardBody>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Upcoming Events
            </Heading>
            {isLoading ? (
              <Text>Loading events...</Text>
            ) : events.length === 0 ? (
              <Text color="gray.500">No events scheduled</Text>
            ) : (
              <VStack spacing={3} align="stretch">
                {events
                  .sort(
                    (a, b) =>
                      new Date(a.date + " " + a.time) -
                      new Date(b.date + " " + b.time)
                  )
                  .slice(0, 5)
                  .map((event) => (
                    <Box
                      key={event.id}
                      p={4}
                      border="1px"
                      borderColor="gray.200"
                      borderRadius="md"
                      bg="white"
                    >
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <HStack spacing={2}>
                            <Text fontWeight="bold">{event.title}</Text>
                            <Badge
                              colorScheme={getPriorityColor(event.priority)}
                              size="sm"
                            >
                              {event.priority}
                            </Badge>
                            <Badge
                              colorScheme={getTypeColor(event.type)}
                              size="sm"
                            >
                              {event.type}
                            </Badge>
                          </HStack>
                          <Text fontSize="sm" color="gray.600">
                            {event.description}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {new Date(event.date).toLocaleDateString()} at{" "}
                            {event.time} ({event.duration}min)
                          </Text>
                        </VStack>
                        <HStack spacing={1}>
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenModal(event)}
                          />
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteEvent(event.id)}
                          />
                        </HStack>
                      </HStack>
                    </Box>
                  ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </VStack>

      {/* Event Modal */}
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedEvent ? "Edit Event" : "Add New Event"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Title</FormLabel>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Event title"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Event description"
                />
              </FormControl>

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration: parseInt(e.target.value),
                      })
                    }
                    min="15"
                    step="15"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="meeting">Meeting</option>
                    <option value="call">Call</option>
                    <option value="review">Review</option>
                    <option value="task">Task</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEvent}>
              {selectedEvent ? "Update" : "Create"} Event
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Calendar;
