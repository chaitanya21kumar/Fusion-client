import React from "react";
import PropTypes from "prop-types";
import { SimpleGrid, Paper, Text, Group, ThemeIcon, Box } from "@mantine/core";
import { IconShieldCheck, IconClockPlay } from "@tabler/icons-react";

export default function SecurityDashboard({ stats, loading }) {
  const data = [
    {
      title: "Active Shifts",
      value: stats?.total_shifts || 0,
      icon: IconClockPlay,
      color: "blue",
      description: "Total shifts today",
    },
    {
      title: "Guards Deployed",
      value: stats?.assigned_guards || 0,
      icon: IconShieldCheck,
      color: "teal",
      description: "Unique guards on duty",
    },
  ];

  const cards = data.map((stat) => (
    <Paper withBorder p="md" radius="md" key={stat.title}>
      <Group justify="space-between">
        <Box>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {stat.title}
          </Text>
          <Text fw={700} size="xl">
            {loading ? "..." : stat.value}
          </Text>
        </Box>
        <ThemeIcon color={stat.color} variant="light" size={38} radius="md">
          <stat.icon size={22} stroke={1.5} />
        </ThemeIcon>
      </Group>
      <Text c="dimmed" size="xs" mt="sm">
        <Text component="span" c={stat.color} fw={700}>
          {stat.description}
        </Text>
      </Text>
    </Paper>
  ));

  return (
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
      {cards}
    </SimpleGrid>
  );
}

SecurityDashboard.propTypes = {
  stats: PropTypes.shape({
    total_shifts: PropTypes.number,
    assigned_guards: PropTypes.number,
  }),
  loading: PropTypes.bool,
};
