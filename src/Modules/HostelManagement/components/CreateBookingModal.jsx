/**
 * CreateBookingModal Component
 * Modal form for creating a new guest room booking
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
  Grid,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates";

function CreateBookingModal({
  opened,
  onClose,
  onSubmit,
  loading,
  halls = [],
}) {
  const [formData, setFormData] = useState({
    hall_id: "",
    guest_name: "",
    guest_phone: "",
    guest_email: "",
    guest_address: "",
    rooms_required: 1,
    total_guest: 1,
    purpose: "",
    arrival_date: null,
    arrival_time: "",
    departure_date: null,
    departure_time: "",
    nationality: "Indian",
    room_type: "single",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      arrival_date: formData.arrival_date?.toISOString().split("T")[0],
      departure_date: formData.departure_date?.toISOString().split("T")[0],
    };
    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Book Guest Room" size="lg">
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
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Guest Name"
                placeholder="Enter guest name"
                required
                value={formData.guest_name}
                onChange={(e) => handleChange("guest_name", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Guest Phone"
                placeholder="Enter phone number"
                required
                value={formData.guest_phone}
                onChange={(e) => handleChange("guest_phone", e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Guest Email"
                placeholder="Enter email"
                value={formData.guest_email}
                onChange={(e) => handleChange("guest_email", e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Nationality"
                placeholder="Enter nationality"
                value={formData.nationality}
                onChange={(e) => handleChange("nationality", e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Textarea
            label="Guest Address"
            placeholder="Enter address"
            value={formData.guest_address}
            onChange={(e) => handleChange("guest_address", e.target.value)}
          />
          <Grid>
            <Grid.Col span={4}>
              <NumberInput
                label="Rooms Required"
                min={1}
                value={formData.rooms_required}
                onChange={(value) => handleChange("rooms_required", value)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Total Guests"
                min={1}
                value={formData.total_guest}
                onChange={(value) => handleChange("total_guest", value)}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <Select
                label="Room Type"
                data={[
                  { value: "single", label: "Single" },
                  { value: "double", label: "Double" },
                  { value: "triple", label: "Triple" },
                ]}
                value={formData.room_type}
                onChange={(value) => handleChange("room_type", value)}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}>
              <DateInput
                label="Arrival Date"
                placeholder="Select date"
                required
                value={formData.arrival_date}
                onChange={(value) => handleChange("arrival_date", value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TimeInput
                label="Arrival Time"
                required
                value={formData.arrival_time}
                onChange={(e) => handleChange("arrival_time", e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={6}>
              <DateInput
                label="Departure Date"
                placeholder="Select date"
                required
                value={formData.departure_date}
                onChange={(value) => handleChange("departure_date", value)}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TimeInput
                label="Departure Time"
                required
                value={formData.departure_time}
                onChange={(e) => handleChange("departure_time", e.target.value)}
              />
            </Grid.Col>
          </Grid>
          <Textarea
            label="Purpose of Visit"
            placeholder="Enter purpose"
            required
            value={formData.purpose}
            onChange={(e) => handleChange("purpose", e.target.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Booking
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

CreateBookingModal.propTypes = {
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

export default CreateBookingModal;
