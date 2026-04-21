/**
 * HallsTable Component
 * Displays list of halls with actions
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge, ActionIcon, Group, Tooltip, Menu } from "@mantine/core";
import { IconTrash, IconEye, IconSettings } from "@tabler/icons-react";
import DataTable from "./DataTable";

function HallsTable({ halls, loading, onDelete, onView, onStatusChange }) {
  const columns = [
    { key: "hall_id", label: "Hostel ID" },
    { key: "hall_name", label: "Hostel Name" },
    { key: "max_accomodation", label: "Total Capacity" },
    { key: "number_students", label: "Current Students" },
    { key: "number_of_rooms", label: "Rooms" },
    {
      key: "type_of_seater",
      label: "Seater Type",
      render: (value) => (
        <Badge
          color={
            value === "single"
              ? "blue"
              : value === "double"
                ? "green"
                : "orange"
          }
        >
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        let color = "blue";
        if (value === "active") color = "green";
        if (value === "maintenance") color = "orange";
        if (value === "inactive") color = "red";
        return <Badge color={color}>{value || "active"}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Group gap="xs">
          <Tooltip label="View Details">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onView?.(row)}
            >
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>

          {onStatusChange && (
            <Menu shadow="md" width={150}>
              <Menu.Target>
                <Tooltip label="Update Status">
                  <ActionIcon variant="light" color="orange">
                    <IconSettings size={16} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={() => onStatusChange(row, "active")}>
                  Set Active
                </Menu.Item>
                <Menu.Item onClick={() => onStatusChange(row, "maintenance")}>
                  Set Maintenance
                </Menu.Item>
                <Menu.Item
                  onClick={() => onStatusChange(row, "inactive")}
                  color="red"
                >
                  Set Inactive
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}

          {onDelete && (
            <Tooltip label="Delete Hall">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onDelete?.(row)}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={halls}
      loading={loading}
      emptyMessage="No halls found"
    />
  );
}

HallsTable.propTypes = {
  halls: PropTypes.arrayOf(
    PropTypes.shape({
      hall_id: PropTypes.string.isRequired,
      hall_name: PropTypes.string.isRequired,
      max_accomodation: PropTypes.number,
      number_students: PropTypes.number,
      number_of_rooms: PropTypes.number,
      type_of_seater: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
  onStatusChange: PropTypes.func,
};

export default HallsTable;
