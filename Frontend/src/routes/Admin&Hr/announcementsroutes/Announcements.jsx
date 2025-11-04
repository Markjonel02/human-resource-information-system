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
} from "@chakra-ui/react";
import {
  AddIcon,
  BellIcon,
  SearchIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
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
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        "/announcements/get-announcements"
      );

      // Handle different response structures
      const announcementsData = Array.isArray(data.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setAnnouncements(announcementsData);
      setFilteredAnnouncements(announcementsData);

      console.log("Announcements fetched:", announcementsData);
    } catch (error) {
      console.error("Fetch error:", error);
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

  const handleCreateAnnouncement = async (formData) => {
    try {
      // The form already makes the API call and shows success toast
      // Just refetch the announcements to get the latest data
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
      // Refetch to get updated data from backend
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
      // Make API call to delete
      await axiosInstance.delete(`/announcements/delete-announcement/${id}`);

      // Refetch announcements
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
              </Text>
            </VStack>
            <Spacer />
            {isAdmin && (
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                size="md"
                fontWeight="600"
                onClick={handleNewAnnouncement}
              >
                New Announcement
              </Button>
            )}
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
