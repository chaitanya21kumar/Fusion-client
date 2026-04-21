/**
 * StaffScheduleTable - Micro Component
 * Displays staff scheduling information
 * Dumb component - receives data and callbacks from parent
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Badge,
  ActionIcon,
  Tooltip,
  Group,
  Text,
  Stack,
  Center,
  Loader,
} from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";

const dayOfWeekLabels = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export default function StaffScheduleTable({
  schedules,
  loading = false,
  onEdit,
  onDelete,
  showActions = true,
}) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!schedules || schedules.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No schedules found</Text>
      </Center>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Staff Member</Table.Th>
            <Table.Th>Day</Table.Th>
            <Table.Th>Start Time</Table.Th>
            <Table.Th>End Time</Table.Th>
            <Table.Th>Location</Table.Th>
            {showActions && <Table.Th>Actions</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {schedules.map((schedule) => (
            <Table.Tr key={schedule.id}>
              <Table.Td>
                <Stack gap={0}>
                  <Text fw={500} size="sm">
                    {schedule.staff?.first_name} {schedule.staff?.last_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {schedule.staff?.user?.username}
                  </Text>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Badge variant="light">
                  {dayOfWeekLabels[schedule.day_of_week] || "Unknown"}
                </Badge>
              </Table.Td>
              <Table.Td>{schedule.start_time}</Table.Td>
              <Table.Td>{schedule.end_time}</Table.Td>
              <Table.Td>{schedule.location || "-"}</Table.Td>
              {showActions && (
                <Table.Td>
                  <Group gap="xs">
                    <Tooltip label="Edit">
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="blue"
                        onClick={() => onEdit?.(schedule)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Delete">
                      <ActionIcon
                        variant="light"
                        size="sm"
                        color="red"
                        onClick={() => onDelete?.(schedule)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}

StaffScheduleTable.propTypes = {
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      staff: PropTypes.shape({
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        user: PropTypes.shape({
          username: PropTypes.string,
        }),
      }),
      day_of_week: PropTypes.number.isRequired,
      start_time: PropTypes.string.isRequired,
      end_time: PropTypes.string.isRequired,
      location: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};
