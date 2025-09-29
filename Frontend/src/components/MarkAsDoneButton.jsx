// components/MarkAsDoneButton.jsx
import React, { useState } from "react";
import {
  Button,
  IconButton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import axiosInstance from "../lib/axiosInstance";
import { useAuth } from "../context/AuthContext";
const MarkAsDoneButton = ({
  id, //  prop from parent
  onSuccess,
  variant = "solid",
  size = "sm",
  colorScheme = "green",
  showConfirm = true,
  fullWidth = false,
  label = "Mark as Done",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();
  const { authState } = useAuth();
  const currentUser = authState?.user;
  // Handle mark as done
  const handleMarkAsDone = async () => {
    if (!id) {
      toast({
        title: "Error",
        description: "Schedule ID is required",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    console.log("Marking schedule as done:", id);
    setIsLoading(true);

    try {
      // Store the response from axios
      const response = await axiosInstance.put(`/calendar/mark-done/${id}`);

      toast({
        title: "Success!",
        description:
          response.data?.message || "Schedule marked as done successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });

      if (showConfirm) onClose();

      // Refresh parent state or re-fetch data
      if (onSuccess && typeof onSuccess === "function") {
        await onSuccess();
      }
    } catch (error) {
      console.error(
        "Mark as done error:",
        error.response?.data || error.message
      );

      toast({
        title: "Failed to mark as done",
        description:
          error.response?.data?.error ||
          error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle button click
  const handleClick = () => {
    if (showConfirm) {
      onOpen();
    } else {
      handleMarkAsDone();
    }
  };

  // Render icon variant
  if (variant === "icon") {
    return (
      <>
        <IconButton
          icon={<FaCheckCircle />}
          onClick={handleClick}
          isLoading={isLoading}
          colorScheme={colorScheme}
          size={size}
          aria-label="Mark as done"
          title="Mark as Done"
          isDisabled={
            currentUser?.role !== "admin" && currentUser?.role !== "hr"
          } // only employee can mark as done
        />

        {showConfirm && (
          <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={cancelRef}
            onClose={onClose}
          >
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  Mark as Done
                </AlertDialogHeader>
                <AlertDialogBody>
                  Are you sure you want to mark this schedule as done? This
                  action will update the schedule status.
                </AlertDialogBody>
                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={onClose}
                    isDisabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    colorScheme={colorScheme}
                    onClick={handleMarkAsDone}
                    ml={3}
                    isLoading={isLoading}
                    loadingText="Marking..."
                  >
                    Confirm
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          </AlertDialog>
        )}
      </>
    );
  }

  // Regular button
  return (
    <>
      <Button
        onClick={handleClick}
        isLoading={isLoading}
        loadingText="Marking..."
        colorScheme={colorScheme}
        variant={variant}
        size={size}
      >
        {label}
      </Button>

      {showConfirm && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
          isCentered
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Mark as Done
              </AlertDialogHeader>
              <AlertDialogBody>
                Are you sure you want to mark this schedule as done? This action
                will update the schedule status.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onClose}
                  isDisabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  colorScheme={colorScheme}
                  onClick={handleMarkAsDone}
                  isLoading={isLoading}
                  loadingText="Marking..."
                  leftIcon={<FaCheck />}
                >
                  Confirm
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
};

export default MarkAsDoneButton;
