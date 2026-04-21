/**
 * ComplaintsTable Component
 * Displays list of hostel complaints
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@mantine/core";
import DataTable from "./DataTable";

const typeColors = {
  Ragging: "red",
  Maintenance: "blue",
  Mess: "orange",
  Other: "gray",
};

function ComplaintsTable({ complaints, loading }) {
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
    {
      key: "complaint_type",
      label: "Type",
      render: (value) => (
        <Badge color={typeColors[value] || "gray"}>{value}</Badge>
      ),
    },
    { key: "description", label: "Description" },
    { key: "complaint_date", label: "Date" },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={value === "Resolved" ? "green" : "yellow"}>
          {value || "Pending"}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={complaints}
      loading={loading}
      emptyMessage="No complaints found"
    />
  );
}

ComplaintsTable.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      complaint_type: PropTypes.string,
      description: PropTypes.string,
      status: PropTypes.string,
      complaint_date: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default ComplaintsTable;
