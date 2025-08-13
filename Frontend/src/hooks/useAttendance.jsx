// hooks/useAttendance.js
import { useState, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import axiosInstance from "../lib/axiosInstance";

export const useAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const fetchAttendance = useCallback(async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axiosInstance.get("/get-attendance", { params });
      setAttendanceRecords(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch attendance data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAttendanceRecord = useCallback(
    async (id, updatedRecord) => {
      try {
        setIsLoading(true);
        const response = await axiosInstance.put(
          `/update-attendance/${id}`,
          updatedRecord
        );
        setAttendanceRecords((prev) =>
          prev.map((rec) => (rec._id === id ? response.data : rec))
        );
        toast({
          title: "Record updated",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        return response.data;
      } catch (err) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to update record",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const deleteAttendanceRecord = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        await axiosInstance.delete(`/delete-attendance/${id}`);
        setAttendanceRecords((prev) => prev.filter((rec) => rec._id !== id));
        toast({
          title: "Record deleted",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: err.response?.data?.message || "Failed to delete record",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  return {
    attendanceRecords,
    isLoading,
    error,
    fetchAttendance,
    updateAttendanceRecord,
    deleteAttendanceRecord,
  };
};
