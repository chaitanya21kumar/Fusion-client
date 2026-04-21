import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  TextInput,
  Stack,
  Button,
  Group,
  Select,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function RegisterGuardModal({
  opened,
  onClose,
  onSubmit,
  loading,
  fixedHostel,
  initialData,
}) {
  const form = useForm({
    initialValues: {
      name: "",
      employee_id: "",
      contact: "",
      hostel: fixedHostel ? fixedHostel.hall_id : "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must be at least 2 characters" : null,
      employee_id: (value) => (!value ? "Employee ID is required" : null),
      contact: (value) => (!value ? "Contact number is required" : null),
    },
  });

  // Handle initialization for edit or create mode
  useEffect(() => {
    if (opened) {
      if (initialData) {
        form.setValues({
          name: initialData.name || "",
          employee_id: initialData.employee_id || "",
          contact: initialData.contact || "",
          hostel: String(initialData.hostel || ""),
        });
      } else {
        form.reset();
        if (fixedHostel) {
          form.setFieldValue("hostel", String(fixedHostel.hall_id));
        }
      }
    }
  }, [opened, initialData, fixedHostel]);

  const handleSubmit = (values) => {
    onSubmit(values);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={700} size="lg">
          {initialData ? "Update Guard Profile" : "Register Security Guard"}
        </Text>
      }
      radius="md"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {!fixedHostel && (
            <Select
              label="Hostel / Hall"
              placeholder="Select assigned hostel"
              data={[]}
              required
              searchable
              {...form.getInputProps("hostel")} // eslint-disable-line react/jsx-props-no-spreading
            />
          )}
          <TextInput
            label="Full Name"
            placeholder="Enter guard name"
            required
            {...form.getInputProps("name")} // eslint-disable-line react/jsx-props-no-spreading
          />
          <TextInput
            label="Employee ID"
            placeholder="SG-101"
            required
            disabled={!!initialData}
            {...form.getInputProps("employee_id")} // eslint-disable-line react/jsx-props-no-spreading
          />
          <TextInput
            label="Contact Number"
            placeholder="+91 XXXXX XXXXX"
            required
            {...form.getInputProps("contact")} // eslint-disable-line react/jsx-props-no-spreading
          />
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {initialData ? "Save Changes" : "Register Profile"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

RegisterGuardModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  fixedHostel: PropTypes.shape({
    hall_id: PropTypes.string.isRequired,
  }),
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    employee_id: PropTypes.string,
    contact: PropTypes.string,
    hostel: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};
