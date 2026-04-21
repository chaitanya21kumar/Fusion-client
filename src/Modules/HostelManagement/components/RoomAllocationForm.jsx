/**
 * RoomAllocationForm - Micro Component
 * Form for allocating individual rooms to students
 * Dumb component - receives data and callbacks from parent
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Select,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

export default function RoomAllocationForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
  students = [],
  rooms = [],
}) {
  const form = useForm({
    initialValues: {
      student_id: "",
      room_id: "",
      allocation_date: new Date(),
    },
    validate: {
      student_id: (value) => (value ? null : "Student is required"),
      room_id: (value) => (value ? null : "Room is required"),
      allocation_date: (value) =>
        value ? null : "Allocation date is required",
    },
  });

  const handleSubmit = async (values) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  const studentOptions = Array.isArray(students)
    ? students
        .filter((s) => s && s.id)
        .map((student) => ({
          value: String(student.id),
          label: `${String(student.username || student.name || "Unknown")} (${String(student.roll_no || "N/A")})`,
        }))
    : [];

  const roomOptions = Array.isArray(rooms)
    ? rooms
        .filter((r) => r && r.id)
        .map((room) => ({
          value: String(room.id),
          label: `Room ${String(room.room_number || "?")} - Block ${String(room.block_number || "?")} (Capacity: ${room.capacity || 1})`,
        }))
    : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Allocate Room to Student"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle />}
            color="blue"
            title="Individual Room Allocation"
          >
            <Text size="sm">
              Allocate a specific room to a single student. For batch allocation
              to multiple students, use the Batch Allocation feature.
            </Text>
          </Alert>

          <Select
            label="Select Student"
            placeholder="Choose a student"
            searchable
            clearable
            data={studentOptions}
            value={form.values.student_id}
            onChange={(value) => form.setFieldValue("student_id", value || "")}
            error={form.errors.student_id}
          />

          <Select
            label="Select Room"
            placeholder="Choose a room"
            searchable
            clearable
            data={roomOptions}
            value={form.values.room_id}
            onChange={(value) => form.setFieldValue("room_id", value || "")}
            error={form.errors.room_id}
          />

          <DatePickerInput
            label="Allocation Date"
            placeholder="Select allocation date"
            minDate={new Date()}
            value={form.values.allocation_date}
            onChange={(value) => form.setFieldValue("allocation_date", value)}
            error={form.errors.allocation_date}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Allocate Room
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

RoomAllocationForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      roll_no: PropTypes.string,
    }),
  ),
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      room_number: PropTypes.string.isRequired,
      block_number: PropTypes.string.isRequired,
      capacity: PropTypes.number.isRequired,
    }),
  ),
};
