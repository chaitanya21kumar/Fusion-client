/**
 * InventoryList - Micro Component
 * Displays inventory items with quantity and status
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
  Progress,
} from "@mantine/core";
import { IconEdit, IconTrash, IconAlertCircle } from "@tabler/icons-react";

export default function InventoryList({
  items,
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

  if (!items || items.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">No inventory items found</Text>
      </Center>
    );
  }

  const getStockStatus = (current, minimum) => {
    if (current <= 0) return { color: "red", label: "Out of Stock" };
    if (current <= minimum) return { color: "orange", label: "Low Stock" };
    return { color: "green", label: "In Stock" };
  };

  const getStockPercentage = (current, maximum) => {
    return Math.min((current / maximum) * 100, 100);
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Item Name</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Current Stock</Table.Th>
            <Table.Th>Minimum Level</Table.Th>
            <Table.Th>Status</Table.Th>
            {showActions && <Table.Th>Actions</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {items.map((item) => {
            const status = getStockStatus(
              item.current_quantity,
              item.minimum_quantity,
            );
            const percentage = getStockPercentage(
              item.current_quantity,
              item.maximum_quantity || item.current_quantity,
            );

            return (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Stack gap={0}>
                    <Text fw={500} size="sm">
                      {item.name}
                    </Text>
                    {item.description && (
                      <Text size="xs" c="dimmed">
                        {item.description}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Badge size="sm" variant="light">
                    {item.category}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    <Text fw={500} size="sm">
                      {item.current_quantity} units
                    </Text>
                    <Progress
                      value={percentage}
                      size="sm"
                      color={status.color}
                      radius="md"
                    />
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{item.minimum_quantity} units</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    {status.color === "red" && (
                      <IconAlertCircle size={16} color="red" />
                    )}
                    <Badge size="sm" color={status.color}>
                      {status.label}
                    </Badge>
                  </Group>
                </Table.Td>
                {showActions && (
                  <Table.Td>
                    <Group gap="xs">
                      <Tooltip label="Edit">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          color="blue"
                          onClick={() => onEdit?.(item)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Delete">
                        <ActionIcon
                          variant="light"
                          size="sm"
                          color="red"
                          onClick={() => onDelete?.(item)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </div>
  );
}

InventoryList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      current_quantity: PropTypes.number.isRequired,
      minimum_quantity: PropTypes.number.isRequired,
      maximum_quantity: PropTypes.number,
      description: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};
