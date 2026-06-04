import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";
import PartyPopper from "/partypopper.gif";

const BirthdayPopup = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [birthdayEmployees, setBirthdayEmployees] = useState([]); // Changed to an array
  const [hasShown, setHasShown] = useState(false);

  const modalBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  // Fetch all of today's birthdays directly
  useEffect(() => {
    const checkTodayBirthday = async () => {
      try {
        const response = await axiosInstance.get(
          "/announcements/birthdays/today",
        );

        const birthdays = response.data.data || [];

        if (birthdays.length > 0 && !hasShown) {
          setBirthdayEmployees(birthdays);
          setHasShown(true);
          onOpen();

          // Auto close after 10 seconds
          setTimeout(() => {
            onClose();
          }, 10000);
        }
      } catch (error) {
        console.error("Error checking birthday:", error);
      }
    };

    checkTodayBirthday();
  }, [hasShown, onOpen, onClose]);

  // If nobody has a birthday today, don't render the modal at all
  if (birthdayEmployees.length === 0) return null;

  // Dynamically format names for 1, 2, or 3+ people
  const getCelebrantNames = () => {
    const names = birthdayEmployees.map((emp) => emp.firstname);
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} & ${names[1]}`;
    return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
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
          _hover={{ bg: useColorModeValue("gray.100", "gray.600") }}
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

            {/* Display formatted names dynamically */}
            <Text
              fontSize="4xl"
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
            >
              Wishing you a wonderful day! 🎂
            </Text>
          </VStack>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default BirthdayPopup;
