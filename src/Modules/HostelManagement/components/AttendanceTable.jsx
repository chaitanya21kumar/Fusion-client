/**
 * AttendanceTable Component
 * Displays student attendance records
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@mantine/core";
import DataTable from "./DataTable";

const statusColors = {
  PRESENT: "green",
  ABSENT: "red",
  ON_LEAVE: "blue",
};

function AttendanceTable({ attendance, loading }) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "student_name",
      label: "Student",
      render: (value, row) =>
        value || row.student?.id?.user?.username || row.roll_number || "-",
    },
    { key: "date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColors[value] || "gray"}>
          {value || "Unknown"}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={attendance}
      loading={loading}
      emptyMessage="No attendance records found"
    />
  );
}

AttendanceTable.propTypes = {
  attendance: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      student_name: PropTypes.string,
      date: PropTypes.string,
      status: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default AttendanceTable;
