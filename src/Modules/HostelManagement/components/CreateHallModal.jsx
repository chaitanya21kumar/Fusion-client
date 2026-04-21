/**
 * CreateHallModal Component
 * Modal form for creating a new hall
 */

import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  TextInput,
  NumberInput,
  Select,
  Button,
  Stack,
  Group,
} from "@mantine/core";

function CreateHallModal({ opened, onClose, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    hall_id: "",
    hall_name: "",
    max_accomodation: 100,
    type_of_seater: "single",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Hall" size="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label="Hall ID"
            placeholder="e.g., H1"
            required
            value={formData.hall_id}
            onChange={(e) => handleChange("hall_id", e.target.value)}
          />
          <TextInput
            label="Hall Name"
            placeholder="e.g., Hall of Residence 1"
            required
            value={formData.hall_name}
            onChange={(e) => handleChange("hall_name", e.target.value)}
          />
          <NumberInput
            label="Maximum Accommodation"
            placeholder="Enter capacity"
            required
            min={1}
            value={formData.max_accomodation}
            onChange={(value) => handleChange("max_accomodation", value)}
          />
          <Select
            label="Seater Type"
            data={[
              { value: "single", label: "Single Seater" },
              { value: "double", label: "Double Seater" },
              { value: "triple", label: "Triple Seater" },
            ]}
            value={formData.type_of_seater}
            onChange={(value) => handleChange("type_of_seater", value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Hall
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

CreateHallModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default CreateHallModal;
