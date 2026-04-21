import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Text,
  Paper,
  Grid,
  Select,
  Button,
  Divider,
  Transition,
  Title,
  Stack,
  Group,
} from "@mantine/core";
import { IconHome, IconBed, IconSend } from "@tabler/icons-react";

/**
 * AccommodationRequestForm Component
 *
 * Allows students to submit their hostel preferences during an open window.
 * Premium design using Mantine UI with focus on readability and smooth UX.
 */
function AccommodationRequestForm({ window, onSubmit, loading }) {
  const [hostelType, setHostelType] = useState("");
  const [roomType, setRoomType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hostelType || !roomType) return;
    onSubmit({
      window: window.id,
      preferred_hostel_type: hostelType,
      preferred_room_type: roomType,
    });
  };

  return (
    <Transition mounted transition="fade" duration={800} timingFunction="ease">
      {(styles) => (
        <Paper
          p="xl"
          radius="md"
          withBorder
          shadow="sm"
          style={{ ...styles, backgroundColor: "white" }}
        >
          <Box mb="lg">
            <Title order={3} fw={700} c="blue.7" mb="xs">
              Accommodation Request
            </Title>
            <Text size="sm" c="dimmed">
              Provide your preferences for the{" "}
              <Text span fw={700} c="dark">
                {window.name}
              </Text>
              . Final allotment is subject to availability and batch priorities.
            </Text>
          </Box>

          <Divider mb="xl" />

          <form onSubmit={handleSubmit}>
            <Grid gutter="xl">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs" mb="sm">
                  <Group gap="xs">
                    <IconHome size={20} color="gray" />
                    <Text fw={600} size="sm">
                      Hostel Preference
                    </Text>
                  </Group>
                  <Select
                    label="Hostel Type"
                    placeholder="Select hostel category"
                    data={[
                      { value: "Boy", label: "Boys Hostel" },
                      { value: "Girl", label: "Girls Hostel" },
                      { value: "Mixed", label: "Mixed/International" },
                    ]}
                    value={hostelType}
                    onChange={setHostelType}
                    radius="md"
                    required
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Stack gap="xs" mb="sm">
                  <Group gap="xs">
                    <IconBed size={20} color="gray" />
                    <Text fw={600} size="sm">
                      Room Configuration
                    </Text>
                  </Group>
                  <Select
                    label="Room Type"
                    placeholder="Select occupancy type"
                    data={[
                      { value: "Single", label: "Single Seater (Premium)" },
                      { value: "Double", label: "Double Seater" },
                      { value: "Triple", label: "Triple Seater" },
                    ]}
                    value={roomType}
                    onChange={setRoomType}
                    radius="md"
                    required
                  />
                </Stack>
              </Grid.Col>

              <Grid.Col span={12}>
                <Group justify="flex-end" mt="md">
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!hostelType || !roomType}
                    size="lg"
                    radius="md"
                    leftSection={!loading && <IconSend size={18} />}
                    loaderProps={{ type: "dots" }}
                    styles={{
                      root: {
                        padding: "0 35px",
                        fontWeight: 700,
                        boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          boxShadow: "0 6px 20px rgba(0,118,255,0.23)",
                          transform: "translateY(-1px)",
                        },
                      },
                    }}
                  >
                    {loading ? "Submitting..." : "Submit Preferences"}
                  </Button>
                </Group>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>
      )}
    </Transition>
  );
}

AccommodationRequestForm.propTypes = {
  window: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default AccommodationRequestForm;
