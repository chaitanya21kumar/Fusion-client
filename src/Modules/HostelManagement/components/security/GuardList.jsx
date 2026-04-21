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
} from "@mantine/core";
import { IconUserPlus, IconEdit, IconTrash } from "@tabler/icons-react";

export default function GuardList({
  guards,
  loading,
  onRegister,
  onEdit,
  onDelete,
}) {
  const rows = guards.map((guard) => (
    <Table.Tr key={guard.id}>
      <Table.Td>
        <Group gap="sm">
          <div>
            <Text size="sm" fw={600}>
              {guard.name}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {guard.employee_id}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{guard.contact}</Text>
      </Table.Td>
      <Table.Td>
        <Badge
          variant="light"
          color={guard.is_active ? "teal" : "red"}
          radius="sm"
        >
          {guard.is_active ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Edit Details">
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => onEdit(guard)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Remove Guard">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to remove ${guard.name}?`,
                  )
                ) {
                  onDelete(guard.id);
                }
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper radius="md" withBorder p="md">
      <Flex justify="space-between" align="center" mb="lg">
        <Box>
          <Text size="lg" fw={700}>
            Security Guards
          </Text>
          <Text size="xs" c="dimmed">
            Manage registered security personnel
          </Text>
        </Box>
        <Button
          leftSection={<IconUserPlus size={16} />}
          size="xs"
          radius="md"
          variant="light"
          onClick={onRegister}
        >
          Register Guard
        </Button>
      </Flex>

      <Table.ScrollContainer minWidth={600}>
        <Table verticalSpacing="sm" striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name & ID</Table.Th>
              <Table.Th>Contact</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={4} align="center" py="xl">
                  <Text size="sm" c="dimmed">
                    Loading guards...
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : guards.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4} align="center" py="xl">
                  <Text size="sm" c="dimmed">
                    No guards registered yet.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}

GuardList.propTypes = {
  guards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      employee_id: PropTypes.string.isRequired,
      contact: PropTypes.string.isRequired,
      is_active: PropTypes.bool.isRequired,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onRegister: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};
