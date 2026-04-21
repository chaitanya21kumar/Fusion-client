import React from "react";
import {
  Drawer,
  Stack,
  Text,
  Badge,
  Group,
  Divider,
  Timeline,
  Paper,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import PropTypes from "prop-types";
import { IconHistory, IconUser, IconExternalLink } from "@tabler/icons-react";

const statusColors = {
  Submitted: "blue",
  InProgress: "yellow",
  Escalated: "orange",
  Resolved: "green",
  Closed: "gray",
};

export default function ComplaintDetailDrawer({ opened, onClose, complaint }) {
  if (!complaint) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <Text fw={700} size="lg">
            {complaint.complaint_uid || `Complaint #${complaint.id}`}
          </Text>
          <Badge color={statusColors[complaint.status]}>
            {complaint.status}
          </Badge>
        </Group>
      }
      position="right"
      size="md"
    >
      <Stack gap="md">
        <Paper withBorder p="sm" radius="md" bg="var(--mantine-color-gray-0)">
          <Stack gap={8}>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">
                Category
              </Text>
              <Badge variant="light">{complaint.category}</Badge>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">
                Submitted By
              </Text>
              <Text size="sm">{complaint.student_name}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">
                Assigned To
              </Text>
              <Text size="sm">
                {complaint.assigned_to_name || "Unassigned"}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" fw={500} c="dimmed">
                Created At
              </Text>
              <Text size="sm">
                {new Date(complaint.created_at).toLocaleString()}
              </Text>
            </Group>
          </Stack>
        </Paper>

        <Stack gap={4}>
          <Text fw={600} size="sm">
            Description
          </Text>
          <Paper withBorder p="sm" radius="md">
            <Text size="sm">{complaint.description}</Text>
          </Paper>
        </Stack>

        {complaint.attachments && (
          <Group justify="space-between">
            <Text fw={600} size="sm">
              Attachments
            </Text>
            <Tooltip label="View File">
              <ActionIcon
                component="a"
                href={complaint.attachments}
                target="_blank"
                variant="light"
              >
                <IconExternalLink size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}

        {complaint.resolution_remarks && (
          <Stack gap={4}>
            <Text fw={600} size="sm" c="green">
              Resolution Remarks
            </Text>
            <Paper withBorder p="sm" radius="md" bg="green.0">
              <Text size="sm">{complaint.resolution_remarks}</Text>
              <Text size="xs" c="dimmed" mt={4}>
                Resolved at: {new Date(complaint.resolved_at).toLocaleString()}
              </Text>
            </Paper>
          </Stack>
        )}

        <Divider label="Audit Trail & History" labelPosition="center" my="sm" />

        <Timeline
          active={(complaint.history?.length || 1) - 1}
          bulletSize={24}
          lineWidth={2}
        >
          {complaint.history?.map((event, index) => (
            <Timeline.Item
              key={index}
              bullet={<IconHistory size={12} />}
              title={
                <Group gap="xs">
                  <Text size="sm" fw={600}>
                    {event.new_status}
                  </Text>
                  {event.old_status && (
                    <Text size="xs" c="dimmed">
                      (from {event.old_status})
                    </Text>
                  )}
                </Group>
              }
            >
              <Text size="xs" c="dimmed" mt={4}>
                {new Date(event.timestamp).toLocaleString()}
              </Text>
              <Text size="sm" mt={4}>
                {event.remarks || "No remarks provided."}
              </Text>
              <Group gap={4} mt={4}>
                <IconUser size={12} color="gray" />
                <Text size="xs" c="dimmed">
                  By: {event.changed_by_name}
                </Text>
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      </Stack>
    </Drawer>
  );
}

ComplaintDetailDrawer.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.number.isRequired,
    complaint_uid: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    student_name: PropTypes.string,
    assigned_to_name: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    attachments: PropTypes.string,
    resolution_remarks: PropTypes.string,
    resolved_at: PropTypes.string,
    history: PropTypes.arrayOf(
      PropTypes.shape({
        new_status: PropTypes.string.isRequired,
        old_status: PropTypes.string,
        timestamp: PropTypes.string.isRequired,
        remarks: PropTypes.string,
        changed_by_name: PropTypes.string,
      }),
    ),
  }),
};
