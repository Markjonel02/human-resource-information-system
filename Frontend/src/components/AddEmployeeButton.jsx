import { useState } from "react";
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
  Select, // Import Select for dropdowns
  SimpleGrid, // Import SimpleGrid for multi-column layout
} from "@chakra-ui/react";
import { PlusCircle } from "lucide-react"; // Using lucide-react for the icon

const AddEmployeeButton = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

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
  const [email, setEmail] = useState("");

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
  const [employeeStatus, setEmployeeStatus] = useState("");

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
  const [employerName, setEmployerName] = useState(""); // Added employer name
  const [employerAddress, setEmployerAddress] = useState("");
  const [employmentPosition, setEmploymentPosition] = useState("");
  const [employmentFrom, setEmploymentFrom] = useState("");
  const [employmentTo, setEmploymentTo] = useState("");

  const handleSubmit = () => {
    // In a real application, you would send this data to a backend
    console.log("New Employee:", {
      firstName,
      lastName,
      middleInitial,
      gender,
      birthday,
      nationality,
      civilStatus,
      religion,
      age,
      presentAddress,
      city,
      town,
      province,
      mobileNumber,
      email,
      companyName,
      employeeId,
      jobPosition,
      corporateRank,
      jobStatus,
      location,
      businessUnit,
      department,
      head,
      employeeStatus,
      salaryRate,
      bankAccountNumber,
      tinNumber,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      schoolName,
      achievements,
      degree,
      educationalAttainment,
      educationFrom,
      educationTo,
      dependantName,
      dependantRelationship,
      dependantBirthdate,
      employerName,
      employerAddress,
      employmentPosition,
      employmentFrom,
      employmentTo,
    });

    // Show a success toast
    toast({
      title: "Employee Added!",
      description: `Employee ${firstName} ${lastName} has been added.`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });

    // Clear form and close modal
    setFirstName("");
    setLastName("");
    setMiddleInitial("");
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
    onClose();
  };

  // Determine if the Save Employee button should be disabled
  const isFormValid =
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
    email &&
    companyName &&
    employeeId &&
    jobPosition &&
    corporateRank &&
    jobStatus &&
    location &&
    businessUnit &&
    department &&
    head &&
    employeeStatus &&
    salaryRate &&
    bankAccountNumber &&
    tinNumber &&
    sssNumber &&
    philhealthNumber &&
    pagibigNumber &&
    schoolName &&
    degree &&
    educationalAttainment &&
    educationFrom &&
    educationTo &&
    dependantName &&
    dependantRelationship &&
    dependantBirthdate &&
    employerName &&
    employerAddress &&
    employmentPosition &&
    employmentFrom &&
    employmentTo;

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
            {/* Using SimpleGrid for a two-column layout */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* Personal Information Fields */}
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

              {/* Address Fields */}
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

              {/* Contact Fields */}
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

              {/* Corporate Details Fields */}
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

              {/* Salary and Government IDs Fields */}
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

              {/* Educational Background Fields */}
              <FormControl id="school-name" isRequired>
                <FormLabel>School Name</FormLabel>
                <Input
                  placeholder="Enter school name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="degree" isRequired>
                <FormLabel>Degree</FormLabel>
                <Input
                  placeholder="Enter degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="educational-attainment" isRequired>
                <FormLabel>Educational Attainment</FormLabel>
                <Input
                  placeholder="e.g., College Graduate, Master's Degree"
                  value={educationalAttainment}
                  onChange={(e) => setEducationalAttainment(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="education-from" isRequired>
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
              <FormControl id="education-to" isRequired>
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

              {/* Dependants Fields */}
              <FormControl id="dependant-name" isRequired>
                <FormLabel>Dependant Name</FormLabel>
                <Input
                  placeholder="Enter dependant's name"
                  value={dependantName}
                  onChange={(e) => setDependantName(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="dependant-relationship" isRequired>
                <FormLabel>Dependant Relationship</FormLabel>
                <Input
                  placeholder="e.g., Son, Daughter, Spouse"
                  value={dependantRelationship}
                  onChange={(e) => setDependantRelationship(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="dependant-birthdate" isRequired>
                <FormLabel>Dependant Birthdate</FormLabel>
                <Input
                  type="date"
                  value={dependantBirthdate}
                  onChange={(e) => setDependantBirthdate(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>

              {/* Employment History Fields */}
              <FormControl id="employer-name" isRequired>
                <FormLabel>Employer Name</FormLabel>
                <Input
                  placeholder="Enter previous employer name"
                  value={employerName}
                  onChange={(e) => setEmployerName(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="employer-address" isRequired>
                <FormLabel>Employer Address</FormLabel>
                <Input
                  placeholder="Enter previous employer address"
                  value={employerAddress}
                  onChange={(e) => setEmployerAddress(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="employment-position" isRequired>
                <FormLabel>Position</FormLabel>
                <Input
                  placeholder="Enter position held"
                  value={employmentPosition}
                  onChange={(e) => setEmploymentPosition(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="employment-from" isRequired>
                <FormLabel>Employment From (Date)</FormLabel>
                <Input
                  type="date"
                  value={employmentFrom}
                  onChange={(e) => setEmploymentFrom(e.target.value)}
                  borderRadius="lg"
                  focusBorderColor="blue.400"
                />
              </FormControl>
              <FormControl id="employment-to" isRequired>
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
