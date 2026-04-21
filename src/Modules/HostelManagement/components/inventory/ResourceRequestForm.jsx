import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Stack,
  TextInput,
  NumberInput,
  Select,
  Textarea,
  Button,
  Title,
  Paper,
  Group,
} from "@mantine/core";

export default function ResourceRequestForm({ hostels, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    hostel: "",
    request_type: "New",
    category: "Other",
    item_name: "",
    quantity: 1,
    justification: "",
  });

  const categories = [
    { value: "Maintenance", label: "Maintenance" },
    { value: "Cleaning", label: "Cleaning" },
    { value: "Bedding", label: "Bedding" },
    { value: "Equipment", label: "Equipment" },
    { value: "Furniture", label: "Furniture" },
    { value: "Electronics", label: "Electronics" },
    { value: "Other", label: "Other" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    // Reset form except hostel if multiple requests needed
    setFormData((prev) => ({
      ...prev,
      item_name: "",
      quantity: 1,
      justification: "",
    }));
  };

  return (
    <Paper withBorder p="md" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          <Title order={4}>Submit Resource Procurement Request</Title>

          <Group grow>
            <Select
              label="Select Hostel"
              placeholder="Choose hostel"
              data={hostels.map((h) => ({ value: h.hall_id, label: h.name }))}
              value={formData.hostel}
              onChange={(val) => setFormData({ ...formData, hostel: val })}
              required
            />
            <Select
              label="Request Type"
              placeholder="Select type"
              data={[
                { value: "New", label: "New (First time purchase)" },
                { value: "Replacement", label: "Replacement (Damaged/Old)" },
                {
                  value: "Additional",
                  label: "Additional (Insufficient stock)",
                },
              ]}
              value={formData.request_type}
              onChange={(val) =>
                setFormData({ ...formData, request_type: val })
              }
              required
            />
          </Group>

          <Group grow>
            <TextInput
              label="Item Name"
              placeholder="e.g., Mattress, Ceiling Fan"
              value={formData.item_name}
              onChange={(e) =>
                setFormData({ ...formData, item_name: e.target.value })
              }
              required
            />
            <Select
              label="Category"
              placeholder="Select category"
              data={categories}
              value={formData.category}
              onChange={(val) => setFormData({ ...formData, category: val })}
              required
            />
            <NumberInput
              label="Quantity"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              min={1}
              required
            />
          </Group>

          <Textarea
            label="Justification"
            placeholder="Explain why this resource is needed..."
            value={formData.justification}
            onChange={(e) =>
              setFormData({ ...formData, justification: e.target.value })
            }
            minRows={3}
            required
          />

          <Button type="submit" loading={loading} mt="md">
            Submit Request
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

ResourceRequestForm.propTypes = {
  hostels: PropTypes.arrayOf(
    PropTypes.shape({
      hall_id: PropTypes.string,
      name: PropTypes.string,
    }),
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
