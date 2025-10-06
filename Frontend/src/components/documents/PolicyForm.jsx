import React from "react";
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";

const PolicyForm = ({ formData, setFormData }) => (
  <VStack spacing={4}>
    <FormControl>
      <FormLabel>Document Title</FormLabel>
      <Input
        placeholder="e.g., New Remote Work Policy"
        value={formData.title}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, title: e.target.value }))
        }
      />
    </FormControl>
    <FormControl>
      <FormLabel>Description</FormLabel>
      <Textarea
        placeholder="Brief description of the document"
        value={formData.description}
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, description: e.target.value }))
        }
      />
    </FormControl>
  </VStack>
);

export default PolicyForm;
