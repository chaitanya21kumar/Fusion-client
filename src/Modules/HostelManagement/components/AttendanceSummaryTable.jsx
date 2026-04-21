/**
 * AttendanceSummaryTable Component
 * Displays aggregated attendance statistics per student
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge, ActionIcon, Group, Tooltip, Text } from "@mantine/core";
import { IconEye } from "@tabler/icons-react";
import DataTable from "./DataTable";

export default function AttendanceSummaryTable({
  data,
  loading,
  onViewAbsences,
  totalItems = 0,
  itemsPerPage = 50,
  activePage = 1,
  onPageChange,
}) {
  const columns = [
    // ... same columns code ...
    {
      key: "roll_number",
      label: "Roll Number",
      render: (val) => <Text fw={500}>{val || "-"}</Text>,
    },
    {
      key: "name",
      label: "Student Name",
      render: (val) => val || "-",
    },
    {
      key: "present_count",
      label: "Present",
      render: (val) => (
        <Badge color="green" variant="light">
          {val ?? 0}
        </Badge>
      ),
    },
    {
      key: "absent_count",
      label: "Absent",
      render: (val) => (
        <Badge color="red" variant="light">
          {val ?? 0}
        </Badge>
      ),
    },
    {
      key: "on_leave_count",
      label: "On Leave",
      render: (val) => (
        <Badge color="blue" variant="light">
          {val ?? 0}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <Group gap={4} justify="center">
          <Tooltip label="View Absence History">
            <ActionIcon
              variant="light"
              color="blue"
              onClick={() => onViewAbsences(row)}
              title="View History"
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyMessage="No students found for this hostel"
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      activePage={activePage}
      onPageChange={onPageChange}
    />
  );
}

AttendanceSummaryTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      roll_number: PropTypes.string,
      name: PropTypes.string,
      present_count: PropTypes.number,
      absent_count: PropTypes.number,
      on_leave_count: PropTypes.number,
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onViewAbsences: PropTypes.func.isRequired,
  totalItems: PropTypes.number,
  itemsPerPage: PropTypes.number,
  activePage: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
};
