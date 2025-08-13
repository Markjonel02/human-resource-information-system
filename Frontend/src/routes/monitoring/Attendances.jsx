// Main component: Attendances.jsx
import React, { useEffect, useState, useCallback } from "react";
import { Box, Alert, AlertIcon, useDisclosure } from "@chakra-ui/react";
import LoadingSpinner from "../../components/attendanceComponents/LoadSpinners";
import AttendanceHeader from "../../components/attendanceComponents/AttendanceHeader";
import AttendanceStats from "../../components/attendanceComponents/AttendanceStats";
import AttendanceTable from "../../components/attendanceComponents/AttendanceTable";
import EmployeeDetailsDrawer from "../../components/attendanceComponents/EmployeeDetailsDrawer";
import EditRecordModal from "../../components/attendanceComponents/EditRecordModal";
import { useAttendance } from "../../hooks/useAttendance";
import { useAttendanceFilters } from "../../hooks/useAttendanceFilters";
import { useAttendanceStats } from "../../hooks/useAttendanceStats";
import useDebounce from "../../hooks/useDebounce";
const Attendances = () => {
  const {
    attendanceRecords,
    isLoading,
    error,
    fetchAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  } = useAttendance();

  const {
    searchTerm,
    setSearchTerm,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    filteredAttendance,
  } = useAttendanceFilters(attendanceRecords);

  // Debounce search term to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const stats = useAttendanceStats(filteredAttendance);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();

  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  // Fetch attendance data when filters change
  useEffect(() => {
    const params = {
      month: selectedMonth,
      year: selectedYear,
      status: debouncedSearchTerm.match(/present|absent|late|leave/i)?.[0],
      employee: debouncedSearchTerm,
    };
    fetchAttendance(params);
  }, [debouncedSearchTerm, selectedMonth, selectedYear, fetchAttendance]);

  const handleViewDetails = useCallback(
    (employee) => {
      setSelectedEmployee(employee);
      onDrawerOpen();
    },
    [onDrawerOpen]
  );

  const handleEditRecord = useCallback(
    (record) => {
      setEditingRecord(record);
      onModalOpen();
    },
    [onModalOpen]
  );

  const handleSaveRecord = useCallback(
    async (updatedRecord) => {
      try {
        await updateAttendanceRecord(updatedRecord._id, updatedRecord);
        onModalClose();
        setEditingRecord(null);
      } catch (error) {
        console.error("Failed to update record:", error);
      }
    },
    [updateAttendanceRecord, onModalClose]
  );

  const handleDeleteRecord = useCallback(
    async (id) => {
      if (window.confirm("Are you sure you want to delete this record?")) {
        try {
          await deleteAttendanceRecord(id);
        } catch (error) {
          console.error("Failed to delete record:", error);
        }
      }
    },
    [deleteAttendanceRecord]
  );

  return (
    <Box
      minH="100vh"
      p={{ base: 4, sm: 6, lg: 8 }}
      bg="gray.50"
      fontFamily="sans-serif"
    >
      {isLoading && <LoadingSpinner />}

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <AttendanceHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
      />

      <AttendanceStats stats={stats} />

      <AttendanceTable
        filteredAttendance={filteredAttendance}
        onEdit={handleEditRecord}
        onView={handleViewDetails}
        onDelete={handleDeleteRecord}
      />

      <EmployeeDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        selectedEmployee={selectedEmployee}z
      />

      <EditRecordModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        record={editingRecord}
        onSave={handleSaveRecord}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Attendances;
