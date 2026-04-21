/**
 * CreateInventoryModal Component
 * Modal form for adding inventory item
 */

import React, { useState } from "react";
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
} from "@mantine/core";

function CreateInventoryModal({
  opened,
  onClose,
  onSubmit,
  loading,
  halls = [],
}) {
  const [formData, setFormData] = useState({
    hall_id: "",
    item_name: "",
    quantity: 1,
    item_type: "",
    remarks: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Inventory Item"
      size="md"
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Select
            label="Hall"
            placeholder="Select hall"
            required
            data={halls.map((h) => ({
              value: String(h.id),
              label: h.hall_name,
            }))}
            value={formData.hall_id}
            onChange={(value) => handleChange("hall_id", value)}
          />
          <TextInput
            label="Item Name"
            placeholder="Enter item name"
            required
            value={formData.item_name}
            onChange={(e) => handleChange("item_name", e.target.value)}
          />
          <NumberInput
            label="Quantity"
            placeholder="Enter quantity"
            required
            min={1}
            value={formData.quantity}
            onChange={(value) => handleChange("quantity", value)}
          />
          <Select
            label="Item Type"
            placeholder="Select item type"
            required
            data={[
              { value: "Furniture", label: "Furniture" },
              { value: "Electronics", label: "Electronics" },
              { value: "Cleaning", label: "Cleaning" },
              { value: "Sports", label: "Sports" },
              { value: "Other", label: "Other" },
            ]}
            value={formData.item_type}
            onChange={(value) => handleChange("item_type", value)}
          />
          <Textarea
            label="Remarks"
            placeholder="Enter any remarks"
            value={formData.remarks}
            onChange={(e) => handleChange("remarks", e.target.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Item
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

CreateInventoryModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  halls: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      hall_name: PropTypes.string.isRequired,
    }),
  ),
};

export default CreateInventoryModal;
