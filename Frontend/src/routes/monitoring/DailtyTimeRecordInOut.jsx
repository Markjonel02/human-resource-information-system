import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Text,
  Badge,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axiosInstance from "../../lib/axiosInstance.jsx";

const RawTimeTable = ({ year, month }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch raw logs on load or when year/month changes
  useEffect(() => {
    const fetchRawLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get("/Dtr/my-rawtime", {
          params: { year, month },
        });

        if (res.data?.success) {
          setRecords(res.data.data || []);
        } else {
          setError("Failed to load raw logs.");
        }
      } catch (e) {
        console.error("Raw Time Fetch Error:", e);
        setError(e.response?.data?.message || "Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchRawLogs();
  }, [year, month]);

  return (
    <Box mt={6}>
      <Text fontSize="xl" fontWeight="bold" ml={3} mb={3}>
        Raw Time Logs
      </Text>

      {loading ? (
        <Center py={10}>
          <Spinner size="lg" />
        </Center>
      ) : error ? (
        <Center py={10}>
          <Text color="red.500">{error}</Text>
        </Center>
      ) : (
        <TableContainer
          borderRadius="md"
          boxShadow="sm"
          border="1px solid #e2e8f0"
        >
          <Table variant="simple" size="md">
            <Thead bg="gray.100">
              <Tr>
                <Th textAlign="center">Date</Th>
                <Th textAlign="center">Raw IN</Th>
                <Th textAlign="center">Raw OUT</Th>
              </Tr>
            </Thead>

            <Tbody>
              {records.length === 0 ? (
                <Tr>
                  <Td colSpan={3} textAlign="center" py={6} color="gray.500">
                    No raw logs found.
                  </Td>
                </Tr>
              ) : (
                records.map((item, i) => (
                  <Tr key={i}>
                    <Td textAlign="center" fontWeight="medium">
                      {item.date}
                    </Td>

                    <Td textAlign="center">
                      {item.rawIn ? (
                        <Badge colorScheme="green" px={3} py={1}>
                          {item.rawIn}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </Td>

                    <Td textAlign="center">
                      {item.rawOut ? (
                        <Badge colorScheme="red" px={3} py={1}>
                          {item.rawOut}
                        </Badge>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RawTimeTable;
