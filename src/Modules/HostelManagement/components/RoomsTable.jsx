/**
 * RoomsTable Component
 * Displays list of hall rooms
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@mantine/core";
import DataTable from "./DataTable";

const statusColors = {
  Occupied: "blue",
  Reserved: "yellow",
  Available: "teal",
  UnderMaintenance: "orange",
};

function RoomsTable({ rooms, loading }) {
  const columns = [
    { key: "id", label: "ID" },
    { key: "room_number", label: "Room No" },
    { key: "floor", label: "Floor" },
    { key: "capacity", label: "Capacity" },
    { key: "current_occupancy", label: "Occupancy" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColors[value] || "gray"}>{value}</Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rooms}
      loading={loading}
      emptyMessage="No rooms found"
    />
  );
}

RoomsTable.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      room_number: PropTypes.string.isRequired,
      floor: PropTypes.number,
      capacity: PropTypes.number,
      current_occupancy: PropTypes.number,
      status: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default RoomsTable;
