// components/EmployeeActionsBar.js
import React from "react";
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  HStack,
  Stack,
} from "@chakra-ui/react";
import { SearchIcon, DeleteIcon } from "@chakra-ui/icons";
import AddEmployeeButton from "./AddEmployeeButton";

const EmployeeActionsBar = ({
  searchTerm,
  onSearchChange,
  selectedCount,
  onBulkDeactivate,
  onEmployeeAdded,
  buttonLayout,
}) => {
  return (
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
              onChange={onSearchChange}
            />
          </InputGroup>

          <Button
            colorScheme="red"
            onClick={onBulkDeactivate}
            isDisabled={selectedCount === 0}
            leftIcon={<DeleteIcon />}
          >
            Set Inactive ({selectedCount})
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
              onChange={onSearchChange}
            />
          </InputGroup>

          <Flex justifyContent="flex-end" flexGrow={1} gap={3}>
            <AddEmployeeButton onEmployeeAdded={onEmployeeAdded} />
            <Button
              colorScheme="red"
              onClick={onBulkDeactivate}
              isDisabled={selectedCount === 0}
              leftIcon={<DeleteIcon />}
            >
              Set Inactive ({selectedCount})
            </Button>
          </Flex>
        </HStack>
      )}
    </Flex>
  );
};

export default EmployeeActionsBar;
