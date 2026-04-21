/**
 * ImposeFineModal Component (UC-016)
 * Simplified form for imposing a fine.
 * Supports: student ID, category, amount, and reason.
 * Now includes auto-fetch functionality for student verification.
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  TextInput,
  NumberInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  Alert,
  Text,
  Loader,
} from "@mantine/core";
import { IconInfoCircle, IconCheck, IconX } from "@tabler/icons-react";
import { fetchStudentByRoll } from "../../api";

function ImposeFineModal({ opened, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    student_id: "",
    category: "",
    amount: 0,
    reason: "",
  });
  const [studentName, setStudentName] = useState("");
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-fetch student name when roll number is entered
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.student_id && formData.student_id.length >= 3) {
        setFetching(true);
        try {
          const data = await fetchStudentByRoll(formData.student_id);
          setStudentName(data.name);
          setErrors((prev) => ({ ...prev, student_id: undefined }));
        } catch (err) {
          setStudentName("");
          setErrors((prev) => ({ ...prev, student_id: "Student not found" }));
        } finally {
          setFetching(false);
        }
      } else {
        setStudentName("");
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [formData.student_id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = "Student ID is required";
    if (!studentName) newErrors.student_id = "Valid student required";
    if (!formData.category)
      newErrors.category = "Violation category is required";
    if (!formData.amount || formData.amount <= 0)
      newErrors.amount = "Amount must be greater than zero";
    if (!formData.reason || formData.reason.trim().length < 5)
      newErrors.reason = "Reason must be at least 5 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClose = () => {
    setFormData({
      student_id: "",
      category: "",
      amount: 0,
      reason: "",
    });
    setStudentName("");
    setErrors({});
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Impose Disciplinary fine"
      size="md"
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Student Roll No"
            placeholder="e.g. 21BCE001"
            required
            value={formData.student_id}
            onChange={(e) =>
              handleChange("student_id", e.currentTarget.value.toUpperCase())
            }
            error={errors.student_id}
            rightSection={
              fetching ? (
                <Loader size="xs" />
              ) : studentName ? (
                <IconCheck size={16} color="green" />
              ) : formData.student_id.length >= 3 ? (
                <IconX size={16} color="red" />
              ) : null
            }
          />

          {studentName && (
            <Alert color="green" py="xs" radius="sm">
              <Text size="sm" fw={700}>
                Target: {studentName}
              </Text>
            </Alert>
          )}

          <Select
            label="Violation Category"
            placeholder="Select category"
            required
            data={[
              { value: "HostelRuleViolation", label: "Rule Violation" },
              { value: "PropertyDamage", label: "Property Damage" },
              { value: "AttendanceViolation", label: "Attendance issue" },
              { value: "RoomStandardsViolation", label: "Room Standard" },
            ]}
            value={formData.category}
            onChange={(value) => handleChange("category", value)}
            error={errors.category}
          />

          <NumberInput
            label="Fine Amount (₹)"
            min={0}
            required
            value={formData.amount}
            onChange={(value) => handleChange("amount", value)}
            error={errors.amount}
          />

          <Textarea
            label="Justification Reason"
            placeholder="Specify details of violation..."
            required
            minRows={3}
            value={formData.reason}
            onChange={(e) => handleChange("reason", e.currentTarget.value)}
            error={errors.reason}
          />

          <Alert color="blue" icon={<IconInfoCircle size={16} />}>
            <Text size="xs">
              This action will be automatically logged and notified.
            </Text>
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading || fetching}
              color="red"
              disabled={!studentName}
            >
              Impose Fine
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

ImposeFineModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default ImposeFineModal;
