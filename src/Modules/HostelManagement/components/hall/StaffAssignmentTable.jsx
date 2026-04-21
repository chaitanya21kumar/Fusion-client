/**
 * StaffAssignmentTable — Display current staff assignments for a hostel
 *
 * Shows active and inactive assignments with role, dates, and status.
 * Active assignments highlighted; inactive ones greyed out.
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Badge,
  Text,
  Group,
  Paper,
  Title,
  ScrollArea,
  Center,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconShieldCheck,
  IconUser,
  IconUserOff,
  IconTrash,
} from "@tabler/icons-react";

const ROLE_COLORS = {
  Warden: "violet",
  Caretaker: "indigo",
};

export default function StaffAssignmentTable({
  assignments = [],
  title,
  onRemove,
}) {
  if (!assignments || assignments.length === 0) {
    return (
      <Paper withBorder p="lg" radius="md">
        <Center>
          <Group gap="xs">
            <IconUserOff size={20} color="gray" />
            <Text c="dimmed" size="sm">
              No staff assignments found for this hostel.
            </Text>
          </Group>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="md" radius="md">
      {title && (
        <Group gap="xs" mb="sm">
          <IconShieldCheck size={20} />
          <Title order={5}>{title}</Title>
        </Group>
      )}

      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Start Date</Table.Th>
              <Table.Th>End Date</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Assigned By</Table.Th>
              {onRemove && (
                <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments.map((a) => (
              <Table.Tr
                key={a.id}
                style={{
                  opacity: a.is_active ? 1 : 0.5,
                }}
              >
                <Table.Td>
                  <Group gap="xs">
                    <IconUser size={16} />
                    <Text size="sm" fw={a.is_active ? 600 : 400}>
                      {a.user_name || `User #${a.user}`}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={ROLE_COLORS[a.role] || "gray"}
                    variant="light"
                    size="sm"
                  >
                    {a.role}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{a.start_date || "—"}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{a.end_date || "—"}</Text>
                </Table.Td>
                <Table.Td>
                  {a.is_active ? (
                    <Badge color="green" variant="light" size="sm">
                      Active
                    </Badge>
                  ) : (
                    <Badge color="gray" variant="light" size="sm">
                      Inactive
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {a.assigned_by_name || "—"}
                  </Text>
                </Table.Td>
                {onRemove && (
                  <Table.Td>
                    <Center>
                      {a.is_active && (
                        <Tooltip label="Remove Assignment">
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => onRemove(a.id)}
                            id={`remove-staff-btn-${a.id}`}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Center>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

StaffAssignmentTable.propTypes = {
  assignments: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      user: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      user_name: PropTypes.string,
      role: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      is_active: PropTypes.bool,
      assigned_by_name: PropTypes.string,
    }),
  ),
  title: PropTypes.string,
  onRemove: PropTypes.func,
};
