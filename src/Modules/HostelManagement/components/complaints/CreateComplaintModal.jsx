/**
 * CreateComplaintModal Component
 * Modal form for filing a new complaint
 * Supports: category, title, description, priority, location (UC-006)
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import { Modal, Select, Textarea, Button, Stack, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createComplaint } from "../../api";

function CreateComplaintModal({
  opened,
  onClose,
  onSubmit,
  loading: externalLoading,
}) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    attachments: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description || formData.description.length < 20)
      newErrors.description = "Description must be at least 20 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("category", formData.category);
      data.append("description", formData.description);
      if (formData.attachments) {
        data.append("attachments", formData.attachments);
      }

      await createComplaint(data);
      notifications.show({
        title: "Success",
        message: "Complaint submitted successfully",
        color: "green",
      });
      setFormData({
        category: "",
        description: "",
        attachments: null,
      });
      setErrors({});
      onSubmit();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to submit complaint",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const isLoading = submitting || externalLoading;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="File a Complaint"
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Category"
            placeholder="Select complaint category"
            required
            data={[
              { value: "Maintenance", label: "Maintenance" },
              { value: "Cleaning", label: "Cleaning" },
              { value: "Security", label: "Security" },
              { value: "Other", label: "Other" },
            ]}
            value={formData.category}
            onChange={(value) => handleChange("category", value)}
            error={errors.category}
          />
          <Textarea
            label="Description"
            placeholder="Describe your complaint in detail (min 20 characters)"
            required
            minRows={5}
            value={formData.description}
            onChange={(e) => handleChange("description", e.currentTarget.value)}
            error={errors.description}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Submit Complaint
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

CreateComplaintModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

CreateComplaintModal.defaultProps = {
  loading: false,
};

export default CreateComplaintModal;
