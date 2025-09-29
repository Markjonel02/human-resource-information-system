// --- EmployeeCalendarModalView.jsx ---
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  useColorModeValue,
  Box,
  Text,
  HStack,
  Badge,
  VStack,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";

const EmployeeCalendarModalView = ({
  isOpen,
  onClose,
  event, // 👈 pass the whole event object instead of generic children
  footer,
}) => {
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const bodyBg = useColorModeValue("white", "gray.800");
  const shadow = useColorModeValue("lg", "dark-lg");

  // Priority color
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

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent
        maxW="600px"
        borderRadius="2xl"
        shadow={shadow}
        overflow="hidden"
      >
        {/* Header */}
        <ModalHeader
          bg={headerBg}
          fontWeight="600"
          fontSize="lg"
          borderBottomWidth="1px"
          borderColor={useColorModeValue("gray.200", "gray.600")}
          px={6}
          py={4}
        >
          {event?.title}
        </ModalHeader>
        <ModalCloseButton />

        {/* Body */}
        <ModalBody
          px={6}
          py={5}
          bg={bodyBg}
          fontSize="sm"
          lineHeight="1.6"
          color={useColorModeValue("gray.700", "gray.200")}
        >
          {event ? (
            <VStack align="start" spacing={3}>
              {/* Priority + Type */}
              <HStack spacing={3}>
                <Badge
                  colorScheme={getPriorityColor(event.priority)}
                  variant="solid"
                  px={2}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {event.priority || "Medium"}
                </Badge>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  px={2}
                  py={1}
                  borderRadius="full"
                  textTransform="capitalize"
                >
                  {event.type || "General"}
                </Badge>
              </HStack>
              {/* Creator */}
              <HStack spacing={2}>
                <FaUser size="12px" />
                <Text fontWeight="500">
                  {event.createdBy
                    ? `${event.createdBy.firstname} ${event.createdBy.lastname}`
                    : "Unknown"}
                </Text>
              </HStack>
              {/* Dates */}
              <HStack spacing={2}>
                <FaCalendarAlt size="12px" />
                <Text>
                  {event.endDate
                    ? `${formatDate(event.date)} → ${formatDate(event.endDate)}`
                    : formatDate(event.date)}
                </Text>
              </HStack>
              {/* Time */}
              {event.time && (
                <HStack spacing={2}>
                  <FaClock size="12px" />
                  <Text>{event.time}</Text>
                </HStack>
              )}

              {event.description && (
                <Box pt={2}>
                  <Text fontSize="sm">{event.description}</Text>
                </Box>
              )}
            </VStack>
          ) : (
            <Text>No details available</Text>
          )}
        </ModalBody>

        {/* Footer (optional) */}
        {footer && (
          <>
            <Divider borderColor={useColorModeValue("gray.200", "gray.600")} />
            <ModalFooter
              px={6}
              py={4}
              bg={bodyBg}
              display="flex"
              justifyContent="flex-end"
              gap={3}
            >
              {footer}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default EmployeeCalendarModalView;
