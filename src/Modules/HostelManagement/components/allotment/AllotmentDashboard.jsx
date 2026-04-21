import React from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Text,
  Table,
  Checkbox,
  Badge,
  Avatar,
  ActionIcon,
  Tooltip,
  Group,
  Stack,
  ScrollArea,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";

/**
 * AllotmentDashboard Component
 *
 * Displays a list of pending accommodation requests to Super Admin.
 * Supports multiple selection for bulk allotment actions using Mantine UI.
 */
function AllotmentDashboard({ requests, selectedIds, onSelect, onSelectAll }) {
  const isAllSelected =
    requests.length > 0 && selectedIds.length === requests.length;

  return (
    <Paper radius="md" withBorder shadow="sm" style={{ overflow: "hidden" }}>
      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: 40 }}>
                <Checkbox
                  indeterminate={
                    selectedIds.length > 0 &&
                    selectedIds.length < requests.length
                  }
                  checked={isAllSelected}
                  onChange={onSelectAll}
                />
              </Table.Th>
              <Table.Th fw={700}>Student</Table.Th>
              <Table.Th fw={700}>Window</Table.Th>
              <Table.Th fw={700}>Hostel Pref.</Table.Th>
              <Table.Th fw={700}>Room Pref.</Table.Th>
              <Table.Th fw={700}>Status</Table.Th>
              <Table.Th fw={700} ta="right">
                Actions
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={7} ta="center" py={50}>
                  <Text c="dimmed" size="sm">
                    No pending requests found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              requests.map((request) => {
                const isSelected = selectedIds.includes(request.id);
                return (
                  <Table.Tr
                    key={request.id}
                    bg={isSelected ? "blue.0" : undefined}
                    style={{ cursor: "pointer" }}
                    onClick={() => onSelect(request.id)}
                  >
                    <Table.Td>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}} // Handled by Row onClick
                        tabIndex={-1}
                        style={{ pointerEvents: "none" }}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="sm">
                        <Avatar size="sm" radius="xl" color="blue">
                          {request.student_name?.[0] || "S"}
                        </Avatar>
                        <Stack gap={0}>
                          <Text size="sm" fw={600}>
                            {request.student_name || "Unknown"}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {request.roll_number}
                          </Text>
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{request.window_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="outline" color="gray" radius="sm">
                        {request.preferred_hostel_type}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">{request.preferred_room_type}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color="orange"
                        radius="sm"
                        fw={600}
                      >
                        {request.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Tooltip label="View Details" withArrow position="left">
                        <ActionIcon variant="subtle" color="gray" size="sm">
                          <IconInfoCircle size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

AllotmentDashboard.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      student_name: PropTypes.string,
      roll_number: PropTypes.string,
      window_name: PropTypes.string,
      preferred_hostel_type: PropTypes.string,
      preferred_room_type: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  selectedIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  onSelectAll: PropTypes.func.isRequired,
};

export default AllotmentDashboard;
