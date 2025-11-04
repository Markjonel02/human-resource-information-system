// components/AnnouncementCard.jsx
import React, { useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Divider,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CalendarIcon } from "@chakra-ui/icons";

const AnnouncementCard = ({ announcement, isAdmin, onEdit, onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();

  // Get color based on type
  const getTypeColor = (type) => {
    const colors = {
      birthday: "purple",
      general: "blue",
      system: "cyan",
      urgent: "red",
    };
    return colors[type] || "gray";
  };

  // Get priority label
  const getPriorityLabel = (priority) => {
    const labels = { 1: "High", 2: "Medium", 3: "Low" };
    return labels[priority] || "Low";
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = { 1: "red", 2: "yellow", 3: "green" };
    return colors[priority] || "gray";
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    onDelete(announcement._id);
    onClose();
  };

  return (
    <>
      <Box
        bg="white"
        borderRadius="8px"
        borderWidth="1px"
        borderColor="gray.200"
        p={5}
        transition="all 0.2s"
        _hover={{
          borderColor: "gray.300",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        w="100%"
      >
        {/* Top Section with Badges and Actions */}
        <HStack justify="space-between" mb={3} wrap="wrap" spacing={3}>
          <HStack spacing={2} wrap="wrap">
            <Badge
              colorScheme={getTypeColor(announcement.type)}
              variant="subtle"
              fontSize="11px"
              fontWeight="600"
              px={2.5}
              py={0.5}
            >
              {announcement.type.charAt(0).toUpperCase() +
                announcement.type.slice(1)}
            </Badge>
            <Badge
              colorScheme={getPriorityColor(announcement.priority)}
              variant="subtle"
              fontSize="11px"
              fontWeight="600"
              px={2.5}
              py={0.5}
            >
              {getPriorityLabel(announcement.priority)}
            </Badge>
          </HStack>

          {/* Admin Actions */}
          {isAdmin && (
            <HStack spacing={2}>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="blue"
                fontSize="12px"
                fontWeight="500"
                onClick={() => onEdit(announcement)}
                _hover={{
                  bg: "transparent",
                  color: "blue.600",
                }}
              >
                Edit
              </Button>
              <Button
                size="xs"
                variant="ghost"
                colorScheme="red"
                fontSize="12px"
                fontWeight="500"
                onClick={onOpen}
                _hover={{
                  bg: "transparent",
                  color: "red.600",
                }}
              >
                Delete
              </Button>
            </HStack>
          )}
        </HStack>

        {/* Title */}
        <Heading size="sm" color="gray.900" mb={2} fontWeight="700">
          {announcement.title}
        </Heading>

        {/* Content */}
        <Text color="gray.700" fontSize="sm" lineHeight="1.5" mb={4}>
          {announcement.content}
        </Text>

        {/* Footer */}
        <HStack spacing={4} fontSize="xs" color="gray.500">
          <HStack spacing={1}>
            <Icon as={CalendarIcon} boxSize={3.5} />
            <Text>{formatDate(announcement.createdAt)}</Text>
          </HStack>
          <HStack spacing={1}>
            <Text>By</Text>
            <Text fontWeight="600" color="gray.700">
              {announcement.postedBy.firstname + " " + announcement.postedBy.lastname}
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Announcement
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete the announcement "
              {announcement.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AnnouncementCard;
