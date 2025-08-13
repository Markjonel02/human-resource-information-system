// utils/attendanceUtils.js
export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || timeStr === "-") return null;
  const [time, period] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }
  return hours * 60 + minutes;
};

export const calculateHoursRendered = (checkIn, checkOut) => {
  if (checkIn === "-" || checkOut === "-") return "-";

  const checkInMinutes = parseTimeToMinutes(checkIn);
  const checkOutMinutes = parseTimeToMinutes(checkOut);

  if (
    checkInMinutes === null ||
    checkOutMinutes === null ||
    checkOutMinutes < checkInMinutes
  ) {
    return "-";
  }

  const totalMinutes = checkOutMinutes - checkInMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

export const getTardiness = (record) => {
  if (record.status === "Late" && record.checkIn) {
    const checkInMinutes = parseTimeToMinutes(record.checkIn);
    const scheduledCheckInMinutes = 9 * 60; // 9:00 AM in minutes
    if (checkInMinutes !== null) {
      const lateMinutes = checkInMinutes - scheduledCheckInMinutes;
      if (lateMinutes > 0) {
        return `${lateMinutes} min late`;
      }
    }
  }
  return "-";
};

export const getStatusColorScheme = (status) => {
  const colorMap = {
    Present: "green",
    Absent: "red",
    Late: "orange",
    Leave: "blue",
  };
  return colorMap[status] || "gray";
};

export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
};
