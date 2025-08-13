// hooks/useAttendanceStats.js
import { useMemo } from "react";
import { parseTimeToMinutes } from "../uitls/attendanceUtils";

export const useAttendanceStats = (filteredAttendance) => {
  return useMemo(() => {
    let totalMinLate = 0;
    let numLate = 0;
    let numAbsent = 0;
    const leaveCounts = { VL: 0, SL: 0, LWOP: 0, BL: 0, OS: 0, CL: 0 };

    filteredAttendance.forEach((record) => {
      if (record.status === "Late" && record.checkIn) {
        const checkInMinutes = parseTimeToMinutes(record.checkIn);
        const scheduledCheckInMinutes = 9 * 60;
        if (checkInMinutes !== null) {
          const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
          if (lateMinutes > 0) {
            totalMinLate += lateMinutes;
            numLate++;
          }
        }
      } else if (record.status === "Absent") {
        numAbsent++;
      } else if (record.status === "Leave" && record.leaveType) {
        if (leaveCounts.hasOwnProperty(record.leaveType)) {
          leaveCounts[record.leaveType]++;
        }
      }
    });

    return { totalMinLate, numLate, numAbsent, leaveCounts };
  }, [filteredAttendance]);
};

// hooks/useDebounce.js
import { useState, useEffect } from "react";

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
