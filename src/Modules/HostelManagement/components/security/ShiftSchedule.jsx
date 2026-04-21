import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Group,
  Text,
  Badge,
  ActionIcon,
  Tooltip,
  Paper,
  Box,
  Button,
  Flex,
  Stack,
} from "@mantine/core";
import { IconCalendarPlus, IconTrash, IconClock } from "@tabler/icons-react";

export default function ShiftSchedule({
  shifts,
  loading,
  onAssign,
  onRemove,
  selectedDate,
  userRole,
}) {
  const canManage = userRole === "warden" || userRole === "super_admin";

  const rows = shifts.map((shift) => (
    <Table.Tr key={shift.id}>
      <Table.Td>
        <Group gap="sm">
          <IconClock size={16} color="var(--mantine-color-blue-6)" />
          <div>
            <Text size="sm" fw={600}>
              {shift.guard_name}
            </Text>
            <Text size="xs" c="dimmed">
              {shift.shift_type} Shift
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" fw={500}>
          {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge variant="outline" size="sm">
          {shift.hostel_name}
        </Badge>
      </Table.Td>
      {canManage && (
        <Table.Td>
          <Tooltip label="Remove Assignment">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => onRemove(shift.id)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Table.Td>
      )}
    </Table.Tr>
  ));

  return (
    <Paper radius="md" withBorder p="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Box>
          <Text size="lg" fw={700}>
            Daily Deployment Schedule
          </Text>
          <Text size="xs" c="dimmed">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </Box>
        {canManage && (
          <Button
            leftSection={<IconCalendarPlus size={16} />}
            size="xs"
            radius="md"
            onClick={onAssign}
          >
            Assign Shift
          </Button>
        )}
      </Flex>

      <Table.ScrollContainer minWidth={600}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Guard & Type</Table.Th>
              <Table.Th>Time Slot</Table.Th>
              <Table.Th>Hostel</Table.Th>
              {canManage && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={canManage ? 4 : 3} align="center" py="xl">
                  <Text size="sm" c="dimmed">
                    Loading shifts...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : shifts.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={canManage ? 4 : 3} align="center" py="xl">
                  <Stack align="center" gap={4}>
                    <Text size="sm" fw={500} c="dimmed">
                      No shifts assigned for this date.
                    </Text>
                    {canManage && (
                      <Text size="xs" c="dimmed">
                        Click "Assign Shift" to deploy guards.
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

ShiftSchedule.propTypes = {
  shifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      guard_name: PropTypes.string.isRequired,
      shift_type: PropTypes.string.isRequired,
      start_time: PropTypes.string.isRequired,
      end_time: PropTypes.string.isRequired,
      hostel_name: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onAssign: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  selectedDate: PropTypes.string.isRequired,
  userRole: PropTypes.string.isRequired,
};
