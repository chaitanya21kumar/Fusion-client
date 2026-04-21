import React from "react";
import PropTypes from "prop-types";
import { Table, Badge, Text, Button } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

export default function DiscrepancyTable({
  discrepancies,
  userRole,
  onResolve,
}) {
  if (!discrepancies || discrepancies.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        No discrepancies reported.
      </Text>
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

  const getTypeColor = (type) => {
    switch (type) {
      case "Missing":
        return "red";
      case "Damaged":
        return "orange";
      case "Depleted":
        return "grape";
      default:
        return "gray";
    }
  };

  return (
    <Table highlightOnHover verticalSpacing="sm">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Reported At</Table.Th>
          <Table.Th>Hall</Table.Th>
          <Table.Th>Item</Table.Th>
          <Table.Th>Type</Table.Th>
          <Table.Th>Reported Condition</Table.Th>
          <Table.Th>Expected</Table.Th>
          <Table.Th>Actual</Table.Th>
          <Table.Th>Reported By</Table.Th>
          <Table.Th>Remarks</Table.Th>
          {(userRole === "warden" || userRole === "super_admin") && (
            <Table.Th>Actions</Table.Th>
          )}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {discrepancies.map((d) => (
          <Table.Tr key={d.id}>
            <Table.Td style={{ fontSize: "12px" }}>
              {new Date(d.reported_at).toLocaleString()}
            </Table.Td>
            <Table.Td>{d.hostel_name}</Table.Td>
            <Table.Td fw={500}>{d.item_name}</Table.Td>
            <Table.Td>
              <Badge color={getTypeColor(d.discrepancy_type)}>
                {d.discrepancy_type}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Badge color={getConditionColor(d.condition)} variant="outline">
                {d.condition}
              </Badge>
            </Table.Td>
            <Table.Td>{d.expected_qty}</Table.Td>
            <Table.Td fw={700} c="red">
              {d.actual_qty}
            </Table.Td>
            <Table.Td>{d.reported_by_name}</Table.Td>
            <Table.Td style={{ maxWidth: "200px" }}>
              <Text size="xs" truncate="end" title={d.remarks}>
                {d.remarks}
              </Text>
            </Table.Td>
            {(userRole === "warden" || userRole === "super_admin") && (
              <Table.Td>
                <Button
                  size="compact-xs"
                  variant="light"
                  color="green"
                  leftSection={<IconCheck size={14} />}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Sync inventory with actual quantity and mark as resolved?",
                      )
                    ) {
                      onResolve(d.id);
                    }
                  }}
                >
                  Resolve
                </Button>
              </Table.Td>
            )}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}

DiscrepancyTable.propTypes = {
  discrepancies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      hostel_name: PropTypes.string,
      item_name: PropTypes.string,
      discrepancy_type: PropTypes.string,
      condition: PropTypes.string,
      expected_qty: PropTypes.number,
      actual_qty: PropTypes.number,
      reported_by_name: PropTypes.string,
      remarks: PropTypes.string,
      reported_at: PropTypes.string,
    }),
  ).isRequired,
  userRole: PropTypes.string.isRequired,
  onResolve: PropTypes.func.isRequired,
};
