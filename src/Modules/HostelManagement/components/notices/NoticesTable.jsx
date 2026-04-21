/**
 * NoticesTable Component
 * Displays list of hostel notices with management actions for staff.
 */

import React from "react";
import PropTypes from "prop-types";
import { ActionIcon, Tooltip, Anchor, Badge, Group, Text } from "@mantine/core";
import {
  IconTrash,
  IconDownload,
  IconExternalLink,
  IconEye,
} from "@tabler/icons-react";
import DataTable from "../DataTable";

const priorityColors = {
  Urgent: "red",
  Important: "orange",
  Normal: "gray",
};

const statusColors = {
  Draft: "yellow",
  Published: "green",
  Archived: "gray",
};

function NoticesTable({
  notices,
  loading,
  onDelete,
  onView,
  canDelete = false,
}) {
  const columns = [
    {
      key: "id",
      label: "UID",
      render: (_, row) => (
        <Text size="xs" fw={500}>
          {row.notice_uid}
        </Text>
      ),
    },
    { key: "title", label: "Title" },
    {
      key: "hostel_name",
      label: "Audience",
      render: (value) =>
        value ? (
          <Badge variant="outline" size="sm">
            {value}
          </Badge>
        ) : (
          <Badge size="sm">All Hostels</Badge>
        ),
    },
    {
      key: "priority",
      label: "Priority",
      render: (value) => (
        <Badge color={priorityColors[value]} variant="light">
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <Badge color={statusColors[value]} variant="dot">
          {value}
        </Badge>
      ),
    },
    {
      key: "read_count",
      label: "Views",
      render: (value) => (
        <Group gap={4}>
          <IconEye size={14} />
          <Text size="sm">{value}</Text>
        </Group>
      ),
    },
    {
      key: "attachment",
      label: "Files",
      render: (value) =>
        value ? (
          <Anchor href={value} target="_blank">
            <IconDownload size={16} />
          </Anchor>
        ) : (
          "-"
        ),
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
              <IconExternalLink size={16} />
            </ActionIcon>
          </Tooltip>
          {canDelete && (
            <Tooltip label="Delete Notice">
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
      data={notices}
      loading={loading}
      emptyMessage="No notices found"
    />
  );
}

NoticesTable.propTypes = {
  notices: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      notice_uid: PropTypes.string,
      title: PropTypes.string.isRequired,
      priority: PropTypes.string,
      status: PropTypes.string,
      read_count: PropTypes.number,
      attachment: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
  canDelete: PropTypes.bool,
};

export default NoticesTable;
