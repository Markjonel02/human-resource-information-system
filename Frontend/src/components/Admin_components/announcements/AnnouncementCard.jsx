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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, CalendarIcon } from "@chakra-ui/icons";
import { MdCake } from "react-icons/md";
import axiosInstance from "../../../lib/axiosInstance";
import PartyPopper from "/partypopper.gif";

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
  const [showBirthdayGreeting, setShowBirthdayGreeting] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const modalBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

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

  // Handle delete birthday
  const handleDeleteBirthday = async () => {
    try {
      await axiosInstance.delete(
        `/announcements/delete-announcement/${announcement._id}`
      );

      toast({
        title: "✅ Birthday Announcement Removed",
        description: "The birthday announcement has been deleted.",
        status: "success",
        duration: 3,
        isClosable: true,
      });

      await onDelete(announcement._id);
      setShowBirthdayGreeting(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete birthday announcement",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    }
  };

  const isBirthday = announcement.type === "birthday";

  return (
    <>
      {/* Birthday Greeting Modal */}
      {isBirthday && (
        <Modal
          isOpen={showBirthdayGreeting}
          onClose={() => setShowBirthdayGreeting(false)}
          size="xl"
          isCentered
        >
          <ModalOverlay backdropFilter="blur(5px)" bg="rgba(0, 0, 0, 0.3)" />
          <ModalContent
            bg={modalBg}
            borderRadius="3xl"
            overflow="hidden"
            boxShadow="2xl"
          >
            <ModalCloseButton
              position="absolute"
              right={4}
              top={4}
              zIndex={10}
              fontSize="xl"
              color={textColor}
            />

            <Flex
              direction="column"
              align="center"
              justify="center"
              py={12}
              px={8}
              position="relative"
            >
              {/* Party Popper GIFs - Left */}
              <Box
                position="absolute"
                left={-50}
                top="50%"
                transform="translateY(-50%)"
                width="150px"
                height="150px"
                style={{
                  backgroundImage: `url(${PartyPopper})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.9,
                }}
              />

              {/* Party Popper GIFs - Right */}
              <Box
                position="absolute"
                right={-50}
                top="50%"
                transform="translateY(-50%)"
                width="150px"
                height="150px"
                style={{
                  backgroundImage: `url(${PartyPopper})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  opacity: 0.9,
                  transform: "scaleX(-1) translateY(-50%)",
                }}
              />

              {/* Content */}
              <VStack spacing={4} align="center" zIndex={1}>
                <Heading
                  as="h1"
                  size="xl"
                  color="purple.500"
                  textAlign="center"
                  letterSpacing="1px"
                >
                  🎉 Happy Birthday! 🎉
                </Heading>

                <Text fontSize="3xl" fontWeight="bold" color={textColor}>
                  {announcement.postedBy?.firstname}
                </Text>

                <Text fontSize="lg" color="gray.500" fontStyle="italic">
                  Wishing you a wonderful day! 🎂
                </Text>
              </VStack>
            </Flex>
          </ModalContent>
        </Modal>
      )}

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
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Card */}
      <Box
        bg={useColorModeValue("white", "gray.600")}
        borderRadius="8px"
        borderWidth="1px"
        borderColor={useColorModeValue("gray.200", "gray.500")}
        p={5}
        transition="all 0.2s"
        _hover={{
          borderColor: useColorModeValue("gray.300", "gray.400"),
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        w="100%"
      >
        {/* Top Section with Badges and Actions */}
        <HStack justify="space-between" mb={3} wrap="wrap" spacing={3}>
          <HStack spacing={3} wrap="wrap">
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
              {isBirthday ? (
                <Menu>
                  <MenuButton as={IconButton} variant="ghost" size="sm" />
                  <MenuList>
                    <MenuItem
                      icon={<MdCake />}
                      onClick={() => setShowBirthdayGreeting(true)}
                    >
                      Birthday Greetings
                    </MenuItem>
                    <MenuItem onClick={handleDeleteBirthday} color="red.500">
                      Remove Birthday
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <>
                  <Button
                    size="xs"
                    variant="ghost"
                    colorScheme="blue"
                    fontSize="12px"
                    fontWeight="500"
                    leftIcon={<EditIcon />}
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
                    leftIcon={<DeleteIcon />}
                    onClick={onOpen}
                    _hover={{
                      bg: "transparent",
                      color: "red.600",
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </HStack>
          )}
        </HStack>

        {/* Title */}
        <Heading size="sm" color={textColor} mb={2} fontWeight="700">
          {announcement.title}
        </Heading>

        {/* Content */}
        <Text
          color={useColorModeValue("gray.700", "gray.300")}
          fontSize="sm"
          lineHeight="1.5"
          mb={4}
        >
          {announcement.content}
        </Text>

        {/* Expiration Info */}
        {announcement.expiresAt && (
          <VStack align="start" mb={3} spacing={1}>
            <Text
              fontSize="xs"
              color={useColorModeValue("gray.500", "gray.400")}
            >
              📅 Expires on: {formatDate(announcement.expiresAt)}
            </Text>
          </VStack>
        )}

        {/* Footer */}
        <HStack
          spacing={4}
          fontSize="xs"
          color={useColorModeValue("gray.500", "gray.400")}
        >
          <HStack spacing={1}>
            <Icon as={CalendarIcon} boxSize={3.5} />
            <Text>Posted {formatDate(announcement.createdAt)}</Text>
          </HStack>
          <HStack spacing={1}>
            <Text>By</Text>
            <Text fontWeight="600" color={textColor}>
              {announcement.postedBy?.firstname &&
              announcement.postedBy?.lastname
                ? `${announcement.postedBy.firstname} ${announcement.postedBy.lastname}`
                : announcement.postedBy?.name || "Unknown"}
              {announcement.postedBy?.role &&
                ` (${announcement.postedBy.role})`}
            </Text>
          </HStack>
        </HStack>
      </Box>
    </>
  );
};

export default AnnouncementCard;
