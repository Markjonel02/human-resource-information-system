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
  const [birthdayEmployee, setBirthdayEmployee] = useState(null);
  const [hasShown, setHasShown] = useState(false);

  const modalBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");

  // Check for today's birthdays
  useEffect(() => {
    const checkTodayBirthday = async () => {
      try {
        const response = await axiosInstance.get(
          "/announcements/get-announcements?type=birthday"
        );

        const announcementsData = response.data.data || response.data || [];
        const todayBirthday = announcementsData.find(
          (ann) =>
            ann.type === "birthday" &&
            new Date(ann.createdAt).toDateString() === new Date().toDateString()
        );

        if (todayBirthday && !hasShown) {
          setBirthdayEmployee(todayBirthday);
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

  if (!birthdayEmployee) return null;

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

            <Text fontSize="3xl" fontWeight="bold" color={textColor}>
              {birthdayEmployee.postedBy?.firstname}
            </Text>

            <Text fontSize="lg" color="gray.500" fontStyle="italic">
              Wishing you a wonderful day! 🎂
            </Text>
          </VStack>
        </Flex>
      </ModalContent>
    </Modal>
  );
};

export default BirthdayPopup;
