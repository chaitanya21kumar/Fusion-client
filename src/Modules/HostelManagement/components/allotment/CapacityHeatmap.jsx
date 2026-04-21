import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Text,
  Title,
  Badge,
  Stack,
  SimpleGrid,
  Card,
  Table,
} from "@mantine/core";
import { IconBuildingCommunity } from "@tabler/icons-react";

/**
 * CapacityHeatmap Component
 *
 * Visualization of hostel occupancy status using Mantine UI.
 * uses color-coded metrics to show availability across halls with premium dashboard cards.
 */
function CapacityHeatmap({ capacityData }) {
  // Compute overall statistics
  const totalCapacity = capacityData.reduce(
    (acc, h) => acc + h.total_capacity,
    0,
  );
  const totalOccupied = capacityData.reduce(
    (acc, h) => acc + h.occupied_seats,
    0,
  );
  const totalVacancy = totalCapacity - totalOccupied;

  if (capacityData.length === 0) {
    return (
      <Paper p="xl" radius="md" withBorder ta="center" py={100}>
        <IconBuildingCommunity
          size={50}
          color="gray"
          style={{ opacity: 0.5 }}
        />
        <Title order={3} mt="md" c="dimmed">
          No Capacity Data Available
        </Title>
        <Text c="dimmed">Hostel records will appear here once configured.</Text>
      </Paper>
    );
  }

  return (
    <Stack gap="xl">
      {/* Summary Statistics */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder radius="md" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Total Capacity
          </Text>
          <Title order={2} fw={800}>
            {totalCapacity}
          </Title>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Current Occupancy
          </Text>
          <Title order={2} fw={800}>
            {totalOccupied}
          </Title>
        </Card>

        <Card withBorder radius="md" p="md">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            Available Vacancies
          </Text>
          <Title order={2} fw={800} c="blue.6">
            {totalVacancy}
          </Title>
        </Card>
      </SimpleGrid>

      <Card withBorder radius="md" p="0">
        <Box p="md" style={{ borderBottom: "1px solid #eee" }}>
          <Title order={4}>Hostel Wise Capacity</Title>
        </Box>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Hostel Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Rooms</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Capacity</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Occupied</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Vacant</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Occupancy %</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {capacityData.map((hostel) => {
              const occupancyRate =
                totalCapacity > 0
                  ? (hostel.occupied_seats / hostel.total_capacity) * 100
                  : 0;
              const isFull = occupancyRate >= 100;

              return (
                <Table.Tr key={hostel.id}>
                  <Table.Td>
                    <Text fw={600}>{hostel.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={
                        hostel.type?.toLowerCase().includes("girl")
                          ? "pink"
                          : "blue"
                      }
                    >
                      {hostel.type}s
                    </Badge>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {hostel.total_rooms || 0}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {hostel.total_capacity}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    {hostel.occupied_seats}
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Text
                      c={
                        hostel.total_capacity - hostel.occupied_seats > 0
                          ? "blue.6"
                          : "dimmed"
                      }
                    >
                      {hostel.total_capacity - hostel.occupied_seats}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: "center" }}>
                    <Badge
                      variant={isFull ? "filled" : "light"}
                      color={isFull ? "red" : "blue"}
                    >
                      {Math.round(occupancyRate)}%
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Card>
    </Stack>
  );
}

CapacityHeatmap.propTypes = {
  capacityData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      total_capacity: PropTypes.number.isRequired,
      occupied_seats: PropTypes.number.isRequired,
      total_rooms: PropTypes.number,
    }),
  ).isRequired,
};

export default CapacityHeatmap;
