import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  Button,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  useBreakpointValue,
  FormLabel,
  List,
  ListItem,
  ListIcon,
  Tooltip, // Import Tooltip
} from "@chakra-ui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  AddIcon,
  DeleteIcon,
  StarIcon,
} from "@chakra-ui/icons";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  parseISO,
  isSameDay,
} from "date-fns";

const generateUniqueId = () =>
  `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Philippine Holidays for 2025 (example data)
const philippineHolidays2025 = [
  {
    id: generateUniqueId(),
    title: "New Year's Day",
    date: "2025-01-01",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Chinese New Year",
    date: "2025-01-29",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "EDSA People Power Revolution Anniversary",
    date: "2025-02-25",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Maundy Thursday",
    date: "2025-04-17",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Good Friday",
    date: "2025-04-18",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Black Saturday",
    date: "2025-04-19",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Araw ng Kagitingan",
    date: "2025-04-09",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Labor Day",
    date: "2025-05-01",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Independence Day",
    date: "2025-06-12",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Eid'l Adha",
    date: "2025-06-07",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Ninoy Aquino Day",
    date: "2025-08-21",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "National Heroes Day",
    date: "2025-08-25",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "All Saints' Day",
    date: "2025-11-01",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "All Souls' Day",
    date: "2025-11-02",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Bonifacio Day",
    date: "2025-11-30",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Feast of the Immaculate Conception",
    date: "2025-12-08",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Christmas Day",
    date: "2025-12-25",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "Rizal Day",
    date: "2025-12-30",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
  {
    id: generateUniqueId(),
    title: "New Year's Eve",
    date: "2025-12-31",
    type: "Holiday",
    isHoliday: true,
    color: "#DD6B20",
    time: "09:00",
  },
];

// --- New EventBadge Component ---
const EventBadge = ({ event, onEdit, onDelete }) => {
  const toast = useToast();

  let colorScheme = "blue";
  let icon = null;

  if (event.isHoliday) {
    colorScheme = "orange";
    icon = <StarIcon mr={1} />;
  } else {
    switch (event.type) {
      case "Shared":
        colorScheme = "purple";
        break;
      case "Public":
        colorScheme = "green";
        break;
      default:
        colorScheme = "blue";
    }
  }

  const truncatedTitle = useBreakpointValue({
    base:
      event.title.length > 1
        ? `${event.title.substring(0, 1)}...`
        : event.title,
    md: event.title,
  });

  const handleBadgeClick = () => {
    if (event.isHoliday) {
      toast({
        title: "This is a public holiday.",
        description: "Public holidays cannot be edited.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      onEdit(event);
    }
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (event.isHoliday) {
      toast({
        title: "Cannot delete public holiday.",
        description: "Public holidays are fixed and cannot be removed.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onDelete(event.id);
  };

  return (
    <Tooltip label={event.title} aria-label={event.title} openDelay={500}>
      <Badge
        colorScheme={colorScheme}
        borderRadius="md"
        px={2}
        py={1}
        mb={1}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        cursor="pointer"
        onClick={handleBadgeClick}
        _hover={{ bg: `${colorScheme}.100` }}
      >
        <Box display="flex" alignItems="center">
          {icon}
          <Text fontSize="xs" fontWeight="bold">
            {event.time !== "09:00" ? event.time : ""}
          </Text>
          <Text fontSize="xs" ml={event.time !== "09:00" ? 1 : 0}>
            {truncatedTitle}
          </Text>
        </Box>
        {!event.isHoliday && (
          <IconButton
            size="xs"
            variant="ghost"
            colorScheme="red"
            aria-label="Delete event"
            icon={<DeleteIcon />}
            onClick={handleDeleteClick}
          />
        )}
      </Badge>
    </Tooltip>
  );
};
// --- End New EventBadge Component ---

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    id: "",
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    type: "All events",
    color: "#3182CE",
  });
  const [editingEventId, setEditingEventId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const storedEvents = localStorage.getItem("calendarEvents");
    let initialEvents = [];
    if (storedEvents) {
      initialEvents = JSON.parse(storedEvents);
    }
    const mergedEvents = [...initialEvents];
    philippineHolidays2025.forEach((holiday) => {
      if (
        !mergedEvents.some(
          (event) =>
            event.title === holiday.title && event.date === holiday.date
        )
      ) {
        mergedEvents.push(holiday);
      }
    });
    setEvents(mergedEvents);
  }, []);

  useEffect(() => {
    const userEvents = events.filter((event) => !event.isHoliday);
    localStorage.setItem("calendarEvents", JSON.stringify(userEvents));
  }, [events]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleAddEventClick = (date = new Date()) => {
    setEditingEventId(null);
    setNewEvent({
      id: generateUniqueId(),
      title: "",
      date: format(date, "yyyy-MM-dd"),
      time: "09:00",
      type: "All events",
      color: "#3182CE",
    });
    setIsModalOpen(true);
  };

  const handleEditEventClick = (event) => {
    setEditingEventId(event.id);
    setNewEvent({ ...event });
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (id) => {
    setEvents(events.filter((e) => e.id !== id));
    toast({
      title: "Event deleted.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Please fill all required fields.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (editingEventId) {
      setEvents(
        events.map((e) => (e.id === editingEventId ? { ...newEvent } : e))
      );
      toast({
        title: "Event updated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setEvents([...events, { ...newEvent, id: generateUniqueId() }]);
      toast({
        title: "Event added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    setIsModalOpen(false);
    setEditingEventId(null);
    setNewEvent({
      id: "",
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      type: "All events",
      color: "#3182CE",
    });
  };

  const getEventsForDay = (day) => {
    return events
      .filter((e) => isSameDay(parseISO(e.date), day))
      .sort((a, b) => {
        if (a.isHoliday && !b.isHoliday) return -1;
        if (!a.isHoliday && b.isHoliday) return 1;
        return a.time.localeCompare(b.time);
      });
  };

  return (
    <ChakraProvider>
      <Box p={4} maxW="1200px" mx="auto">
        <Flex justify="space-between" align="center" mb={6} wrap="wrap">
          <Text fontSize="3xl" fontWeight="bold" mb={{ base: 4, md: 0 }}>
            Calendar
          </Text>
          <InputGroup w={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input type="text" placeholder="Search" borderRadius="lg" />
          </InputGroup>
        </Flex>

        <Flex mb={6} wrap="wrap">
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "center", md: "stetch" }}
            gap={2}
            w="full"
            justify="space-between"
          >
            <Flex gap={2} mb={{ base: 4, md: 0 }}>
              {["All events", "Shared", "Public"].map((label) => (
                <Button key={label} borderRadius="lg" variant="outline">
                  {label}
                </Button>
              ))}
            </Flex>
            <Flex align="center" gap={2}>
              <Text fontSize="lg" fontWeight="semibold">
                {format(currentMonth, "MMMM yyyy")}
              </Text>
              <IconButton
                aria-label="Previous month"
                icon={<ChevronLeftIcon />}
                onClick={goToPreviousMonth}
                borderRadius="lg"
              />
              <IconButton
                aria-label="Next month"
                icon={<ChevronRightIcon />}
                onClick={goToNextMonth}
                borderRadius="lg"
              />
              <Menu></Menu>
            </Flex>
            <Flex
              direction={{ base: "column", sm: "row" }}
              w={{ base: "full", sm: "auto" }}
              gap={2}
            >
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                borderRadius="lg"
                onClick={() => handleAddEventClick()}
                w={{ base: "full", sm: "auto" }}
              >
                Add event
              </Button>
              <Button
                leftIcon={<StarIcon />}
                colorScheme="orange"
                borderRadius="lg"
                onClick={() => setIsHolidayModalOpen(true)}
                w={{ base: "full", sm: "auto" }}
              >
                View Holidays
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <Box
          border="1px"
          borderColor="gray.200"
          borderRadius="lg"
          overflow="hidden"
        >
          <Flex bg="gray.50" borderBottom="1px" borderColor="gray.200">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <Box
                key={day}
                flex="1"
                p={2}
                textAlign="center"
                fontWeight="bold"
                fontSize="sm"
              >
                {day}
              </Box>
            ))}
          </Flex>
          <Box display="grid" gridTemplateColumns="repeat(7, 1fr)">
            {daysInMonth.map((day, index) => (
              <Box
                key={index}
                border="1px"
                borderColor="gray.100"
                minH="120px"
                p={2}
                opacity={isSameMonth(day, currentMonth) ? 1 : 0.5}
                bg={isToday(day) ? "blue.50" : "white"}
                position="relative"
                _hover={{ bg: "gray.50" }}
                onClick={() => handleAddEventClick(day)}
              >
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  color={isToday(day) ? "blue.700" : "gray.700"}
                  mb={2}
                >
                  {format(day, "d")}
                </Text>
                <Flex direction="column" gap={1}>
                  {getEventsForDay(day)
                    .slice(0, 3)
                    .map((event) => (
                      <EventBadge
                        key={event.id}
                        event={event}
                        onEdit={handleEditEventClick}
                        onDelete={handleDeleteEvent}
                      />
                    ))}
                </Flex>
                {getEventsForDay(day).length > 3 && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {getEventsForDay(day).length - 3} more...
                  </Text>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <ModalOverlay />
          <ModalContent borderRadius="lg">
            <ModalHeader>
              {editingEventId ? "Edit Event" : "Add New Event"}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isRequired mb={4}>
                <FormLabel>Event Title</FormLabel>
                <Input
                  placeholder="Event Title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  borderRadius="md"
                />
              </FormControl>
              <FormControl isRequired mb={4}>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  borderRadius="md"
                />
              </FormControl>
              <FormControl isRequired mb={4}>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  borderRadius="md"
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Type</FormLabel>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronRightIcon transform="rotate(90deg)" />}
                    width="100%"
                    borderRadius="md"
                  >
                    {newEvent.type}
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          type: "All events",
                          color: "#3182CE",
                        })
                      }
                    >
                      All events
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          type: "Shared",
                          color: "#805AD5",
                        })
                      }
                    >
                      Shared
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          type: "Public",
                          color: "#38A169",
                        })
                      }
                    >
                      Public
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        setNewEvent({
                          ...newEvent,
                          type: "Archived",
                          color: "#A0AEC0",
                        })
                      }
                    >
                      Archived
                    </MenuItem>
                  </MenuList>
                </Menu>
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                colorScheme="blue"
                mr={3}
                onClick={handleSaveEvent}
                borderRadius="md"
              >
                {editingEventId ? "Update" : "Save"}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} borderRadius="md">
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Holiday List Modal */}
        <Modal
          isOpen={isHolidayModalOpen}
          onClose={() => setIsHolidayModalOpen(false)}
          size="md"
        >
          <ModalOverlay />
          <ModalContent borderRadius="lg">
            <ModalHeader>Philippine Holidays 2025</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <List spacing={3}>
                {philippineHolidays2025
                  .sort(
                    (a, b) =>
                      parseISO(a.date).getTime() - parseISO(b.date).getTime()
                  )
                  .map((holiday) => (
                    <ListItem
                      key={holiday.id}
                      display="flex"
                      alignItems="center"
                    >
                      <ListIcon as={StarIcon} color="orange.500" />
                      <Text fontWeight="semibold">
                        {format(parseISO(holiday.date), "MMM d")}:
                      </Text>
                      <Text ml={2}>{holiday.title}</Text>
                    </ListItem>
                  ))}
              </List>
              <Text fontSize="sm" color="gray.500" mt={4}>
                *Dates for some holidays (e.g., Eid'l Adha) are approximate and
                subject to official declaration.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => setIsHolidayModalOpen(false)}
                borderRadius="md"
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </ChakraProvider>
  );
};

export default Calendar;
