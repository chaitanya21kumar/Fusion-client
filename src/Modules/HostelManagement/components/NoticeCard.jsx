/**
 * NoticeCard - Micro Component
 * Displays a single notice from the notice board with priority levels and read status.
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  Badge,
  Group,
  Stack,
  Text,
  ThemeIcon,
  ActionIcon,
  Tooltip,
  Indicator,
  Box,
  Anchor,
} from "@mantine/core";
import {
  IconBellRinging,
  IconChevronRight,
  IconTrash,
  IconAlertTriangle,
  IconInfoCircle,
  IconDownload,
} from "@tabler/icons-react";

const priorityConfig = {
  Urgent: { color: "red", icon: IconAlertTriangle, label: "Urgent" },
  Important: { color: "orange", icon: IconInfoCircle, label: "Important" },
  Normal: { color: "gray", icon: IconBellRinging, label: "Normal" },
};

export default function NoticeCard({
  notice,
  onView,
  onDelete,
  canDelete = false,
  showActions = true,
}) {
  const config = priorityConfig[notice.priority] || priorityConfig.Normal;
  const isUrgent = notice.priority === "Urgent";
  const isImportant = notice.priority === "Important";

  return (
    <Indicator
      inline
      processing
      disabled={notice.is_read || !showActions}
      color="blue"
      size={12}
      offset={4}
      h="100%"
      styles={{ indicator: { zIndex: 10 } }}
    >
      <Card
        withBorder
        padding="md"
        radius="md"
        h="100%"
        sx={(theme) => ({
          display: "flex",
          borderLeft: `4px solid ${theme.colors[config.color][6]}`,
          backgroundColor: isUrgent
            ? theme.colors.red[0]
            : isImportant
              ? theme.colors.orange[0]
              : "white",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            box_shadow: theme.shadows.sm,
          },
        })}
      >
        <Stack gap="sm" style={{ flex: 1 }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <ThemeIcon
                variant="light"
                size="lg"
                radius="md"
                color={config.color}
              >
                <config.icon size={20} />
              </ThemeIcon>
              <Stack gap={2}>
                <Text fw={700} size="sm" lineClamp={1}>
                  {notice.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {notice.created_by_name} •{" "}
                  {new Date(notice.created_at).toLocaleDateString()}
                </Text>
              </Stack>
            </Group>
            <Badge color={config.color} variant="light" size="sm">
              {config.label}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed" lineClamp={2}>
            {notice.description}
          </Text>

          <Group justify="space-between" align="center" mt="auto" pt="xs">
            <Box>
              {notice.attachment && (
                <Anchor
                  href={notice.attachment}
                  target="_blank"
                  download
                  underline="hover"
                  size="xs"
                >
                  <Group gap={4}>
                    <IconDownload size={14} />
                    <Text size="xs" span>
                      Attachment
                    </Text>
                  </Group>
                </Anchor>
              )}
            </Box>

            {showActions && (
              <Group gap="xs">
                {canDelete && (
                  <Tooltip label="Delete Notice">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(notice);
                      }}
                    >
                      <IconTrash size={18} />
                    </ActionIcon>
                  </Tooltip>
                )}
                <Tooltip label="View Details">
                  <ActionIcon
                    variant="filled"
                    color={config.color}
                    onClick={() => onView?.(notice)}
                  >
                    <IconChevronRight size={18} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          </Group>
        </Stack>
      </Card>
    </Indicator>
  );
}

NoticeCard.propTypes = {
  notice: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    priority: PropTypes.string,
    created_by_name: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    is_read: PropTypes.bool,
    attachment: PropTypes.string,
  }).isRequired,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  canDelete: PropTypes.bool,
  showActions: PropTypes.bool,
};
