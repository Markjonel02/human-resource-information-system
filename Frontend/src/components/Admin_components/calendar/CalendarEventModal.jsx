import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";

const CalendarEventModal = ({ isOpen, onClose, onSave, onDelete, event }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    endDate: "",
    time: "09:00",
    duration: 60,
    type: "meeting",
    priority: "medium",
  });

  useEffect(() => {
    if (event) {
      const props = event.extendedProps || {};
      setFormData({
        title: event.title,
        description: props.description || "",
        date: props.date || event.startStr.split("T")[0],
        endDate: props.endDate || props.date || "",
        time:
          props.time || event.startStr.split("T")[1]?.slice(0, 5) || "09:00",
        duration: props.duration || 60,
        type: props.type || "meeting",
        priority: props.priority || "medium",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        date: "",
        endDate: "",
        time: "09:00",
        duration: 60,
        type: "meeting",
        priority: "medium",
      });
    }
  }, [event]);

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{event ? "Edit Event" : "Add Event"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </FormControl>
            <HStack w="100%">
              <FormControl isRequired>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </FormControl>
            </HStack>
            <HStack w="100%">
              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange("time", e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Duration (min)</FormLabel>
                <Input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  min="15"
                  step="15"
                />
              </FormControl>
            </HStack>
            <HStack w="100%">
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  <option value="meeting">Meeting</option>
                  <option value="call">Call</option>
                  <option value="review">Review</option>
                  <option value="task">Task</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Priority</FormLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Select>
              </FormControl>
            </HStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          {event && (
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              mr="auto"
              onClick={() => {
                onDelete();
                onClose();
              }}
            >
              Delete
            </Button>
          )}
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            {event ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CalendarEventModal;
