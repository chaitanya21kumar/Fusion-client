import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Group,
  MultiSelect,
  Alert,
  List,
  ThemeIcon,
  Stepper,
  Divider,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconClock,
  IconTrash,
  IconCheck,
  IconBell,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { fetchHalls, processBulkHostelVacation, createNotice } from "./api";

function SemesterEndProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [selectedHostels, setSelectedHostels] = useState([]);
  const [noticeTitle, setNoticeTitle] = useState(
    "IMPORTANT: Semester End Room Vacation Notice",
  );
  const [noticeDescription, setNoticeDescription] = useState(
    "This is a mandatory notice for all residents. The current semester is ending. Please ensure all personal belongings are removed and the room is vacated by the deadline. Failure to comply will result in automatic unallocation and potential fines.",
  );

  useEffect(() => {
    const loadHostels = async () => {
      try {
        const data = await fetchHalls();
        setHostels(data);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to load hostels",
          color: "red",
        });
      }
    };
    loadHostels();
  }, []);

  const handleSendNotice = async () => {
    setLoading(true);
    try {
      // Create a global notice for all students
      const noticeData = new FormData();
      noticeData.append("hostel", ""); // Global
      noticeData.append("title", noticeTitle);
      noticeData.append("description", noticeDescription);
      noticeData.append("priority", "Urgent");
      noticeData.append("start_date", new Date().toISOString().split("T")[0]);
      noticeData.append(
        "end_date",
        new Date(new Date().setDate(new Date().getDate() + 15))
          .toISOString()
          .split("T")[0],
      );
      noticeData.append("status", "Published");

      await createNotice(noticeData);
      notifications.show({
        title: "Notice Sent",
        message: "Vacation notice published to all hostels.",
        color: "green",
      });
      setActiveStep(1);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to send notice",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVacate = async () => {
    if (selectedHostels.length === 0) {
      notifications.show({
        title: "Warning",
        message: "Please select at least one hostel.",
        color: "orange",
      });
      return;
    }

    if (
      !window.confirm(
        "CRITICAL ACTION: This will unallocate ALL students in the selected hostels, cancel their pending leaves/complaints, and reset room occupancy. Fines will be transferred to their next assignment. This cannot be undone. Proceed?",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await processBulkHostelVacation(selectedHostels);
      notifications.show({
        title: "Success",
        message: `Successfully vacated ${result.hostels_affected} hostels.`,
        color: "green",
      });
      setActiveStep(2);
    } catch (error) {
      notifications.show({
        title: "Process Failed",
        message: error.response?.data?.error || "Failed to process vacation",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="xl">
      <Paper p="xl" radius="md" withBorder shadow="sm">
        <Stack gap="md">
          <Title order={2}>Semester End Vacation Workflow</Title>
          <Text c="dimmed">
            Manage the transition between semesters by notifying students and
            cleaning up hostel allocations.
          </Text>

          <Divider my="md" />

          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            breakpoint="sm"
            allowNextStepsSelect={false}
          >
            <Stepper.Step
              label="Notification"
              description="Inform Students"
              icon={<IconBell size={18} />}
            >
              <Stack gap="md" mt="xl">
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Policy Reminder"
                  color="blue"
                >
                  It is recommended to send a notice at least 2 weeks before the
                  actual vacation process to allow students to clear their
                  belongings and check out properly.
                </Alert>

                <Paper p="md" withBorder radius="md">
                  <Stack gap="sm">
                    <Text fw={600}>Notice Content:</Text>
                    <TextInput
                      label="Title"
                      placeholder="Enter notice title"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.currentTarget.value)}
                      required
                    />
                    <Textarea
                      label="Description"
                      placeholder="Enter notice description"
                      value={noticeDescription}
                      onChange={(e) =>
                        setNoticeDescription(e.currentTarget.value)
                      }
                      minRows={4}
                      required
                    />
                    <Button
                      onClick={handleSendNotice}
                      loading={loading}
                      color="blue"
                      leftSection={<IconBell size={18} />}
                      disabled={!noticeTitle || !noticeDescription}
                    >
                      Send Notice to All Hostels
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Stepper.Step>

            <Stepper.Step
              label="Vacation"
              description="Empty Out Hostels"
              icon={<IconTrash size={18} />}
            >
              <Stack gap="md" mt="xl">
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Destructive Action"
                  color="red"
                >
                  Processing vacation will permanently remove current student
                  assignments. Use this only when the semester has officially
                  ended and hostels must be cleared for new batch allocation.
                </Alert>

                <MultiSelect
                  label="Select Hostels to Vacate"
                  placeholder="Pick one or more hostels"
                  data={hostels
                    .filter((h) => h.occupied_rooms > 0)
                    .map((h) => ({
                      value: h.hall_id,
                      label: `${h.name} (${h.occupied_rooms} residents)`,
                    }))}
                  value={selectedHostels}
                  onChange={setSelectedHostels}
                  searchable
                  clearable
                />

                <Paper
                  p="md"
                  withBorder
                  radius="md"
                  bg="var(--mantine-color-red-light)"
                >
                  <Stack gap="xs">
                    <Text fw={700} c="red.9">
                      The "Empty Out" process will:
                    </Text>
                    <List
                      spacing="xs"
                      size="sm"
                      center
                      icon={
                        <ThemeIcon color="red" size={20} radius="xl">
                          <IconCheck size={12} />
                        </ThemeIcon>
                      }
                    >
                      <List.Item>
                        Deactivate ALL current Room Allotments
                      </List.Item>
                      <List.Item>
                        Reset all room occupancy status to "Available"
                      </List.Item>
                      <List.Item>
                        Cancel all pending/approved student leave requests
                      </List.Item>
                      <List.Item>
                        Close all unresolved hostel complaints
                      </List.Item>
                      <List.Item>
                        Transfer unpaid fines to next allocation (Financial
                        Accountability)
                      </List.Item>
                    </List>

                    <Button
                      mt="md"
                      color="red"
                      onClick={handleBulkVacate}
                      loading={loading}
                      leftSection={<IconTrash size={18} />}
                    >
                      Process Hostel Vacation (Empty Out)
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Stepper.Step>

            <Stepper.Completed>
              <Stack gap="md" mt="xl" align="center">
                <ThemeIcon size={60} radius="xl" color="green">
                  <IconCheck size={40} />
                </ThemeIcon>
                <Title order={3}>Process Completed</Title>
                <Text ta="center">
                  All selected hostels have been vacated. You can now proceed to
                  the "Hostel Allocation" tab to start room assignments for the
                  upcoming semester.
                </Text>
                <Button variant="light" onClick={() => setActiveStep(0)}>
                  Start New Session
                </Button>
              </Stack>
            </Stepper.Completed>
          </Stepper>

          {activeStep < 2 && (
            <Group justify="space-between" mt="xl">
              <Button
                variant="default"
                onClick={() => setActiveStep((p) => Math.max(0, p - 1))}
                disabled={activeStep === 0}
              >
                Previous Step
              </Button>
              {activeStep === 0 && (
                <Button variant="subtle" onClick={() => setActiveStep(1)}>
                  Skip to Vacation
                </Button>
              )}
            </Group>
          )}
        </Stack>
      </Paper>

      {activeStep === 1 && (
        <Alert icon={<IconClock size={16} />} title="Audit Log" color="gray">
          Every vacation action is logged in the Hostel Audit Log for
          compliance.
        </Alert>
      )}
    </Stack>
  );
}

export default SemesterEndProcess;
