/**
 * InventoryTable Component
 * Displays list of hostel inventory items
 */

import React from "react";
import PropTypes from "prop-types";
import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import DataTable from "./DataTable";

function InventoryTable({
  inventory,
  loading,
  onEdit,
  onDelete,
  showActions = false,
}) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "item_name", label: "Item Name" },
    { key: "quantity", label: "Quantity" },
    { key: "item_type", label: "Type" },
    {
      key: "hall_name",
      label: "Hall",
      render: (_, row) => row.hall?.hall_name || "-",
    },
    { key: "remarks", label: "Remarks" },
  ];

  if (showActions) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Group gap="xs">
          <Tooltip label="Edit Item">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onEdit?.(row)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Item">
            <ActionIcon
              variant="light"
              color="red"
              onClick={() => onDelete?.(row)}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={inventory}
      loading={loading}
      emptyMessage="No inventory items found"
    />
  );
}

InventoryTable.propTypes = {
  inventory: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      item_name: PropTypes.string.isRequired,
      quantity: PropTypes.number,
      item_type: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};

export default InventoryTable;
