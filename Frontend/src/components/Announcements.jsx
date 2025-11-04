import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  Flex,
  Spacer,
  Button,
  Tag,
  Avatar,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Spinner,
  Center,
  Badge,
} from "@chakra-ui/react";
import { FaCalendarAlt, FaEllipsisV } from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";

const Announcements = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch announcements from backend
  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/announcements/get-announcements"
      );

      const announcementsData = response.data.data || response.data || [];

      // Limit to 5 announcements for dashboard
      setAnnouncements(announcementsData.slice(0, 5));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();

    // Refresh announcements every 30 seconds
    const interval = setInterval(fetchAnnouncements, 30000);

    return () => clearInterval(interval);
  }, []);

  // Format date/time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if today
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise show date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get badge color based on type
  const getTypeBadgeColor = (type) => {
    const colors = {
      birthday: "purple",
      general: "blue",
      system: "cyan",
      urgent: "red",
    };
    return colors[type] || "gray";
  };

  // Get initials for avatar
  const getInitials = (firstname, lastname) => {
    return `${firstname?.charAt(0) || ""}${
      lastname?.charAt(0) || ""
    }`.toUpperCase();
  };

  return (
    <Box
      p={6}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="md"
      bg={cardBg}
    >
      <Flex mb={4} alignItems="center">
        <Heading as="h2" size="md" color={textColor}>
          Announcements
        </Heading>
        <Spacer />
        <Button
          size="sm"
          variant="link"
          colorScheme="teal"
          color={subTextColor}
          _hover={{ textDecoration: "underline" }}
          onClick={() => {
            // Navigate to full announcements page
            window.location.href = "/announcements";
          }}
        >
          See all
        </Button>
      </Flex>

      {loading ? (
        <Center py={8}>
          <Spinner size="sm" color="teal.500" />
        </Center>
      ) : announcements.length === 0 ? (
        <Center py={8}>
          <Text color={subTextColor} fontSize="sm">
            No announcements yet
          </Text>
        </Center>
      ) : (
        <VStack
          spacing={3}
          align="stretch"
          maxH="400px"
          overflowY="auto"
          pr={2}
          css={{
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              bg: useColorModeValue("gray.100", "gray.600"),
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              bg: useColorModeValue("gray.300", "gray.400"),
              borderRadius: "10px",
              "&:hover": {
                bg: useColorModeValue("gray.400", "gray.500"),
              },
            },
          }}
        >
          {announcements.map((announcement) => (
            <Box
              key={announcement._id}
              p={3}
              borderRadius="md"
              bg={useColorModeValue("gray.50", "gray.600")}
              _hover={{
                bg: useColorModeValue("gray.100", "gray.500"),
                cursor: "pointer",
              }}
              transition="all 0.2s"
            >
              <Flex alignItems="flex-start">
                <Avatar
                  size="sm"
                  name={getInitials(
                    announcement.postedBy?.firstname,
                    announcement.postedBy?.lastname
                  )}
                  mr={3}
                  mt={0.5}
                />
                <Box flex={1}>
                  <Flex alignItems="center" mb={1}>
                    <Text
                      fontWeight="semibold"
                      fontSize="sm"
                      color={textColor}
                      noOfLines={2}
                    >
                      {announcement.title}
                    </Text>
                    <Spacer />
                    <Badge
                      ml={2}
                      colorScheme={getTypeBadgeColor(announcement.type)}
                      fontSize="10px"
                    >
                      {announcement.type.charAt(0).toUpperCase() +
                        announcement.type.slice(1)}
                    </Badge>
                  </Flex>
                  <Text fontSize="xs" color={subTextColor} noOfLines={1}>
                    {announcement.content}
                  </Text>
                  <Text fontSize="xs" color={subTextColor} mt={1}>
                    <FaCalendarAlt
                      style={{
                        display: "inline",
                        marginRight: "4px",
                        fontSize: "10px",
                      }}
                    />
                    {formatDateTime(announcement.createdAt)}
                  </Text>
                </Box>
                <Button
                  variant="ghost"
                  size="sm"
                  p={0}
                  ml={2}
                  minW="unset"
                  h="auto"
                >
                  <FaEllipsisV color={subTextColor} size={12} />
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default Announcements;
