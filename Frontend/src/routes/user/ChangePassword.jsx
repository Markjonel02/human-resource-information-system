import React, { useState } from "react";
import {
  Box,
  Container,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  FormErrorMessage,
  Icon,
  List,
  ListItem,
  ListIcon,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
import {
  ViewIcon,
  ViewOffIcon,
  CheckCircleIcon,
  WarningIcon,
  LockIcon,
} from "@chakra-ui/icons";
import axiosInstance from "../../lib/axiosInstance";

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Password validation rules
  const passwordRules = [
    { label: "At least 8 characters long", test: (pwd) => pwd.length >= 8 },
    { label: "Contains uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
    { label: "Contains lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
    { label: "Contains number", test: (pwd) => /\d/.test(pwd) },
    {
      label: "Contains special character",
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    },
  ];

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: "", color: "gray" };

    const passed = passwordRules.filter((rule) => rule.test(password)).length;
    const percentage = (passed / passwordRules.length) * 100;

    if (percentage <= 40)
      return { strength: percentage, label: "Weak", color: "red" };
    if (percentage <= 70)
      return { strength: percentage, label: "Fair", color: "orange" };
    if (percentage < 100)
      return { strength: percentage, label: "Good", color: "yellow" };
    return { strength: 100, label: "Strong", color: "green" };
  };

  const validatePassword = (password) => {
    return passwordRules.every((rule) => rule.test(password));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!validatePassword(formData.newPassword)) {
      newErrors.newPassword = "Password does not meet all requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.put("/settings/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast({
        title: "Success!",
        description: "Your password has been changed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });

      // Reset form
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to change password. Please check your current password.";

      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Box bg="gray.50" minH="100vh" py={8}>
      <Container maxW="container.md">
        <Card bg="white" shadow="lg" borderRadius="2xl" overflow="hidden">
          {/* Header */}
          <CardHeader bgGradient="linear(to-r, blue.500, blue.600)" py={8}>
            <VStack spacing={2}>
              <Box bg="whiteAlpha.200" p={3} borderRadius="full">
                <Icon as={LockIcon} boxSize={8} color="white" />
              </Box>
              <Heading size="lg" color="white">
                Change Password
              </Heading>
              <Text color="whiteAlpha.900" fontSize="sm" textAlign="center">
                Keep your account secure with a strong password
              </Text>
            </VStack>
          </CardHeader>

          <CardBody p={8}>
            <VStack spacing={6} align="stretch">
              {/* Security Notice */}
              <Alert status="info" borderRadius="lg" bg="blue.50">
                <AlertIcon color="blue.500" />
                <AlertDescription fontSize="sm" color="gray.700">
                  Make sure your new password is strong and unique. Avoid using
                  personal information.
                </AlertDescription>
              </Alert>

              {/* Current Password */}
              <FormControl isInvalid={!!errors.currentPassword}>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Current Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    name="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder="Enter your current password"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowPassword("current")}
                      tabIndex={-1}
                    >
                      {showPassword.current ? (
                        <ViewOffIcon color="gray.500" />
                      ) : (
                        <ViewIcon color="gray.500" />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.currentPassword}</FormErrorMessage>
              </FormControl>

              {/* New Password */}
              <FormControl isInvalid={!!errors.newPassword}>
                <FormLabel fontWeight="semibold" color="gray.700">
                  New Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    name="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowPassword("new")}
                      tabIndex={-1}
                    >
                      {showPassword.new ? (
                        <ViewOffIcon color="gray.500" />
                      ) : (
                        <ViewIcon color="gray.500" />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>

                {/* Password Strength Indicator */}
                {formData.newPassword && (
                  <Box mt={2}>
                    <VStack align="stretch" spacing={1}>
                      <Box>
                        <Progress
                          value={passwordStrength.strength}
                          size="sm"
                          colorScheme={passwordStrength.color}
                          borderRadius="full"
                          bg="gray.200"
                        />
                      </Box>
                      <Text
                        fontSize="xs"
                        color={`${passwordStrength.color}.600`}
                        fontWeight="medium"
                      >
                        Password strength: {passwordStrength.label}
                      </Text>
                    </VStack>
                  </Box>
                )}

                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>

                {/* Password Requirements */}
                <Box
                  mt={3}
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color="gray.700"
                    mb={2}
                  >
                    Password Requirements:
                  </Text>
                  <List spacing={1}>
                    {passwordRules.map((rule, index) => {
                      const isValid =
                        formData.newPassword && rule.test(formData.newPassword);
                      return (
                        <ListItem
                          key={index}
                          fontSize="sm"
                          color={isValid ? "green.600" : "gray.600"}
                        >
                          <ListIcon
                            as={isValid ? CheckCircleIcon : WarningIcon}
                            color={isValid ? "green.500" : "gray.400"}
                          />
                          {rule.label}
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
              </FormControl>

              {/* Confirm Password */}
              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel fontWeight="semibold" color="gray.700">
                  Confirm New Password
                </FormLabel>
                <InputGroup size="lg">
                  <Input
                    name="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    focusBorderColor="blue.500"
                    bg="gray.50"
                    _hover={{ bg: "gray.100" }}
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleShowPassword("confirm")}
                      tabIndex={-1}
                    >
                      {showPassword.confirm ? (
                        <ViewOffIcon color="gray.500" />
                      ) : (
                        <ViewIcon color="gray.500" />
                      )}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>

                {/* Password Match Indicator */}
                {formData.confirmPassword && formData.newPassword && (
                  <Text
                    fontSize="sm"
                    mt={2}
                    color={
                      formData.newPassword === formData.confirmPassword
                        ? "green.600"
                        : "red.600"
                    }
                    fontWeight="medium"
                  >
                    {formData.newPassword === formData.confirmPassword ? (
                      <>
                        <CheckCircleIcon mr={1} />
                        Passwords match
                      </>
                    ) : (
                      <>
                        <WarningIcon mr={1} />
                        Passwords do not match
                      </>
                    )}
                  </Text>
                )}
              </FormControl>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                size="lg"
                fontSize="md"
                isLoading={isLoading}
                loadingText="Changing Password..."
                mt={4}
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                Change Password
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ChangePassword;
