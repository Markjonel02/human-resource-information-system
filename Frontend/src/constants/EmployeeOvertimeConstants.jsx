import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

export const OVERTIME_TYPES = [
  { value: "regular", label: "Regular Overtime" },
  { value: "holiday", label: "Holiday Overtime" },
  { value: "weekend", label: "Weekend Overtime" },
  { value: "other", label: "Other" },
];

export const STATUS_COLORS = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

export const STATUS_ICONS = {
  pending: FiAlertCircle,
  approved: FiCheckCircle,
  rejected: FiXCircle,
};
