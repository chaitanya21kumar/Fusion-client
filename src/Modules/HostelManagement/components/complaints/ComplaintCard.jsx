/**
 * ComplaintCard - Micro Component
 * Displays a single complaint with status and action buttons
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
  ActionIcon,
  Tooltip,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconChevronRight,
  IconArrowNarrowUp,
  IconCheck,
} from "@tabler/icons-react";

const statusColors = {
  Submitted: "blue",
  InProgress: "yellow",
  Escalated: "orange",
  Resolved: "green",
  Closed: "gray",
};

const statusLabels = {
  Submitted: "Submitted",
  InProgress: "In Progress",
  Escalated: "Escalated to Warden",
  Resolved: "Resolved",
  Closed: "Closed",
};

const categoryColors = {
  Maintenance: "purple",
  Cleaning: "orange",
  Security: "red",
  Other: "gray",
};

const priorityColors = {
  low: "gray",
  medium: "blue",
  high: "orange",
  critical: "red",
};

export default function ComplaintCard({
  complaint,
  onView,
  onStart,
  onEscalate,
  onResolve,
  canStart,
  canEscalate,
  canResolve,
  showActions = true,
}) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start">
          <Group align="flex-start">
            <ThemeIcon variant="light" size="lg" radius="md" color="red">
              <IconAlertCircle size={20} />
            </ThemeIcon>
            <Stack gap={4}>
              <Text fw={600} size="sm">
                {complaint.complaint_uid || `Complaint #${complaint.id}`}
              </Text>
              <Text size="xs" c="dimmed">
                Submitted on{" "}
                {new Date(complaint.created_at).toLocaleDateString()}
              </Text>
            </Stack>
          </Group>
          <Badge color={statusColors[complaint.status] || "gray"}>
            {statusLabels[complaint.status] || complaint.status}
          </Badge>
        </Group>

        <Stack gap={4}>
          <Text size="sm" fw={500}>
            {complaint.title}
          </Text>
          <Text size="sm" c="dimmed" lineClamp={2}>
            {complaint.description}
          </Text>
        </Stack>

        <Group gap="xs">
          <Badge
            size="sm"
            variant="light"
            color={categoryColors[complaint.category]}
          >
            {complaint.category}
          </Badge>
          {complaint.priority && (
            <Badge
              size="sm"
              variant="light"
              color={priorityColors[complaint.priority] || "gray"}
            >
              {complaint.priority}
            </Badge>
          )}
          {complaint.location && (
            <Badge size="sm" variant="light">
              {complaint.location}
            </Badge>
          )}
        </Group>

        {showActions && (
          <Group justify="flex-end" gap="xs">
            {canStart && (
              <Button
                size="xs"
                variant="light"
                color="blue"
                onClick={() => onStart?.(complaint)}
              >
                Start Work
              </Button>
            )}
            {canEscalate && (
              <Tooltip label="Escalate to Warden">
                <Button
                  size="xs"
                  variant="light"
                  color="orange"
                  onClick={() => onEscalate?.(complaint)}
                >
                  <IconArrowNarrowUp size={16} />
                  Escalate
                </Button>
              </Tooltip>
            )}
            {canResolve && (
              <Tooltip label="Mark Resolved">
                <Button
                  size="xs"
                  color="green"
                  onClick={() => onResolve?.(complaint)}
                >
                  <IconCheck size={16} />
                  Resolve
                </Button>
              </Tooltip>
            )}
            <Tooltip label="View Details & History">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => onView?.(complaint)}
              >
                <IconChevronRight size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Stack>
    </Card>
  );
}

ComplaintCard.propTypes = {
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_uid: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    location: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    priority: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onStart: PropTypes.func,
  onEscalate: PropTypes.func,
  onResolve: PropTypes.func,
  canStart: PropTypes.bool,
  canEscalate: PropTypes.bool,
  canResolve: PropTypes.bool,
  showActions: PropTypes.bool,
};
