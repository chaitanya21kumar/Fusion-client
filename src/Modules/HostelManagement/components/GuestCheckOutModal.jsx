import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Stack,
  Group,
  NumberInput,
  Textarea,
  Text,
  Select,
  Divider,
} from "@mantine/core";
import { IconLogout, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import PropTypes from "prop-types";
import { checkOutGuest, fetchGuestRoomPolicy } from "../api";

export default function GuestCheckOutModal({
  opened,
  onClose,
  booking,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [, setPolicyLoading] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [formData, setFormData] = useState({
    condition_remarks: "Room left in good condition.",
    damage_severity: "None",
    damage_charge: 0,
  });

  useEffect(() => {
    if (opened && booking?.hostel) {
      setPolicyLoading(true);
      fetchGuestRoomPolicy(booking.hostel)
        .then((data) => setPolicy(data))
        .catch((err) =>
          console.error("Could not fetch policy for checkout defaults:", err),
        )
        .finally(() => setPolicyLoading(false));
    }
  }, [opened, booking]);

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await checkOutGuest(booking.id, formData);
      notifications.show({
        title: "Success",
        message: `Guest checked out. Total stay charge: ₹${response.booking.total_charges}`,
        color: "green",
      });
      if (response.inspection.damage_charge > 0) {
        notifications.show({
          title: "Fine Imposed",
          message: `A damage fine of ₹${response.inspection.damage_charge} has been recorded.`,
          color: "orange",
          icon: <IconAlertCircle size={16} />,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to check out guest",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  const defaultMinorFine = policy ? policy.fines_grace_threshold : 500;
  const defaultMajorFine = policy ? policy.fines_grace_threshold * 4 : 2000;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconLogout size={20} />
          <Text fw={600}>Room Inspection & Check-Out</Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        <Text size="sm" color="dimmed">
          Please inspect Room {booking.room_number} before the guest departs and
          record any damages.
        </Text>

        <Select
          label="Damage Severity"
          placeholder="Select severity"
          data={[
            { value: "None", label: "No Damage" },
            { value: "Minor", label: `Minor (₹${defaultMinorFine} Fine)` },
            { value: "Major", label: `Major (₹${defaultMajorFine} Fine)` },
          ]}
          value={formData.damage_severity}
          onChange={(val) => {
            let charge = 0;
            if (val === "Minor") charge = defaultMinorFine;
            if (val === "Major") charge = defaultMajorFine;
            setFormData((prev) => ({
              ...prev,
              damage_severity: val,
              damage_charge: charge,
            }));
          }}
        />

        <NumberInput
          label="Damage Charge (₹)"
          description="Amount to be fined for damages"
          min={0}
          value={formData.damage_charge}
          onChange={(val) =>
            setFormData((prev) => ({ ...prev, damage_charge: val }))
          }
          disabled={formData.damage_severity === "None"}
        />

        <Textarea
          label="Inspection Remarks"
          placeholder="Describe the condition of the room..."
          minRows={3}
          value={formData.condition_remarks}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              condition_remarks: e.target.value,
            }))
          }
        />

        <Divider my="sm" />

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color={formData.damage_severity !== "None" ? "orange" : "blue"}
            onClick={handleCheckOut}
            loading={loading}
          >
            Complete Check-Out
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

GuestCheckOutModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    room_number: PropTypes.string,
    hostel: PropTypes.string,
  }),
  onSuccess: PropTypes.func.isRequired,
};
