import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Select,
  Grid,
  useToast,
  Spinner,
  Center,
  Icon,
  InputGroup,
  InputLeftElement,
  Badge,
  Spacer,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  Checkbox,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { AddIcon, BellIcon, SearchIcon, DeleteIcon } from "@chakra-ui/icons";
import axiosInstance from "../../../lib/axiosInstance";
import AnnouncementForm from "../../../components/Admin_components/announcements/AnnouncementForm";
import AnnouncementCard from "../../../components/Admin_components/announcements/AnnouncementCard";

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAdmin] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBirthdayCheckTriggered, setIsBirthdayCheckTriggered] =
    useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isBulkDeleteOpen,
    onOpen: onBulkDeleteOpen,
    onClose: onBulkDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      console.log("🔄 Fetching announcements...");

      const response = await axiosInstance.get(
        "/announcements/get-announcements"
      );

      console.log("✅ Response:", response.data);

      const announcementsData = response.data.data || response.data || [];

      if (!Array.isArray(announcementsData)) {
        throw new Error("Invalid data format: expected array");
      }

      setAnnouncements(announcementsData);
      setFilteredAnnouncements(announcementsData);
      setSelectedIds(new Set());

      console.log(
        `✅ Successfully fetched ${announcementsData.length} announcements`
      );
    } catch (error) {
      console.error("❌ Fetch error:", error);
      toast({
        title: "Error fetching announcements",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 4,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let filtered = announcements;

    if (typeFilter !== "all") {
      filtered = filtered.filter((ann) => ann.type === typeFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ann) =>
          ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ann.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAnnouncements(filtered);
  }, [searchTerm, typeFilter, announcements]);

  // Handle individual selection
  const handleSelectChange = (id, isChecked) => {
    const newSelected = new Set(selectedIds);
    if (isChecked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle select all
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      const allIds = new Set(filteredAnnouncements.map((ann) => ann._id));
      setSelectedIds(allIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await axiosInstance.post("/announcements/bulk-delete-announcements", {
        ids: Array.from(selectedIds),
      });

      toast({
        title: "✅ Success",
        description: `${selectedIds.size} announcement(s) deleted successfully`,
        status: "success",
        duration: 3,
        isClosable: true,
      });

      // Refetch announcements
      await fetchAnnouncements();
      onBulkDeleteClose();
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete announcements",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleCreateAnnouncement = async (formData) => {
    try {
      await fetchAnnouncements();
      onClose();
      toast({
        title: "✨ Success",
        description: "Announcement created successfully",
        status: "success",
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    }
  };

  const handleUpdateAnnouncement = async (formData) => {
    try {
      await fetchAnnouncements();
      setEditingAnnouncement(null);
      onClose();
      toast({
        title: "✨ Success",
        description: "Announcement updated successfully",
        status: "success",
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      await axiosInstance.delete(`/announcements/delete-announcement/${id}`);
      await fetchAnnouncements();
      toast({
        title: "🗑️ Deleted",
        description: "Announcement removed successfully",
        status: "info",
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete announcement",
        status: "error",
        duration: 3,
        isClosable: true,
      });
    }
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setEditingAnnouncement(null);
  };

  const handleNewAnnouncement = () => {
    setEditingAnnouncement(null);
    onOpen();
  };

  // Trigger birthday check manually
  const handleTriggerBirthdayCheck = async () => {
    try {
      toast({
        title: "🎂 Checking birthdays...",
        status: "loading",
        duration: null,
        isClosable: false,
      });

      const response = await axiosInstance.post(
        "/announcements/trigger-birthday-check"
      );

      toast.closeAll();
      toast({
        title: "✅ Birthday Check Complete",
        description:
          response.data.message || "Birthday check has been triggered",
        status: "success",
        duration: 4,
        isClosable: true,
      });

      // Refetch announcements to show any newly created birthday announcements
      await fetchAnnouncements();
    } catch (error) {
      toast.closeAll();
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to trigger birthday check",
        status: "error",
        duration: 4,
        isClosable: true,
      });
    }
  };

  const isAllSelected =
    filteredAnnouncements.length > 0 &&
    selectedIds.size === filteredAnnouncements.length;

  return (
    <Box minH="100vh" bg="white" py={12}>
      <Container maxW="6xl">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Flex align="center" justify="space-between">
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Icon as={BellIcon} w={7} h={7} color="gray.800" />
                <Text fontSize="28px" fontWeight="700" color="gray.900">
                  Announcements
                </Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                {filteredAnnouncements.length} announcement
                {filteredAnnouncements.length !== 1 ? "s" : ""}
                {selectedIds.size > 0 && (
                  <Badge ml={2} colorScheme="blue">
                    {selectedIds.size} selected
                  </Badge>
                )}
              </Text>
            </VStack>
            <Spacer />
            <HStack spacing={3}>
              {selectedIds.size > 0 && isAdmin && (
                <Button
                  leftIcon={<DeleteIcon />}
                  colorScheme="red"
                  variant="outline"
                  size="md"
                  fontWeight="600"
                  onClick={onBulkDeleteOpen}
                >
                  Delete Selected ({selectedIds.size})
                </Button>
              )}
              {isAdmin && (
                <>
                  <Button
                    colorScheme="purple"
                    variant="outline"
                    size="md"
                    fontWeight="600"
                    onClick={handleTriggerBirthdayCheck}
                    isDisabled={isBirthdayCheckTriggered}
                    opacity={isBirthdayCheckTriggered ? 0.6 : 1}
                  >
                    {isBirthdayCheckTriggered
                      ? "✅ Birthday Check Done"
                      : "🎂 Check Birthdays"}
                  </Button>
                  <Button
                    leftIcon={<AddIcon />}
                    colorScheme="blue"
                    size="md"
                    fontWeight="600"
                    onClick={handleNewAnnouncement}
                  >
                    New Announcement
                  </Button>
                </>
              )}
            </HStack>
          </Flex>

          {/* Modal for Form */}
          <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl">
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Create New Announcement"}
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <AnnouncementForm
                  isEditing={!!editingAnnouncement}
                  announcement={editingAnnouncement}
                  onSubmit={
                    editingAnnouncement
                      ? handleUpdateAnnouncement
                      : handleCreateAnnouncement
                  }
                  onCancel={handleCloseModal}
                />
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Bulk Delete Confirmation Dialog */}
          <AlertDialog
            isOpen={isBulkDeleteOpen}
            leastDestructiveRef={cancelRef}
            onClose={onBulkDeleteClose}
            isCentered
          >
            <AlertDialogOverlay>
              <AlertDialogContent borderRadius="12px" boxShadow="lg">
                <AlertDialogHeader
                  fontSize="lg"
                  fontWeight="bold"
                  color="red.600"
                >
                  🗑️ Delete Multiple Announcements
                </AlertDialogHeader>

                <AlertDialogBody color="gray.700">
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="600">
                      Are you sure you want to delete {selectedIds.size}{" "}
                      announcement{selectedIds.size !== 1 ? "s" : ""}?
                    </Text>
                    <Box
                      bg="gray.50"
                      p={3}
                      borderRadius="md"
                      borderLeft="4px"
                      borderColor="red.500"
                      w="100%"
                    >
                      <Text fontSize="sm" color="gray.600">
                        This will permanently remove the following
                        announcements:
                      </Text>
                      <VStack align="start" mt={2} spacing={1}>
                        {filteredAnnouncements
                          .filter((ann) => selectedIds.has(ann._id))
                          .map((ann) => (
                            <Text
                              key={ann._id}
                              fontSize="sm"
                              color="gray.900"
                              fontWeight="500"
                            >
                              • {ann.title}
                            </Text>
                          ))}
                      </VStack>
                    </Box>
                    <Text fontSize="sm" color="red.600" fontWeight="500">
                      ⚠️ This action cannot be undone.
                    </Text>
                  </VStack>
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={onBulkDeleteClose}
                    variant="outline"
                    isDisabled={isBulkDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={handleBulkDelete}
                    ml={3}
                    isLoading={isBulkDeleting}
                    loadingText="Deleting..."
                  >
                    Delete {selectedIds.size}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>

          {/* Search and Filter Bar */}
          <Box borderBottomWidth="1px" borderColor="gray.200" pb={6}>
            <Grid
              templateColumns={{ base: "1fr", md: "2fr 1fr" }}
              gap={4}
              w="100%"
            >
              {/* Search Input */}
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="md"
                  borderRadius="8px"
                  border="1px solid"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                  }}
                  fontSize="sm"
                />
              </InputGroup>

              {/* Type Filter */}
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                size="md"
                borderRadius="8px"
                border="1px solid"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.1)",
                }}
                fontSize="sm"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="birthday">Birthday</option>
                <option value="system">System</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Grid>
          </Box>

          {/* Select All Checkbox */}
          {filteredAnnouncements.length > 0 && isAdmin && (
            <HStack spacing={3} bg="gray.50" p={3} borderRadius="md">
              <Checkbox
                isChecked={isAllSelected}
                isIndeterminate={selectedIds.size > 0 && !isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                colorScheme="blue"
                size="lg"
              />
              <Text fontSize="sm" fontWeight="500" color="gray.700">
                {isAllSelected
                  ? `All ${filteredAnnouncements.length} selected`
                  : `Select all announcements (${filteredAnnouncements.length})`}
              </Text>
            </HStack>
          )}

          {/* Announcements List */}
          {loading ? (
            <Center py={20}>
              <Spinner size="lg" color="gray.400" thickness="3px" />
            </Center>
          ) : filteredAnnouncements.length === 0 ? (
            <Center py={16}>
              <VStack spacing={3}>
                <Icon as={BellIcon} w={10} h={10} color="gray.300" />
                <Text color="gray.500" fontSize="sm">
                  {searchTerm || typeFilter !== "all"
                    ? "No announcements found"
                    : "No announcements yet"}
                </Text>
              </VStack>
            </Center>
          ) : (
            <VStack spacing={4}>
              {filteredAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement._id}
                  announcement={announcement}
                  isAdmin={isAdmin}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteAnnouncement}
                  isSelected={selectedIds.has(announcement._id)}
                  onSelectChange={handleSelectChange}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Announcements;
