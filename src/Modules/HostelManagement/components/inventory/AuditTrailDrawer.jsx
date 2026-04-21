import PropTypes from "prop-types";
import {
  Drawer,
  ScrollArea,
  Timeline,
  Text,
  Badge,
  Group,
  Stack,
} from "@mantine/core";
import {
  IconHistory,
  IconCircleCheck,
  IconInfoCircle,
} from "@tabler/icons-react";

export default function AuditTrailDrawer({
  opened,
  onClose,
  item,
  logs,
  loading,
}) {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconHistory size={20} />
          <Text fw={700}>Audit Trail: {item?.name}</Text>
        </Group>
      }
      position="right"
      size="md"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <Stack p="md">
        {loading ? (
          <Text ta="center" py="xl">
            Loading history...
          </Text>
        ) : !logs || logs.length === 0 ? (
          <Text ta="center" py="xl" c="dimmed">
            No history recorded for this item.
          </Text>
        ) : (
          <Timeline active={logs.length} bulletSize={24} lineWidth={2}>
            {logs.map((log) => (
              <Timeline.Item
                key={log.id}
                bullet={
                  log.action === "Inspected" ? (
                    <IconCircleCheck size={14} />
                  ) : (
                    <IconInfoCircle size={14} />
                  )
                }
                title={
                  <Group justify="space-between">
                    <Text size="sm" fw={700}>
                      {log.action}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(log.timestamp).toLocaleString()}
                    </Text>
                  </Group>
                }
              >
                <Stack gap={4} mt={4}>
                  <Text size="xs">
                    <Text span fw={600}>
                      Performed by:
                    </Text>{" "}
                    {log.performed_by_name}
                  </Text>

                  <Group gap="xs">
                    <Text size="xs" fw={600}>
                      Quantity:
                    </Text>
                    <Text size="xs">
                      {log.old_qty ?? "N/A"} → {log.new_qty}
                    </Text>
                  </Group>

                  <Group gap="xs">
                    <Text size="xs" fw={600}>
                      Condition:
                    </Text>
                    <Badge size="xs" variant="light">
                      {log.old_condition ?? "N/A"}
                    </Badge>
                    <Text size="xs">→</Text>
                    <Badge size="xs">{log.new_condition}</Badge>
                  </Group>

                  {log.remarks && (
                    <Text
                      size="xs"
                      p="xs"
                      bg="gray.0"
                      style={{
                        borderRadius: "4px",
                        borderLeft: "3px solid #dee2e6",
                      }}
                    >
                      {log.remarks}
                    </Text>
                  )}
                </Stack>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Stack>
    </Drawer>
  );
}

AuditTrailDrawer.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.shape({
    name: PropTypes.string,
  }),
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      action: PropTypes.string,
      new_qty: PropTypes.number,
      old_qty: PropTypes.number,
      new_condition: PropTypes.string,
      old_condition: PropTypes.string,
      performed_by_name: PropTypes.string,
      remarks: PropTypes.string,
      timestamp: PropTypes.string,
    }),
  ),
  loading: PropTypes.bool,
};
