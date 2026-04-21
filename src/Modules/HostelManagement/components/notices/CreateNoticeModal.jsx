import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Stack,
  Group,
  FileInput,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconUpload, IconCalendar } from "@tabler/icons-react";

function CreateNoticeModal({
  opened,
  onClose,
  onSubmit,
  loading,
  hostels = [],
  isSuperAdmin = false,
}) {
  const [formData, setFormData] = useState({
    hostel_id: "all",
    title: "",
    description: "",
    priority: "Normal",
    start_date: new Date(),
    end_date: new Date(new Date().setDate(new Date().getDate() + 7)), // Default 1 week
    attachment: null,
  });

  // Auto-select assigned hostel for staff members
  useEffect(() => {
    if (opened && !isSuperAdmin && hostels.length > 0) {
      setFormData((prev) => ({
        ...prev,
        hostel_id: String(hostels[0].hall_id),
      }));
    } else if (opened && isSuperAdmin) {
      setFormData((prev) => ({ ...prev, hostel_id: "all" }));
    }
  }, [opened, isSuperAdmin, hostels]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = new FormData();
    // Use the field name 'hostel' to match the backend serializer
    submitData.append(
      "hostel",
      formData.hostel_id === "all" ? "" : formData.hostel_id,
    );
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("priority", formData.priority);
    submitData.append(
      "start_date",
      formData.start_date.toISOString().split("T")[0],
    );
    submitData.append(
      "end_date",
      formData.end_date.toISOString().split("T")[0],
    );
    submitData.append("status", "Published"); // Auto-publish for now

    if (formData.attachment) {
      submitData.append("attachment", formData.attachment);
    }
    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isTitleValid =
    formData.title.length >= 5 && formData.title.length <= 200;
  const isDescValid =
    formData.description.length >= 20 && formData.description.length <= 5000;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Publish New Notice"
      size="lg"
      radius="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group grow>
            {isSuperAdmin ? (
              <Select
                label="Audience (Hostel)"
                placeholder="Select target hostel"
                data={[
                  { value: "all", label: "All Hostels (Global)" },
                  ...hostels.map((h) => ({
                    value: String(h.hall_id),
                    label: h.name,
                  })),
                ]}
                value={formData.hostel_id}
                onChange={(value) => handleChange("hostel_id", value)}
              />
            ) : (
              // Staff can only post to their assigned hostel, no choice needed.
              // We could show it as a hidden field or read-only text if there's space.
              <TextInput
                label="Target Hostel"
                value={
                  hostels.find((h) => String(h.hall_id) === formData.hostel_id)
                    ?.name || "Assigned Hostel"
                }
                disabled
              />
            )}
            <Select
              label="Priority"
              data={["Normal", "Important", "Urgent"]}
              value={formData.priority}
              onChange={(value) => handleChange("priority", value)}
            />
          </Group>

          <TextInput
            label="Title"
            placeholder="Min 5, Max 200 characters"
            required
            value={formData.title}
            error={
              formData.title.length > 0 &&
              !isTitleValid &&
              "Title must be 5-200 characters"
            }
            onChange={(e) => handleChange("title", e.target.value)}
            rightSection={
              <Text size="xs" c={isTitleValid ? "dimmed" : "red"}>
                {formData.title.length}/200
              </Text>
            }
          />

          <Textarea
            label="Description"
            placeholder="Min 20, Max 5000 characters"
            required
            minRows={4}
            value={formData.description}
            error={
              formData.description.length > 0 &&
              !isDescValid &&
              "Description must be 20-5000 characters"
            }
            onChange={(e) => handleChange("description", e.target.value)}
            description={
              <Text
                size="xs"
                c={isDescValid ? "dimmed" : "red"}
                style={{ textAlign: "right" }}
              >
                {formData.description.length}/5000
              </Text>
            }
          />

          <Group grow>
            <DateInput
              label="Start Date"
              placeholder="Notice active from"
              value={formData.start_date}
              onChange={(val) => handleChange("start_date", val)}
              leftSection={<IconCalendar size={16} />}
              popoverProps={{ width: 300 }}
              required
            />
            <DateInput
              label="End Date"
              placeholder="Notice expires on"
              value={formData.end_date}
              onChange={(val) => handleChange("end_date", val)}
              leftSection={<IconCalendar size={16} />}
              required
              minDate={formData.start_date}
              popoverProps={{ width: 300 }}
            />
          </Group>

          <FileInput
            label="Attachment (Optional)"
            placeholder="Upload PDF or Image"
            leftSection={<IconUpload size={16} />}
            value={formData.attachment}
            onChange={(file) => handleChange("attachment", file)}
            accept="image/*,application/pdf"
          />

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!isTitleValid || !isDescValid}
            >
              Publish Notice
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

CreateNoticeModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  isSuperAdmin: PropTypes.bool,
  hostels: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      hall_id: PropTypes.string,
    }),
  ),
};

export default CreateNoticeModal;
