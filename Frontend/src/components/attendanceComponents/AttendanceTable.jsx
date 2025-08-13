// components/AttendanceTable.jsx
import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th } from "@chakra-ui/react";
import AttendanceTableRow from "./AttendanceTableRow";

const AttendanceTable = ({ filteredAttendance, onEdit, onView, onDelete }) => {
  return (
    <Box bg="white" borderRadius="lg" shadow="md" overflowX="auto">
      <Table variant="simple" minW="full" borderCollapse="collapse">
        <Thead bg="gray.50">
          <Tr>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Employee Name
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{
                base: "none",
                md: "none",
                lg: "none",
                xl: "table-cell",
              }}
            >
              Date
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Status
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{
                base: "none",
                md: "none",
                lg: "none",
                xl: "table-cell",
              }}
            >
              Check-in
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{
                base: "none",
                md: "none",
                lg: "none",
                xl: "table-cell",
              }}
            >
              Check-out
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{ base: "none", lg: "table-cell" }}
            >
              Hours Rendered
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{ base: "none", lg: "table-cell" }}
            >
              Tardiness
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
              display={{ base: "none", lg: "table-cell" }}
            >
              Leave Type
            </Th>
            <Th
              py={3}
              px={4}
              textAlign="left"
              fontSize="xs"
              fontWeight="medium"
              color="gray.500"
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Actions
            </Th>
          </Tr>
        </Thead>
        <Tbody bg="white" borderBottomWidth="1px" borderColor="gray.200">
          {filteredAttendance.map((record) => (
            <AttendanceTableRow
              key={record._id}
              record={record}
              onEdit={onEdit}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AttendanceTable;
