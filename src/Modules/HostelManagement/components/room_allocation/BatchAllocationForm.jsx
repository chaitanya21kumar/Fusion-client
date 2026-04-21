/**
 * BatchAllocationForm - Micro Component
 * Form for batch allocating rooms to multiple students by academic batch
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
  Textarea,
  NumberInput,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

export default function BatchAllocationForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
  batches = [],
  halls = [],
}) {
  const form = useForm({
    initialValues: {
      academic_batch: "",
      hall_id: "",
      allocation_date: new Date(),
      notes: "",
      start_room_number: 1,
    },
    validate: {
      academic_batch: (value) => (value ? null : "Academic batch is required"),
      hall_id: (value) => (value ? null : "Hall is required"),
      allocation_date: (value) =>
        value ? null : "Allocation date is required",
      start_room_number: (value) =>
        value && value > 0 ? null : "Start room number must be greater than 0",
    },
  });

  const handleSubmit = async (values) => {
    try {
      const selectedBatch = batches.find(
        (b) => String(b.id) === values.academic_batch,
      );
      if (!selectedBatch) {
        throw new Error("Selected batch not found");
      }

      // Map batch info to foundational backend logic parameters
      const allocationData = {
        programme_category: selectedBatch.programme_level || "UG",
        admission_year: selectedBatch.year || new Date().getFullYear(),
        gender: selectedBatch.gender || "M", // Fallback to M if not specified
        notes: values.notes,
        allocation_date: values.allocation_date,
      };

      await onSubmit(allocationData, values.hall_id);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };
  // Format batch options with programme, discipline, year, student count, and gender
  const batchOptions = Array.isArray(batches)
    ? batches
        .filter((b) => b && b.id)
        .map((batch) => {
          const discipline =
            batch.discipline || batch.discipline_name || "Unknown";
          const year = batch.year || "Unknown";
          const studentCount = batch.student_count || batch.filled_seats || 0;
          const level = batch.programme_level || "UG";
          const programme = batch.name || "Programme"; // Infer gender from batch information
          let gender = "All";
          if (batch.gender) {
            gender =
              batch.gender === "M"
                ? "Male"
                : batch.gender === "F"
                  ? "Female"
                  : "All";
          }

          return {
            value: String(batch.id),
            label: `${String(programme)} - ${String(discipline)} ${String(year)} ${String(level)} ${String(gender)} (${studentCount} students)`,
          };
        })
    : [];
  const hallOptions = Array.isArray(halls)
    ? halls
        .filter((h) => h && h.id)
        .map((hall) => ({
          value: String(hall.id),
          label: `${String(hall.hall_name || hall.name || "Unknown Hall")} (Max: ${hall.max_accomodation || 0})`,
        }))
    : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Batch Allocate Rooms"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle />}
            color="orange"
            title="Batch Allocation"
          >
            <Text size="sm">
              Allocate rooms to all students from a specific academic batch in a
              selected hall. The system will automatically assign available
              rooms sequentially. Make sure there are enough available rooms
              before proceeding.
            </Text>
          </Alert>

          <Select
            label="Select Academic Batch"
            placeholder="Choose a batch"
            searchable
            data={batchOptions}
            value={form.values.academic_batch}
            onChange={(value) =>
              form.setFieldValue("academic_batch", value || "")
            }
            error={form.errors.academic_batch}
            description="Students from this batch will be allocated rooms. Shows: Programme - Discipline Year Level Gender (Count)"
          />

          <Select
            label="Select Hall"
            placeholder="Choose a hall"
            searchable
            data={hallOptions}
            value={form.values.hall_id}
            onChange={(value) => form.setFieldValue("hall_id", value || "")}
            error={form.errors.hall_id}
            description="Rooms will be allocated from this hall"
          />

          <NumberInput
            label="Start Room Number"
            placeholder="Starting room number for allocation"
            min={1}
            value={form.values.start_room_number}
            onChange={(value) =>
              form.setFieldValue("start_room_number", value || 1)
            }
            error={form.errors.start_room_number}
            description="Allocation will start from this room and proceed sequentially"
          />

          <DatePickerInput
            label="Allocation Date"
            placeholder="Select allocation date"
            minDate={new Date()}
            value={form.values.allocation_date}
            onChange={(value) => form.setFieldValue("allocation_date", value)}
            error={form.errors.allocation_date}
          />

          <Textarea
            label="Notes"
            placeholder="Add any notes about this batch allocation (optional)"
            minRows={2}
            value={form.values.notes}
            onChange={(value) => form.setFieldValue("notes", value)}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="orange">
              Allocate Batch
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

BatchAllocationForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  batches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      discipline: PropTypes.string,
      year: PropTypes.number,
      student_count: PropTypes.number,
      programme_level: PropTypes.string,
      gender: PropTypes.string,
    }),
  ),
  halls: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      hall_name: PropTypes.string.isRequired,
      max_accomodation: PropTypes.number.isRequired,
    }),
  ),
};
