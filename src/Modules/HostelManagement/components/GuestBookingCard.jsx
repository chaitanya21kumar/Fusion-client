import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Button,
  Divider,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import {
  IconUser,
  IconCalendar,
  IconBuildingCommunity,
  IconCheck,
  IconArrowRight,
  IconLogout,
  IconCurrencyRupee,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function GuestBookingCard({
  booking,
  onApprove,
  onCheckIn,
  onCheckOut,
  canApprove,
  canCheckIn,
  canCheckOut,
  showActions = true,
}) {
  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s === "pending") return "yellow";
    if (s === "approved") return "green";
    if (s === "checkedin" || s === "checked_in") return "blue";
    if (s === "completed" || s === "checked_out") return "gray";
    if (s === "rejected") return "red";
    if (s === "cancelled") return "red";
    return "gray";
  };

  const getStatusLabel = (status = "") => {
    if (status === "CheckedIn") return "CHECKED IN";
    return status.replace("_", " ").toUpperCase();
  };

  return (
    <Card withBorder radius="md" padding="lg" shadow="sm">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={2} style={{ flex: 1 }}>
            <Group gap="xs" wrap="nowrap">
              <IconUser size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={600} size="lg" truncate>
                {booking.guest_name}
              </Text>
            </Group>
            <Text size="xs" color="dimmed" ml={30} lineClamp={2}>
              Purpose: {booking.visit_purpose}
            </Text>
          </Stack>
          <Badge
            size="lg"
            variant="light"
            color={getStatusColor(booking.status)}
          >
            {getStatusLabel(booking.status)}
          </Badge>
        </Group>

        <Divider />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          <Group gap="sm" wrap="nowrap">
            <IconCalendar
              size={24}
              color="var(--mantine-color-blue-5)"
              style={{ flexShrink: 0 }}
            />
            <Stack gap={0}>
              <Text size="xs" color="dimmed" tt="uppercase" fw={600}>
                Check-In Date
              </Text>
              <Text size="sm" fw={600}>
                {booking.check_in_date}
              </Text>
            </Stack>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <IconCalendar
              size={24}
              color="var(--mantine-color-blue-5)"
              style={{ flexShrink: 0 }}
            />
            <Stack gap={0}>
              <Text size="xs" color="dimmed" tt="uppercase" fw={600}>
                Check-Out Date
              </Text>
              <Text size="sm" fw={600}>
                {booking.check_out_date}
              </Text>
            </Stack>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <IconBuildingCommunity
              size={24}
              color="var(--mantine-color-orange-5)"
              style={{ flexShrink: 0 }}
            />
            <Stack gap={0}>
              <Text size="xs" color="dimmed" tt="uppercase" fw={600}>
                Room Assignment
              </Text>
              <Text size="sm" fw={600}>
                {booking.room_number
                  ? `Room ${booking.room_number}`
                  : "Pending Assignment"}
              </Text>
            </Stack>
          </Group>

          <Group gap="sm" wrap="nowrap">
            <IconCurrencyRupee
              size={24}
              color="var(--mantine-color-teal-5)"
              style={{ flexShrink: 0 }}
            />
            <Stack gap={0}>
              <Text size="xs" color="dimmed" tt="uppercase" fw={600}>
                Total Charge
              </Text>
              <Text size="sm" fw={700} color="teal.7">
                ₹{booking.total_charges}
              </Text>
            </Stack>
          </Group>
        </SimpleGrid>

        {booking.status?.toLowerCase() === "checkedin" &&
          booking.id_proof_number && (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
              py="xs"
            >
              <Text size="xs">
                Identity Verified: {booking.id_proof_type.toUpperCase()} -{" "}
                {booking.id_proof_number}
              </Text>
            </Alert>
          )}

        {showActions && (
          <Group justify="flex-end" mt="md" gap="sm">
            {booking.status?.toLowerCase() === "pending" && canApprove && (
              <Button
                variant="light"
                color="green"
                leftSection={<IconCheck size={18} />}
                onClick={onApprove}
              >
                Review & Approve
              </Button>
            )}

            {booking.status?.toLowerCase() === "approved" && canCheckIn && (
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconArrowRight size={18} />}
                onClick={onCheckIn}
              >
                Verify & Check-In
              </Button>
            )}

            {(booking.status?.toLowerCase() === "checkedin" ||
              booking.status?.toLowerCase() === "checked_in") &&
              canCheckOut && (
                <Button
                  variant="filled"
                  color="orange"
                  leftSection={<IconLogout size={18} />}
                  onClick={onCheckOut}
                >
                  Inspect & Check-Out
                </Button>
              )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

GuestBookingCard.propTypes = {
  booking: PropTypes.shape({
    guest_name: PropTypes.string,
    visit_purpose: PropTypes.string,
    status: PropTypes.string,
    check_in_date: PropTypes.string,
    check_out_date: PropTypes.string,
    room_number: PropTypes.string,
    total_charges: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id_proof_number: PropTypes.string,
    id_proof_type: PropTypes.string,
  }).isRequired,
  onApprove: PropTypes.func.isRequired,
  onCheckIn: PropTypes.func.isRequired,
  onCheckOut: PropTypes.func.isRequired,
  canApprove: PropTypes.bool.isRequired,
  canCheckIn: PropTypes.bool.isRequired,
  canCheckOut: PropTypes.bool.isRequired,
  showActions: PropTypes.bool,
};
