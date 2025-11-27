// components/EmployeeTable.js
import React from "react";
import {
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
  HStack,
  Tooltip,
  Flex,
} from "@chakra-ui/react";
import { FiMoreVertical } from "react-icons/fi";

const EmployeeTable = ({
  employees,
  selectedIds,
  allChecked,
  isMobile,
  onCheckboxChange,
  onSelectAll,
  onViewEmployee,
  onEditEmployee,
  onDeactivateEmployee,
}) => {
  return (
    <Table variant="simple">
      <Thead bg="gray.100">
        <Tr>
          <Th>
            <Checkbox
              isChecked={allChecked}
              onChange={onSelectAll}
              isIndeterminate={
                selectedIds.length > 0 && selectedIds.length < employees.length
              }
            />
          </Th>
          <Th>Employee</Th>
          <Th display={{ base: "none", xl: "table-cell" }}>Email</Th>
          <Th
            display={{ base: "none", md: "none", lg: "none", xl: "table-cell" }}
          >
            Department
          </Th>
          <Th display={{ base: "none", md: "table-cell", lg: "table-cell" }}>
            Role
          </Th>
          <Th display={{ base: "table-cell", md: "none", lg: "table-cell" }}>
            Status
          </Th>
          <Th>Actions</Th>
        </Tr>
      </Thead>
      <Tbody>
        {employees.map((employee) => (
          <Tr key={employee.id}>
            <Td>
              <Checkbox
                isChecked={selectedIds.includes(employee.id)}
                onChange={() => onCheckboxChange(employee.id)}
              />
            </Td>
            <Td>
              <HStack spacing={3}>
                <Avatar size="sm" src={employee.avatar} name={employee.name} />
                <Tooltip label={employee.name}>
                  <Text>
                    {isMobile && employee.name.length > 15
                      ? `${employee.name.slice(0, 15)}...`
                      : employee.name}
                  </Text>
                </Tooltip>
              </HStack>
            </Td>
            <Td display={{ base: "none", xl: "table-cell" }}>
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
            <Td display={{ base: "none", md: "table-cell", lg: "table-cell" }}>
              {employee.role}
            </Td>
            <Td display={{ base: "table-cell", md: "none", lg: "table-cell" }}>
              <Tag
                size="sm"
                variant="subtle"
                colorScheme={employee.status === "Active" ? "green" : "red"}
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
                  <MenuItem onClick={() => onViewEmployee(employee)}>
                    View
                  </MenuItem>
                  <MenuItem onClick={() => onEditEmployee(employee)}>
                    Edit
                  </MenuItem>
                  <MenuItem onClick={() => onDeactivateEmployee(employee)}>
                    Deactivate
                  </MenuItem>
                </MenuList>
              </Menu>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default EmployeeTable;
