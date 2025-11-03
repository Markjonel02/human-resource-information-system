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
      <Card
        w="100%"
        boxShadow="md"
        transition="all 0.3s"
        _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
      >
        {/* Card Header */}
        <CardHeader pb={3}>
          <VStack align="start" w="100%" spacing={3}>
            {/* Badges Row */}
            <HStack justify="space-between" w="100%">
              <HStack spacing={2} wrap="wrap">
                <Badge
                  colorScheme={getTypeColor(announcement.type)}
                  fontSize="xs"
                  px={2}
                  py={1}
                >
                  {announcement.type.toUpperCase()}
                </Badge>
                <Badge
                  colorScheme={getPriorityColor(announcement.priority)}
                  fontSize="xs"
                  variant="outline"
                >
                  {getPriorityLabel(announcement.priority)} Priority
                </Badge>
              </HStack>

              {/* Admin Actions */}
              {isAdmin && (
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    leftIcon={<EditIcon />}
                    variant="ghost"
                    colorScheme="blue"
                    onClick={() => onEdit(announcement)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<DeleteIcon />}
                    variant="ghost"
                    colorScheme="red"
                    onClick={onOpen}
                  >
                    Delete
                  </Button>
                </HStack>
              )}
            </HStack>

            {/* Title */}
            <Heading size="md" color="gray.800" w="100%">
              {announcement.title}
            </Heading>
          </VStack>
        </CardHeader>

        <Divider />

        {/* Card Body */}
        <CardBody>
          <VStack align="start" spacing={4}>
            {/* Content */}
            <Text color="gray.700" lineHeight="1.6" fontSize="sm">
              {announcement.content}
            </Text>

            {/* Footer Info */}
            <Box w="100%" pt={2} borderTopWidth="1px" borderTopColor="gray.100">
              <HStack spacing={6} fontSize="xs" color="gray.600" wrap="wrap">
                <HStack spacing={2}>
                  <Icon as={CalendarIcon} boxSize={3} />
                  <Text>Posted: {formatDate(announcement.createdAt)}</Text>
                </HStack>
                <HStack spacing={1}>
                  <Text fontWeight="600">By:</Text>
                  <Text>{announcement.postedBy.name}</Text>
                </HStack>
              </HStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

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
