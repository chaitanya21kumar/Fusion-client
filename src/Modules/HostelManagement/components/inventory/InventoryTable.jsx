import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Badge,
  Group,
  ActionIcon,
  Tooltip,
  Text,
  Loader,
} from "@mantine/core";
import {
  IconClipboardCheck,
  IconEdit,
  IconHistory,
  IconTrash,
} from "@tabler/icons-react";

export default function InventoryTable({
  items,
  loading,
  userRole,
  onInspect,
  onUpdate,
  onDelete,
  onViewHistory,
}) {
  if (loading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="lg" variant="dots" />
      </Group>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Group justify="center" py="xl">
        <Text c="dimmed" ta="center">
          No inventory items found.
        </Text>
      </Group>
    );
  }

  const getConditionColor = (condition) => {
    switch (condition) {
      case "Good":
        return "green";
      case "Damaged":
        return "orange";
      case "Missing":
        return "red";
      default:
        return "gray";
    }
  };

  const isCaretaker = userRole === "caretaker";

  return (
    <Table highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Item Name</Table.Th>
          <Table.Th>Category</Table.Th>
          <Table.Th>Expected Qty</Table.Th>
          <Table.Th>Current Qty</Table.Th>
          <Table.Th>Unit</Table.Th>
          <Table.Th>Condition</Table.Th>
          <Table.Th>Last Inspected</Table.Th>
          {userRole !== "super_admin" && <Table.Th>Actions</Table.Th>}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {items.map((item) => (
          <Table.Tr key={item.id}>
            <Table.Td fw={500}>{item.name}</Table.Td>
            <Table.Td>
              <Badge variant="light" color="blue">
                {item.category}
              </Badge>
            </Table.Td>
            <Table.Td>{item.expected_quantity}</Table.Td>
            <Table.Td>
              <Text
                c={
                  item.current_quantity < item.expected_quantity
                    ? "red"
                    : "inherit"
                }
                fw={item.current_quantity < item.expected_quantity ? 700 : 400}
              >
                {item.current_quantity}
              </Text>
            </Table.Td>
            <Table.Td>{item.unit}</Table.Td>
            <Table.Td>
              <Badge color={getConditionColor(item.condition)}>
                {item.condition}
              </Badge>
            </Table.Td>
            <Table.Td style={{ fontSize: "12px" }}>
              {item.last_inspected_at
                ? new Date(item.last_inspected_at).toLocaleString()
                : "Never"}
            </Table.Td>
            {userRole !== "super_admin" && (
              <Table.Td>
                <Group gap="xs">
                  {isCaretaker && (
                    <>
                      <Tooltip label="Record Inspection">
                        <ActionIcon
                          variant="light"
                          color="green"
                          onClick={() => onInspect(item)}
                        >
                          <IconClipboardCheck size={18} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Direct Update">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          onClick={() => onUpdate(item)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>
                    </>
                  )}
                  {userRole === "warden" && (
                    <Tooltip label="Delete Item">
                      <ActionIcon
                        variant="light"
                        color="red"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Are you sure you want to delete ${item.name}? This will also delete its history.`,
                            )
                          ) {
                            onDelete(item.id);
                          }
                        }}
                      >
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Tooltip>
                  )}
                  <Tooltip label="View Audit Log">
                    <ActionIcon
                      variant="light"
                      color="gray"
                      onClick={() => onViewHistory(item)}
                    >
                      <IconHistory size={18} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

InventoryTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      category: PropTypes.string,
      expected_quantity: PropTypes.number,
      current_quantity: PropTypes.number,
      unit: PropTypes.string,
      condition: PropTypes.string,
      last_inspected_at: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  userRole: PropTypes.string.isRequired,
  onInspect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewHistory: PropTypes.func.isRequired,
};
