/**
 * FinesTable Component
 * Displays list of hostel fines
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge, ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import DataTable from "./DataTable";

const statusColors = {
  Pending: "yellow",
  Paid: "green",
};

function FinesTable({ fines, loading, onEdit, onDelete, showActions = false }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "student_name",
      label: "Student",
      render: (_, row) => row.student?.id?.user?.username || "-",
    },
    {
      key: "hall_name",
      label: "Hall",
      render: (_, row) => row.hall?.hall_name || "-",
    },
    { key: "fine_type", label: "Fine Type" },
    {
      key: "amount",
      label: "Amount",
      render: (value) => `â‚¹${value}`,
    },
    { key: "reason", label: "Reason" },
    { key: "date_issued", label: "Date Issued" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColors[value] || "gray"}>{value}</Badge>
      ),
    },
  ];

  if (showActions) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Group gap="xs">
          <Tooltip label="Edit Fine">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onEdit?.(row)}
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete Fine">
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
      data={fines}
      loading={loading}
      emptyMessage="No fines found"
    />
  );
}

FinesTable.propTypes = {
  fines: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      fine_type: PropTypes.string,
      amount: PropTypes.number,
      status: PropTypes.string,
      date_issued: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showActions: PropTypes.bool,
};

export default FinesTable;
