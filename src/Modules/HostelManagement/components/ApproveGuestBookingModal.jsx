import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Group,
  Stack,
  Text,
  Select,
  Textarea,
  Alert,
  Loader,
  SimpleGrid,
  Divider,
  SegmentedControl,
  Card,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { fetchGuestRoomRegistry, approveGuestBooking } from "../api";

export default function ApproveGuestBookingModal({
  opened,
  onClose,
  booking,
  hallId,
  onApproveSuccess,
}) {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [decision, setDecision] = useState("approved");

  const loadAvailableGuestRooms = useCallback(async () => {
    try {
      setRoomsLoading(true);
      setError(null);
      // Fetch only designated guest rooms that are NOT occupied
      const registryData = await fetchGuestRoomRegistry({ hall_id: hallId });

      const availableRooms = registryData
        .filter((item) => !item.is_occupied)
        .map((item) => ({
          value: item.id.toString(),
          label: `Room ${item.room_detail.room_number} (Floor ${item.room_detail.floor})`,
        }));

      setRooms(availableRooms);

      if (availableRooms.length === 0) {
        setError(
          "No vacant Guest Rooms found in registry. Please add rooms to the Guest Registry first.",
        );
      }
    } catch (err) {
      setError("Failed to load guest rooms");
    } finally {
      setRoomsLoading(false);
    }
  }, [hallId]);

  useEffect(() => {
    if (opened && hallId && booking && decision === "approved") {
      loadAvailableGuestRooms();
    }
  }, [opened, hallId, booking, decision]);

  const handleSubmit = async () => {
    try {
      if (decision === "approved" && !selectedRoom) {
        notifications.show({
          title: "Error",
          message: "Please select a room",
          color: "red",
        });
        return;
      }

      setLoading(true);
      const payload = {
        decision,
        remarks: remarks.trim(),
        room_id: selectedRoom ? parseInt(selectedRoom, 10) : null,
      };

      await approveGuestBooking(booking.id, payload);

      notifications.show({
        title: "Success",
        message: `Booking ${decision === "approved" ? "approved" : "rejected"} successfully`,
        color: decision === "approved" ? "green" : "orange",
      });

      onApproveSuccess?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Action failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>Review Guest Booking Request</Text>}
      size="lg"
      centered
    >
      <Stack gap="md">
        <Card withBorder p="md" bg="gray.0">
          <SimpleGrid cols={2}>
            <div>
              <Text size="xs" color="dimmed">
                Guest Name
              </Text>
              <Text size="sm" fw={500}>
                {booking.guest_name}
              </Text>
            </div>
            <div>
              <Text size="xs" color="dimmed">
                Stay Dates
              </Text>
              <Text size="sm" fw={500}>
                {booking.check_in_date} to {booking.check_out_date}
              </Text>
            </div>
            <div>
              <Text size="xs" color="dimmed">
                Purpose
              </Text>
              <Text size="sm">{booking.visit_purpose}</Text>
            </div>
            <div>
              <Text size="xs" color="dimmed">
                Estimated Charge
              </Text>
              <Text size="sm" fw={700} color="blue">
                ₹{booking.total_charges}
              </Text>
            </div>
          </SimpleGrid>
        </Card>

        <SegmentedControl
          value={decision}
          onChange={setDecision}
          data={[
            { label: "Approve", value: "approved" },
            { label: "Reject", value: "rejected" },
          ]}
          color={decision === "approved" ? "green" : "red"}
          fullWidth
        />

        {decision === "approved" && (
          <>
            <Divider label="Room Assignment" labelPosition="center" />
            {roomsLoading ? (
              <Group justify="center">
                <Loader size="sm" />
              </Group>
            ) : error ? (
              <Alert icon={<IconAlertCircle />} color="red">
                {error}
              </Alert>
            ) : (
              <Select
                label="Select Guest Room"
                placeholder="Choose from designated guest rooms"
                data={rooms}
                value={selectedRoom}
                onChange={setSelectedRoom}
                required
              />
            )}
          </>
        )}

        <Textarea
          label={
            decision === "approved" ? "Approval Remarks" : "Rejection Reason"
          }
          placeholder="Add your comments here..."
          minRows={3}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />

        <Group justify="flex-end" mt="lg">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color={decision === "approved" ? "green" : "red"}
            leftSection={
              decision === "approved" ? (
                <IconCheck size={18} />
              ) : (
                <IconX size={18} />
              )
            }
            onClick={handleSubmit}
            loading={loading}
            disabled={decision === "approved" && !selectedRoom}
          >
            {decision === "approved" ? "Approve & Assign" : "Reject Booking"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ApproveGuestBookingModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  booking: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    guest_name: PropTypes.string,
    check_in_date: PropTypes.string,
    check_out_date: PropTypes.string,
    visit_purpose: PropTypes.string,
    total_charges: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  hallId: PropTypes.string,
  onApproveSuccess: PropTypes.func,
};
