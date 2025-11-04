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
  useToast,
  Spinner,
  Checkbox,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CalendarIcon } from "@chakra-ui/icons";

const AnnouncementCard = ({
  announcement,
  isAdmin,
  onEdit,
  onDelete,
  isSelected,
  onSelectChange,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

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
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(announcement._id);
      onClose();
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Box
        bg={isSelected ? "blue.50" : "white"}
        borderRadius="8px"
        borderWidth="1px"
        borderColor={isSelected ? "blue.400" : "gray.200"}
        p={5}
        transition="all 0.2s"
        _hover={{
          borderColor: isSelected ? "blue.400" : "gray.300",
          boxShadow: isSelected
            ? "0 2px 8px rgba(66, 153, 225, 0.2)"
            : "0 2px 8px rgba(0,0,0,0.06)",
        }}
        w="100%"
      >
        {/* Top Section with Checkbox, Badges and Actions */}
        <HStack justify="space-between" mb={3} wrap="wrap" spacing={3}>
          <HStack spacing={3} wrap="wrap">
            {/* Checkbox for selection */}
            {isAdmin && (
              <Checkbox
                isChecked={isSelected}
                onChange={(e) =>
                  onSelectChange(announcement._id, e.target.checked)
                }
                colorScheme="blue"
                size="lg"
              />
            )}

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
                leftIcon={<EditIcon boxSize={3} />}
                onClick={() => onEdit(announcement)}
                _hover={{
                  bg: "blue.50",
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
                leftIcon={<DeleteIcon boxSize={3} />}
                onClick={onOpen}
                _hover={{
                  bg: "red.50",
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

        {/* Expiration Info */}
        {announcement.expiresAt && (
          <VStack align="start" mb={3} spacing={1}>
            <Text fontSize="xs" color="gray.500">
              📅 Expires on: {formatDate(announcement.expiresAt)}
            </Text>
          </VStack>
        )}

        {/* Footer */}
        <HStack spacing={4} fontSize="xs" color="gray.500">
          <HStack spacing={1}>
            <Icon as={CalendarIcon} boxSize={3.5} />
            <Text>Posted {formatDate(announcement.createdAt)}</Text>
          </HStack>
          <HStack spacing={1}>
            <Text>By</Text>
            <Text fontWeight="600" color="gray.700">
              {announcement.postedBy.firstname && announcement.postedBy.lastname
                ? `${announcement.postedBy.firstname} ${announcement.postedBy.lastname}`
                : announcement.postedBy.name || "Unknown"}
              {announcement.postedBy.role && ` (${announcement.postedBy.role})`}
            </Text>
          </HStack>
        </HStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="12px" boxShadow="lg">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
              🗑️ Delete Announcement
            </AlertDialogHeader>

            <AlertDialogBody color="gray.700">
              <VStack align="start" spacing={2}>
                <Text fontWeight="600">
                  Are you sure you want to delete this announcement?
                </Text>
                <Box
                  bg="gray.50"
                  p={3}
                  borderRadius="md"
                  borderLeft="4px"
                  borderColor="red.500"
                  w="100%"
                >
                  <Text fontSize="sm" color="gray.900" fontWeight="600">
                    "{announcement.title}"
                  </Text>
                </Box>
                <Text fontSize="sm" color="red.600" fontWeight="500">
                  ⚠️ This action cannot be undone.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                variant="outline"
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                {isDeleting ? (
                  <>
                    <Spinner size="sm" mr={2} />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default AnnouncementCard;
