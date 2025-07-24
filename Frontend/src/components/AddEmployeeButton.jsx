import { useState } from "react";
import axios from "axios"; // Import axios
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
} from "@chakra-ui/react";
import { PlusCircle } from "lucide-react";

const AddEmployeeButton = () => {
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

  // States for Salary and Government IDs
  const [salaryRate, setSalaryRate] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [sssNumber, setSssNumber] = useState("");
  const [philhealthNumber, setPhilhealthNumber] = useState("");
  const [pagibigNumber, setPagibigNumber] = useState("");

  // New states for Educational Background (Note: Backend schema might need these fields)
  const [schoolName, setSchoolName] = useState("");
  const [achievements, setAchievements] = useState("");
  const [degree, setDegree] = useState("");
  const [educationalAttainment, setEducationalAttainment] = useState("");
  const [educationFrom, setEducationFrom] = useState("");
  const [educationTo, setEducationTo] = useState("");

  // New states for Dependants (Note: Backend schema might need these fields)
  const [dependantName, setDependantName] = useState("");
  const [dependantRelationship, setDependantRelationship] = useState("");
  const [dependantBirthdate, setDependantBirthdate] = useState("");

  // New states for Employment History (Note: Backend schema might need these fields)
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
    const isEmployeeActive = employeeStatus === "Active";

    // Prepare the data payload to match backend expectations
    const employeeData = {
      username,
      password,
      employeeEmail: email, // Map frontend 'email' to backend 'employeeEmail'
      firstName,
      lastName,
      middleInitial,
      suffix,
      prefix,
      gender,
      birthday,
      nationality,
      civilStatus,
      religion,
      age: Number(age), // Ensure age is a number
      presentAddress,
      city,
      town,
      province,
      mobileNumber,
      companyName,
      employeeId,
      jobposition: jobPosition, // Match backend field name
      corporaterank: corporateRank, // Match backend field name
      jobStatus,
      location,
      businessUnit,
      department,
      head,
      employeeStatus: isEmployeeActive, // Send as boolean
      salaryRate: Number(salaryRate), // Ensure salaryRate is a number
      bankAccountNumber,
      tinNumber,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      // Note: The backend controller you provided does not explicitly
      // handle these fields (schoolName, achievements, etc.).
      // You might need to update your Mongoose User schema and backend controller
      // to store this additional information if it's required.
      educationalBackground: {
        schoolName,
        achievements,
        degree,
        educationalAttainment,
        educationFrom,
        educationTo,
      },
      dependants: [
        {
          dependantName,
          dependantRelationship,
          dependantBirthdate,
        },
      ],
      employmentHistory: [
        {
          employerName,
          employerAddress,
          employmentPosition,
          employmentFrom,
          employmentTo,
        },
      ],
    };

    try {
      // Replace 'YOUR_AUTH_TOKEN_HERE' with a dynamic token from your authentication system
      // For example, if you store it in localStorage: localStorage.getItem('accessToken')
      const token = "YOUR_ADMIN_AUTH_TOKEN_HERE"; // Placeholder: Get actual admin token

      const response = await axios.post(
        "/api/employees", // Your backend API endpoint
        employeeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Employee creation successful:", response.data);

      toast({
        title: "Employee Added!",
        description: `Employee ${firstName} ${lastName} has been added successfully.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      clearForm(); // Clear form fields
      onClose(); // Close the modal
    } catch (error) {
      console.error(
        "Error creating employee:",
        error.response?.data || error.message
      );

      let errorMessage = "Failed to add employee. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
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

  // Determine if the Save Employee button should be disabled
  // Ensure all required fields from the backend controller are included here
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
    employeeId &&
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
    philhealthNumber;
  // The backend controller doesn't explicitly require pagibigNumber, schoolName, etc.
  // If they are truly required, add them to this check and your backend validation.
  // For now, I'm keeping it consistent with your backend's `if (!otherFields.tinNumber || ...)` check.

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
        size="xl" // Make modal larger to accommodate more fields
        scrollBehavior="inside" // Allow scrolling inside the modal body
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
          maxW="4xl" // Increased maxW to better fit more fields in 2 columns
          mx={4}
        >
          <ModalHeader fontSize="2xl" fontWeight="bold" pb={2}>
            Add New Employee
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Authentication Fields (Username, Password) - Added for backend requirement */}
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Authentication Details
              </Text>
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

            {/* Personal Information Fields */}
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Personal Information
              </Text>
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
                    } // Limit to 1 char, uppercase
                    maxLength={1}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="suffix">
                  <FormLabel>Suffix</FormLabel>
                  <Input
                    placeholder=" ex: Jr,Sr,II and etc..."
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
                </FormControl>
                <FormControl id="prefix">
                  <FormLabel>Prefix</FormLabel>
                  <Input
                    placeholder=" ex:Mr,Ms,Msr,and etc... "
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </Select>
                </FormControl>

                <FormControl id="birthday" isRequired>
                  <FormLabel>Birthday</FormLabel>
                  <Input
                    type="date"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
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
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </Select>
                </FormControl>

                <FormControl id="religion" isRequired>
                  <FormLabel>Religion</FormLabel>
                  <Input
                    placeholder="Enter religion"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
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
                  />
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Address Fields */}
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Address Information
              </Text>
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
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Contact Information
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                <FormControl id="mobile-number" isRequired>
                  <FormLabel>Mobile Number</FormLabel>
                  <Input
                    type="tel" // Use type="tel" for mobile numbers
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
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Corporate Details
              </Text>
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
                <FormControl id="employee-id" isRequired>
                  <FormLabel>Employee ID</FormLabel>
                  <Input
                    placeholder="Enter employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
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
                    <option value="Managerial employees">
                      Managerial employees
                    </option>
                    <option value="Managerial staff">Managerial staff</option>
                    <option value="Supervisory employees">
                      Supervisory employees
                    </option>
                    <option value="Rank-and-File employees">
                      Rank-and-File employees
                    </option>
                  </Select>
                </FormControl>
                <FormControl id="job-status" isRequired>
                  <FormLabel>Job Status</FormLabel>
                  <Input
                    placeholder="Enter job status (e.g., Full-time, Part-time)"
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    borderRadius="lg"
                    focusBorderColor="blue.400"
                  />
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
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </Select>
                </FormControl>
              </SimpleGrid>
            </VStack>

            {/* Salary and Government IDs Fields */}
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Salary & Government IDs
              </Text>
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
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Educational Background
              </Text>
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
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Dependants Information
              </Text>
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
            <VStack spacing={4} mb={6}>
              <Text fontSize="lg" fontWeight="semibold" color="blue.600">
                Employment History
              </Text>
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
              isDisabled={!isFormValid} // Disable if any required field is empty
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
