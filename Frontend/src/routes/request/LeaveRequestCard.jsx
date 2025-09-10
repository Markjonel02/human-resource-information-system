import {
  Box,
  Text,
  Flex,
  Badge,
  Button,
  Avatar,
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { CalendarIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
export const LeaveRequestCard = ({
  id,
  leaveType,
  days,
  startDate,
  endDate,
  reason,
  requesterName,
  requesterAvatarUrl,
  status,
  onApprove,
  onReject,
  isSelected,
  onToggleSelect,
}) => {
  const statusColor = {
    Approved: "green",
    Pending: "orange",
    Rejected: "red",
  };

  let cardColorScheme = "other";
  let headerBgColor = "gray.50";
  let daysBoxBg = "blue.50";
  let daysTextColor = "blue.700";
  let calendarIconColor = "blue.600";
  let dateTextColor = "blue.600";

  switch (leaveType) {
    case "Sick leave request":
      cardColorScheme = "sickLeave";
      headerBgColor = "sickLeave.50";
      daysBoxBg = "sickLeave.100";
      daysTextColor = "sickLeave.700";
      calendarIconColor = "sickLeave.600";
      dateTextColor = "sickLeave.600";
      break;
    case "Excuse request":
      cardColorScheme = "excuse";
      headerBgColor = "excuse.50";
      daysBoxBg = "excuse.100";
      daysTextColor = "excuse.700";
      calendarIconColor = "excuse.600";
      dateTextColor = "excuse.600";
      break;
    case "Business Trip Request":
      cardColorScheme = "businessTrip";
      headerBgColor = "businessTrip.50";
      daysBoxBg = "businessTrip.100";
      daysTextColor = "businessTrip.700";
      calendarIconColor = "businessTrip.600";
      dateTextColor = "businessTrip.600";
      break;
    case "Loan request":
      cardColorScheme = "loan";
      headerBgColor = "loan.50";
      daysBoxBg = "loan.100";
      daysTextColor = "loan.700";
      calendarIconColor = "loan.600";
      dateTextColor = "loan.600";
      break;
    case "Ticket Request":
      cardColorScheme = "ticket";
      headerBgColor = "ticket.50";
      daysBoxBg = "ticket.100";
      daysTextColor = "ticket.700";
      calendarIconColor = "ticket.600";
      dateTextColor = "ticket.600";
      break;
    default:
      break;
  }

  const truncatedRequesterName =
    requesterName.length > 15
      ? `${requesterName.substring(0, 15)}...`
      : requesterName;

  const displayReason =
    reason.length > 50 ? `${reason.substring(0, 50)}...` : reason;

  return (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="xl"
      bg="white"
      maxW={{ base: "90%", sm: "350px", md: "380px" }}
      mx="auto"
      my={4}
      _hover={{ transform: "translateY(-5px)", boxShadow: "2xl" }}
      transition="all 0.3s ease-in-out"
      position="relative"
    >
      <Flex
        align="center"
        mb={2}
        p={2}
        borderRadius="md"
        justifyContent="space-between"
        bg="lightBlue.50"
      >
        <HStack spacing={2} align="center">
          {status === "Pending" && (
            <Checkbox
              isChecked={isSelected}
              onChange={() => onToggleSelect(id)}
              colorScheme="blue"
              borderColor="blue.500"
              size="md"
            />
          )}
          <Box
            p={2}
            borderRadius="md" // Added borderRadius for the light blue background box
          >
            <Text fontSize="md" fontWeight="semibold" color="black">
              {leaveType}
            </Text>
          </Box>
        </HStack>
        <Badge
          px={3}
          py={1}
          borderRadius="full"
          colorScheme={statusColor[status]}
          textTransform="capitalize"
          variant="solid"
        >
          {status}
        </Badge>
      </Flex>
      <HStack spacing={2} align="center" mb={4} pl={2}>
        <Avatar size="xs" name={requesterName} src={requesterAvatarUrl} />
        <Text fontSize="xs" fontWeight="medium" color="gray.700">
          {truncatedRequesterName}
        </Text>
      </HStack>
      <Box bg={daysBoxBg} p={4} borderRadius="lg" mb={4}>
        <Text
          fontSize="3xl"
          fontWeight="extrabold"
          color={daysTextColor}
          mb={1}
        >
          {days}
        </Text>
        <Flex align="center">
          <CalendarIcon color={calendarIconColor} mr={2} />
          <Text fontSize="sm" color={dateTextColor} fontWeight="medium">
            {startDate
              ? new Date(startDate)
                  .toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                  .substring(0, 3)
              : ""}
            {" - "}
            {endDate
              ? new Date(endDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </Text>
        </Flex>
      </Box>
      <Box mb={4}>
        <Text fontSize="sm" fontWeight="semibold" mb={1} color="gray.700">
          Reason
        </Text>
        <Text fontSize="sm" color="gray.600" noOfLines={3}>
          {displayReason}
        </Text>
      </Box>

      <Flex justifyContent="space-between" alignItems="flex-end" pt={2}>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          Actions
        </Text>
        <HStack spacing={2} ml={5}>
          <Button
            colorScheme="green"
            size="sm"
            onClick={onApprove}
            leftIcon={<CheckIcon />}
            isDisabled={status !== "Pending"}
            boxShadow="sm"
            _hover={{ bg: "green.600", transform: "scale(1.05)" }}
            _active={{ bg: "green.700", transform: "scale(0.95)" }}
          >
            Approve
          </Button>
          <Button
            size="sm"
            onClick={onReject}
            leftIcon={<CloseIcon />}
            isDisabled={status !== "Pending"}
            boxShadow="sm"
            _hover={{ bg: "red.50", transform: "scale(1.05)" }}
            _active={{ bg: "red.700", transform: "scale(0.95)" }}
          >
            Reject
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};
