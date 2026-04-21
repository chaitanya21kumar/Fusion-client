/**
 * LeaveRequestForm - Micro Component
 * Form for submitting hostel leave requests
 * Dumb component - receives data and callbacks from parent
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  Stack,
  SimpleGrid,
  Textarea,
  FileInput,
  rem,
  Alert,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { DateInput } from "@mantine/dates";
import { IconUpload, IconInfoCircle } from "@tabler/icons-react";

export default function LeaveRequestForm({
  opened,
  onClose,
  onSubmit,
  loading,
}) {
  const form = useForm({
    initialValues: {
      start_date: null,
      end_date: null,
      reason: "",
      documents: null,
    },
    validate: {
      start_date: (value) => (value ? null : "Start date is required"),
      end_date: (value, values) => {
        if (!value) return "End date is required";
        if (value < values.start_date)
          return "End date must be after or equal to start date";
        return null;
      },
      reason: (value) =>
        value && value.trim().length >= 10
          ? null
          : "Reason must be at least 10 characters",
      documents: (value) =>
        value ? null : "Supporting documents are mandatory",
    },
  });

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append(
        "start_date",
        values.start_date instanceof Date
          ? values.start_date.toISOString().split("T")[0]
          : values.start_date,
      );
      formData.append(
        "end_date",
        values.end_date instanceof Date
          ? values.end_date.toISOString().split("T")[0]
          : values.end_date,
      );
      formData.append("reason", values.reason);
      if (values.documents) {
        formData.append("documents", values.documents);
      }

      await onSubmit(formData);
      form.reset();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const uploadIcon = <IconUpload style={{ width: rem(14), height: rem(14) }} />;

  // Calculate duration for feedback
  const duration =
    form.values.start_date && form.values.end_date
      ? Math.ceil(
          (form.values.end_date - form.values.start_date) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Submit Leave Request"
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <DateInput
              label="Start Date"
              placeholder="Pick a date"
              value={form.values.start_date}
              onChange={(value) => form.setFieldValue("start_date", value)}
              error={form.errors.start_date}
              required
              withAsterisk
              minDate={new Date()}
              valueFormat="YYYY-MM-DD"
              clearable
              w="100%"
              popoverProps={{ width: 300 }}
            />
            <DateInput
              label="End Date"
              placeholder="Pick a date"
              value={form.values.end_date}
              onChange={(value) => form.setFieldValue("end_date", value)}
              error={form.errors.end_date}
              required
              withAsterisk
              minDate={form.values.start_date || new Date()}
              valueFormat="YYYY-MM-DD"
              clearable
              w="100%"
              popoverProps={{ width: 300 }}
            />
          </SimpleGrid>

          {duration && duration > 0 && (
            <Alert
              color="blue"
              variant="light"
              icon={<IconInfoCircle size={16} />}
            >
              <Text size="sm">
                Expected Leave Duration: <strong>{duration} day(s)</strong>
              </Text>
            </Alert>
          )}

          <Textarea
            label="Reason for Leave"
            placeholder="Provide detailed reasons (Medical, Personal, etc.)"
            description="Minimum 10 characters"
            minRows={3}
            value={form.values.reason}
            onChange={(e) =>
              form.setFieldValue("reason", e.currentTarget.value)
            }
            error={form.errors.reason}
            required
            withAsterisk
          />

          <FileInput
            label="Supporting Documents"
            description="Upload mandatory proof (Medical certificate, parent letter)"
            placeholder="PDF or Image files"
            leftSection={uploadIcon}
            value={form.values.documents}
            onChange={(file) => form.setFieldValue("documents", file)}
            error={form.errors.documents}
            accept="image/*,.pdf,.doc,.docx"
            required
            withAsterisk
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={loading}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

LeaveRequestForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};
