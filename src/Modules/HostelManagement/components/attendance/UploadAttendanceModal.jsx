/**
 * UploadAttendanceModal Component
 * Handles bulk attendance marking via Excel upload
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  FileInput,
  Button,
  Stack,
  Group,
  Text,
  Alert,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconUpload,
  IconFileSpreadsheet,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { uploadAttendance } from "../../api";

export default function UploadAttendanceModal({
  opened,
  onClose,
  hallId,
  onUploadSuccess,
}) {
  const [file, setFile] = useState(null);
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file || !date || !hallId) return;

    try {
      setLoading(true);
      setError(null);
      setResult(null);

      // Format date to YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      const data = await uploadAttendance(hallId, formattedDate, file);
      setResult(data);
      if (onUploadSuccess) onUploadSuccess();

      // Close automatically if perfect success
      if (!data.errors || data.errors.length === 0) {
        setTimeout(() => {
          onClose();
          setResult(null);
          setFile(null);
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to upload attendance file. Please check the file format.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Upload Daily Attendance"
      size="md"
    >
      <Stack>
        <Text size="sm" c="dimmed">
          Upload an Excel (.xlsx) file with two columns: <b>Roll Number</b> and{" "}
          <b>Status</b> (Present/Absent).
        </Text>

        <DateInput
          label="Attendance Date"
          placeholder="Pick date"
          value={date}
          onChange={setDate}
          maxDate={new Date()}
          clearable={false}
          popoverProps={{ width: "300" }}
          required
        />

        <FileInput
          label="Attendance Excel File"
          placeholder="Upload .xlsx file"
          leftSection={<IconFileSpreadsheet size={18} />}
          accept=".xlsx"
          value={file}
          onChange={setFile}
          required
        />

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red">
            {error}
          </Alert>
        )}

        {result && (
          <Stack gap="xs">
            <Alert icon={<IconCheck size={16} />} color="green">
              Successfully processed {result.records_count} records.
            </Alert>
            {result.errors && result.errors.length > 0 && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="orange"
                title="Processing Warnings"
              >
                <Stack gap={4}>
                  {result.errors.map((err, i) => (
                    <Text key={i} size="xs">
                      • {err}
                    </Text>
                  ))}
                </Stack>
              </Alert>
            )}
          </Stack>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            leftSection={<IconUpload size={18} />}
            onClick={handleUpload}
            loading={loading}
            disabled={!file || !date}
          >
            Upload Attendance
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

UploadAttendanceModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  hallId: PropTypes.string,
  onUploadSuccess: PropTypes.func,
};
