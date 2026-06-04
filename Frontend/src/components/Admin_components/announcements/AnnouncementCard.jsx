import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Icon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
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
import { BsThreeDotsVertical } from "react-icons/bs";
import axiosInstance from "../../../lib/axiosInstance";
import PartyPopper from "/partypopper.gif";

const AnnouncementCard = ({
  announcement,
  isAdmin,
  onEdit,
  onDelete,
  isSelected,
  onSelectChange,
  todaysBirthdays = [], // NEW: Accepts the array of everyone who has a birthday today
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBirthdayGreeting, setShowBirthdayGreeting] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const modalBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  if (!announcement) return null;

  const isBirthday = announcement.type === "birthday";

  useEffect(() => {
    if (isBirthday) {
      setShowBirthdayGreeting(true);
    }
  }, [isBirthday]);

  // Dynamically format names for 1, 2, or 3+ people
  const getCelebrantNames = () => {
    if (isBirthday && todaysBirthdays.length > 0) {
      const names = todaysBirthdays.map((b) => b.firstname);
      if (names.length === 1) return names[0];
      if (names.length === 2) return `${names[0]} & ${names[1]}`;
      return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
    }

    // Fallback if the array isn't provided
    if (announcement.postedBy?.firstname) {
      return announcement.postedBy.firstname;
    }
    const match = announcement.title.match(/Happy Birthday,\s*([^!]+)/i);
    return match ? match[1].trim() : "Celebrant";
  };

  const getTypeColor = (type) => {
    const colors = {
      birthday: "purple",
      general: "blue",
      system: "cyan",
      urgent: "red",
    };
    return colors[type] || "gray";
  };

  const getPriorityLabel = (priority) => {
    const labels = { 1: "High", 2: "Medium", 3: "Low" };
    return labels[priority] || "Low";
  };

  const getPriorityColor = (priority) => {
    const colors = { 1: "red", 2: "yellow", 3: "green" };
    return colors[priority] || "gray";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDelete(announcement._id);
      onClose();
    } catch (error) {
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

  const handleDeleteBirthday = async () => {
    try {
      await axiosInstance.delete(
        `/announcements/delete-announcement/${announcement._id}`,
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
              {/* Party Popper GIFs */}
              <Box
                position="absolute"
                left={-20}
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
              <Box
                position="absolute"
                right={-20}
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

                {/* Dynamically grouped names render here */}
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  color={textColor}
                  textAlign="center"
                >
                  {getCelebrantNames()}
                </Text>

                <Text
                  fontSize="lg"
                  color="gray.500"
                  fontStyle="italic"
                  textAlign="center"
                  px={4}
                >
                  {announcement.content || "Wishing you a wonderful day! 🎂"}
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

      {/* Card Body */}
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

          {isAdmin && (
            <HStack spacing={2}>
              {isBirthday ? (
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<BsThreeDotsVertical />}
                    variant="ghost"
                    size="sm"
                    aria-label="Birthday options"
                  />
                  <MenuList>
                    <MenuItem
                      icon={<MdCake />}
                      onClick={() => setShowBirthdayGreeting(true)}
                    >
                      View Birthday Card
                    </MenuItem>
                    <MenuItem
                      onClick={handleDeleteBirthday}
                      color="red.500"
                      icon={<DeleteIcon />}
                    >
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
                    _hover={{ bg: "transparent", color: "blue.600" }}
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
                    _hover={{ bg: "transparent", color: "red.600" }}
                  >
                    Delete
                  </Button>
                </>
              )}
            </HStack>
          )}
        </HStack>

        <Heading size="sm" color={textColor} mb={2} fontWeight="700">
          {announcement.title}
        </Heading>

        <Text
          color={useColorModeValue("gray.700", "gray.300")}
          fontSize="sm"
          lineHeight="1.5"
          mb={4}
          whiteSpace="pre-wrap"
        >
          {announcement.content}
        </Text>

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
                : announcement.postedBy?.name || "Automated System"}
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
