// AdminOfficialBusinessDetailModal.jsx
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

const AdminOfficialBusinessDetailModal = ({
  isOpen,
  onClose,
  officialBusiness,
}) => {
  if (!officialBusiness) return null;

  // Use originalData if available (from parent component), otherwise use the passed data
  const businessData = officialBusiness.originalData || officialBusiness;

  const cardBg = useColorModeValue("white", "gray.800");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // Helper function to get employee name
  const getEmployeeName = () => {
    if (businessData.employee && typeof businessData.employee === "object") {
      return `${businessData.employee.firstname || ""} ${
        businessData.employee.lastname || ""
      }`.trim();
    }
    return "Unknown Employee";
  };

  // Helper function to get employee initials for avatar
  const getEmployeeInitials = () => {
    if (businessData.employee && typeof businessData.employee === "object") {
      const first = businessData.employee.firstname?.charAt(0) || "";
      const last = businessData.employee.lastname?.charAt(0) || "";
      return `${first}${last}`.toUpperCase();
    }
    return "UE";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent rounded="2xl" shadow="2xl" overflow="hidden" maxH="80vh">
        {/* Gradient Header */}
        <Box
          bgGradient="linear(to-r, blue.400, purple.500)"
          p={5}
          color="white"
          textAlign="center"
        >
          <ModalHeader fontSize="xl" fontWeight="bold" m={0} p={0}>
            OB Request Details
          </ModalHeader>
          <Text fontSize="sm" opacity={0.9}>
            Review submitted request
          </Text>
        </Box>
        <ModalCloseButton color="white" top={3} right={3} />

        {/* Scrollable Body */}
        <ModalBody bg={cardBg} px={5} py={4} overflowY="auto">
          <VStack align="stretch" spacing={4}>
            {/* Reason */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Reason
              </Text>
              <Text fontSize="sm" color={textColor}>
                {businessData.reason}
              </Text>
            </Box>

            {/* Status */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Status
              </Text>
              <Badge
                colorScheme={
                  businessData.status === "approved"
                    ? "green"
                    : businessData.status === "pending"
                    ? "yellow"
                    : "red"
                }
                px={3}
                py={1}
                rounded="full"
                fontSize="sm"
                textTransform="capitalize"
              >
                {businessData.status}
              </Badge>
            </Box>

            {/* Dates */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Date Range
              </Text>
              <Text fontSize="sm" color={textColor}>
                {new Date(businessData.dateFrom).toLocaleDateString()} –{" "}
                {new Date(businessData.dateTo).toLocaleDateString()}
              </Text>
            </Box>

            {/* Employee (Requester) */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Requested By
              </Text>
              <Flex align="center">
                <Avatar
                  size="xs"
                  name={getEmployeeName()}
                  mr={2}
                  bg="teal.500"
                  color="white"
                />
                <Text fontSize="sm" color={textColor}>
                  {getEmployeeName()}
                </Text>
              </Flex>
            </Box>

            {/* Additional Info - Created Date */}
            <Box p={3} rounded="lg" bg={sectionBg}>
              <Text fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>
                Request Date
              </Text>
              <Text fontSize="sm" color={textColor}>
                {new Date(businessData.createdAt).toLocaleDateString()}
              </Text>
            </Box>

            {/* Approval/Rejection Info */}
            {businessData.status !== "pending" && (
              <Box p={3} rounded="lg" bg={sectionBg}>
                <Text
                  fontSize="xs"
                  fontWeight="semibold"
                  color="gray.500"
                  mb={1}
                >
                  {businessData.status === "approved" ? "Approved" : "Rejected"}{" "}
                  At
                </Text>
                <Text fontSize="sm" color={textColor}>
                  {new Date(
                    businessData.status === "approved"
                      ? businessData.approvedAt
                      : businessData.rejectedAt
                  ).toLocaleString()}
                </Text>
              </Box>
            )}
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

export default AdminOfficialBusinessDetailModal;
