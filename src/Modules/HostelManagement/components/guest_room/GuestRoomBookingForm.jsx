/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  TextInput,
  Textarea,
  Stack,
  Text,
  Alert,
  SimpleGrid,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconAlertCircle } from "@tabler/icons-react";

export default function GuestRoomBookingForm({
  opened,
  onClose,
  onSubmit,
  loading = false,
}) {
  useEffect(() => {
    if (opened) {
      // Intentionally left empty. Hostel is auto-assigned by the backend based on student's current residence.
    }
  }, [opened]);

  const form = useForm({
    initialValues: {
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      guest_address: "",
      nationality: "",
      check_in_date: null,
      check_out_date: null,
      visit_purpose: "",
    },
    validate: {
      guest_name: (val) => (val && val.length >= 3 ? null : "Name too short"),
      guest_phone: (val) =>
        val && val.length >= 10 ? null : "Valid phone required",
      guest_address: (val) =>
        val && val.trim().length >= 5 ? null : "Address is required",
      nationality: (val) =>
        val && val.trim().length > 0 ? null : "Nationality is required",
      check_in_date: (val) => (val ? null : "Check-in date required"),
      check_out_date: (val, values) => {
        if (!val) return "Check-out date required";
        if (values.check_in_date && val <= values.check_in_date)
          return "Must be after check-in";
        return null;
      },
      visit_purpose: (val) =>
        val && val.length >= 10 ? null : "Purpose must be at least 10 chars",
    },
  });

  const handleSubmit = async (values) => {
    const payload = {
      guest_name: values.guest_name,
      guest_email: values.guest_email,
      guest_phone: values.guest_phone,
      visit_purpose: values.visit_purpose,
      check_in_date: values.check_in_date.toISOString().split("T")[0],
      check_out_date: values.check_out_date.toISOString().split("T")[0],
      guest_address: values.guest_address,
      nationality: values.nationality,
    };
    const success = await onSubmit(payload);
    if (success) {
      form.reset();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Request Guest Room Booking</Text>}
      size="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Alert icon={<IconAlertCircle />} color="blue" variant="light">
            Bookings are subject to caretaker approval and room availability.
            Automated charges will apply based on the hostel's nightly rate.
            Your current assigned hostel will be automatically used.
          </Alert>

          <SimpleGrid cols={2}>
            <TextInput
              label="Guest Name"
              placeholder="Full name"
              {...form.getInputProps("guest_name")}
              required
            />
            <TextInput
              label="Guest Phone"
              placeholder="10-digit number"
              {...form.getInputProps("guest_phone")}
              required
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              label="Guest Email (Optional)"
              placeholder="guest@example.com"
              {...form.getInputProps("guest_email")}
            />
            <TextInput
              label="Nationality"
              placeholder="e.g. Indian"
              {...form.getInputProps("nationality")}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Guest Address"
            placeholder="Full Residential Address"
            minRows={2}
            {...form.getInputProps("guest_address")}
            required
          />

          <SimpleGrid cols={2}>
            <DatePickerInput
              label="Check-In Date"
              placeholder="Arrival"
              minDate={new Date()}
              {...form.getInputProps("check_in_date")}
              popoverProps={{ width: "300" }}
              required
            />
            <DatePickerInput
              label="Check-Out Date"
              placeholder="Departure"
              minDate={form.values.check_in_date || new Date()}
              {...form.getInputProps("check_out_date")}
              popoverProps={{ width: "300" }}
              required
            />
          </SimpleGrid>

          <Textarea
            label="Purpose of Visit"
            placeholder="Min. 10 characters description..."
            minRows={3}
            {...form.getInputProps("visit_purpose")}
            required
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

GuestRoomBookingForm.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
