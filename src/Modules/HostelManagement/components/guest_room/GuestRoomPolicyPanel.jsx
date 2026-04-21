import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  NumberInput,
  Button,
  Stack,
  Group,
  Text,
  Title,
  Divider,
  Loader,
  Alert,
  Center,
  Badge,
} from "@mantine/core";
import {
  IconSettings,
  IconDeviceFloppy,
  IconAlertCircle,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  fetchGuestRoomPolicy,
  updateGuestRoomPolicy,
  deleteGuestRoomPolicy,
} from "../../api";

export default function GuestRoomPolicyPanel({ hallId }) {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    per_night_rate: 200,
    max_duration_nights: 7,
    fines_grace_threshold: 500,
  });

  useEffect(() => {
    const loadPolicy = async () => {
      if (!hallId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchGuestRoomPolicy(hallId);
        setPolicy(data);
        if (data && data.per_night_rate !== undefined) {
          setFormData({
            per_night_rate: data.per_night_rate,
            max_duration_nights: data.max_duration_nights,
            fines_grace_threshold: data.fines_grace_threshold,
          });
        }
        setError(null);
      } catch (err) {
        if (err.response?.status === 404) {
          // This is expected for standard hostels that haven't set a policy yet
          setPolicy(null);
          setError(
            "No policy configured yet. Please configure the defaults and save.",
          );
        } else {
          setError("Failed to load hostel policy");
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, [hallId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPolicy = await updateGuestRoomPolicy(hallId, formData);
      setPolicy(updatedPolicy);
      notifications.show({
        title: "Policy Updated",
        message: "Guest room booking policies have been saved.",
        color: "green",
        icon: <IconCheck size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to update policy",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to completely remove this hostel's guest policy?",
      )
    )
      return;
    setSaving(true);
    try {
      await deleteGuestRoomPolicy(hallId);
      setPolicy(null);
      setError(
        "No policy configured yet. Please configure the defaults and save.",
      );
      notifications.show({
        title: "Policy Removed",
        message: "The guest room policy has been successfully deleted.",
        color: "blue",
        icon: <IconTrash size={16} />,
      });
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to remove policy",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!hallId) {
    return (
      <Card withBorder py={40} radius="md">
        <Center>
          <Stack align="center" gap="xs">
            <IconAlertCircle size={40} color="var(--mantine-color-gray-4)" />
            <Text color="dimmed">Please select a hostel to view policies.</Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (loading) {
    return (
      <Group justify="center" p="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Card withBorder padding="xl" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <Group>
              <IconSettings size={28} color="var(--mantine-color-blue-6)" />
              <Title order={3}>Booking Policies</Title>
              <Badge color={policy ? "green" : "red"} variant="light">
                {policy ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </Group>
            <Group>
              {policy && (
                <Button
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={18} />}
                  onClick={handleDelete}
                  loading={saving}
                  size="sm"
                >
                  Remove
                </Button>
              )}
              <Button
                leftSection={<IconDeviceFloppy size={18} />}
                onClick={handleSave}
                loading={saving}
                size="sm"
              >
                Save Changes
              </Button>
            </Group>
          </Group>

          <Text size="sm" color="dimmed">
            Configure rates and stay limits for Hall {hallId}. These settings
            apply to all future booking requests.
          </Text>

          <Divider my="sm" />

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          <Group grow align="start">
            <NumberInput
              label="Daily Rate (₹)"
              description="Per night charge for the guest room"
              min={0}
              step={50}
              value={formData.per_night_rate}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, per_night_rate: val }))
              }
              placeholder="e.g. 200"
            />

            <NumberInput
              label="Max Duration (Days)"
              description="Maximum length of a single stay"
              min={1}
              max={30}
              value={formData.max_duration_nights}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, max_duration_nights: val }))
              }
              placeholder="e.g. 7"
            />
          </Group>

          <Group grow align="start">
            <NumberInput
              label="Damage Fine Threshold (₹)"
              description="Default fine amount for minor damages recorded at check-out"
              min={0}
              step={100}
              value={formData.fines_grace_threshold}
              onChange={(val) =>
                setFormData((prev) => ({ ...prev, fines_grace_threshold: val }))
              }
              placeholder="e.g. 500"
            />
            {/* Reserved for future settings */}
            <div style={{ flex: 1 }} />
          </Group>
        </Stack>
      </Card>

      <Card
        withBorder
        p="md"
        bg="blue.0"
        style={{ borderColor: "var(--mantine-color-blue-2)" }}
      >
        <Group>
          <IconAlertCircle size={20} color="var(--mantine-color-blue-6)" />
          <Text size="sm" fw={500} color="blue.9">
            Note: Changes to the daily rate will only affect new booking
            requests. Existing bookings will retain their originally calculated
            charges.
          </Text>
        </Group>
      </Card>
    </Stack>
  );
}

GuestRoomPolicyPanel.propTypes = {
  hallId: PropTypes.string,
};
