/**
 * FineManagement - Simplified Disciplinary Module (HM-WF-105)
 * Clean, simple, and functional interface for fine management.
 * Role-based visibility:
 * - Student: View personal fines
 * - Caretaker/Warden: Impose and manage fines
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Grid,
  Card,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  Text,
  Loader,
  Center,
  Tabs,
  Table,
  ScrollArea,
  TextInput,
  ActionIcon,
  Tooltip,
  Modal,
  Divider,
  Timeline,
  SegmentedControl,
  Paper,
  Textarea,
} from "@mantine/core";
import {
  IconPlus,
  IconDownload,
  IconSearch,
  IconList,
  IconUser,
  IconAlertTriangle,
  IconCheck,
  IconEye,
  IconCalendar,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import {
  fetchFines,
  fetchFineReport,
  markFinePaid,
  waiveFine,
  imposeFine,
} from "./api";
import ImposeFineModal from "./components/fines/ImposeFineModal";

export default function FineManagement() {
  const [fines, setFines] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [waiveModalOpen, setWaiveModalOpen] = useState(false);
  const [waiveReason, setWaiveReason] = useState("");
  const [waivingId, setWaivingId] = useState(null);

  const userRole = useSelector((state) => state.user.role);
  const isStudent = userRole === "student";
  const isWarden = userRole === "warden";
  const isCaretaker = userRole === "caretaker";
  const isStaff = isWarden || isCaretaker;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const params = selectedStatus !== "all" ? { status: selectedStatus } : {};
      const [finesData, reportData] = await Promise.all([
        fetchFines(params),
        !isStudent ? fetchFineReport() : Promise.resolve(null),
      ]);
      setFines(finesData || []);
      setReport(reportData);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to load fine data.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [isStudent, selectedStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleExport = () => {
    if (!fines || fines.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(fines);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fines");
    XLSX.writeFile(wb, "Hostel_Fines.xlsx");
  };

  const handleMarkPaid = async (id) => {
    try {
      await markFinePaid(id);
      notifications.show({
        title: "Success",
        message: "Fine marked as paid.",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Action failed.",
        color: "red",
      });
    }
  };

  const handleWaive = (id) => {
    setWaivingId(id);
    setWaiveReason("");
    setWaiveModalOpen(true);
  };

  const handleConfirmWaive = async () => {
    if (!waiveReason || waiveReason.trim().length < 5) {
      notifications.show({
        title: "Invalid Input",
        message: "Justification must be at least 5 characters.",
        color: "orange",
      });
      return;
    }

    try {
      setSubmitting(true);
      await waiveFine(waivingId, waiveReason);
      notifications.show({
        title: "Success",
        message: "Fine waived successfully.",
        color: "blue",
      });
      setWaiveModalOpen(false);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to waive fine.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFines = useMemo(() => {
    return fines.filter(
      (f) =>
        f.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.fine_uid?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [fines, searchTerm]);

  if (loading)
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );

  return (
    <Stack gap="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={2}>Hostel Fine Management</Title>
          <Group>
            {isStaff && (
              <Button
                leftSection={<IconDownload size={16} />}
                variant="light"
                onClick={handleExport}
              >
                Export
              </Button>
            )}
            {isStaff && (
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => setModalOpen(true)}
              >
                Impose Fine
              </Button>
            )}
          </Group>
        </Group>

        {isStaff && report && (
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Fines
                </Text>
                <Text fw={700} size="xl">
                  {report.summary.total_fines}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Total Amount
                </Text>
                <Text fw={700} size="xl">
                  ₹{report.summary.total_amount}
                </Text>
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder radius="md" p="md">
                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                  Unpaid Count
                </Text>
                <Text fw={700} size="xl" c="red">
                  {report.summary.unpaid_fines}
                </Text>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        <Tabs defaultValue="list">
          <Tabs.List>
            <Tabs.Tab value="list" leftSection={<IconList size={14} />}>
              Fine Records
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="list" pt="md">
            <Stack>
              <Group justify="space-between">
                <TextInput
                  placeholder="Search by student or ID..."
                  leftSection={<IconSearch size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <SegmentedControl
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  data={[
                    { label: "All", value: "all" },
                    { label: "Pending", value: "pending" },
                    { label: "Paid", value: "paid" },
                    { label: "Waived", value: "waived" },
                  ]}
                />
              </Group>
              <ScrollArea h={500}>
                <Table verticalSpacing="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>ID</Table.Th>
                      {!isStudent && <Table.Th>Student</Table.Th>}
                      <Table.Th>Category</Table.Th>
                      <Table.Th>Amount</Table.Th>
                      <Table.Th>Date Imposed</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredFines.map((f) => (
                      <Table.Tr key={f.id}>
                        <Table.Td>
                          <Text size="sm" fw={600}>
                            {f.fine_uid}
                          </Text>
                        </Table.Td>
                        {!isStudent && (
                          <Table.Td>
                            <Group gap="xs">
                              <IconUser size={14} />
                              <div>
                                <Text size="sm" fw={500}>
                                  {f.student_name}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {f.student_roll}
                                </Text>
                              </div>
                            </Group>
                          </Table.Td>
                        )}
                        <Table.Td>
                          <Badge variant="dot" size="sm">
                            {f.category.replace("Violation", "")}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={700}>
                            ₹{f.amount}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <IconCalendar size={14} c="dimmed" />
                            <Text size="xs">
                              {new Date(f.imposed_date).toLocaleDateString()}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={
                              f.status === "paid"
                                ? "green"
                                : f.status === "waived"
                                  ? "gray"
                                  : "red"
                            }
                            variant="light"
                            size="sm"
                          >
                            {f.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={8}>
                            <Tooltip label="View Details">
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => {
                                  setSelectedFine(f);
                                  setDetailsOpen(true);
                                }}
                              >
                                <IconEye size={18} />
                              </ActionIcon>
                            </Tooltip>

                            {isStaff && f.status === "pending" && (
                              <Tooltip label="Resolve / Mark Paid">
                                <ActionIcon
                                  color="green"
                                  variant="light"
                                  onClick={() => handleMarkPaid(f.id)}
                                >
                                  <IconCheck size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}

                            {isWarden && f.status === "pending" && (
                              <Tooltip label="Waive Fine">
                                <ActionIcon
                                  color="orange"
                                  variant="light"
                                  onClick={() => handleWaive(f.id)}
                                >
                                  <IconX size={18} />
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <ImposeFineModal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={async (data) => {
          setSubmitting(true);
          try {
            await imposeFine(data);
            notifications.show({
              title: "Success",
              message: "Fine imposed.",
              color: "green",
            });
            loadData();
            setModalOpen(false);
          } finally {
            setSubmitting(false);
          }
        }}
        loading={submitting}
      />

      <Modal
        opened={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={<Text fw={700}>Fine Record: {selectedFine?.fine_uid}</Text>}
        size="lg"
        radius="md"
      >
        {selectedFine && (
          <Stack>
            <Timeline
              active={selectedFine.status === "paid" ? 2 : 1}
              bulletSize={24}
              lineWidth={2}
            >
              <Timeline.Item
                bullet={<IconPlus size={12} />}
                title="Fine Imposed"
              >
                <Text color="dimmed" size="xs">
                  {new Date(selectedFine.imposed_date).toLocaleString()}
                </Text>
                <Text size="sm" mt={4}>
                  By:{" "}
                  <Text span fw={500}>
                    {selectedFine.imposed_by_name || "Staff"}
                  </Text>
                </Text>
              </Timeline.Item>

              <Timeline.Item
                bullet={<IconAlertTriangle size={12} />}
                title="Reason & Justification"
              >
                <Paper withBorder p="xs" mt={4} bg="gray.0">
                  <Text size="sm" italic>
                    {selectedFine.reason || "No justification provided."}
                  </Text>
                </Paper>
              </Timeline.Item>

              {selectedFine.status === "paid" && (
                <Timeline.Item
                  bullet={<IconCheck size={12} />}
                  title="Payment Resolved"
                >
                  <Text color="dimmed" size="xs">
                    {selectedFine.paid_date
                      ? new Date(selectedFine.paid_date).toLocaleString()
                      : "N/A"}
                  </Text>
                  <Text size="sm" mt={4}>
                    Status changed to <Badge color="green">Paid</Badge>
                  </Text>
                </Timeline.Item>
              )}

              {selectedFine.status === "waived" && (
                <Timeline.Item bullet={<IconX size={12} />} title="Fine Waived">
                  <Text color="dimmed" size="xs">
                    {selectedFine.updated_at
                      ? new Date(selectedFine.updated_at).toLocaleString()
                      : "N/A"}
                  </Text>
                  <Stack gap={4} mt={4}>
                    <Text size="sm">
                      Waived by:{" "}
                      <Text span fw={500}>
                        {selectedFine.waived_by_name || "Warden"}
                      </Text>
                    </Text>
                    <Paper withBorder p="xs" bg="orange.0">
                      <Text size="xs" fw={700} c="orange.9" tt="uppercase">
                        Waiver Justification
                      </Text>
                      <Text size="sm" italic>
                        {selectedFine.waive_reason || "No reason provided."}
                      </Text>
                    </Paper>
                  </Stack>
                </Timeline.Item>
              )}
            </Timeline>

            <Divider my="sm" />

            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed">
                  Fine Amount
                </Text>
                <Text fw={700} size="xl" c="blue">
                  ₹{selectedFine.amount}
                </Text>
              </div>
              <Button variant="light" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={waiveModalOpen}
        onClose={() => setWaiveModalOpen(false)}
        title={<Text fw={700}>Waive Student Fine</Text>}
        radius="md"
        centered
      >
        <Stack>
          <Text size="sm" c="dimmed">
            Please provide a justification for waiving this fine. This action is
            irreversible and will be logged.
          </Text>
          <Textarea
            label="Waiver Justification"
            placeholder="Reason for waiving..."
            required
            minRows={3}
            value={waiveReason}
            onChange={(e) => setWaiveReason(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button
              variant="subtle"
              onClick={() => setWaiveModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              color="orange"
              onClick={handleConfirmWaive}
              loading={submitting}
            >
              Confirm Waiver
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
