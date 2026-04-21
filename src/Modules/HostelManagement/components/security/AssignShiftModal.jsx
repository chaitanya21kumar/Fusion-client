import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Select,
  Stack,
  Button,
  Group,
  SimpleGrid,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function AssignShiftModal({
  opened,
  onClose,
  guards,
  onSubmit,
  loading,
  initialDate,
  fixedHostel,
}) {
  const form = useForm({
    initialValues: {
      guard: "",
      hostel: fixedHostel ? fixedHostel.hall_id : "",
      shift_type: "Morning",
      start_time: "08:00",
      end_time: "16:00",
      date: initialDate || new Date().toISOString().split("T")[0],
    },
    validate: {
      guard: (value) => (!value ? "Select a guard" : null),
    },
  });

  // Sync fixedHostel
  React.useEffect(() => {
    if (fixedHostel) {
      form.setFieldValue("hostel", fixedHostel.hall_id);
    }
  }, [fixedHostel, opened]);

  const handleSubmit = (values) => {
    onSubmit(values);
    form.reset();
    if (fixedHostel) {
      form.setFieldValue("hostel", fixedHostel.hall_id);
    }
  };

  // Auto-adjust times based on shift type
  const handleShiftTypeChange = (value) => {
    form.setFieldValue("shift_type", value);
    if (value === "Morning") {
      form.setFieldValue("start_time", "08:00");
      form.setFieldValue("end_time", "16:00");
    } else if (value === "Evening") {
      form.setFieldValue("start_time", "16:00");
      form.setFieldValue("end_time", "00:00");
    } else if (value === "Night") {
      form.setFieldValue("start_time", "00:00");
      form.setFieldValue("end_time", "08:00");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Assign Security Shift"
      radius="md"
      centered
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <SimpleGrid cols={fixedHostel ? 1 : 2}>
            <Select
              label="Security Guard"
              placeholder="Select guard"
              data={guards.map((g) => ({ value: String(g.id), label: g.name }))}
              required
              searchable
              {...form.getInputProps("guard")} // eslint-disable-line react/jsx-props-no-spreading
            />
            {!fixedHostel && (
              <Select
                label="Hostel / Hall"
                placeholder="Select hostel"
                data={[]}
                required
                searchable
                {...form.getInputProps("hostel")} // eslint-disable-line react/jsx-props-no-spreading
              />
            )}
          </SimpleGrid>

          <Select
            label="Shift Type"
            data={["Morning", "Evening", "Night", "Custom"]}
            {...form.getInputProps("shift_type")} // eslint-disable-line react/jsx-props-no-spreading
            onChange={handleShiftTypeChange}
          />

          <SimpleGrid cols={2}>
            <TextInput
              label="Start Time"
              type="time"
              required
              {...form.getInputProps("start_time")} // eslint-disable-line react/jsx-props-no-spreading
            />
            <TextInput
              label="End Time"
              type="time"
              required
              {...form.getInputProps("end_time")} // eslint-disable-line react/jsx-props-no-spreading
            />
          </SimpleGrid>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} color="blue">
              Confirm Assignment
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

AssignShiftModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  guards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  initialDate: PropTypes.string,
  fixedHostel: PropTypes.shape({
    hall_id: PropTypes.string.isRequired,
  }),
};
