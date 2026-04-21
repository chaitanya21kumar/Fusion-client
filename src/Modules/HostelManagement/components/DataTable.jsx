/**
 * DataTable Component
 * Reusable table component for displaying data
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Text,
  ScrollArea,
  Paper,
  Center,
  Loader,
  Pagination,
  Group,
  Divider,
} from "@mantine/core";

function DataTable({
  columns,
  data,
  loading,
  emptyMessage = "No data available",
  totalItems = 0,
  itemsPerPage = 50,
  activePage = 1,
  onPageChange,
}) {
  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" />
      </Center>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Center py="xl">
        <Text c="dimmed">{emptyMessage}</Text>
      </Center>
    );
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Paper shadow="sm" radius="md" withBorder>
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={col.key}>{col.label}</Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((row, index) => (
              <Table.Tr key={row.id || index}>
                {columns.map((col) => (
                  <Table.Td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {onPageChange && totalPages > 1 && (
        <>
          <Divider />
          <Group justify="space-between" p="md">
            <Text size="sm" c="dimmed">
              Showing {data.length} of {totalItems} items
            </Text>
            <Pagination
              total={totalPages}
              value={activePage}
              onChange={onPageChange}
              size="sm"
              radius="md"
              withEdges
            />
          </Group>
        </>
      )}
    </Paper>
  );
}

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
    }),
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string,
  totalItems: PropTypes.number,
  itemsPerPage: PropTypes.number,
  activePage: PropTypes.number,
  onPageChange: PropTypes.func,
};

export default DataTable;
