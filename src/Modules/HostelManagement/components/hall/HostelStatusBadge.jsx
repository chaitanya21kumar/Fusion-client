/**
 * HostelStatusBadge — Reusable status badge for hostel operational status
 *
 * Colour mapping:
 * - Active    → teal
 * - Inactive  → gray
 * - UnderMaintenance → orange
 */

import React from "react";
import PropTypes from "prop-types";
import { Badge } from "@mantine/core";
import { IconCircleCheck, IconCircleX, IconTool } from "@tabler/icons-react";

const STATUS_MAP = {
  Active: {
    color: "teal",
    label: "Active",
    Icon: IconCircleCheck,
  },
  Inactive: {
    color: "gray",
    label: "Inactive",
    Icon: IconCircleX,
  },
  UnderMaintenance: {
    color: "orange",
    label: "Under Maintenance",
    Icon: IconTool,
  },
};

export default function HostelStatusBadge({ status, size = "md" }) {
  const config = STATUS_MAP[status] || STATUS_MAP.Inactive;
  const { color, label, Icon } = config;

  return (
    <Badge
      color={color}
      variant="light"
      size={size}
      leftSection={<Icon size={14} />}
      style={{ textTransform: "capitalize" }}
    >
      {label}
    </Badge>
  );
}

HostelStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  size: PropTypes.string,
};
