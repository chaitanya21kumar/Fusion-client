import React from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Text,
  Button,
  Stack,
  Progress,
  Group,
  Center,
} from "@mantine/core";
import { IconWand } from "@tabler/icons-react";

/**
 * BulkAllotmentPanel Component
 *
 * Floating/anchored action panel for bulk allotment using Mantine UI.
 * Shows selection count and provides 'Auto-Allot' action.
 */
function BulkAllotmentPanel({ selectedCount, onBulkAllot, onClear, loading }) {
  if (selectedCount === 0 && !loading) return null;

  return (
    <Paper
      shadow="xl"
      p="sm"
      radius="lg"
      style={{
        position: "fixed",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: 600,
        backgroundColor: "#1e1e1e",
        color: "white",
        zIndex: 1000,
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
      }}
    >
      <Group justify="space-between" align="center">
        <Group gap="md">
          <Center
            style={{
              width: 40,
              height: 40,
              borderRadius: "8px",
              backgroundColor: "#228be6",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {selectedCount}
          </Center>
          <Stack gap={0}>
            <Text fw={700} size="sm">
              {loading ? "Processing Allotment..." : "Requests Selected"}
            </Text>
            <Text size="xs" opacity={0.7} maw={300}>
              {loading
                ? "Assigning rooms and updating database"
                : "System will automatically find best matches based on preferences."}
            </Text>
          </Stack>
        </Group>

        <Group gap="xs">
          {!loading && (
            <Button
              variant="subtle"
              color="gray"
              onClick={onClear}
              styles={{ root: { color: "white" } }}
            >
              Clear
            </Button>
          )}
          <Button
            loading={loading}
            disabled={selectedCount === 0}
            leftSection={!loading && <IconWand size={18} />}
            onClick={onBulkAllot}
            radius="md"
            fw={700}
            color="blue"
            styles={{
              root: {
                padding: "0 20px",
                transition: "all 0.2s ease",
              },
            }}
          >
            {loading ? "Running..." : "Run Bulk Allotment"}
          </Button>
        </Group>
      </Group>
      {loading && (
        <Progress
          value={100}
          animated
          size="xs"
          radius="xl"
          mt="sm"
          color="blue"
          bg="rgba(255,255,255,0.1)"
        />
      )}
    </Paper>
  );
}

BulkAllotmentPanel.propTypes = {
  selectedCount: PropTypes.number.isRequired,
  onBulkAllot: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default BulkAllotmentPanel;
