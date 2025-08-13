// hooks/useAttendanceFilters.js
import { useState, useMemo } from "react";

export const useAttendanceFilters = (attendanceRecords) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth() + 1;
      const recordYear = recordDate.getFullYear();

      const matchesSearch =
        `${record.employee?.firstname} ${record.employee?.lastname}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        record.status.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesMonth =
        !selectedMonth ||
        String(recordMonth).padStart(2, "0") === selectedMonth;
      const matchesYear = !selectedYear || String(recordYear) === selectedYear;

      return matchesSearch && matchesMonth && matchesYear;
    });
  }, [searchTerm, selectedMonth, selectedYear, attendanceRecords]);

  return {
    searchTerm,
    setSearchTerm,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    filteredAttendance,
  };
};
