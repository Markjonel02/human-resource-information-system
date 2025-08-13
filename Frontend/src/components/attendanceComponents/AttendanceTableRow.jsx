// components/AttendanceTableRow.jsx
import React from "react";
import {
  Tr,
  Td,
  Text,
  HStack,
  Tag,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { CalendarIcon, TimeIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  getStatusColorScheme,
  formatDate,
  calculateHoursRendered,
  getTardiness,
} from "../../uitls/attendanceUtils";

const AttendanceTableRow = ({ record, onEdit, onView, onDelete }) => {
  return (
    <Tr key={record._id}>
      <Td px={4} py={4} whiteSpace="nowrap">
        <Text fontSize="sm" fontWeight="medium" color="gray.900">
          {record.employee?.firstname} {record.employee?.lastname}
        </Text>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{
          base: "none",
          md: "none",
          lg: "none",
          xl: "table-cell",
        }}
      >
        <HStack spacing={1} display="inline-flex" alignItems="center">
          <CalendarIcon w={3} h={3} color="gray.500" />
          <Text fontSize="sm" color="gray.900">
            {formatDate(record.date)}
          </Text>
        </HStack>
      </Td>
      <Td px={4} py={4} whiteSpace="nowrap">
        <Tag
          size="md"
          variant="subtle"
          colorScheme={getStatusColorScheme(record.status)}
        >
          {record.status}
        </Tag>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{
          base: "none",
          md: "none",
          lg: "none",
          xl: "table-cell",
        }}
      >
        <HStack spacing={1} display="inline-flex" alignItems="center">
          <TimeIcon w={3} h={3} color="gray.500" />
          <Text fontSize="sm" color="gray.900">
            {record.checkIn}
          </Text>
        </HStack>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{
          base: "none",
          md: "none",
          lg: "none",
          xl: "table-cell",
        }}
      >
        <HStack spacing={1} display="inline-flex" alignItems="center">
          <TimeIcon w={3} h={3} color="gray.500" />
          <Text fontSize="sm" color="gray.900">
            {record.checkOut}
          </Text>
        </HStack>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{ base: "none", lg: "table-cell" }}
      >
        <Text fontSize="sm" color="gray.900">
          {calculateHoursRendered(record.checkIn, record.checkOut)}
        </Text>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{ base: "none", lg: "table-cell" }}
      >
        <Text fontSize="sm" color="gray.900">
          {getTardiness(record)}
        </Text>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        display={{ base: "none", lg: "table-cell" }}
      >
        <Text fontSize="sm" color="gray.900">
          {record.leaveType || "-"}
        </Text>
      </Td>
      <Td
        px={4}
        py={4}
        whiteSpace="nowrap"
        textAlign="right"
        fontSize="sm"
        fontWeight="medium"
      >
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<ChevronDownIcon />}
            variant="ghost"
            colorScheme="gray"
          />
          <MenuList>
            <MenuItem onClick={() => onEdit(record)}>Edit Record</MenuItem>
            <MenuItem onClick={() => onView(record)}>View Details</MenuItem>
            <MenuItem onClick={() => onDelete(record._id)}>
              Delete Record
            </MenuItem>
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export default AttendanceTableRow;
