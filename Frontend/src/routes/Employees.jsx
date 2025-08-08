import React, { useEffect, useState, useRef } from "react";
import { calculateAge } from "../uitls/AgeCalulator";
import {
  Box,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Avatar,
  Text,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stack,
  HStack,
  Spinner,
  useBreakpointValue,
  Button,
  useToast,
  Tooltip,
  // Modal imports (for Edit)
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  // Alert Dialog imports (for Deactivate)
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Grid,
  SimpleGrid,
  GridItem,
  FormControl,
  Icon,
  // Drawer imports (for View)
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  VStack,
  FormLabel,
  Select,
  useDisclosure,
  ButtonGroup,
} from "@chakra-ui/react";

import {
  SearchIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EmailIcon,
  CalendarIcon,
  InfoIcon,
} from "@chakra-ui/icons";
import { FiMoreVertical } from "react-icons/fi";
import {
  FaBuilding,
  FaBriefcase,
  FaCalendarAlt,
  FaUserTie,
  FaDollarSign,
  FaIdCard,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaHome,
  FaRegListAlt,
  FaUniversity,
  FaCertificate,
  FaHeart,
  FaTransgender,
} from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";
import AddEmployeeButton from "../components/AddEmployeeButton";
import useDebounce from "../hooks/useDebounce";
import { useAuth } from "../context/AuthContext";

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "N/A";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Main component
const Employees = () => {
  const { authState } = useAuth();
  const currentUser = authState?.user;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [allChecked, setAllChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // State for Modals and Dialogs
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateAlertOpen, setIsDeactivateAlertOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [fullEmployeeDetails, setFullEmployeeDetails] = useState(null);
  const [viewDetailsLoading, setViewDetailsLoading] = useState(false);

  const cancelRef = useRef();
  const toast = useToast();
  const ITEMS_PER_PAGE = 10;

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

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [confirmAction, setConfirmAction] = useState(() => () => {});
  const [employeeCount, setEmployeeCount] = useState(0);
  const handleOpenConfirm = (ids, onConfirmCallback) => {
    setEmployeeCount(ids.length);
    setConfirmAction(() => () => {
      onConfirmCallback(); // your actual deactivation function
      onClose();
    });
    onOpen();
  };

  const handleSave = async () => {
    if (!selectedEmployee) return;

    const updates = {
      username,
      firstname: firstName,
      lastname: lastName,
      suffix,
      prefix,
      employeeEmail: email,
      department,
      jobStatus: jobStatus.toLowerCase(),
      employeeStatus: employeeStatus === "1" ? 1 : 0,
      gender,
      birthday,
      nationality,
      civilStatus,
      religion,
      presentAddress,
      province,
      town,
      age: Number(age),
      city,
      mobileNumber,
      companyName,
      jobposition: jobPosition,
      corporaterank: corporateRank,
      location,
      businessUnit,
      head,
      salaryRate: Number(salaryRate),
      bankAccountNumber,
      tinNumber,
      sssNumber,
      philhealthNumber,
      pagibigNumber,
      schoolName,
      degree,
      educationalAttainment,
      educationFromYear: educationFrom,
      educationToYear: educationTo,
      achievements,
      dependantsName: dependantName,
      dependentsRelation: dependantRelationship,
      dependentbirthDate: dependantBirthdate,
      employerName,
      employeeAddress: employerAddress,
      prevPosition: employmentPosition,
      employmentfromDate: employmentFrom,
      employmenttoDate: employmentTo,
    };

    // Only add password and role if applicable
    if (password) updates.password = password;
    if (currentUser?.role === "admin" && employeeRole) {
      updates.role = employeeRole;
    }
    console.log("Current User Role:", currentUser?.role);

    // Compare only specified fields
    const fieldsToCheck = Object.keys(updates).filter(
      (field) => field !== "password" && field !== "role"
    );

    const hasChanges = fieldsToCheck.some((key) => {
      const newVal = updates[key];
      const oldVal = selectedEmployee[key];

      if (typeof newVal === "number") return Number(oldVal) !== Number(newVal);
      if (typeof newVal === "string")
        return String(oldVal || "") !== String(newVal);
      if (Array.isArray(newVal))
        return JSON.stringify(oldVal || []) !== JSON.stringify(newVal);
      if (typeof newVal === "object")
        return JSON.stringify(oldVal || {}) !== JSON.stringify(newVal);
      return newVal !== oldVal;
    });

    if (!hasChanges) {
      toast({
        title: "No changes made",
        description: "All values are the same. Nothing to update.",
        status: "info",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.put(
        `/update-employee/${selectedEmployee.id}`,
        updates,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast({
        title: "Employee updated",
        description: response.data.message || "Employee updated successfully",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      fetchingEmployees(currentPage);
      onCloseEditModal();
      clearForm();
    } catch (error) {
      console.error("Error updating employee:", error);

      let errorMessage = "Could not update employee";
      if (error.response) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.errors) {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join(", ");
        }
      }

      toast({
        title: "Update failed",
        description: errorMessage,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  // Update the useEffect to populate form fields when editing:
  useEffect(() => {
    if (selectedEmployee && isEditModalOpen) {
      const fetchEmployeeDetails = async () => {
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axiosInstance.get(
            `/employees/${selectedEmployee.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const employeeData = response.data;

          // Set all form fields with employee data
          setUsername(employeeData.username || "");
          setFirstName(employeeData.firstname || "");
          setLastName(employeeData.lastname || "");
          setSuffix(employeeData.suffix || "");
          setPrefix(employeeData.prefix || "");
          setEmail(employeeData.employeeEmail || "");
          setDepartment(employeeData.department || "");
          setEmployeeStatus(employeeData.employeeStatus ? "1" : "0");
          setEmployeeRole(employeeData.role || "");
          setJobStatus(employeeData.jobStatus?.toLowerCase() || "");
          setAge(employeeData.age || 0);

          // Set other fields
          setGender(employeeData.gender || "");
          setBirthday(
            employeeData.birthday
              ? formatDateForInput(employeeData.birthday)
              : ""
          );
          setNationality(employeeData.nationality || "");
          setCivilStatus(employeeData.civilStatus || "");
          setReligion(employeeData.religion || "");
          setPresentAddress(employeeData.presentAddress || "");
          setCity(employeeData.city || "");
          setTown(employeeData.town || "");
          setProvince(employeeData.province || "");
          setMobileNumber(employeeData.mobileNumber || "");
          setCompanyName(employeeData.companyName || "");
          setJobPosition(employeeData.jobposition || "");
          setCorporateRank(employeeData.corporaterank || "");
          setLocation(employeeData.location || "");
          setBusinessUnit(employeeData.businessUnit || "");
          setHead(employeeData.head || "");
          setSalaryRate(employeeData.salaryRate?.toString() || "");
          setBankAccountNumber(employeeData.bankAccountNumber || "");
          setTinNumber(employeeData.tinNumber || "");
          setSssNumber(employeeData.sssNumber || "");
          setPhilhealthNumber(employeeData.philhealthNumber || "");
          setPagibigNumber(employeeData.pagibigNumber || "");
          setSchoolName(employeeData.schoolName || ""); // Corrected field name
          setDegree(employeeData.degree || "");
          setEducationalAttainment(employeeData.educationalAttainment || "");
          setEducationFrom(employeeData.educationFromYear || "");
          setEducationTo(employeeData.educationToYear || "");
          setAchievements(employeeData.achievements || "");
          setDependantName(employeeData.dependantsName || ""); // Corrected field name
          setDependantRelationship(employeeData.dependentsRelation || "");
          setDependantBirthdate(
            employeeData.dependentbirthDate
              ? formatDateForInput(employeeData.dependentbirthDate)
              : ""
          );
          setEmployerName(employeeData.employerName || "");
          setEmployerAddress(employeeData.employeeAddress || "");
          setEmploymentPosition(employeeData.prevPosition || "");
          setEmploymentFrom(employeeData.employmentfromDate || "");
          setEmploymentTo(employeeData.employmenttoDate || "");
        } catch (error) {
          console.error("Error fetching employee details:", error);
          toast({
            title: "Failed to load details",
            description: "Could not fetch employee information.",
            status: "error",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
        }
      };

      fetchEmployeeDetails();
    }
  }, [selectedEmployee, isEditModalOpen]);
  // helper function for date formatting

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Handle both Date objects and ISO strings
    const date = new Date(dateString);
    if (isNaN(date)) return "";

    // Get local date parts to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  //clearing form when submit
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

  // Move all useBreakpointValue calls to the top level
  const buttonLayout = useBreakpointValue({
    base: "vertical",
    md: "horizontal",
  });
  const isMobile = useBreakpointValue({ base: true, md: true, lg: false });

  // Pre-calculate the business unit display value
  const businessUnitDisplay = useBreakpointValue({
    base:
      fullEmployeeDetails?.businessUnit?.length > 5
        ? `${fullEmployeeDetails.businessUnit.substring(0, 5)}...`
        : fullEmployeeDetails?.businessUnit || "N/A",
    md: fullEmployeeDetails?.businessUnit || "N/A",
  });

  // Handlers for Modals and Dialogs
  const onOpenEditModal = (employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };
  const onCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
  };

  const onOpenDeactivateAlert = (employee) => {
    setSelectedEmployee(employee);
    setIsDeactivateAlertOpen(true);
  };
  const onCloseDeactivateAlert = () => {
    setIsDeactivateAlertOpen(false);
    setSelectedEmployee(null);
  };

  // New handlers for View Drawer
  const onOpenViewDrawer = async (employee) => {
    setSelectedEmployee(employee);
    setIsViewDrawerOpen(true);
    setViewDetailsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(`/employees/${employee.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFullEmployeeDetails(response.data);
    } catch (error) {
      console.error("Error fetching full employee details:", error);
      toast({
        title: "Failed to load details",
        description: "Could not fetch full employee information.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      setFullEmployeeDetails(null);
    } finally {
      setViewDetailsLoading(false);
    }
  };

  const onCloseViewDrawer = () => {
    setIsViewDrawerOpen(false);
    setSelectedEmployee(null);
    setFullEmployeeDetails(null);
  };

  useEffect(() => {
    fetchingEmployees(currentPage);
  }, [currentPage]);

  const handleEmployeeAdded = () => {
    fetchingEmployees(currentPage);
    setSelectedIds([]);
    setAllChecked(false);
  };

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      employee.email
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      employee.department
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()) ||
      employee.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const renderPagination = () => (
    <Flex justify="center" align="center" mt={6} gap={2}>
      <Button
        onClick={() => setCurrentPage(1)}
        isDisabled={currentPage === 1}
        colorScheme="blue"
        variant="outline"
      >
        First
      </Button>
      <IconButton
        icon={<ChevronLeftIcon />}
        onClick={() => setCurrentPage((prev) => prev - 1)}
        isDisabled={currentPage === 1}
        colorScheme="blue"
        variant="outline"
      />
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <Button
            key={page}
            onClick={() => setCurrentPage(page)}
            colorScheme={currentPage === page ? "blue" : "gray"}
            variant={currentPage === page ? "solid" : "outline"}
          >
            {page}
          </Button>
        );
      })}
      <IconButton
        icon={<ChevronRightIcon />}
        onClick={() => setCurrentPage((prev) => prev + 1)}
        isDisabled={currentPage === totalPages}
        colorScheme="blue"
        variant="outline"
      />
      <Button
        onClick={() => setCurrentPage(totalPages)}
        isDisabled={currentPage === totalPages}
        colorScheme="blue"
        variant="outline"
      >
        Last
      </Button>
    </Flex>
  );

  const fetchingEmployees = async (page) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));

      const formattedData = data.map((emp) => ({
        id: emp._id,
        name: `${emp.firstname} ${emp.lastname}`,
        email: emp.employeeEmail,
        department: emp.department || "Not Set",
        role: emp.role || "Not Set",
        status: emp.employeeStatus === 1 ? "Active" : "Inactive",
        avatar: `https://ui-avatars.com/api/?name=${emp.firstname}+${emp.lastname}&background=random`,
      }));

      setEmployees(formattedData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Failed to load employees",
        description: "Check your network or server.",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      const isSelected = prev.includes(id);
      const newSelection = isSelected
        ? prev.filter((sid) => sid !== id)
        : [...prev, id];
      setAllChecked(newSelection.length === filteredEmployees.length);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (allChecked) {
      setSelectedIds([]);
      setAllChecked(false);
    } else {
      const allIds = filteredEmployees.map((emp) => emp.id);
      setSelectedIds(allIds);
      setAllChecked(true);
    }
  };

  const handleBulkDeactivate = () => {
    if (selectedIds.length === 0) return;

    handleOpenConfirm(selectedIds, async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("accessToken");

        const response = await axiosInstance.post(
          "/deactivate-bulk",
          { ids: selectedIds },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle case where some admins were protected
        if (response.data.protectedCount > 0) {
          toast({
            title: "Partial deactivation",
            description: response.data.message,
            status: "warning",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
        } else {
          toast({
            title: "Employees deactivated",
            description: response.data.message,
            status: "success",
            duration: 4000,
            isClosable: true,
            position: "top",
          });
        }

        setSelectedIds([]);
        setAllChecked(false);
        fetchingEmployees(currentPage);
      } catch (error) {
        console.error("Error during bulk deactivate:", error);

        let errorMessage = "Could not deactivate employees.";
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast({
          title: "Deactivation failed",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
        });

        fetchingEmployees(currentPage);
      } finally {
        setLoading(false);
      }
    });
  };
  //hadlessave for update

  const handleDeactivateEmployee = async () => {
    if (!selectedEmployee) return;

    if (selectedEmployee.status === 0) {
      toast({
        title: "Already Deactivated",
        description: `The user "${selectedEmployee.name}" is already inactive.`,
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      const response = await axiosInstance.put(
        `/deactivate-user/${selectedEmployee.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Deactivated Successfully",
        description: `${selectedEmployee.name} has been marked as inactive.`,
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      fetchingEmployees(currentPage); // Refresh employee list
      onCloseDeactivateAlert(); // Close modal
    } catch (error) {
      console.error("Error deactivating employee:", error);

      const msg =
        error?.response?.data?.message ||
        "Could not deactivate the employee. Please try again.";

      toast({
        title: "Deactivation Failed",
        description: msg,
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });

      onCloseDeactivateAlert();
    }
  };

  return (
    <>
      <Box p={6}>
        <Flex justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          <Heading size="lg">Employee List</Heading>
        </Flex>

        <Flex justify="space-between" mb={6} flexWrap="wrap" gap={3}>
          {buttonLayout === "vertical" ? (
            <Stack spacing={3} w="100%">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Button
                colorScheme="red"
                onClick={handleBulkDeactivate}
                isDisabled={selectedIds.length === 0}
                leftIcon={<DeleteIcon />}
              >
                Set Inactive ({selectedIds.length})
              </Button>
            </Stack>
          ) : (
            <HStack spacing={3} w="100%">
              <InputGroup w="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Flex justifyContent={"flex-end"} flexGrow={1} gap={3}>
                <AddEmployeeButton onEmployeeAdded={handleEmployeeAdded} />
                <Button
                  colorScheme="red"
                  onClick={handleBulkDeactivate}
                  isDisabled={selectedIds.length === 0}
                  leftIcon={<DeleteIcon />}
                >
                  Set Inactive ({selectedIds.length})
                </Button>
              </Flex>
            </HStack>
          )}
        </Flex>

        {loading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.100">
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={allChecked}
                      onChange={handleSelectAll}
                      isIndeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredEmployees.length
                      }
                    />
                  </Th>
                  <Th>Employee</Th>
                  <Th
                    display={{
                      base: "none",
                      xl: "table-cell",
                    }}
                  >
                    Email
                  </Th>
                  <Th
                    display={{
                      base: "none",
                      md: "none",
                      lg: "none",
                      xl: "table-cell",
                    }}
                  >
                    Department
                  </Th>
                  <Th
                    display={{
                      base: "none",
                      md: "table-cell",
                      lg: "table-cell",
                    }}
                  >
                    Role
                  </Th>
                  <Th
                    display={{
                      base: "tavle-cell",
                      md: "none",
                      lg: "table-cell",
                    }}
                  >
                    Status
                  </Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredEmployees.map((employee) => (
                  <Tr key={employee.id}>
                    <Td>
                      <Checkbox
                        isChecked={selectedIds.includes(employee.id)}
                        onChange={() => handleCheckboxChange(employee.id)}
                      />
                    </Td>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          src={employee.avatar}
                          name={employee.name}
                        />
                        <Tooltip label={employee.name}>
                          <Text>
                            {isMobile && employee.name.length > 15
                              ? `${employee.name.slice(0, 15)}...`
                              : employee.name}
                          </Text>
                        </Tooltip>
                      </HStack>
                    </Td>
                    <Td
                      display={{
                        base: "none",

                        xl: "table-cell",
                      }}
                    >
                      <Tooltip label={employee.email}>
                        <Text>
                          {isMobile && employee.email.length > 10
                            ? `${employee.email.slice(0, 20)}...`
                            : employee.email}
                        </Text>
                      </Tooltip>
                    </Td>
                    <Td
                      display={{
                        base: "none",
                        md: "none",
                        lg: "none",
                        xl: "table-cell",
                      }}
                    >
                      {employee.department}
                    </Td>
                    <Td
                      display={{
                        base: "none",
                        md: "table-cell",
                        lg: "table-cell",
                      }}
                    >
                      {employee.role}
                    </Td>
                    <Td
                      display={{
                        base: "table-cell",
                        md: "none",
                        lg: "table-cell",
                      }}
                    >
                      <Tag
                        size="sm"
                        variant="subtle"
                        colorScheme={
                          employee.status === "Active" ? "green" : "red"
                        }
                      >
                        {employee.status}
                      </Tag>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem onClick={() => onOpenViewDrawer(employee)}>
                            View
                          </MenuItem>
                          <MenuItem onClick={() => onOpenEditModal(employee)}>
                            Edit
                          </MenuItem>
                          <MenuItem
                            onClick={() => onOpenDeactivateAlert(employee)}
                          >
                            Deactivate
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {filteredEmployees.length === 0 && !loading && (
              <Flex justify="center" py={10}>
                <Text color="gray.500">
                  {searchTerm
                    ? "No employees found matching your search."
                    : "No employees found."}
                </Text>
              </Flex>
            )}
          </Box>
        )}
      </Box>

      {filteredEmployees.length > 0 && renderPagination()}

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={onCloseEditModal}
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
            Edit Employee Details
          </ModalHeader>
          <ModalCloseButton />

          {!selectedEmployee ? (
            <ModalBody>
              <Box textAlign="center" py={10}>
                <Spinner size="xl" color="blue.500" />
                <Text mt={4}>Loading employee details...</Text>
              </Box>
            </ModalBody>
          ) : (
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
                  <FormControl id="username" isRequired>
                    <FormLabel>username</FormLabel>
                    <Input
                      placeholder="username"
                      value={username}
                      readOnly
                      onChange={(e) => setUsername(e.target.value)}
                      borderRadius="lg"
                      focusBorderColor="blue.400"
                    />
                  </FormControl>

                  {/* For a real app, do not pre-fill or allow editing of password directly in this form without
                    proper security measures. This is included for form structure completeness. */}
                  <FormControl id="password">
                    <FormLabel>Password</FormLabel>
                    <Input
                      type="password"
                      placeholder="Leave blank to keep current"
                      onChange={(e) => setPassword(e.target.value)}
                      borderRadius="lg"
                      focusBorderColor="blue.400"
                      isDisabled={currentUser?.role !== "admin"}
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>

              {/* Personal Information Fields */}
              <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
                Personal Information
              </Text>
              <VStack spacing={4} mb={6}>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                        setMiddleInitial(
                          e.target.value.toUpperCase().slice(0, 1)
                        )
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
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="prefer not to say">
                        Prefer not to say
                      </option>
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
                      <option value="catholic">Catholic</option>
                      <option value="christian">Christian</option>
                      <option value="others">Others</option>
                    </Select>
                  </FormControl>
                  <FormControl id="age" isRequired>
                    <FormLabel>Age</FormLabel>
                    <Input
                      type="number"
                      placeholder="Age will be calculated automatically"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      borderRadius="lg"
                      focusBorderColor="blue.400"
                      readOnly // This prevents manual editing
                    />
                  </FormControl>
                </SimpleGrid>
              </VStack>

              {/* Address Information Fields */}
              <Text fontSize="lg" fontWeight="semibold" color="blue.600" mb={4}>
                Address Information
              </Text>
              <VStack spacing={4} mb={6}>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                      <option value="managerial employees">
                        Managerial Employees
                      </option>
                      <option value="managerial staff">Managerial Staff</option>
                      <option value="supervisory employees">
                        Supervisory Employees
                      </option>
                      <option value="rank-and-file employees">
                        Rank & File Employees
                      </option>
                    </Select>
                  </FormControl>
                  <FormControl id="jobStatus" isRequired>
                    <FormLabel>Job Status</FormLabel>
                    <Select
                      placeholder="Select job status"
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value)}
                    >
                      <option value="probationary">Probitionary</option>
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
                      isDisabled={currentUser?.role !== "admin"}
                      // Only admins can change roles
                    >
                      <option value="employee">Employee</option>
                      <option value="hr">HR Staff</option>
                      <option value="hr_manager">Manager</option>
                      <option value="admin">Admin</option>
                    </Select>
                  </FormControl>
                </SimpleGrid>
              </VStack>

              {/* Salary and Government IDs Fields */}
              <Text mb={4} fontSize="lg" fontWeight="semibold" color="blue.600">
                Salary & Government IDs
              </Text>
              <VStack spacing={4} mb={6}>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
                  <FormControl id="salary-rate" isRequired>
                    <FormLabel>Salary Rate</FormLabel>
                    <Input
                      type="number"
                      placeholder="Enter salary rate"
                      value={salaryRate}
                      onChange={(e) => setSalaryRate(e.target.value)}
                      borderRadius="lg"
                      focusBorderColor="blue.400"
                      isDisabled={currentUser?.role !== "admin"}
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  spacing={4}
                  width="100%"
                >
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
          )}

          <ModalFooter pt={6}>
            <Button
              variant="ghost"
              onClick={onCloseEditModal}
              mr={3}
              borderRadius="lg"
              _hover={{ bg: "gray.100" }}
            >
              Cancel
            </Button>

            {/*   // Update the Save Changes button in the Edit Modal to use this handler: */}

            <Button
              colorScheme="blue"
              onClick={handleSave}
              borderRadius="lg"
              px={6}
              _hover={{
                boxShadow: "md",
                transform: "translateY(-1px)",
              }}
              transition="all 0.2s ease-in-out"
            >
              Save Changes
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* deativated bulk */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Deactivation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to deactivate {employeeCount} employee(s)?
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmAction} ml={3}>
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Deactivate Employee Alert Dialog */}
      <AlertDialog
        isOpen={isDeactivateAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseDeactivateAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Deactivate Employee
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to deactivate{" "}
              <Text as="span" fontWeight="bold">
                {selectedEmployee?.name}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseDeactivateAlert}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeactivateEmployee}
                ml={3}
              >
                Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* View Employee Drawer - Sliding from right */}
      <Drawer
        isOpen={isViewDrawerOpen}
        placement="right"
        onClose={onCloseViewDrawer}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent bg="gray.100">
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor="gray.200">
            <Heading size="lg">Employee Details</Heading>
          </DrawerHeader>
          <DrawerBody>
            {viewDetailsLoading ? (
              <Flex justify="center" align="center" minHeight="200px">
                <Spinner size="xl" />
              </Flex>
            ) : !fullEmployeeDetails ? (
              <Text>Failed to load employee details.</Text>
            ) : (
              <Stack spacing={6}>
                {/* Employee Header Section (Top part of the image) */}
                <Flex
                  align="center"
                  bg="white"
                  p={6}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Avatar
                    size="xl"
                    src={`https://ui-avatars.com/api/?name=${fullEmployeeDetails.firstname}+${fullEmployeeDetails.lastname}&background=random`}
                    name={`${fullEmployeeDetails.firstname} ${fullEmployeeDetails.lastname}`}
                  />
                  <Box ml={6} flexGrow={1}>
                    <Text fontSize="md" fontWeight="bold" color="gray.600">
                      EMP ID: {fullEmployeeDetails.employeeId || "N/A"}
                    </Text>
                    <Heading size="xl">
                      {fullEmployeeDetails.firstname}{" "}
                      {fullEmployeeDetails.lastname}
                    </Heading>
                    <Text fontSize="md" color="gray.500">
                      {fullEmployeeDetails.jobposition || "N/A"} (
                      {fullEmployeeDetails.jobStatus || "N/A"})
                    </Text>
                    <Tag
                      mt={2}
                      size="md"
                      variant="solid"
                      colorScheme={
                        fullEmployeeDetails.employeeStatus === 1
                          ? "green"
                          : "red"
                      }
                    >
                      {fullEmployeeDetails.employeeStatus === 1
                        ? "Active"
                        : "Inactive"}
                    </Tag>
                  </Box>
                  <Box>
                    {/* <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<FiMoreVertical />}
                        variant="outline"
                      >
                        View Details
                      </MenuButton>
                      <MenuList>
                        <MenuItem>Action 1</MenuItem>
                        <MenuItem>Action 2</MenuItem>
                      </MenuList>
                    </Menu> */}
                  </Box>
                </Flex>

                {/* Main Details Grid (Middle of the image) */}
                <Box p={6} bg="white" borderRadius="lg" shadow="sm">
                  <Grid
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      md: "repeat(2, 1fr)",
                    }}
                    gap={6}
                  >
                    {/* The existing details from your previous code */}
                    {/* Column 1 */}
                    <Stack spacing={4}>
                      <Flex align="center">
                        <Icon as={FaBriefcase} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Department:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.department || "N/A"}
                            hasArrow
                          >
                            {`${fullEmployeeDetails.department.substring(
                              0,
                              10
                            )}...` || "N/A"}
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUserTie} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Role:</Text>
                        <Text ml={2}>{fullEmployeeDetails.role || "N/A"}</Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaCalendarAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Job Status:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.jobStatus || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaDollarSign} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Salary Rate:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.salaryRate
                            ? `₱${fullEmployeeDetails.salaryRate.toLocaleString()}`
                            : "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaTransgender} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Gender:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.gender || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={CalendarIcon} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Birthday:</Text>
                        <Text ml={2}>
                          {formatDate(fullEmployeeDetails.birthday)}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaPhoneAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Mobile Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.mobileNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={EmailIcon} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Email:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.employeeEmail || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaHeart} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Civil Status:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.civilStatus || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUniversity} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">
                          Educational Attainment:
                        </Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.educationalAttainment || "N/A"}
                        </Text>
                      </Flex>
                    </Stack>

                    {/* Column 2 */}
                    <Stack spacing={4}>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">TIN Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.tinNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">SSS Number:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.sssNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Philhealth Number:</Text>
                        <Text ml={2}>
                          {`${fullEmployeeDetails.philhealthNumber.substring(
                            0,
                            5
                          )}...` || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaIdCard} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Pag-IBIG #</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.pagibigNumber || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaHome} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Present Address:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.presentAddress || "N/A"}
                            hasArrow
                          >
                            {`${fullEmployeeDetails.presentAddress.substring(
                              0,
                              10
                            )}...` || "N/A"}
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaMapMarkerAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Location:</Text>
                        <Text ml={2}>
                          {fullEmployeeDetails.location || "N/A"}
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaBuilding} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Business Unit:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.businessUnit || "N/A"}
                            hasArrow
                          >
                            {businessUnitDisplay}
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaUserTie} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Corporate Rank:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.corporaterank || "N/A"}
                            hasArrow
                          >
                            {`${fullEmployeeDetails.corporaterank.substring(
                              0,
                              10
                            )}...` || "N/A"}
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaRegListAlt} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Religion:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.religion || "N/A"}
                            hasArrow
                          >
                            {`${fullEmployeeDetails.religion.substring(
                              0,
                              5
                            )}...` || "N/A"}
                          </Tooltip>
                        </Text>
                      </Flex>
                      <Flex align="center">
                        <Icon as={FaCertificate} color="blue.500" mr={3} />
                        <Text fontWeight="semibold">Achievements:</Text>
                        <Text ml={2}>
                          <Tooltip
                            label={fullEmployeeDetails.achievements || "N/A"}
                            hasArrow
                          >
                            {fullEmployeeDetails.achievements
                              ? `${fullEmployeeDetails.achievements.substring(
                                  0,
                                  5
                                )}...`
                              : "N/A"}
                          </Tooltip>
                        </Text>
                      </Flex>
                    </Stack>
                  </Grid>
                </Box>

                {/* Attendance Summary Section (Bottom part of the image) */}
                <Box p={6} bg="white" borderRadius="lg" shadow="sm">
                  <Heading size="md" mb={4}>
                    Attendance Summary
                  </Heading>
                  <Grid
                    templateColumns={{
                      base: "repeat(2, 1fr)",
                      md: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    <Box>
                      <Text color="gray.500">Year of Employment</Text>
                      <Text fontWeight="bold" fontSize="xl" color="blue.500">
                        2023
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Presents Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="green.500">
                        200 Days
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Absent Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="red.500">
                        3 Days
                      </Text>
                    </Box>
                    <Box>
                      <Text color="gray.500">Total Leave Days</Text>
                      <Text fontWeight="bold" fontSize="xl" color="blue.500">
                        7 Days
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Monthly Log Section (Footer of the image) */}
                <Flex
                  justify="space-between"
                  align="center"
                  bg="white"
                  p={4}
                  borderRadius="lg"
                  shadow="sm"
                >
                  <Text fontWeight="semibold">March 2025 Log</Text>
                  <HStack spacing={2}>
                    <Button
                      /*     leftIcon={<Icon as={FiDownload} />} */
                      variant="outline"
                      colorScheme="purple"
                    >
                      Export CSV
                    </Button>
                    <Button
                      /*  leftIcon={<Icon as={FiFilter} />} */
                      variant="solid"
                      colorScheme="purple"
                    >
                      Filter
                    </Button>
                  </HStack>
                </Flex>
              </Stack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Employees;
