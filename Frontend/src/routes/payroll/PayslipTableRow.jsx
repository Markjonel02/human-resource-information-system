import React from "react";
import {
  Tr,
  Td,
  VStack,
  Text,
  Badge,
  Icon,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react";
import {
  ViewIcon,
  DownloadIcon,
  EditIcon,
  CheckIcon,
  DeleteIcon,
} from "@chakra-ui/icons";
import { BsThreeDotsVertical } from "react-icons/bs";

const PayslipTableRow = ({
  payslip,
  isSelected,
  onSelect,
  onView,
  onDownload,
  onEdit,
  onApprove,
  onDelete,
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusIcon,
}) => {
  return (
    <Tr _hover={{ bg: "gray.50" }}>
      <Td>
        <Checkbox
          isChecked={isSelected}
          onChange={(e) => onSelect(payslip._id, e.target.checked)}
          colorScheme="purple"
        />
      </Td>
      <Td>
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold">
            {payslip.employeeInfo?.firstname} {payslip.employeeInfo?.lastname}
          </Text>
          <Text fontSize="xs" color="gray.500">
            {payslip.employeeInfo?.employeeId}
          </Text>
        </VStack>
      </Td>
      <Td fontSize="sm">
        {payslip.payrollPeriod?.startDate &&
          formatDate(payslip.payrollPeriod.startDate)}{" "}
        -
        {payslip.payrollPeriod?.endDate &&
          formatDate(payslip.payrollPeriod.endDate)}
      </Td>
      <Td>{payslip.paymentDate && formatDate(payslip.paymentDate)}</Td>
      <Td isNumeric fontWeight="bold" color="green.600" fontSize="md">
        {formatCurrency(payslip.summary?.netPayThisPay)}
      </Td>
      <Td>
        <Badge
          colorScheme={getStatusColor(payslip.status)}
          px={3}
          py={1}
          borderRadius="full"
          display="flex"
          alignItems="center"
          gap={2}
          w="fit-content"
        >
          <Icon as={getStatusIcon(payslip.status)} />
          {payslip.status?.toUpperCase()}
        </Badge>
      </Td>
      <Td>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<BsThreeDotsVertical />}
            variant="ghost"
            size="sm"
            aria-label="Actions"
          />
          <MenuList>
            <MenuItem icon={<ViewIcon />} onClick={() => onView(payslip._id)}>
              View PDF
            </MenuItem>
            <MenuItem
              icon={<DownloadIcon />}
              onClick={() =>
                onDownload(payslip._id, payslip.employeeInfo?.lastname)
              }
            >
              Download PDF
            </MenuItem>
            <MenuItem icon={<EditIcon />} onClick={() => onEdit(payslip._id)}>
              Edit Payslip
            </MenuItem>
            {(payslip.status === "draft" || payslip.status === "pending") && (
              <MenuItem
                icon={<CheckIcon />}
                color="green.600"
                onClick={() => onApprove(payslip._id)}
              >
                Approve
              </MenuItem>
            )}
            {payslip.status !== "paid" && payslip.status !== "processed" && (
              <MenuItem
                icon={<DeleteIcon />}
                color="red.600"
                onClick={() => onDelete(payslip._id)}
              >
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      </Td>
    </Tr>
  );
};

export default PayslipTableRow;
