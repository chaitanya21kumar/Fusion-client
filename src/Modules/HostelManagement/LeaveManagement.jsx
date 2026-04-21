/**
 * LeaveManagement Feature (UC-001, UC-002, UC-003, UC-005)
 * Manages hostel leave requests
 * Role-based visibility:
 * - Student: Submit leave, view own leave history
 * - Caretaker: View all leave requests, approve/reject with remarks
 * - Warden: View all leaves (read-only), generate reports
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Button,
  Group,
  Alert,
  Tabs,
  Stack,
  Badge,
  Modal,
  Textarea,
  Text,
  Select,
  Container,
} from "@mantine/core";
import {
  IconPlus,
  IconAlertCircle,
  IconList,
  IconUser,
  IconDownload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import LeavesTable from "./components/LeavesTable";
import LeaveRequestForm from "./components/LeaveRequestForm";
import {
  fetchLeaves,
  fetchMyLeaves,
  createLeave,
  updateLeaveStatus,
} from "./api";

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const userRole = (
    useSelector((state) => state.user.role) || ""
  ).toLowerCase();
  const isStaff = userRole === "caretaker" || userRole === "warden";
  const isStudent = userRole === "student";

  const [activeTab, setActiveTab] = useState(isStudent ? "my" : "all");

  // Reject modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      if (isStudent) {
        const myLeavesData = await fetchMyLeaves();
        setMyLeaves(myLeavesData);
      } else {
        const [leavesData, myLeavesData] = await Promise.all([
          fetchLeaves(),
          fetchMyLeaves().catch(() => []),
        ]);
        setLeaves(leavesData);
        setMyLeaves(myLeavesData);
      }
    } catch (err) {
      setError("Failed to load leaves. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isStudent]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateLeave = async (formData) => {
    try {
      setSubmitting(true);
      await createLeave(formData);
      notifications.show({
        title: "Success",
        message:
          "Leave request submitted successfully. Your Caretaker has been notified.",
        color: "green",
      });
      setModalOpen(false);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message:
          err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to submit leave request",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveLeave = async (leave) => {
    try {
      await updateLeaveStatus(leave.id, "approved", {
        status: "Approved",
        decision_remarks: "Approved by Caretaker",
      });
      notifications.show({
        title: "Success",
        message: "Leave approved. Student has been notified.",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to approve leave",
        color: "red",
      });
    }
  };

  const handleRejectLeave = async () => {
    if (!selectedLeave) return;
    if (!rejectReason.trim()) {
      notifications.show({
        title: "Error",
        message: "Rejection reason is mandatory",
        color: "red",
      });
      return;
    }

    try {
      setSubmitting(true);
      await updateLeaveStatus(selectedLeave.id, "rejected", {
        status: "Rejected",
        decision_remarks: rejectReason,
      });
      notifications.show({
        title: "Success",
        message: "Leave rejected. Student has been notified.",
        color: "green",
      });
      setRejectModalOpen(false);
      setRejectReason("");
      setSelectedLeave(null);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to reject leave",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (leave) => {
    setSelectedLeave(leave);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  // Filter leaves by status
  const filteredLeaves = statusFilter
    ? leaves.filter((l) => l.status?.toLowerCase() === statusFilter)
    : leaves;

  const handleGenerateReport = () => {
    if (filteredLeaves.length === 0) {
      notifications.show({
        title: "No Data",
        message: "There are no leave records to export.",
        color: "yellow",
      });
      return;
    }

    const headers = [
      "ID",
      "Student",
      "Start Date",
      "End Date",
      "Reason",
      "Status",
      "Decision Remarks",
      "Decided By",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredLeaves.map((l) =>
        [
          l.id,
          `"${l.student_name || l.student?.id || ""}"`,
          l.start_date,
          l.end_date,
          `"${(l.reason || "").replace(/"/g, '""')}"`,
          l.status,
          `"${(l.decision_remarks || "").replace(/"/g, '""')}"`,
          `"${l.decided_by_name || ""}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leave_report_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats
  const pendingCount = leaves.filter(
    (l) => l.status?.toLowerCase() === "pending",
  ).length;
  const approvedCount = leaves.filter(
    (l) => l.status?.toLowerCase() === "approved",
  ).length;

  return (
    <Container size={1200} p={0}>
      <Stack gap="lg">
        <Group justify="space-between" mb="md">
          <Title order={2}>Leave Management</Title>
          {isStudent && (
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Apply Leave
            </Button>
          )}
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" mb="md">
            {error}
          </Alert>
        )}

        {/* Stats for staff */}
        {isStaff && (
          <Group grow>
            <Card
              withBorder
              p="lg"
              style={{ borderLeft: "3px solid var(--mantine-color-yellow-5)" }}
            >
              <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Pending
                </Text>
                <Text fw={700} size="xl">
                  {pendingCount}
                </Text>
              </Stack>
            </Card>
            <Card
              withBorder
              p="lg"
              style={{ borderLeft: "3px solid var(--mantine-color-green-5)" }}
            >
              <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Approved
                </Text>
                <Text fw={700} size="xl">
                  {approvedCount}
                </Text>
              </Stack>
            </Card>
            <Card
              withBorder
              p="lg"
              style={{ borderLeft: "3px solid var(--mantine-color-blue-5)" }}
            >
              <Stack gap={4}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                  Total
                </Text>
                <Text fw={700} size="xl">
                  {leaves.length}
                </Text>
              </Stack>
            </Card>
          </Group>
        )}

        {/* Status filter and Reports for staff */}
        {isStaff && (
          <Group justify="space-between">
            <Select
              placeholder="Filter by status"
              clearable
              data={[
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ maxWidth: 250 }}
            />
            <Button
              variant="light"
              color="blue"
              leftSection={<IconDownload size={16} />}
              onClick={handleGenerateReport}
            >
              Generate Report
            </Button>
          </Group>
        )}

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List mb="md">
            {isStudent && (
              <Tabs.Tab
                value="my"
                leftSection={<IconUser size={14} />}
                rightSection={<Badge size="sm">{myLeaves.length}</Badge>}
              >
                My Leaves
              </Tabs.Tab>
            )}
            {isStaff && (
              <Tabs.Tab
                value="all"
                leftSection={<IconList size={14} />}
                rightSection={<Badge size="sm">{leaves.length}</Badge>}
              >
                All Leaves
              </Tabs.Tab>
            )}
          </Tabs.List>

          {isStudent && (
            <Tabs.Panel value="my">
              <LeavesTable leaves={myLeaves} loading={loading} />
            </Tabs.Panel>
          )}

          {isStaff && (
            <Tabs.Panel value="all">
              <LeavesTable
                leaves={filteredLeaves}
                loading={loading}
                showActions={userRole === "caretaker"}
                onApprove={handleApproveLeave}
                onReject={openRejectModal}
              />
            </Tabs.Panel>
          )}
        </Tabs>

        <LeaveRequestForm
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreateLeave}
          loading={submitting}
        />

        {/* Reject Modal — UC-002: Decision reason mandatory for rejection */}
        <Modal
          opened={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Leave Request"
          centered
        >
          <Stack gap="md">
            {selectedLeave && (
              <Alert color="yellow" variant="light">
                <Text size="sm" fw={500}>
                  Leave #{selectedLeave.id}:{" "}
                  {selectedLeave.reason?.substring(0, 80)}...
                </Text>
              </Alert>
            )}
            <Textarea
              label="Rejection Reason"
              placeholder="Provide a reason for rejection (mandatory)"
              required
              minRows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.currentTarget.value)}
            />
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                color="red"
                loading={submitting}
                onClick={handleRejectLeave}
              >
                Reject Leave
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
}
