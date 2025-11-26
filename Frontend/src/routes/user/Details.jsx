import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Avatar,
  Badge,
  VStack,
  HStack,
  Divider,
  Card,
  CardHeader,
  CardBody,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  useToast,
  Flex,
  SimpleGrid,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance";

const Details = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get("/settings/my-details");

      // Axios automatically parses JSON, so we access response.data directly
      if (response.data && response.data.data) {
        setUser(response.data.data);
      } else if (response.data) {
        setUser(response.data);
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to load user profile",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const InfoCard = ({ title, children }) => (
    <Card bg="white" shadow="sm" borderRadius="xl" overflow="hidden">
      <CardHeader bg="gray.50" py={3}>
        <Heading size="sm" color="gray.700">
          {title}
        </Heading>
      </CardHeader>
      <CardBody>{children}</CardBody>
    </Card>
  );

  const InfoRow = ({ label, value }) => (
    <Flex justify="space-between" align="start" py={2}>
      <Text fontSize="sm" color="gray.600" fontWeight="medium" flex="0 0 40%">
        {label}
      </Text>
      <Text fontSize="sm" color="gray.900" textAlign="right" flex="1">
        {value || "N/A"}
      </Text>
    </Flex>
  );

  if (loading) {
    return (
      <Box bg="gray.50" minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Card bg="white" shadow="md" borderRadius="2xl" p={6}>
            <HStack spacing={6} mb={6}>
              <SkeletonCircle size="20" />
              <VStack align="start" flex="1" spacing={3}>
                <Skeleton height="30px" width="200px" />
                <Skeleton height="20px" width="150px" />
              </VStack>
            </HStack>
            <SkeletonText noOfLines={8} spacing={4} />
          </Card>
        </Container>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        bg="gray.50"
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.600">No user data available</Text>
      </Box>
    );
  }

  const getInitials = () => {
    return `${user.firstname?.charAt(0) || ""}${
      user.lastname?.charAt(0) || ""
    }`.toUpperCase();
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getStatusColor = (status) => {
    return status === 1 ? "green" : "red";
  };

  const getStatusText = (status) => {
    return status === 1 ? "Active" : "Inactive";
  };

  return (
    <Box minH="100vh">
      <Container maxW="container.xl">
        {/* Header Card */}
        <Card
          bg="white"
          shadow="md"
          borderRadius="2xl"
          mb={6}
          overflow="hidden"
        >
          <Box bgGradient="linear(to-r, blue.500, blue.600)" h="50px" />
          <CardBody px={8} pb={6}>
            <HStack spacing={6} align="end" mb={6}>
              <Avatar
                size="xl"
                bg="blue.500"
                color="white"
                fontSize="3xl"
                border="4px solid white"
                shadow="lg"
              ></Avatar>
              <VStack align="start" spacing={1} flex="1" pb={2}>
                <HStack>
                  <Heading size="lg" color="gray.800">
                    {user.prefix && `${user.prefix} `}
                    {user.firstname} {user.lastname}
                    {user.suffix && ` ${user.suffix}`}
                  </Heading>
                  <Badge
                    colorScheme={getStatusColor(user.employeeStatus)}
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {getStatusText(user.employeeStatus)}
                  </Badge>
                </HStack>
                <Text color="gray.600" fontSize="md">
                  {user.jobposition || "N/A"} • {user.department || "N/A"}
                </Text>
                <HStack spacing={4} mt={2}>
                  {user.role && (
                    <Badge
                      colorScheme="purple"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {user.role.toUpperCase()}
                    </Badge>
                  )}
                  {user.employeeId && (
                    <Badge
                      colorScheme="blue"
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {user.employeeId}
                    </Badge>
                  )}
                </HStack>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Main Content Grid */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Personal Information */}
          <InfoCard title="Personal Information">
            <VStack divider={<Divider />} spacing={0} align="stretch">
              <InfoRow label="Username" value={user.username} />
              <InfoRow label="Gender" value={user.gender} />
              <InfoRow label="Birthday" value={formatDate(user.birthday)} />
              <InfoRow
                label="Age"
                value={user.age ? `${user.age} years old` : "N/A"}
              />
              <InfoRow label="Nationality" value={user.nationality} />
              <InfoRow label="Civil Status" value={user.civilStatus} />
              <InfoRow label="Religion" value={user.religion} />
            </VStack>
          </InfoCard>

          {/* Contact Information */}
          <InfoCard title="Contact Information">
            <VStack divider={<Divider />} spacing={0} align="stretch">
              <InfoRow label="Mobile Number" value={user.mobileNumber} />
              <InfoRow label="Email" value={user.employeeEmail} />
              <InfoRow label="Present Address" value={user.presentAddress} />
              <InfoRow label="Province" value={user.province} />
              <InfoRow label="Town" value={user.town} />
              <InfoRow label="City" value={user.city} />
            </VStack>
          </InfoCard>

          {/* Employment Details */}
          <InfoCard title="Employment Details">
            <VStack divider={<Divider />} spacing={0} align="stretch">
              <InfoRow label="Company" value={user.companyName} />
              <InfoRow label="Employee ID" value={user.employeeId} />
              <InfoRow label="Position" value={user.jobposition} />
              <InfoRow label="Corporate Rank" value={user.corporaterank} />
              <InfoRow label="Job Status" value={user.jobStatus} />
              <InfoRow label="Location" value={user.location} />
              <InfoRow label="Business Unit" value={user.businessUnit} />
              <InfoRow label="Department" value={user.department} />
              <InfoRow label="Head" value={user.head} />
            </VStack>
          </InfoCard>

          {/* Financial Information */}
          <InfoCard title="Financial Information">
            <VStack divider={<Divider />} spacing={0} align="stretch">
              <InfoRow
                label="Salary Rate"
                value={
                  user.salaryRate
                    ? `₱${user.salaryRate.toLocaleString()}`
                    : "N/A"
                }
              />
              <InfoRow label="Bank Account" value={user.bankAccountNumber} />
              <InfoRow label="TIN Number" value={user.tinNumber} />
              <InfoRow label="SSS Number" value={user.sssNumber} />
              <InfoRow
                label="PhilHealth Number"
                value={user.philhealthNumber}
              />
              <InfoRow label="Pag-IBIG Number" value={user.pagibigNumber} />
            </VStack>
          </InfoCard>

          {/* Educational Background */}
          {user.schoolName && (
            <InfoCard title="Educational Background">
              <VStack divider={<Divider />} spacing={0} align="stretch">
                <InfoRow label="School Name" value={user.schoolName} />
                <InfoRow label="Degree" value={user.degree} />
                <InfoRow
                  label="Educational Attainment"
                  value={user.educationalAttainment}
                />
                <InfoRow
                  label="Years Attended"
                  value={
                    user.educationFromYear && user.educationToYear
                      ? `${user.educationFromYear} - ${user.educationToYear}`
                      : "N/A"
                  }
                />
                <InfoRow label="Achievements" value={user.achievements} />
              </VStack>
            </InfoCard>
          )}

          {/* Dependents Information */}
          {user.dependentsName && (
            <InfoCard title="Dependents Information">
              <VStack divider={<Divider />} spacing={0} align="stretch">
                <InfoRow label="Name" value={user.dependentsName} />
                <InfoRow label="Relation" value={user.dependentsRelation} />
                <InfoRow
                  label="Birth Date"
                  value={formatDate(user.dependentbirthDate)}
                />
              </VStack>
            </InfoCard>
          )}

          {/* Previous Employment */}
          {user.employerName && (
            <InfoCard title="Previous Employment">
              <VStack divider={<Divider />} spacing={0} align="stretch">
                <InfoRow label="Employer Name" value={user.employerName} />
                <InfoRow label="Address" value={user.employeeAddress} />
                <InfoRow label="Position" value={user.prevPosition} />
                <InfoRow
                  label="Employment Period"
                  value={
                    user.employmentfromDate && user.employmenttoDate
                      ? `${formatDate(user.employmentfromDate)} - ${formatDate(
                          user.employmenttoDate
                        )}`
                      : "N/A"
                  }
                />
              </VStack>
            </InfoCard>
          )}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default Details;
