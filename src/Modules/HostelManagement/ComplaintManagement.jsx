/**
 * ComplaintManagement - Thin View
 * Manages hostel complaints (UC-006, UC-007, UC-008, UC-009)
 * Orchestrates components and handles state, calls api.js
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Title,
  Button,
  Group,
  Alert,
  TextInput,
  Stack,
  Textarea,
  Tabs,
  Badge,
  Text,
  Select,
  Modal,
  Container,
  Card,
  SimpleGrid,
} from "@mantine/core";
import {
  IconPlus,
  IconAlertCircle,
  IconUser,
  IconList,
  IconSearch,
  IconChecklist,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import ComplaintCard from "./components/ComplaintCard";
import CreateComplaintModal from "./components/CreateComplaintModal";
import ComplaintDetailDrawer from "./components/ComplaintDetailDrawer";
import {
  fetchComplaints,
  fetchMyComplaints,
  escalateComplaint,
  resolveComplaint,
  startComplaint,
  fetchComplaintReport,
} from "./api";

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState("");
  const [resolutionRemarks, setResolutionRemarks] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const userRole = useSelector((state) => state.user.role);
  const isStaff = userRole === "caretaker" || userRole === "warden";
  const isStudent = userRole === "student";
  const [activeTab, setActiveTab] = useState(isStaff ? "all" : "my");

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [allData, personalData] = await Promise.all([
        fetchComplaints(),
        isStudent ? fetchMyComplaints() : Promise.resolve([]),
      ]);
      setComplaints(allData);
      setMyComplaints(personalData);

      if (userRole === "warden") {
        setLoadingReport(true);
        fetchComplaintReport()
          .then(setReportData)
          .finally(() => setLoadingReport(false));
      }
    } catch (err) {
      setError("Failed to load complaints. Please try again.");
      console.error(err);
    }
  }, [userRole, isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEscalate = async () => {
    if (!selectedComplaint || !escalationReason.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide a reason for escalation",
        color: "red",
      });
      return;
    }

    try {
      setSubmitting(true);
      await escalateComplaint(selectedComplaint.id, {
        escalation_reason: escalationReason,
      });
      notifications.show({
        title: "Success",
        message: "Complaint escalated to Warden successfully",
        color: "green",
      });
      setEscalateModalOpen(false);
      setEscalationReason("");
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to escalate complaint",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionRemarks.trim()) {
      notifications.show({
        title: "Error",
        message: "Please provide resolution remarks (minimum 10 characters)",
        color: "red",
      });
      return;
    }

    if (resolutionRemarks.trim().length < 10) {
      notifications.show({
        title: "Error",
        message: "Resolution remarks must be at least 10 characters",
        color: "red",
      });
      return;
    }

    try {
      setSubmitting(true);
      await resolveComplaint(selectedComplaint.id, {
        resolution_remarks: resolutionRemarks,
      });
      notifications.show({
        title: "Success",
        message: "Complaint resolved successfully",
        color: "green",
      });
      setResolveModalOpen(false);
      setResolutionRemarks("");
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to resolve complaint",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartWork = async (complaintId) => {
    try {
      setSubmitting(true);
      await startComplaint(complaintId);
      notifications.show({
        title: "Success",
        message: "Complaint status updated to In Progress",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to start work",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredComplaints = (list) => {
    return list.filter((c) => {
      const matchesStatus =
        !statusFilter || c.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesCategory = !categoryFilter || c.category === categoryFilter;
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        c.complaint_uid?.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const activeCount = complaints.filter(
    (c) => c.status === "Submitted" || c.status === "InProgress",
  ).length;
  const escalatedCount = complaints.filter(
    (c) => c.status === "Escalated",
  ).length;

  return (
    <Container size={1200} p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={1} fw={800} style={{ letterSpacing: "-1px" }}>
              Hostel Grievances
            </Title>
            <Text c="dimmed" size="sm">
              Manage and resolve hostel complaints
            </Text>
          </Stack>

          {isStudent && (
            <Button
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpen(true)}
              size="md"
            >
              New Complaint
            </Button>
          )}
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle />}
            color="red"
            variant="light"
            radius="md"
          >
            {error}
          </Alert>
        )}

        {isStaff && (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Active Issues
              </Text>
              <Title order={3}>{activeCount}</Title>
            </Card>
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Escalations
              </Text>
              <Title order={3}>{escalatedCount}</Title>
            </Card>
            <Card withBorder radius="md" p="md">
              <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                Total Registry
              </Text>
              <Title order={3}>{complaints.length}</Title>
            </Card>
          </SimpleGrid>
        )}

        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Select
              placeholder="Status"
              clearable
              data={[
                { value: "submitted", label: "Submitted" },
                { value: "inprogress", label: "In Progress" },
                { value: "escalated", label: "Escalated" },
                { value: "resolved", label: "Resolved" },
                { value: "closed", label: "Closed" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 150 }}
            />
            <Select
              placeholder="Department"
              clearable
              data={["Maintenance", "Cleaning", "Security", "Other"]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: 150 }}
            />
          </Group>
          <TextInput
            placeholder="Search by ID or description..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            style={{ width: 300 }}
          />
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            {isStudent && (
              <Tabs.Tab
                value="my"
                leftSection={<IconUser size={14} />}
                rightSection={
                  <Badge size="sm" variant="filled" circle>
                    {myComplaints.length}
                  </Badge>
                }
              >
                My Requests
              </Tabs.Tab>
            )}
            {isStaff && (
              <Tabs.Tab
                value="all"
                leftSection={<IconList size={14} />}
                rightSection={
                  <Badge size="sm" variant="light" circle>
                    {complaints.length}
                  </Badge>
                }
              >
                Registry
              </Tabs.Tab>
            )}
            {userRole === "warden" && (
              <Tabs.Tab
                value="reports"
                leftSection={<IconChecklist size={14} />}
              >
                Audit Report
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="my">
            <Stack gap="md">
              {getFilteredComplaints(myComplaints).length > 0 ? (
                getFilteredComplaints(myComplaints).map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={(c) => {
                      setSelectedComplaint(c);
                      setDrawerOpen(true);
                    }}
                    showActions={false}
                  />
                ))
              ) : (
                <Card
                  p="xl"
                  withBorder
                  style={{
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                  }}
                  radius="md"
                >
                  <Text c="dimmed">No personal grievances found.</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="all">
            <Stack gap="md">
              {getFilteredComplaints(complaints).length > 0 ? (
                getFilteredComplaints(complaints).map((complaint) => (
                  <ComplaintCard
                    key={complaint.id}
                    complaint={complaint}
                    onView={(c) => {
                      setSelectedComplaint(c);
                      setDrawerOpen(true);
                    }}
                    onStart={(c) => handleStartWork(c.id)}
                    onEscalate={(c) => {
                      setSelectedComplaint(c);
                      setEscalateModalOpen(true);
                    }}
                    onResolve={(c) => {
                      setSelectedComplaint(c);
                      setResolveModalOpen(true);
                    }}
                    canStart={complaint.status === "Submitted"}
                    canEscalate={complaint.status === "InProgress"}
                    canResolve={["InProgress", "Escalated"].includes(
                      complaint.status,
                    )}
                  />
                ))
              ) : (
                <Card
                  p="xl"
                  withBorder
                  style={{
                    textAlign: "center",
                    backgroundColor: "#f9f9f9",
                  }}
                  radius="md"
                >
                  <Text c="dimmed">No assigned registry items found.</Text>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="reports">
            {loadingReport ? (
              <Card
                p="xl"
                withBorder
                style={{ textAlign: "center" }}
                radius="md"
              >
                <Text c="dimmed">Scanning registry for audit metrics...</Text>
              </Card>
            ) : userRole === "warden" && reportData ? (
              <Stack gap="xl" mt="md">
                <SimpleGrid cols={2}>
                  <Card withBorder p="xl" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      Resolved Today
                    </Text>
                    <Text fw={800} size="36px">
                      {reportData.summary.resolved_today}
                    </Text>
                  </Card>
                  <Card withBorder p="xl" radius="md">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                      System Total
                    </Text>
                    <Text fw={800} size="36px">
                      {reportData.summary.total_complaints}
                    </Text>
                  </Card>
                </SimpleGrid>

                <Card withBorder p="lg" radius="md">
                  <Title order={4} mb="lg">
                    Operational Statistics
                  </Title>
                  <Stack gap="xs">
                    {reportData.metrics.map((m, i) => (
                      <Group
                        key={i}
                        justify="space-between"
                        p="md"
                        style={{
                          borderRadius: "4px",
                          background: "#f8f9fa",
                        }}
                      >
                        <Stack gap={0}>
                          <Text size="sm" fw={700}>
                            {m.category}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {m.status}
                          </Text>
                        </Stack>
                        <Badge size="lg" variant="light">
                          {m.total}
                        </Badge>
                      </Group>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            ) : (
              <Card p="xl" withBorder style={{ textAlign: "center" }}>
                <Text c="dimmed">Report parameters not initialized.</Text>
              </Card>
            )}
          </Tabs.Panel>
        </Tabs>

        <ComplaintDetailDrawer
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          complaint={selectedComplaint}
        />

        <CreateComplaintModal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={() => {
            setModalOpen(false);
            loadData();
          }}
          loading={submitting}
        />

        <Modal
          opened={escalateModalOpen}
          onClose={() => setEscalateModalOpen(false)}
          title="Escalate Issue to Warden"
          centered
          radius="md"
        >
          <Stack gap="md">
            {selectedComplaint && (
              <Alert color="blue" variant="light" radius="md">
                <Text size="sm" fw={500}>
                  #{selectedComplaint.complaint_uid || selectedComplaint.id}:{" "}
                  {selectedComplaint.title}
                </Text>
              </Alert>
            )}
            <Textarea
              label="Escalation Details"
              placeholder="Justify the escalation for Warden review..."
              required
              minRows={4}
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.currentTarget.value)}
              radius="md"
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setEscalateModalOpen(false)}
              >
                Back
              </Button>
              <Button
                color="orange"
                loading={submitting}
                onClick={handleEscalate}
                radius="md"
              >
                Confirm Escalation
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title="Finalize Resolution"
          centered
          radius="md"
        >
          <Stack gap="md">
            {selectedComplaint && (
              <Alert color="green" variant="light" radius="md">
                <Text size="sm" fw={500}>
                  #{selectedComplaint.complaint_uid || selectedComplaint.id}:{" "}
                  {selectedComplaint.title}
                </Text>
              </Alert>
            )}
            <Textarea
              label="Resolution Logic"
              placeholder="Detail the steps taken to resolve this issue (min 10 chars)..."
              required
              minRows={4}
              value={resolutionRemarks}
              onChange={(e) => setResolutionRemarks(e.currentTarget.value)}
              radius="md"
            />
            <Group justify="flex-end">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setResolveModalOpen(false)}
              >
                Back
              </Button>
              <Button
                color="green"
                loading={submitting}
                onClick={handleResolve}
                radius="md"
              >
                Confirm Resolution
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
