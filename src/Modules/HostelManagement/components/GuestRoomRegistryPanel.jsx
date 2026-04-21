import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Table,
  Button,
  Group,
  Text,
  Select,
  Stack,
  ActionIcon,
  Badge,
  Loader,
  Alert,
  Center,
} from "@mantine/core";
import {
  IconTrash,
  IconPlus,
  IconAlertCircle,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import {
  fetchGuestRoomRegistry,
  registerGuestRoom,
  deleteGuestRoom,
  fetchAvailableRoomsForGuest,
} from "../api";

export default function GuestRoomRegistryPanel({ hallId }) {
  const [registry, setRegistry] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!hallId) return;
    setLoading(true);
    try {
      const [registryData, roomsData] = await Promise.all([
        fetchGuestRoomRegistry({ hall_id: hallId }),
        fetchAvailableRoomsForGuest(hallId),
      ]);
      setRegistry(registryData);
      setAvailableRooms(
        roomsData.map((r) => ({
          value: r.id.toString(),
          label: `Room ${r.room_number} (Floor ${r.floor}, Cap: ${r.capacity})`,
        })),
      );
      setError(null);
    } catch (err) {
      setError("Failed to load registry data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [hallId]);

  const handleRegister = async () => {
    if (!selectedRoomId) return;
    setAdding(true);
    try {
      await registerGuestRoom({ room: selectedRoomId });
      notifications.show({
        title: "Success",
        message: "Room registered for guests",
        color: "green",
        icon: <IconCheck size={16} />,
      });
      setSelectedRoomId(null);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to register room",
        color: "red",
      });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGuestRoom(id);
      notifications.show({
        title: "Success",
        message: "Room removed from guest registry",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to remove room",
        color: "red",
      });
    }
  };

  if (!hallId) {
    return (
      <Card withBorder py={40} radius="md">
        <Center>
          <Stack align="center" gap="xs">
            <IconAlertCircle size={40} color="var(--mantine-color-gray-4)" />
            <Text color="dimmed">
              Please select a hostel to view the room registry.
            </Text>
          </Stack>
        </Center>
      </Card>
    );
  }

  if (loading && registry.length === 0) {
    return (
      <Group justify="center" p="xl">
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg" radius="md">
        <Stack gap="md">
          <Text fw={600} size="lg">
            Add Room to Guest Registry
          </Text>
          <Text size="sm" color="dimmed">
            Select a completely empty (unoccupied) room from Hall {hallId} to
            designate as a Guest Room.
          </Text>

          <Group align="flex-end">
            <Select
              label="Select Room"
              placeholder="Pick a room"
              data={availableRooms}
              value={selectedRoomId}
              onChange={setSelectedRoomId}
              searchable
              clearable
              style={{ flex: 1 }}
              disabled={availableRooms.length === 0}
            />
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={handleRegister}
              loading={adding}
              disabled={!selectedRoomId}
            >
              Add to Registry
            </Button>
          </Group>

          {availableRooms.length === 0 && !loading && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="blue"
              variant="light"
            >
              No empty rooms currently available for guest designation in this
              hall.
            </Alert>
          )}
        </Stack>
      </Card>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
          {error}
        </Alert>
      )}

      <Table highlightOnHover verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Room Number</Table.Th>
            <Table.Th>Floor</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {registry.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={5} align="center">
                <Text size="sm" color="dimmed" py="xl">
                  No guest rooms registered in Hall {hallId}
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            registry.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td fw={500}>
                  Room {item.room_detail.room_number}
                </Table.Td>
                <Table.Td>{item.room_detail.floor}</Table.Td>
                <Table.Td>
                  <Badge variant="dot" color="blue">
                    Guest Room
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {item.is_occupied ? (
                    <Badge color="red">Occupied</Badge>
                  ) : (
                    <Badge color="green">Available</Badge>
                  )}
                </Table.Td>
                <Table.Td>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDelete(item.id)}
                    disabled={item.is_occupied}
                    title={
                      item.is_occupied
                        ? "Cannot remove occupied room"
                        : "Remove from registry"
                    }
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}

GuestRoomRegistryPanel.propTypes = {
  hallId: PropTypes.string,
};
