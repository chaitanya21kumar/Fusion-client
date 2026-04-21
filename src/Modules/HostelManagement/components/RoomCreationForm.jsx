/**
 * RoomCreationForm - Micro Component
 * Form for creating new rooms in a hall
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
  TextInput,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";
import "@mantine/core/styles.css";

export default function RoomCreationForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
  halls = [],
}) {
  const form = useForm({
    initialValues: {
      hall_id: "",
      room_number: "",
      block_number: "",
      room_type: "single",
      capacity: 1,
    },
    validate: {
      hall_id: (value) => (value ? null : "Hall is required"),
      room_number: (value) =>
        value && value.length <= 20
          ? null
          : "Room number must be between 1 and 20 characters",
      block_number: (value) =>
        value && value.length <= 10
          ? null
          : "Block number must be between 1 and 10 characters",
      capacity: (value) =>
        value && value > 0 ? null : "Capacity must be greater than 0",
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
  const hallOptions = Array.isArray(halls)
    ? halls
        .filter((h) => h && h.id)
        .map((hall) => ({
          value: String(hall.id),
          label: `${String(hall.hall_name || hall.name || "Unknown")} (${String(hall.hall_id || "N/A")})`,
        }))
    : [];

  const roomTypeOptions = [
    { value: "single", label: "Single" },
    { value: "double", label: "Double" },
    { value: "triple", label: "Triple" },
    { value: "four-seater", label: "Four-Seater" },
    { value: "other", label: "Other" },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Create New Room"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert icon={<IconAlertCircle />} color="blue" title="Room Creation">
            <Text size="sm">
              Create a new hostel room. Specify the hall, room details, and
              capacity.
            </Text>
          </Alert>

          <Select
            label="Select Hall"
            placeholder="Choose a hall"
            searchable
            data={hallOptions}
            value={form.values.hall_id}
            onChange={(value) => form.setFieldValue("hall_id", value || "")}
            error={form.errors.hall_id}
          />

          <TextInput
            label="Room Number"
            placeholder="e.g., 101, A201, etc."
            value={form.values.room_number}
            onChange={(e) =>
              form.setFieldValue("room_number", e.currentTarget.value)
            }
            error={form.errors.room_number}
          />

          <TextInput
            label="Block Number"
            placeholder="e.g., A, B, Wing-1, etc."
            value={form.values.block_number}
            onChange={(e) =>
              form.setFieldValue("block_number", e.currentTarget.value)
            }
            error={form.errors.block_number}
          />

          <Select
            label="Room Type"
            placeholder="Select room type"
            data={roomTypeOptions}
            value={form.values.room_type}
            onChange={(value) =>
              form.setFieldValue("room_type", value || "single")
            }
          />

          <NumberInput
            label="Room Capacity"
            placeholder="Number of students"
            min={1}
            max={10}
            value={form.values.capacity}
            onChange={(value) => form.setFieldValue("capacity", value || 1)}
            error={form.errors.capacity}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Room
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

RoomCreationForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  halls: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      hall_name: PropTypes.string.isRequired,
      hall_id: PropTypes.string.isRequired,
    }),
  ),
};
