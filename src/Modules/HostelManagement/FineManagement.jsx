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
  Paper as MantinePaper,
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
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import * as XLSX from "xlsx";
import { fetchFines, fetchFineReport, markFinePaid, imposeFine } from "./api";
import ImposeFineModal from "./components/ImposeFineModal";

export default function FineManagement() {
  const [fines, setFines] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const userRole = useSelector((state) => state.user.role);
  const isStudent = userRole === "student";
  const isWarden = userRole === "warden";
  const isCaretaker = userRole === "caretaker";
  const isStaff = isWarden || isCaretaker;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [finesData, reportData] = await Promise.all([
        fetchFines(),
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
  }, [isStudent]);

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
              <TextInput
                placeholder="Search by student or ID..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.currentTarget.value)}
              />
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
                <MantinePaper withBorder p="xs" mt={4} bg="gray.0">
                  <Text size="sm" italic>
                    {selectedFine.reason || "No justification provided."}
                  </Text>
                </MantinePaper>
              </Timeline.Item>

              {selectedFine.status === "paid" && (
                <Timeline.Item
                  bullet={<IconCheck size={12} />}
                  title="Payment Resolved"
                >
                  <Text color="dimmed" size="xs">
                    {new Date(selectedFine.paid_date).toLocaleString()}
                  </Text>
                  <Text size="sm" mt={4}>
                    Status changed to <Badge color="green">Paid</Badge>
                  </Text>
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
    </Stack>
  );
}
