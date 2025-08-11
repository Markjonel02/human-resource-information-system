import { useState } from "react";
import axios from "axios"; // Import axios
import { calculateAge } from "../uitls/AgeCalulator";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Text,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Select,
  SimpleGrid,
  FormHelperText,
} from "@chakra-ui/react";
import { PlusCircle } from "lucide-react";
import axiosInstance from "../lib/axiosInstance"; // Assuming axiosInstance is configured correctly
import { useAuth } from "../context/AuthContext";
// Define available roles based on current user's role

const AddEmployeeButton = ({ onEmployeeAdded }) => {
  const { authState } = useAuth();
  const currentUserRoles = authState?.user?.role; // ✅ Get role directly

  const getAvailableRoles = () => {
    if (currentUserRoles === "admin") {
      // Admin can create all roles
      return [
        { value: "admin", label: "Admin" },
        { value: "hr_manager", label: "HR Manager" },
        { value: "hr", label: "HR Staff" },
        { value: "employee", label: "Employee" },
      ];
    } else if (currentUserRoles === "hr") {
      // HR can only create employee and hr roles
      return [
        { value: "hr", label: "HR Staff" },
        { value: "employee", label: "Employee" },
      ];
    }

    // Default fallback
    return [{ value: "employee", label: "Employee" }];
  };
  // Added prop for callback
  const availableRoles = getAvailableRoles();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // State for authentication (username, password) - REQUIRED by backend
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // State for new form inputs (Personal Information)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nationality, setNationality] = useState("");
  const [civilStatus, setCivilStatus] = useState("");
  const [religion, setReligion] = useState("");
  const [age, setAge] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [city, setCity] = useState("");
  const [town, setTown] = useState("");
  const [province, setProvince] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [email, setEmail] = useState(""); // This will map to employeeEmail in backend
  const [suffix, setSuffix] = useState("");
  const [prefix, setPrefix] = useState("");

  // States for Corporate Details
  const [companyName, setCompanyName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [corporateRank, setCorporateRank] = useState("");
  const [jobStatus, setJobStatus] = useState("");
  const [location, setLocation] = useState("");
  const [businessUnit, setBusinessUnit] = useState("");
  const [department, setDepartment] = useState("");
  const [head, setHead] = useState("");
  const [employeeStatus, setEmployeeStatus] = useState(""); // Will be converted to boolean
  const [employeeRole, setEmployeeRole] = useState("");

  // States for Salary and Government IDs
  const [salaryRate, setSalaryRate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [sssNumber, setSssNumber] = useState("");
  const [philhealthNumber, setPhilhealthNumber] = useState("");
  const [pagibigNumber, setPagibigNumber] = useState("");

  // New states for Educational Background
  const [schoolName, setSchoolName] = useState("");
  const [achievements, setAchievements] = useState("");
  const [degree, setDegree] = useState("");
  const [educationalAttainment, setEducationalAttainment] = useState("");
  const [educationFrom, setEducationFrom] = useState("");
  const [educationTo, setEducationTo] = useState("");

  // New states for Dependants
  const [dependantName, setDependantName] = useState("");
  const [dependantRelationship, setDependantRelationship] = useState("");
  const [dependantBirthdate, setDependantBirthdate] = useState("");

  // New states for Employment History
  const [employerName, setEmployerName] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [employmentPosition, setEmploymentPosition] = useState("");
  const [employmentFrom, setEmploymentFrom] = useState("");
  const [employmentTo, setEmploymentTo] = useState("");

  // Function to clear all form fields
  const clearForm = () => {
    setUsername("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setMiddleInitial("");
    setSuffix("");
    setPrefix("");
    setGender("");
    setBirthday("");
    setNationality("");
    setCivilStatus("");
    setReligion("");
    setAge("");
    setEmployeeRole("");
    setPresentAddress("");
    setCity("");
    setTown("");
    setProvince("");
    setMobileNumber("");
    setEmail("");
    setCompanyName("");
    setEmployeeId("");
    setJobPosition("");
    setCorporateRank("");
    setJobStatus("");
    setLocation("");
    setBusinessUnit("");
    setDepartment("");
    setHead("");
    setEmployeeStatus("");
    setSalaryRate("");
    setBankAccountNumber("");
    setTinNumber("");
    setSssNumber("");
    setPhilhealthNumber("");
    setPagibigNumber("");
    setSchoolName("");
    setAchievements("");
    setDegree("");
    setEducationalAttainment("");
    setEducationFrom("");
    setEducationTo("");
    setDependantName("");
    setDependantRelationship("");
    setDependantBirthdate("");
    setEmployerName("");
    setEmployerAddress("");
    setEmploymentPosition("");
    setEmploymentFrom("");
    setEmploymentTo("");
  };

  const handleSubmit = async () => {
    // Convert employeeStatus string to boolean
    const isEmployeeActive = employeeStatus === "1";

    // Prepare the data payload to match backend expectations
    const employeeData = {
      username,
      password,
      employeeEmail: email, // Map frontend 'email' to backend 'employeeEmail'

      // IMPORTANT: Map employeeRole to 'role' to match backend expectation
      role: employeeRole, // Backend expects 'role', not 'employeeRole'

      // Personal Information - Use correct field names that match backend schema
      firstname: firstName, // Changed from firstName to firstname
      lastname: lastName, // Changed from lastName to lastname
      middleInitial,
      suffix,
      prefix,
      gender: gender.toLowerCase(), // Convert to lowercase to match backend enum
      birthday,
      nationality,
      civilStatus: civilStatus.toLowerCase(), // Convert to lowercase to match backend enum
      religion: religion.toLowerCase(), // Convert to lowercase to match backend enum
      age: Number(age), // Ensure age is a number

      // Address Information
      presentAddress,
      city,
      town,
      province,
      mobileNumber,

      // Employment Information
      companyName,
      jobposition: jobPosition, // Match backend field name
      corporaterank: corporateRank.toLowerCase(),
      jobStatus,
      location,
      businessUnit,
      department,
      head,
      employeeStatus: isEmployeeActive, // Send as boolean
      salaryRate: Number(salaryRate), // Ensure salaryRate is a number

      // Government IDs
      bankAccountNumber,
      tinNumber,
      sssNumber,
      philhealthNumber,
      pagibigNumber,

      // Complex data structures - Convert to JSON strings or objects based on backend schema
      educationalBackground: JSON.stringify({
        schoolName,
        achievements,
        degree,
        educationalAttainment,
        educationFrom,
        educationTo,
      }),
      dependants: JSON.stringify([
        {
          dependantName,
          dependantRelationship,
          dependantBirthdate,
        },
      ]),
      employmentHistory: JSON.stringify([
        {
          employerName,
          employerAddress,
          employmentPosition,
          employmentFrom,
          employmentTo,
        },
      ]),
    };

    try {
      const token = localStorage.getItem("accessToken");

      const response = await axiosInstance.post(
        "/create-employees", // Your backend API endpoint
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Employee creation successful:", response.data);

      // Success handling
      toast({
        title: "Employee Added!",
        description: `Employee ${firstName} ${lastName} has been added successfully. Employee ID: ${
          response.data.employee?.employeeId || "Generated"
        }`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      clearForm(); // Clear form fields
      onClose(); // Close the modal

      // Call the callback function to refresh the employee list
      if (onEmployeeAdded) {
        onEmployeeAdded();
      }
    } catch (error) {
      console.error(
        "Error creating employee:",
        error.response?.data || error.message
      );

      let errorMessage = "Failed to add employee. Please try again.";

      // Enhanced error handling for specific backend responses
      if (error.response?.status === 403) {
        errorMessage =
          error.response.data.message ||
          "Access denied. You don't have permission to create this type of employee.";
      } else if (error.response?.status === 409) {
        errorMessage =
          error.response.data.message ||
          "Employee with this username or email already exists.";
      } else if (error.response?.status === 400) {
        errorMessage =
          error.response.data.message ||
          "Invalid data provided. Please check all required fields.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // FIXED: Include pagibigNumber in validation
  const isFormValid =
    username &&
    password &&
    firstName &&
    lastName &&
    gender &&
    birthday &&
    nationality &&
    civilStatus &&
    religion &&
    age &&
    presentAddress &&
    city &&
    town &&
    province &&
    mobileNumber &&
    email && // Corresponds to employeeEmail
    companyName &&
    jobPosition && // Corresponds to jobposition
    corporateRank && // Corresponds to corporaterank
    jobStatus &&
    location &&
    businessUnit &&
    department &&
    head &&
    employeeStatus && // Check if a value is selected (Active/Inactive)
    salaryRate &&
    bankAccountNumber &&
    tinNumber &&
    sssNumber &&
    philhealthNumber &&
    pagibigNumber && // Added pagibigNumber validation
    employeeRole; // Check if a value is selected (HR/Manager/Admin)

  return (
    <Flex
      align="center"
      justify="center"
      bg="gray.50"
      fontFamily="Inter, sans-serif"
    >
      <Button
        onClick={onOpen}
        colorScheme="blue"
        size="sm"
        leftIcon={<PlusCircle size={20} />}
        borderRadius="lg"
        px={4}
        py={5}
        boxShadow="lg"
        display={{ base: "flex", md: "flex" }}
        _hover={{
          boxShadow: "xl",
          transform: "translateY(-2px)",
        }}
        transition="all 0.2s ease-in-out"
      >
        <Text fontSize="sm" fontWeight="500">
          Add Employee
        </Text>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay
          bg="blackAlpha.300"
          backdropFilter="blur(10px) hue-rotate(90deg)"
        />
        <ModalContent
          borderRadius="xl"
          boxShadow="2xl"
          p={6}
          bg="white"
          maxW="4xl"
          mx={4}
        >
          <ModalHeader fontSize="2xl" fontWeight="bold" pb={2}>
            Add New Employee
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Authentication Fields */}
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color="blue.600"
              textAlign="start"
              mb={4}
            >
              Authentication Details
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="username" isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="password" isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Personal Information
            </Text>
            {/* Personal Information Fields */}
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="first-name" isRequired>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="last-name" isRequired>
                  <FormLabel>Last Name</FormLabel>
                  <Input
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="middle-initial">
                  <FormLabel>Middle Initial (MI)</FormLabel>
                  <Input
                    placeholder="Enter middle initial"
                    value={middleInitial}
                    onChange={(e) =>
                      setMiddleInitial(e.target.value.toUpperCase().slice(0, 1))
                    }
                    maxLength={1}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="suffix">
                  <FormLabel>Suffix</FormLabel>
                  <Input
                    placeholder="ex: Jr,Sr,II and etc..."
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="prefix">
                  <FormLabel>Prefix</FormLabel>
                  <Input
                    placeholder="ex:Mr,Ms,Msr,and etc..."
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="gender" isRequired>
                  <FormLabel>Gender</FormLabel>
                  <Select
                    placeholder="Select gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {/* FIXED: Match backend enum values (lowercase) */}
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer not to say">Prefer not to say</option>
                  </Select>
                </FormControl>

                <FormControl id="birthday" isRequired>
                  <FormLabel>Birthday</FormLabel>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => {
                      setBirthday(e.target.value);
                      setAge(calculateAge(e.target.value)); // Update age when birthday changes
                    }}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl id="nationality" isRequired>
                  <FormLabel>Nationality</FormLabel>
                  <Input
                    placeholder="Enter nationality"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>

                <FormControl id="civil-status" isRequired>
                  <FormLabel>Civil Status</FormLabel>
                  <Select
                    placeholder="Select civil status"
                    value={civilStatus}
                    onChange={(e) => setCivilStatus(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {/* FIXED: Match backend enum values (lowercase) */}
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </Select>
                </FormControl>

                <FormControl id="religion" isRequired>
                  <FormLabel>Religion</FormLabel>
                  <Select
                    placeholder="Select religion"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {/* FIXED: Match backend enum values (lowercase) */}
                    <option value="catholic">Catholic</option>
                    <option value="christian">Christian</option>
                    <option value="others">Others</option>
                  </Select>
                </FormControl>

                <FormControl id="age" isRequired>
                  <FormLabel>Age</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                    readOnly // This prevents manual editing
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Address Information
            </Text>
            {/* Address Fields */}
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="present-address" isRequired>
                  <FormLabel>Present Address</FormLabel>
                  <Input
                    placeholder="House No., Street, Barangay"
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="province" isRequired>
                  <FormLabel>Province</FormLabel>
                  <Input
                    placeholder="Enter province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="city" isRequired>
                  <FormLabel>City</FormLabel>
                  <Input
                    placeholder="Enter city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="town" isRequired>
                  <FormLabel>Town</FormLabel>
                  <Input
                    placeholder="Enter town"
                    value={town}
                    onChange={(e) => setTown(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Contact Fields */}
            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Contact Information
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="mobile-number" isRequired>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    type="tel"
                    placeholder="e.g., 09XX-XXX-XXXX"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employee-email" isRequired>
                  <FormLabel>Employee Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="Enter employee email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Corporate Details Fields */}
            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Corporate Details
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="company-name" isRequired>
                  <FormLabel>Company Name</FormLabel>
                  <Input
                    placeholder="Enter company name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="job-position" isRequired>
                  <FormLabel>Job Position</FormLabel>
                  <Input
                    placeholder="Enter job position"
                    value={jobPosition}
                    onChange={(e) => setJobPosition(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="corporate-rank" isRequired>
                  <FormLabel>Corporate Rank</FormLabel>
                  <Select
                    placeholder="Select corporate rank"
                    value={corporateRank}
                    onChange={(e) => setCorporateRank(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {/* These values will be mapped to backend enum values */}
                    <option value="managerial employees">
                      Managerial Employees
                    </option>
                    <option value="managerial staff">Managerial Staff</option>
                    <option value="supervisory employees">
                      Supervisory Employees
                    </option>
                    <option value="Rank-and-file">Rank & File Employee</option>

                    {/*    <option value="rankandfile employees">
                      Rank and File Employees
                    </option> */}
                  </Select>
                </FormControl>

                <FormControl id="job-status" isRequired>
                  <FormLabel>Job Status</FormLabel>
                  <Select
                    placeholder="Select job status"
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    <option value="probitionary">Probitionary</option>
                    <option value="regular">Regular</option>
                  </Select>
                </FormControl>
                <FormControl id="location" isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="business-unit" isRequired>
                  <FormLabel>Business Unit</FormLabel>
                  <Input
                    placeholder="Enter business unit"
                    value={businessUnit}
                    onChange={(e) => setBusinessUnit(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="department" isRequired>
                  <FormLabel>Department</FormLabel>
                  <Input
                    placeholder="Enter department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="head" isRequired>
                  <FormLabel>Head</FormLabel>
                  <Input
                    placeholder="Enter department head"
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employee-status" isRequired>
                  <FormLabel>Employee Status</FormLabel>
                  <Select
                    placeholder="Select employee status"
                    value={employeeStatus}
                    onChange={(e) => setEmployeeStatus(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </Select>
                </FormControl>
                <FormControl id="role" isRequired>
                  <FormLabel>Employee Role</FormLabel>
                  <Select
                    placeholder="Select employee role"
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  >
                    {availableRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </Select>

                  {/* Optional: Display a helper text based on user role */}
                  {currentUserRoles?.role === "hr" && (
                    <FormHelperText color="gray.500" fontSize="sm" mt={2}>
                      As an HR user, you can only create Employee and HR Staff
                      roles.
                    </FormHelperText>
                  )}

                  {currentUserRoles?.role === "admin" && (
                    <FormHelperText color="gray.500" fontSize="sm" mt={2}>
                      As an Admin, you can create any role type.
                    </FormHelperText>
                  )}
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Salary and Government IDs Fields */}
            <Text mb={4} fontSize="lg" fontWeight="semibold" color="blue.600">
              Salary & Government IDs
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="salary-rate" isRequired>
                  <FormLabel>Salary Rate</FormLabel>
                  <Input
                    type="number"
                    placeholder="Enter salary rate"
                    value={salaryRate}
                    onChange={(e) => setSalaryRate(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="bank-account-number" isRequired>
                  <FormLabel>Bank Account Number</FormLabel>
                  <Input
                    placeholder="Enter bank account number"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="tin-number" isRequired>
                  <FormLabel>TIN Number</FormLabel>
                  <Input
                    placeholder="Enter TIN number"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="sss-number" isRequired>
                  <FormLabel>SSS Number</FormLabel>
                  <Input
                    placeholder="Enter SSS number"
                    value={sssNumber}
                    onChange={(e) => setSssNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="philhealth-number" isRequired>
                  <FormLabel>Philhealth Number</FormLabel>
                  <Input
                    placeholder="Enter Philhealth number"
                    value={philhealthNumber}
                    onChange={(e) => setPhilhealthNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="pagibig-number" isRequired>
                  <FormLabel>Pag-IBIG Number</FormLabel>
                  <Input
                    placeholder="Enter Pag-IBIG number"
                    value={pagibigNumber}
                    onChange={(e) => setPagibigNumber(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Educational Background Fields */}
            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Educational Background
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="school-name">
                  <FormLabel>School Name</FormLabel>
                  <Input
                    placeholder="Enter school name"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="degree">
                  <FormLabel>Degree</FormLabel>
                  <Input
                    placeholder="Enter degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="educational-attainment">
                  <FormLabel>Educational Attainment</FormLabel>
                  <Input
                    placeholder="e.g., College Graduate, Master's Degree"
                    value={educationalAttainment}
                    onChange={(e) => setEducationalAttainment(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="education-from">
                  <FormLabel>Education From (Year)</FormLabel>
                  <Input
                    type="number"
                    placeholder="Start Year"
                    value={educationFrom}
                    onChange={(e) => setEducationFrom(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="education-to">
                  <FormLabel>Education To (Year)</FormLabel>
                  <Input
                    type="number"
                    placeholder="End Year (or Present)"
                    value={educationTo}
                    onChange={(e) => setEducationTo(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="achievements">
                  <FormLabel>Achievements (Optional)</FormLabel>
                  <Input
                    placeholder="Enter achievements"
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Dependants Fields */}
            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Dependants Information
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="dependant-name">
                  <FormLabel>Dependant Name</FormLabel>
                  <Input
                    placeholder="Enter dependant's name"
                    value={dependantName}
                    onChange={(e) => setDependantName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="dependant-relationship">
                  <FormLabel>Dependant Relationship</FormLabel>
                  <Input
                    placeholder="e.g., Son, Daughter, Spouse"
                    value={dependantRelationship}
                    onChange={(e) => setDependantRelationship(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="dependant-birthdate">
                  <FormLabel>Dependant Birthdate</FormLabel>
                  <Input
                    type="date"
                    value={dependantBirthdate}
                    onChange={(e) => setDependantBirthdate(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Employment History Fields */}
            <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
              Employment History
            </Text>
            <VStack spacing={4} mb={6}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="employer-name">
                  <FormLabel>Employer Name</FormLabel>
                  <Input
                    placeholder="Enter previous employer name"
                    value={employerName}
                    onChange={(e) => setEmployerName(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employer-address">
                  <FormLabel>Employer Address</FormLabel>
                  <Input
                    placeholder="Enter previous employer address"
                    value={employerAddress}
                    onChange={(e) => setEmployerAddress(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employment-position">
                  <FormLabel>Position</FormLabel>
                  <Input
                    placeholder="Enter position held"
                    value={employmentPosition}
                    onChange={(e) => setEmploymentPosition(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employment-from">
                  <FormLabel>Employment From (Date)</FormLabel>
                  <Input
                    type="date"
                    value={employmentFrom}
                    onChange={(e) => setEmploymentFrom(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="employment-to">
                  <FormLabel>Employment To (Date)</FormLabel>
                  <Input
                    type="date"
                    value={employmentTo}
                    onChange={(e) => setEmploymentTo(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>
          </ModalBody>

          <ModalFooter pt={6}>
            <Button
              variant="ghost"
              onClick={onClose}
              mr={3}
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              borderRadius="lg"
              px={6}
              _hover={{
                boxShadow: "md",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s ease-in-out"
              isDisabled={!isFormValid}
            >
              Save Employee
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default AddEmployeeButton;
