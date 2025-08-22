// components/EditRecordModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
} from "@chakra-ui/react";
import {
  LEAVE_TYPES,
  STATUS_OPTIONS,
} from "../../constants/attendanceConstants";
import { formatDate } from "../../uitls/attendanceUtils";

const EditRecordModal = ({ isOpen, onClose, record, onSave, isLoading }) => {
  const [editingRecord, setEditingRecord] = useState(null);

  useEffect(() => {
    if (record) {
      setEditingRecord({ ...record });
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingRecord((prev) => {
      const updatedRecord = { ...prev, [name]: value };

      if (name === "status") {
        if (value === "Absent" || value === "Leave") {
          updatedRecord.checkIn = "-";
          updatedRecord.checkOut = "-";
        } else if (prev.status === "Absent" || prev.status === "Leave") {
          updatedRecord.checkIn = "09:00 AM";
          updatedRecord.checkOut = "05:00 PM";
        }
      }
      if (name === "status" && value !== "Leave") {
        updatedRecord.leaveType = null;
      }

      return updatedRecord;
    });
  };

  const handleSave = () => {
    if (editingRecord) {
      onSave(editingRecord);
    }
  };

  if (!editingRecord) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Attendance Record</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Employee Name</FormLabel>
              <Input
                value={`${editingRecord.employee?.firstname} ${editingRecord.employee?.lastname}`}
                isReadOnly
              />
            </FormControl>
            <FormControl>
              <FormLabel>Date</FormLabel>
              <Input value={formatDate(editingRecord.date)} isReadOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Status</FormLabel>
              <Select
                name="status"
                value={editingRecord.status}
                onChange={handleChange}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            {(editingRecord.status === "Present" ||
              editingRecord.status === "Late") && (
              <>
                <FormControl>
                  <FormLabel>Check-in</FormLabel>
                  <Input
                    type="time"
                    name="checkIn"
                    value={
                      editingRecord.checkIn === "-" ? "" : editingRecord.checkIn
                    }
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Check-out</FormLabel>
                  <Input
                    type="time"
                    name="checkOut"
                    value={
                      editingRecord.checkOut === "-"
                        ? ""
                        : editingRecord.checkOut
                    }
                    onChange={handleChange}
                  />
                </FormControl>
              </>
            )}

            {editingRecord.status === "Leave" && (
              <>
                <FormControl>
                  <FormLabel>Leave Type</FormLabel>
                  <Select
                    name="leaveType"
                    value={editingRecord.leaveType || ""}
                    onChange={handleChange}
                    placeholder="Select Leave Type"
                  >
                    {LEAVE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Leave Date From</FormLabel>
                  <Input
                    type="date"
                    name="dateFrom"
                    value={
                      editingRecord.dateFrom
                        ? editingRecord.dateFrom.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Leave Date To</FormLabel>
                  <Input
                    type="date"
                    name="dateTo"
                    value={
                      editingRecord.dateTo
                        ? editingRecord.dateTo.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                  />
                </FormControl>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            ml={3}
            onClick={handleSave}
            isLoading={isLoading}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditRecordModal;
