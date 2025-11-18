import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Checkbox,
  HStack,
  Button,
  Text,
  Flex,
  IconButton,
} from "@chakra-ui/react";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import PayslipTableRow from "./PayslipTableRow";

const PayslipTable = ({
  payslips,
  selectedPayslips,
  onSelectAll,
  onSelectPayslip,
  onBulkApprove,
  onView,
  onDownload,
  onEdit,
  onApprove,
  onDelete,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const allSelected =
    payslips.length > 0 && selectedPayslips.length === payslips.length;
  const someSelected =
    selectedPayslips.length > 0 && selectedPayslips.length < payslips.length;

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedPayslips.length > 0 && (
        <Box bg="purple.50" p={4} borderRadius="lg" mb={4}>
          <HStack justify="space-between">
            <Text fontWeight="bold" color="purple.900">
              {selectedPayslips.length} payslip(s) selected
            </Text>
            <Button
              leftIcon={<CheckIcon />}
              colorScheme="green"
              size="sm"
              onClick={onBulkApprove}
            >
              Approve Selected
            </Button>
          </HStack>
        </Box>
      )}

      <Box overflowX="auto" minH={300}>
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th width="50px">
                <Checkbox
                  isChecked={allSelected}
                  isIndeterminate={someSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  colorScheme="purple"
                />
              </Th>
              <Th>Employee</Th>
              <Th>Period</Th>
              <Th>Payment Date</Th>
              <Th isNumeric>Net Pay</Th>
              <Th>Status</Th>
              <Th textAlign="center">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {payslips.map((payslip) => (
              <PayslipTableRow
                key={payslip._id}
                payslip={payslip}
                isSelected={selectedPayslips.includes(payslip._id)}
                onSelect={onSelectPayslip}
                onView={onView}
                onDownload={onDownload}
                onEdit={onEdit}
                onApprove={onApprove}
                onDelete={onDelete}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Pagination */}
      <Box bg="gray.50" px={6} py={4} borderTopWidth="1px">
        <Flex justify="space-between" align="center">
          <Text fontSize="sm" color="gray.700">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<ChevronLeftIcon />}
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              isDisabled={currentPage === 1}
              aria-label="Previous page"
            />
            <IconButton
              icon={<ChevronRightIcon />}
              size="sm"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              isDisabled={currentPage === totalPages}
              aria-label="Next page"
            />
          </HStack>
        </Flex>
      </Box>
    </>
  );
};

export default PayslipTable;
