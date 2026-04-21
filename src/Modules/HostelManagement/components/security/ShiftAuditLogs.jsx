import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Group,
  Text,
  Badge,
  Paper,
  Box,
  ScrollArea,
  Tooltip,
} from "@mantine/core";
import { IconHistory, IconInfoCircle } from "@tabler/icons-react";

export default function ShiftAuditLogs({ logs, loading }) {
  const getActionColor = (action) => {
    switch (action) {
      case "Assigned":
        return "blue";
      case "Modified":
        return "yellow";
      case "Removed":
        return "red";
      default:
        return "gray";
    }
  };

  const rows = logs.map((log) => (
    <Table.Tr key={log.id}>
      <Table.Td>
        <Text size="xs" fw={500}>
          {new Date(log.timestamp).toLocaleString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={getActionColor(log.action)}
          variant="light"
          size="sm"
          radius="xs"
        >
          {log.action}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Box>
          <Text size="sm" fw={600}>
            {log.guard_name}
          </Text>
          <Text size="xs" c="dimmed">
            {log.hostel_name}
          </Text>
        </Box>
      </Table.Td>
      <Table.Td>
        <Text size="xs">{log.performed_by_name}</Text>
      </Table.Td>
      <Table.Td>
        <Tooltip
          label={JSON.stringify(log.detail_json, null, 2)}
          multiline
          w={300}
        >
          <Group gap={4} style={{ cursor: "help" }}>
            <IconInfoCircle size={14} color="gray" />
            <Text size="xs" c="dimmed">
              Details
            </Text>
          </Group>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper radius="md" withBorder p="md">
      <Group mb="lg">
        <IconHistory size={20} color="var(--mantine-color-blue-6)" />
        <Box>
          <Text size="lg" fw={700}>
            Shift Audit Trail
          </Text>
          <Text size="xs" c="dimmed">
            Immutable log of all scheduling actions for security monitoring
          </Text>
        </Box>
      </Group>

      <ScrollArea h={400} offsetScrollbars>
        <Table verticalSpacing="xs" striped highlightOnHover stickyHeader>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Timestamp</Table.Th>
              <Table.Th>Action</Table.Th>
              <Table.Th>Guard & Hostel</Table.Th>
              <Table.Th>Performed By</Table.Th>
              <Table.Th>Data</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={5} align="center" py="xl">
                  <Text size="sm" c="dimmed">
                    Loading logs...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : logs.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5} align="center" py="xl">
                  <Text size="sm" c="dimmed">
                    No activity logs found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

ShiftAuditLogs.propTypes = {
  logs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      timestamp: PropTypes.string.isRequired,
      action: PropTypes.string.isRequired,
      guard_name: PropTypes.string,
      hostel_name: PropTypes.string,
      performed_by_name: PropTypes.string,
      detail_json: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.array,
        PropTypes.string,
      ]),
    }),
  ).isRequired,
  loading: PropTypes.bool,
};
