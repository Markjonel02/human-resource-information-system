// OfficialBusinessDetailModal.jsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Text,
  Badge,
  Flex,
  Avatar,
  Button,
  VStack,
  useColorModeValue,
  Divider,
} from "@chakra-ui/react";

const OfficialBusinessDetailModal = ({ isOpen, onClose, officialBusiness }) => {
  if (!officialBusiness) return null;

  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent
        rounded="2xl"
        shadow="2xl"
        overflow="hidden"
        maxH="80vh" // limit height
      >
        {/* Gradient Header */}
        <Box
          bgGradient="linear(to-r, blue.500, purple.600)"
          p={5}
          color="white"
          textAlign="center"
        >
          <ModalHeader fontSize="xl" fontWeight="bold" m={0} p={0}>
            Official Business Details
          </ModalHeader>
          <Text fontSize="sm" opacity={0.9}>
            Review request information
          </Text>
        </Box>
        <ModalCloseButton color="white" top={3} right={3} />

        {/* Scrollable Body */}
        <ModalBody
          bg={cardBg}
          px={5}
          py={4}
          overflowY="auto" // enable scrolling if too tall
        >
          <VStack align="stretch" spacing={4}>
            {/* Reason */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Reason
              </Text>
              <Text fontSize="sm" color={textColor}>
                {officialBusiness.reason}
              </Text>
            </Box>

            {/* Status */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Status
              </Text>
              <Badge
                colorScheme={
                  officialBusiness.status === "approved"
                    ? "green"
                    : officialBusiness.status === "pending"
                    ? "yellow"
                    : "red"
                }
                px={3}
                py={1}
                rounded="full"
                fontSize="sm"
                textTransform="capitalize"
              >
                {officialBusiness.status}
              </Badge>
            </Box>

            {/* Dates */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Date Range
              </Text>
              <Text fontSize="sm" color={textColor}>
                {new Date(officialBusiness.dateFrom).toLocaleDateString()} –{" "}
                {new Date(officialBusiness.dateTo).toLocaleDateString()}
              </Text>
            </Box>

            {/* Approver */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Approver
              </Text>
              <Flex align="center">
                <Avatar
                  size="xs"
                  name={
                    officialBusiness.approvedBy || officialBusiness.rejectedBy
                  }
                  mr={2}
                />
                <Text fontSize="sm" color={textColor}>
                  {officialBusiness.approvedBy ||
                    officialBusiness.rejectedBy ||
                    "Not assigned"}
                </Text>
              </Flex>
            </Box>
          </VStack>
        </ModalBody>

        <Divider />
        <ModalFooter bg={cardBg}>
          <Button
            variant="solid"
            colorScheme="blue"
            size="sm"
            px={5}
            rounded="full"
            onClick={onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OfficialBusinessDetailModal;
