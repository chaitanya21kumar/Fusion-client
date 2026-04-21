import React from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  Box,
} from "@mantine/core";
import { IconCalendar, IconClock, IconCircleCheck } from "@tabler/icons-react";

/**
 * ApplicationWindowBanner Component
 *
 * Displays an active accommodation application window with a premium,
 * attention-grabbing design using Mantine UI.
 *
 * @param {Object} window - The active application window object
 * @param {Function} onApply - Callback when student clicks 'Apply Now'
 */
function ApplicationWindowBanner({ window, onApply, isStudent }) {
  if (!window) return null;

  const startDate = new Date(window.start_date).toLocaleDateString();
  const endDate = new Date(window.end_date).toLocaleDateString();

  return (
    <Paper
      p="xl"
      mb="xl"
      radius="md"
      shadow="md"
      style={{
        background: "linear-gradient(135deg, #1A237E 0%, #3949AB 100%)",
        color: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.1)",
          zIndex: 0,
        }}
      />

      <Group
        justify="space-between"
        align="center"
        style={{ position: "relative", zIndex: 1 }}
      >
        <Stack gap="xs">
          <Badge
            leftSection={<IconCircleCheck size={14} />}
            variant="light"
            color="white"
            size="lg"
            styles={{
              root: {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                backdropFilter: "blur(4px)",
                border: "none",
              },
            }}
          >
            Application Window Open
          </Badge>

          <Title order={2} fw={800} style={{ color: "white" }}>
            {window.name}
          </Title>

          <Group gap="xl">
            <Group gap="xs">
              <IconCalendar size={18} />
              <Text size="sm">
                Starts:{" "}
                <Text span fw={700}>
                  {startDate}
                </Text>
              </Text>
            </Group>
            <Group gap="xs">
              <IconClock size={18} />
              <Text size="sm">
                Ends:{" "}
                <Text span fw={700}>
                  {endDate}
                </Text>
              </Text>
            </Group>
          </Group>
        </Stack>

        {isStudent && (
          <Button
            size="lg"
            onClick={onApply}
            radius="md"
            styles={{
              root: {
                backgroundColor: "white",
                color: "#1A237E",
                fontWeight: 700,
                padding: "0 40px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                },
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
              },
            }}
          >
            Apply Now
          </Button>
        )}
      </Group>
    </Paper>
  );
}

ApplicationWindowBanner.propTypes = {
  window: PropTypes.shape({
    name: PropTypes.string.isRequired,
    start_date: PropTypes.string.isRequired,
    end_date: PropTypes.string.isRequired,
  }),
  onApply: PropTypes.func,
  isStudent: PropTypes.bool,
};

export default ApplicationWindowBanner;
