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
} from "@chakra-ui/react";
import {
  AddIcon,
  BellIcon,
  SearchIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import AnnouncementForm from "../../../components/Admin_components/announcements/AnnouncementForm";
import AnnouncementCard from "../../../components/Admin_components/announcements/AnnouncementCard";

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isAdmin] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const toast = useToast();

  const mockData = [
    {
      _id: "1",
      title: "Happy Birthday, John Doe! 🎉",
      content: "Wishing John a wonderful birthday filled with joy and success!",
      type: "birthday",
      priority: 1,
      createdAt: new Date().toISOString(),
      postedBy: { name: "Admin", email: "admin@company.com" },
      isActive: true,
    },
    {
      _id: "2",
      title: "Company Outing Next Week",
      content: "Join us for our annual company outing on Saturday!",
      type: "general",
      priority: 2,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      postedBy: { name: "HR Department", email: "hr@company.com" },
      isActive: true,
    },
    {
      _id: "3",
      title: "System Maintenance Alert",
      content: "The system will be under maintenance on Friday night.",
      type: "urgent",
      priority: 1,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      postedBy: { name: "IT Support", email: "it@company.com" },
      isActive: true,
    },
    {
      _id: "4",
      title: "New Holiday Policy Update",
      content: "Please review the updated holiday policy in the HR portal.",
      type: "system",
      priority: 3,
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      postedBy: { name: "HR Department", email: "hr@company.com" },
      isActive: true,
    },
  ];

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAnnouncements(mockData);
      setFilteredAnnouncements(mockData);
    } catch (error) {
      toast({
        title: "Error fetching announcements",
        description: error.message,
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

  const handleCreateAnnouncement = (formData) => {
    const newAnnouncement = {
      _id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
      postedBy: { name: "You", email: "your@email.com" },
      isActive: true,
    };
    setAnnouncements([newAnnouncement, ...announcements]);
    setShowForm(false);
    toast({
      title: "✨ Success",
      description: "Announcement created successfully",
      status: "success",
      duration: 3,
      isClosable: true,
    });
  };

  const handleUpdateAnnouncement = (formData) => {
    const updatedAnnouncements = announcements.map((ann) =>
      ann._id === editingAnnouncement._id
        ? {
            ...ann,
            ...formData,
            updatedAt: new Date().toISOString(),
          }
        : ann
    );
    setAnnouncements(updatedAnnouncements);
    setEditingAnnouncement(null);
    setShowForm(false);
    toast({
      title: "✨ Success",
      description: "Announcement updated successfully",
      status: "success",
      duration: 3,
      isClosable: true,
    });
  };

  const handleDeleteAnnouncement = (id) => {
    const updatedAnnouncements = announcements.filter((ann) => ann._id !== id);
    setAnnouncements(updatedAnnouncements);
    toast({
      title: "🗑️ Deleted",
      description: "Announcement removed",
      status: "info",
      duration: 3,
      isClosable: true,
    });
  };

  const handleEditClick = (announcement) => {
    setEditingAnnouncement(announcement);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
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
              >
                New Announcement
              </Button>
            )}
          </Flex>

          {/* Form Section */}
          {showForm && (
            <AnnouncementForm
              isEditing={!!editingAnnouncement}
              announcement={editingAnnouncement}
              onSubmit={
                editingAnnouncement
                  ? handleUpdateAnnouncement
                  : handleCreateAnnouncement
              }
              onCancel={handleCloseForm}
            />
          )}

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

export default AnnouncementsPage;
