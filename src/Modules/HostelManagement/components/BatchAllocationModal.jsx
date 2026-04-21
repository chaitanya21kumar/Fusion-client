/**
 * BatchAllocationModal — Micro Component
 * Sequential bulk allocation for a specific hostel.
 *
 * Allows SuperAdmin to select Category (UG/PG/M.Tech), Year, and Gender.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { getActiveBatchYears, bulkBatchAllotHostel } from "../api";

export default function BatchAllocationModal({
  opened,
  onClose,
  hostel,
  onFinish,
}) {
  const [loading, setLoading] = useState(false);
  const [activeBatches, setActiveBatches] = useState([]);
  const [formValues, setFormValues] = useState({
    programme_category: "UG",
    admission_year: new Date().getFullYear(),
    gender: hostel?.type === "Girl" ? "F" : "M",
  });

  // Sync gender with hostel type when hostel changes
  useEffect(() => {
    if (hostel) {
      setFormValues((prev) => ({
        ...prev,
        gender: hostel.type === "Girl" ? "F" : "M",
      }));
    }
  }, [hostel]);

  // Load active batch years for the dropdown
  useEffect(() => {
    if (opened) {
      const loadBatches = async () => {
        try {
          const batches = await getActiveBatchYears();
          setActiveBatches(batches);
        } catch (err) {
          console.error("Failed to load active batches:", err);
        }
      };
      loadBatches();
    }
  }, [opened]);

  const handleSubmit = async () => {
    if (!hostel) return;
    setLoading(true);
    try {
      const result = await bulkBatchAllotHostel(hostel.hall_id, formValues);
      notifications.show({
        title: "Bulk Allocation Complete",
        message: result.message,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      onFinish();
      onClose();
    } catch (err) {
      notifications.show({
        title: "Allocation Failed",
        message:
          err.response?.data?.error || "Failed to perform bulk allocation.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  };

  const yearsOptions = [...new Set(activeBatches.map((b) => b.year))]
    .sort((a, b) => b - a)
    .map((year) => ({ value: String(year), label: String(year) }));

  // Fallback if no years fetched yet
  if (yearsOptions.length === 0) {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 5; i += 1) {
      yearsOptions.push({
        value: String(currentYear - i),
        label: String(currentYear - i),
      });
    }
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          Bulk Batch Allocation — {hostel?.name}
        </Text>
      }
      size="md"
      radius="md"
    >
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={loading} />

        <Alert
          icon={<IconAlertCircle />}
          color="blue"
          title="Sequential Allocation"
        >
          Students will be matched by admission year and categorised programme,
          then assigned sequentially starting from the lowest floor.
        </Alert>

        <Select
          label="Programme Category"
          placeholder="Select category"
          data={[
            { value: "UG", label: "Undergraduate (B.Tech, B.Des)" },
            { value: "PG", label: "Postgraduate (M.Des, PhD)" },
            { value: "M.Tech", label: "M.Tech" },
          ]}
          value={formValues.programme_category}
          onChange={(val) =>
            setFormValues({ ...formValues, programme_category: val })
          }
        />

        <Select
          label="Admission Year"
          placeholder="Select year"
          data={yearsOptions}
          value={String(formValues.admission_year)}
          onChange={(val) =>
            setFormValues({ ...formValues, admission_year: parseInt(val, 10) })
          }
        />

        <Select
          label="Gender"
          placeholder="Select gender"
          data={[
            { value: "M", label: "Male" },
            { value: "F", label: "Female" },
          ]}
          value={formValues.gender}
          onChange={(val) => setFormValues({ ...formValues, gender: val })}
          disabled={hostel?.type !== "Mixed"}
          description={
            hostel?.type !== "Mixed" ? `Restricted to ${hostel?.type} only` : ""
          }
        />

        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={loading} color="blue">
            Start Allocation
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

BatchAllocationModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hostel: PropTypes.shape({
    hall_id: PropTypes.string,
    name: PropTypes.string,
    type: PropTypes.string,
  }),
  onFinish: PropTypes.func.isRequired,
};
