import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  useToast,
  Icon,
  Heading,
  Flex,
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import {
  FaClock,
  FaSignInAlt,
  FaSignOutAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const TimeIn = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [hasTimedInToday, setHasTimedInToday] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const savedRecords = JSON.parse(localStorage.getItem("timeRecords")) || [];
    setRecords(savedRecords);

    const today = new Date().toDateString();
    const timedInToday = savedRecords.some(
      (record) => new Date(record.timeIn).toDateString() === today
    );
    setHasTimedInToday(timedInToday);

    return () => clearInterval(timer);
  }, []);

  const saveRecords = (newRecords) => {
    localStorage.setItem("timeRecords", JSON.stringify(newRecords));
    setRecords(newRecords);
  };

  const handleTimeIn = () => {
    const today = new Date().toDateString();
    if (hasTimedInToday) {
      toast({
        title: "Already Timed In Today",
        status: "info",
        duration: 3000,
        position: "top",
        isClosable: true,
      });
      return;
    }

    const newRecord = {
      id: Date.now(),
      date: today,
      timeIn: new Date().toISOString(),
      timeOut: null,
    };

    const updatedRecords = [...records, newRecord];
    saveRecords(updatedRecords);
    setHasTimedInToday(true);
    toast({
      title: "Time In Recorded",
      status: "success",
      position: "top",
      duration: 2000,
    });
  };

  const handleTimeOut = () => {
    const today = new Date().toDateString();
    const updatedRecords = records.map((record) => {
      if (
        new Date(record.timeIn).toDateString() === today &&
        record.timeOut === null
      ) {
        return { ...record, timeOut: new Date().toISOString() };
      }
      return record;
    });

    saveRecords(updatedRecords);
    toast({
      title: "Time Out Recorded",
      position: "top",
      status: "success",
      duration: 2000,
    });
  };

  return (
    <Box p={[4, 8]} maxW="1000px" mx="auto">
      <Card boxShadow="2xl" borderRadius="2xl" p={6} bg="white">
        <CardHeader pb={4} borderBottom="1px solid" borderColor="gray.200">
          <Flex align="center" gap={4} flexWrap="wrap">
            <Icon as={FaClock} boxSize={6} color="blue.500" />
            <Heading size="md" color="gray.700">
              Employee Daily Time Log
            </Heading>
          </Flex>
        </CardHeader>

        <CardBody>
          <VStack spacing={8} align="stretch">
            {/* Clock + Buttons */}
            <Flex
              justify="space-between"
              align="center"
              flexWrap="wrap"
              gap={4}
              bg="gray.50"
              p={4}
              borderRadius="lg"
              boxShadow="sm"
            >
              <Text fontSize="2xl" fontWeight="bold" color="gray.700">
                <Icon as={FaClock} mr={2} />
                {currentTime.toLocaleTimeString()}
              </Text>
              <Flex gap={3}>
                <Button
                  leftIcon={<FaSignInAlt />}
                  colorScheme="teal"
                  variant="solid"
                  onClick={handleTimeIn}
                  isDisabled={hasTimedInToday}
                >
                  Time In
                </Button>
                <Button
                  leftIcon={<FaSignOutAlt />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleTimeOut}
                >
                  Time Out
                </Button>
              </Flex>
            </Flex>

            {/* Table */}
            <Box
              overflowX="auto"
              border="1px solid"
              borderColor="gray.100"
              borderRadius="lg"
              bg="gray.50"
            >
              <Table variant="simple" size="sm">
                <Thead bg="gray.100">
                  <Tr>
                    <Th>
                      <Icon as={FaCalendarAlt} mr={2} />
                      Date
                    </Th>
                    <Th>
                      <Icon as={FaSignInAlt} mr={2} />
                      Time In
                    </Th>
                    <Th>
                      <Icon as={FaSignOutAlt} mr={2} />
                      Time Out
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {records
                    .slice()
                    .reverse()
                    .map((record) => (
                      <Tr key={record.id}>
                        <Td fontWeight="medium">{record.date}</Td>
                        <Td color="green.600">
                          {new Date(record.timeIn).toLocaleTimeString()}
                        </Td>
                        <Td color={record.timeOut ? "red.600" : "gray.400"}>
                          {record.timeOut
                            ? new Date(record.timeOut).toLocaleTimeString()
                            : "--"}
                        </Td>
                      </Tr>
                    ))}
                </Tbody>
              </Table>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default TimeIn;
