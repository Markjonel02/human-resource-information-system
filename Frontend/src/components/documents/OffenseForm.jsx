import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Box,
  Text,
} from "@chakra-ui/react";

const OffenseForm = ({
  formData,
  setFormData,
  nameSuggestions,
  handleNameChange,
  handleSelectName,
}) => (
  <VStack spacing={4}>
    <FormControl>
      <FormLabel>Employee Name</FormLabel>
      <Input
        placeholder="Type employee name..."
        value={formData.employeeName}
        onChange={handleNameChange}
      />
      {nameSuggestions.length > 0 && (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          mt={1}
          maxH="150px"
          overflowY="auto"
          bg="white"
        >
          {nameSuggestions.map((employee) => (
            <Text
              key={employee.id}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleSelectName(employee)}
            >
              {employee.name}
            </Text>
          ))}
        </Box>
      )}
    </FormControl>

    <FormControl>
      <FormLabel>Department</FormLabel>
      <Select
        placeholder="Select Department"
        value={formData.employeeDepartment}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            employeeDepartment: e.target.value,
          }))
        }
      >
        <option value="Engineering">Engineering</option>
        <option value="Human Resources">Human Resources</option>
        <option value="Marketing">Marketing</option>
        <option value="Sales">Sales</option>
        <option value="Finance">Finance</option>
      </Select>
    </FormControl>

    <FormControl>
      <FormLabel>Offense Details</FormLabel>
      <Textarea
        placeholder="Describe the offense..."
        value={formData.offenseDetails}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, offenseDetails: e.target.value }))
        }
      />
    </FormControl>
  </VStack>
);

export default OffenseForm;
