/**
 * LeavesTable Component
 * Displays list of hostel leave requests
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge, ActionIcon, Group, Tooltip, Anchor } from "@mantine/core";
import { IconCheck, IconX, IconFileText } from "@tabler/icons-react";
import DataTable from "./DataTable";

const statusColors = {
  pending: "yellow",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
};

function LeavesTable({
  leaves,
  loading,
  onApprove,
  onReject,
  showActions = false,
}) {
  const columns = [
    { key: "id", label: "ID" },
    {
      key: "student_name",
      label: "Student",
      render: (value, row) => value || row.student?.id?.user?.username || "-",
    },
    { key: "start_date", label: "Start Date" },
    { key: "end_date", label: "End Date" },
    { key: "reason", label: "Reason" },
    {
      key: "documents",
      label: "Docs",
      render: (value) =>
        value ? (
          <Tooltip label="View Documents">
            <Anchor href={value} target="_blank" underline="always">
              <IconFileText size={18} />
            </Anchor>
          </Tooltip>
        ) : (
          "-"
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const normalized = (value || "").toLowerCase();
        return (
          <Badge color={statusColors[normalized] || "gray"}>{value}</Badge>
        );
      },
    },
    {
      key: "decision_remarks",
      label: "Remarks",
      render: (value) => value || "-",
    },
  ];

  if (showActions) {
    columns.push({
      key: "actions",
      label: "Actions",
      render: (_, row) => {
        const isPending = (row.status || "").toLowerCase() === "pending";
        return isPending ? (
          <Group gap="xs">
            <Tooltip label="Approve">
              <ActionIcon
                variant="light"
                color="green"
                onClick={() => onApprove?.(row)}
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Reject">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onReject?.(row)}
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ) : null;
      },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={leaves}
      loading={loading}
      emptyMessage="No leave requests found"
    />
  );
}

LeavesTable.propTypes = {
  leaves: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      reason: PropTypes.string,
      status: PropTypes.string,
      documents: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  showActions: PropTypes.bool,
};

export default LeavesTable;
