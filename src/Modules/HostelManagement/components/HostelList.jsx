/**
 * HostelList — Table view of all hostels with actions
 *
 * Features:
 * - Name, Type, Status (badge), Rooms, Warden, Caretaker columns
 * - "Activate" disabled if no warden/caretaker assigned
 * - Status change dropdown menu
 * - Assign Warden / Assign Caretaker action buttons
 * - Responsive with horizontal scroll
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  Text,
  Group,
  Badge,
  Menu,
  ActionIcon,
  Tooltip,
  Paper,
  ScrollArea,
  Center,
  Loader,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconPlayerPlay,
  IconPlayerPause,
  IconTool,
  IconUserPlus,
  IconBuildingSkyscraper,
  IconDoor,
  IconTrash,
} from "@tabler/icons-react";
import HostelStatusBadge from "./HostelStatusBadge";

const TYPE_COLORS = {
  Boys: "blue",
  Girls: "pink",
  Mixed: "grape",
};

export default function HostelList({
  hostels,
  loading,
  onStatusChange,
  onAssignWarden,
  onAssignCaretaker,
  onViewStaff,
  onBulkBatchAllot,
  onRemove,
}) {
  if (loading) {
    return (
      <Center p="xl">
        <Loader size="md" />
        <Text ml="md" c="dimmed">
          Loading hostels...
        </Text>
      </Center>
    );
  }

  if (!hostels || hostels.length === 0) {
    return (
      <Paper withBorder p="xl" radius="md">
        <Center>
          <Group gap="xs">
            <IconBuildingSkyscraper size={24} color="gray" />
            <Text c="dimmed" size="md">
              No hostels configured yet. Click "Create Hostel" to get started.
            </Text>
          </Group>
        </Center>
      </Paper>
    );
  }

  const canActivate = (hostel) => {
    return hostel.active_warden && hostel.active_caretaker;
  };

  return (
    <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
      <ScrollArea>
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          style={{ minWidth: 900 }}
        >
          <Table.Thead
            style={{
              background:
                "linear-gradient(135deg, rgba(34,139,230,0.06), rgba(34,139,230,0.12))",
            }}
          >
            <Table.Tr>
              <Table.Th>Hall ID</Table.Th>
              <Table.Th>Hostel Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Rooms</Table.Th>
              <Table.Th>Capacity</Table.Th>
              <Table.Th>Warden</Table.Th>
              <Table.Th>Caretaker</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {hostels.map((hostel) => (
              <Table.Tr key={hostel.hall_id}>
                <Table.Td>
                  <Text fw={700} size="sm" c="blue">
                    {hostel.hall_id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconBuildingSkyscraper
                      size={18}
                      color="var(--mantine-color-blue-6)"
                    />
                    <Text fw={600} size="sm">
                      {hostel.name}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={TYPE_COLORS[hostel.type] || "gray"}
                    variant="light"
                    size="sm"
                  >
                    {hostel.type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <HostelStatusBadge status={hostel.status} size="sm" />
                </Table.Td>
                <Table.Td>
                  <Group gap={4}>
                    <IconDoor size={14} />
                    <Text size="sm">
                      {hostel.occupied_rooms || 0}/{hostel.total_rooms || 0}
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{hostel.total_capacity}</Text>
                </Table.Td>
                <Table.Td>
                  {hostel.active_warden ? (
                    <Text size="sm" fw={500} c="violet">
                      {hostel.active_warden.name}
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      Not assigned
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {hostel.active_caretaker ? (
                    <Text size="sm" fw={500} c="indigo">
                      {hostel.active_caretaker.name}
                    </Text>
                  ) : (
                    <Text size="sm" c="dimmed" fs="italic">
                      Not assigned
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="center">
                    <Tooltip label="Assign Warden">
                      <ActionIcon
                        id={`assign-warden-btn-${hostel.hall_id}`}
                        variant="subtle"
                        color="violet"
                        onClick={() => onAssignWarden(hostel)}
                      >
                        <IconUserPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Assign Caretaker">
                      <ActionIcon
                        id={`assign-caretaker-btn-${hostel.hall_id}`}
                        variant="subtle"
                        color="indigo"
                        onClick={() => onAssignCaretaker(hostel)}
                      >
                        <IconUserPlus size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Menu shadow="md" width={200} position="bottom-end">
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Label>Change Status</Menu.Label>
                        {hostel.status !== "Active" && (
                          <Tooltip
                            label={
                              canActivate(hostel)
                                ? "Set hostel to Active"
                                : "Assign Warden & Caretaker first"
                            }
                            position="left"
                          >
                            <Menu.Item
                              leftSection={<IconPlayerPlay size={14} />}
                              color="teal"
                              disabled={!canActivate(hostel)}
                              onClick={() =>
                                onStatusChange(hostel.hall_id, "Active")
                              }
                            >
                              Activate
                            </Menu.Item>
                          </Tooltip>
                        )}
                        {hostel.status !== "Inactive" && (
                          <Menu.Item
                            leftSection={<IconPlayerPause size={14} />}
                            color="gray"
                            onClick={() =>
                              onStatusChange(hostel.hall_id, "Inactive")
                            }
                          >
                            Deactivate
                          </Menu.Item>
                        )}
                        {hostel.status !== "UnderMaintenance" && (
                          <Menu.Item
                            leftSection={<IconTool size={14} />}
                            color="orange"
                            onClick={() =>
                              onStatusChange(hostel.hall_id, "UnderMaintenance")
                            }
                          >
                            Under Maintenance
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item onClick={() => onViewStaff(hostel)}>
                          View Staff History
                        </Menu.Item>
                        <Menu.Item
                          onClick={() => onBulkBatchAllot(hostel)}
                          color="blue"
                        >
                          Bulk Batch Allocation
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item
                          leftSection={<IconTrash size={14} />}
                          color="red"
                          onClick={() => onRemove(hostel)}
                        >
                          Remove Hostel
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

HostelList.propTypes = {
  hostels: PropTypes.arrayOf(
    PropTypes.shape({
      hall_id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      total_rooms: PropTypes.number,
      occupied_rooms: PropTypes.number,
      total_capacity: PropTypes.number,
      active_warden: PropTypes.shape({ name: PropTypes.string }),
      active_caretaker: PropTypes.shape({ name: PropTypes.string }),
    }),
  ).isRequired,
  loading: PropTypes.bool,
  onStatusChange: PropTypes.func.isRequired,
  onAssignWarden: PropTypes.func.isRequired,
  onAssignCaretaker: PropTypes.func.isRequired,
  onViewStaff: PropTypes.func.isRequired,
  onBulkBatchAllot: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};
