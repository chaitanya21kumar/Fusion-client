import React, { useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Group,
  Text,
  Select,
  TextInput,
  Card,
} from "@mantine/core";
import { IconUserCheck, IconArrowRight } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { checkInGuest } from "../../api";

export default function GuestCheckInModal({
  opened,
  onClose,
  booking,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id_proof_type: "aadhar",
    id_proof_number: "",
  });

  const handleCheckIn = async () => {
    if (!formData.id_proof_number) {
      notifications.show({
        title: "Validation Error",
        message: "ID Proof Number is required",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      await checkInGuest(booking.id, formData);
      notifications.show({
        title: "Success",
        message: `Guest ${booking.guest_name} checked in successfully.`,
        color: "green",
      });
      onSuccess();
      onClose();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to check in guest",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconUserCheck size={20} />
          <Text fw={600}>Guest Check-In</Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        <Card withBorder p="sm" bg="blue.0">
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="xs" color="dimmed">
                Guest Name
              </Text>
              <Text size="sm" fw={500}>
                {booking.guest_name}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="xs" color="dimmed">
                Assigned Room
              </Text>
              <Text size="sm" fw={500}>
                Room {booking.room_number}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Text size="sm">
          Please verify the guest's identity and record the ID details below.
        </Text>

        <Select
          label="ID Proof Type"
          placeholder="Select ID type"
          data={[
            { value: "aadhar", label: "Aadhar Card" },
            { value: "pan", label: "PAN Card" },
            { value: "voter_id", label: "Voter ID" },
            { value: "driving_license", label: "Driving License" },
            { value: "other", label: "Other Official ID" },
          ]}
          value={formData.id_proof_type}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, id_proof_type: val }))
          }
          required
        />

        <TextInput
          label="ID Proof Number"
          placeholder="Enter ID number"
          value={formData.id_proof_number}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              id_proof_number: e.target.value,
            }))
          }
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            rightSection={<IconArrowRight size={18} />}
            onClick={handleCheckIn}
            loading={loading}
          >
            Confirm Check-In
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

GuestCheckInModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    guest_name: PropTypes.string,
    room_number: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
};
