/**
 * FineStatusCard - Micro Component
 * Displays fine information with payment status and actions
 * Dumb component - receives data and callbacks from parent
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  Badge,
  Group,
  Stack,
  Text,
  Button,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Progress,
} from "@mantine/core";
import {
  IconMoneybag,
  IconCheck,
  IconX,
  IconChevronRight,
} from "@tabler/icons-react";

const statusColors = {
  pending: "yellow",
  paid: "green",
  waived: "blue",
  cancelled: "gray",
};

const typeColors = {
  damage: "red",
  late_checkout: "orange",
  rule_violation: "pink",
  other: "gray",
};

export default function FineStatusCard({
  fine,
  onView,
  onMarkPaid,
  onWaive,
  canMarkPaid = false,
  canWaive = false,
  showActions = true,
}) {
  const isPaid = fine.status === "paid";
  const isWaived = fine.status === "waived";

  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group align="flex-start">
            <ThemeIcon variant="light" size="lg" radius="md" color="yellow">
              <IconMoneybag size={20} />
            </ThemeIcon>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                Fine #{fine.id}
              </Text>
              <Text size="xs" c="dimmed">
                {new Date(fine.created_at).toLocaleDateString()}
              </Text>
            </Stack>
          </Group>
          <Badge color={statusColors[fine.status] || "gray"}>
            {fine.status}
          </Badge>
        </Group>

        <Stack gap={4}>
          <Group justify="space-between">
            <Text fw={500}>Amount</Text>
            <Text fw={600} size="lg" c={isPaid ? "green" : "red"}>
              ₹{fine.amount}
            </Text>
          </Group>

          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed">
              {fine.type}
            </Text>
            <Badge size="sm" color={typeColors[fine.type] || "gray"}>
              {fine.type}
            </Badge>
          </Group>

          {fine.reason && (
            <Text size="sm" c="dimmed">
              {fine.reason}
            </Text>
          )}
        </Stack>

        {!isPaid && !isWaived && (
          <Progress value={0} size="sm" color="red" radius="md" />
        )}
        {isPaid && (
          <Group gap={4}>
            <IconCheck size={16} color="green" />
            <Text size="sm" c="green">
              Paid on {new Date(fine.paid_date).toLocaleDateString()}
            </Text>
          </Group>
        )}
        {isWaived && (
          <Group gap={4}>
            <IconCheck size={16} color="blue" />
            <Text size="sm" c="blue">
              Waived on {new Date(fine.waived_date).toLocaleDateString()}
            </Text>
          </Group>
        )}

        {showActions && (
          <Group justify="flex-end" gap="xs">
            <Tooltip label="View Details">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onView?.(fine)}
              >
                <IconChevronRight size={18} />
              </ActionIcon>
            </Tooltip>

            {canMarkPaid && !isPaid && !isWaived && (
              <Button
                size="xs"
                color="green"
                onClick={() => onMarkPaid?.(fine)}
              >
                <IconCheck size={16} />
                Mark Paid
              </Button>
            )}

            {canWaive && !isPaid && !isWaived && (
              <Button
                size="xs"
                color="blue"
                variant="light"
                onClick={() => onWaive?.(fine)}
              >
                <IconX size={16} />
                Waive
              </Button>
            )}
          </Group>
        )}
      </Stack>
    </Card>
  );
}

FineStatusCard.propTypes = {
  fine: PropTypes.shape({
    id: PropTypes.number.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    reason: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    paid_date: PropTypes.string,
    waived_date: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onMarkPaid: PropTypes.func,
  onWaive: PropTypes.func,
  canMarkPaid: PropTypes.bool,
  canWaive: PropTypes.bool,
  showActions: PropTypes.bool,
};
