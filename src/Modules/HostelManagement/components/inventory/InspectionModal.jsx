import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  NumberInput,
  Select,
  Textarea,
  Button,
  Stack,
  Group,
  Text,
} from "@mantine/core";

export default function InspectionModal({
  opened,
  onClose,
  item,
  onSubmit,
  mode = "inspect",
}) {
  const [formData, setFormData] = useState({
    quantity: 0,
    condition: "Good",
    remarks: "",
  });

  useEffect(() => {
    if (item) {
      setFormData({
        quantity:
          mode === "inspect" ? item.expected_quantity : item.current_quantity,
        condition: item.condition,
        remarks: "",
      });
    }
  }, [item, mode]);

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      itemId: item.id,
    });
  };

  const isInspect = mode === "inspect";

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        isInspect ? `Inspect: ${item?.name}` : `Update Record: ${item?.name}`
      }
      size="md"
    >
      <Stack>
        {isInspect && (
          <Text size="sm" c="dimmed">
            Record the actual quantity and condition found during inspection.
            Discrepancies will be logged automatically if they deviate from
            expected levels.
          </Text>
        )}

        <NumberInput
          label={isInspect ? "Actual Quantity" : "New Quantity"}
          placeholder="Enter quantity"
          value={formData.quantity}
          onChange={(val) => setFormData({ ...formData, quantity: val })}
          min={0}
          required
        />

        <Select
          label="Condition"
          placeholder="Select condition"
          data={[
            { value: "Good", label: "Good" },
            { value: "Damaged", label: "Damaged" },
            { value: "Missing", label: "Missing" },
          ]}
          value={formData.condition}
          onChange={(val) => setFormData({ ...formData, condition: val })}
          required
        />

        <Textarea
          label="Remarks"
          placeholder={
            isInspect
              ? "Notes from inspection..."
              : "Reason for manual update..."
          }
          value={formData.remarks}
          onChange={(e) =>
            setFormData({ ...formData, remarks: e.target.value })
          }
          required={!isInspect}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button color={isInspect ? "green" : "blue"} onClick={handleSubmit}>
            {isInspect ? "Submit Inspection" : "Update Record"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

InspectionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    expected_quantity: PropTypes.number,
    current_quantity: PropTypes.number,
    condition: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  mode: PropTypes.string,
};
