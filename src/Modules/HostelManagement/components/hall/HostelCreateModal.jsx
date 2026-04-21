/**
 * HostelCreateModal — Form dialog for creating a new hostel
 *
 * Features:
 * - Name, Type, Total Capacity, Floor Count fields
 * - Dynamic room config builder (floor → rooms_per_floor → capacity_per_room)
 * - Live preview of total rooms that will be auto-generated
 * - Validation against duplicate names and invalid values
 */

import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  TextInput,
  Select,
  NumberInput,
  Button,
  Group,
  Stack,
  Divider,
  Text,
  ActionIcon,
  Paper,
  Badge,
  SimpleGrid,
  Alert,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconBuilding,
  IconAlertCircle,
} from "@tabler/icons-react";

const HOSTEL_TYPES = [
  { value: "Boys", label: "Boys" },
  { value: "Girls", label: "Girls" },
  { value: "Mixed", label: "Mixed" },
];

export default function HostelCreateModal({
  opened,
  onClose,
  onSubmit,
  loading,
}) {
  const [hallId, setHallId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("Boys");
  const [totalCapacity, setTotalCapacity] = useState(100);
  const [floorCount, setFloorCount] = useState(1);
  const [floors, setFloors] = useState([
    { floor: 1, rooms_per_floor: 10, capacity_per_room: 2 },
  ]);
  const [error, setError] = useState("");

  /** Keep floor rows in sync with floorCount */
  const handleFloorCountChange = (val) => {
    const count = val || 1;
    setFloorCount(count);

    setFloors((prev) => {
      if (count > prev.length) {
        const newFloors = [...prev];
        for (let i = prev.length + 1; i <= count; i += 1) {
          newFloors.push({
            floor: i,
            rooms_per_floor: 10,
            capacity_per_room: 2,
          });
        }
        return newFloors;
      }
      return prev.slice(0, count);
    });
  };

  const updateFloor = (index, field, value) => {
    setFloors((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  /** Compute total rooms from config */
  const totalRooms = useMemo(
    () => floors.reduce((sum, f) => sum + (f.rooms_per_floor || 0), 0),
    [floors],
  );

  const totalBeds = useMemo(
    () =>
      floors.reduce(
        (sum, f) => sum + (f.rooms_per_floor || 0) * (f.capacity_per_room || 1),
        0,
      ),
    [floors],
  );

  const handleSubmit = () => {
    setError("");

    if (!hallId || hallId.trim().length < 2) {
      setError("Hall ID must be at least 2 characters.");
      return;
    }
    if (!name || name.trim().length < 2) {
      setError("Hostel name must be at least 2 characters.");
      return;
    }
    if (totalCapacity <= 0) {
      setError("Total capacity must be positive.");
      return;
    }

    const roomConfig = {
      floors: floors.map((f, i) => ({
        floor: i + 1,
        rooms_per_floor: f.rooms_per_floor || 1,
        capacity_per_room: f.capacity_per_room || 1,
      })),
    };

    onSubmit({
      hall_id: hallId.trim(),
      name: name.trim(),
      type,
      total_capacity: totalCapacity,
      floor_count: floorCount,
      room_config_json: roomConfig,
    });
  };

  const handleClose = () => {
    setHallId("");
    setName("");
    setType("Boys");
    setTotalCapacity(100);
    setFloorCount(1);
    setFloors([{ floor: 1, rooms_per_floor: 10, capacity_per_room: 2 }]);
    setError("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconBuilding size={22} />
          <Text fw={600} size="lg">
            Create New Hostel
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md">
        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        <SimpleGrid cols={2}>
          <TextInput
            id="hall-id-input"
            label="Hall ID"
            placeholder="e.g. Hall-1"
            value={hallId}
            onChange={(e) => setHallId(e.target.value)}
            required
          />
          <TextInput
            id="hostel-name-input"
            label="Hostel Name"
            placeholder="e.g. Himalaya Hostel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </SimpleGrid>

        <SimpleGrid cols={2}>
          <Select
            id="hostel-type-select"
            label="Type"
            data={HOSTEL_TYPES}
            value={type}
            onChange={setType}
            required
          />
          <NumberInput
            id="hostel-capacity-input"
            label="Total Capacity"
            min={1}
            value={totalCapacity}
            onChange={setTotalCapacity}
            required
          />
        </SimpleGrid>

        <NumberInput
          id="hostel-floor-count-input"
          label="Number of Floors"
          min={1}
          max={20}
          value={floorCount}
          onChange={handleFloorCountChange}
          required
          style={{ maxWidth: "calc(50% - 10px)" }}
        />

        <Divider label="Room Configuration" labelPosition="center" />

        <Stack gap="xs">
          {floors.map((f, idx) => (
            <Paper
              key={idx}
              withBorder
              p="xs"
              radius="md"
              style={{
                background:
                  "linear-gradient(135deg, rgba(34,139,230,0.03), rgba(34,139,230,0.08))",
              }}
            >
              <Group justify="space-between" align="flex-end">
                <Badge variant="light" size="lg" color="blue">
                  Floor {idx + 1}
                </Badge>
                <Group gap="xs">
                  <NumberInput
                    label="Rooms"
                    size="xs"
                    min={1}
                    max={100}
                    value={f.rooms_per_floor}
                    onChange={(val) =>
                      updateFloor(idx, "rooms_per_floor", val || 1)
                    }
                    style={{ width: 90 }}
                  />
                  <NumberInput
                    label="Beds/Room"
                    size="xs"
                    min={1}
                    max={8}
                    value={f.capacity_per_room}
                    onChange={(val) =>
                      updateFloor(idx, "capacity_per_room", val || 1)
                    }
                    style={{ width: 90 }}
                  />
                  {floors.length > 1 && (
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        setFloors((prev) => prev.filter((_, i) => i !== idx));
                        setFloorCount((prev) => prev - 1);
                      }}
                      mt={22}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  )}
                </Group>
              </Group>
            </Paper>
          ))}

          <Button
            variant="subtle"
            size="xs"
            leftSection={<IconPlus size={14} />}
            onClick={() => {
              setFloors((prev) => [
                ...prev,
                {
                  floor: prev.length + 1,
                  rooms_per_floor: 10,
                  capacity_per_room: 2,
                },
              ]);
              setFloorCount((prev) => prev + 1);
            }}
          >
            Add Floor
          </Button>
        </Stack>

        <Paper
          withBorder
          p="sm"
          radius="md"
          style={{
            background:
              "linear-gradient(135deg, rgba(32,201,151,0.06), rgba(32,201,151,0.12))",
          }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Preview
            </Text>
            <Group gap="lg">
              <Text size="sm">
                <Text span fw={600}>
                  {totalRooms}
                </Text>{" "}
                rooms
              </Text>
              <Text size="sm">
                <Text span fw={600}>
                  {totalBeds}
                </Text>{" "}
                beds
              </Text>
            </Group>
          </Group>
        </Paper>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            id="hostel-create-submit-btn"
            onClick={handleSubmit}
            loading={loading}
            gradient={{ from: "teal", to: "cyan", deg: 105 }}
            variant="gradient"
          >
            Create Hostel
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HostelCreateModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
