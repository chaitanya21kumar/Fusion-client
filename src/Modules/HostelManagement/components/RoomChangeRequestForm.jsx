/**
 * RoomChangeRequestForm - Micro Component
 * Form for submitting room change requests
 * Dumb component - receives data and callbacks from parent
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  Select,
  Textarea,
  Stack,
  Text,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

export default function RoomChangeRequestForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
  availableRooms = [],
  currentRoom = null,
}) {
  const form = useForm({
    initialValues: {
      requested_room: "",
      reason: "",
    },
    validate: {
      requested_room: (value) => (value ? null : "Room is required"),
      reason: (value) =>
        value && value.length >= 10
          ? null
          : "Reason must be at least 10 characters",
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
  const hallRooms = Array.isArray(availableRooms)
    ? [...availableRooms].sort((a, b) => {
        // Extract numeric part from room number for proper numerical sorting
        const numA = parseInt(a.number?.match(/\d+/)?.[0] || 0, 10);
        const numB = parseInt(b.number?.match(/\d+/)?.[0] || 0, 10);
        return numA - numB;
      })
    : [];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Request Room Change"
      size="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {currentRoom && (
            <Alert icon={<IconAlertCircle />} color="blue" title="Current Room">
              <Text size="sm">
                {currentRoom.hall?.name} - Room {currentRoom.number}
              </Text>
            </Alert>
          )}

          <Select
            label="New Room"
            placeholder="Select a room in your current hall"
            data={
              Array.isArray(hallRooms)
                ? hallRooms
                    .filter((r) => r && r.id && r.number)
                    .map((r) => ({
                      value: String(r.id),
                      label: `Room ${String(r.number || "?")} (${String(r.current_occupancy || 0)}/${String(r.capacity || "?")})`,
                    }))
                : []
            }
            searchable
            disabled={hallRooms.length === 0}
            value={form.values.requested_room}
            onChange={(value) => form.setFieldValue("requested_room", value)}
            error={form.errors.requested_room}
          />
          {hallRooms.length === 0 && (
            <Alert
              icon={<IconAlertCircle />}
              color="yellow"
              title="No Rooms Available"
            >
              <Text size="sm">
                No available alternative rooms found in your current hall.
                Please contact the caretaker.
              </Text>
            </Alert>
          )}
          <Textarea
            label="Reason for Change"
            placeholder="Explain why you need to change rooms"
            minRows={3}
            value={form.values.reason}
            onChange={(e) =>
              form.setFieldValue("reason", e.currentTarget.value)
            }
            error={form.errors.reason}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

RoomChangeRequestForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  availableRooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      number: PropTypes.string.isRequired,
      hall: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        name: PropTypes.string.isRequired,
      }),
      current_occupancy: PropTypes.number,
      capacity: PropTypes.number,
    }),
  ),
  currentRoom: PropTypes.shape({
    hall: PropTypes.shape({
      name: PropTypes.string,
    }),
    number: PropTypes.string,
  }),
};
