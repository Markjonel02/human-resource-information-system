import React from "react";
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
} from "@chakra-ui/react";
import { FaCalendarAlt, FaEllipsisV } from "react-icons/fa"; // Using FaEllipsisV for the three dots icon

const Announcements = () => {
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const subTextColor = useColorModeValue("gray.600", "gray.300");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const announcements = [
    {
      id: 1,
      title: "Outing schedule for every departement",
      time: "Today 11:30 AM",
      avatar: "https://placehold.co/40x40/FF0000/white?text=A1",
    },
    {
      id: 2,
      title: "Meeting HR Department",
      time: "Today 11:30 AM",
      avatar: "https://placehold.co/40x40/00FF00/white?text=A2",
    },
    {
      id: 3,
      title: "IT Department need two more talents for ux/ui Designer position",
      time: "Today 11:30 AM",
      avatar: "https://placehold.co/40x40/0000FF/white?text=A3",
    },
    {
      id: 4,
      title: "Enrich your skills with exclusive workshops led by experts",
      time: "Today 11:30 AM",
      avatar: "https://placehold.co/40x40/FFFF00/black?text=A4",
    },
  ];

  return (
    <Box
      p={6}
      shadow="sm"
      border="1px solid"
      borderColor={borderColor}
      rounded="md"
      bg={cardBg}
      width={{ base: "60%", md: "100%" }} // Responsive width
    >
      <Flex mb={4} alignItems="center">
        <Heading as="h2" size="md" color={textColor}>
          Announcement
        </Heading>
        <Spacer />
        <Button
          size="sm"
          variant="link"
          colorScheme="teal"
          color={subTextColor}
          _hover={{ textDecoration: "underline" }}
        >
          See all
        </Button>
      </Flex>

      <VStack spacing={4} align="stretch">
        {announcements.map((announcement) => (
          <Flex key={announcement.id} alignItems="center">
            <Avatar
              size="sm"
              name={announcement.title}
              src={announcement.avatar}
              mr={3}
            />
            <Box>
              <Text fontWeight="semibold" fontSize="md" color={textColor}>
                {announcement.title}
              </Text>
              <Text fontSize="sm" color={subTextColor}>
                {announcement.time}
              </Text>
            </Box>
            <Spacer />
            <Button variant="ghost" size="sm" p={0}>
              <FaEllipsisV color={subTextColor} />
            </Button>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default Announcements;
