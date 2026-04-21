/**
 * HallManagement — Unified administrative portal for managing hostels and halls.
 *
 * Container that renders HostelList and manages modals for:
 * - Creating a new hostel
 * - Assigning warden/caretaker
 * - Viewing staff assignment history
 *
 * Fetches hostel data on mount and refreshes after mutations.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Title,
  Group,
  Button,
  Stack,
  Paper,
  Modal,
  Text,
  Flex,
  Container,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import {
  IconBuildingSkyscraper,
  IconPlus,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import HostelList from "./components/hall/HostelList";
import HostelCreateModal from "./components/hall/HostelCreateModal";
import AssignStaffModal from "./components/hall/AssignStaffModal";
import StaffAssignmentTable from "./components/hall/StaffAssignmentTable";
import BatchAllocationModal from "./components/room_allocation/BatchAllocationModal";
import {
  fetchHostels,
  createHostel,
  updateHostelStatus as updateHostelStatusApi,
  assignHostelWarden,
  assignHostelCaretaker,
  removeStaffAssignment,
  fetchHostelStaff,
  deleteHostel,
} from "./api";

export default function HallManagement() {
  // Data state
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignRole, setAssignRole] = useState("Warden");
  const [assignHostel, setAssignHostel] = useState(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffModalHostel, setStaffModalHostel] = useState(null);
  const [staffAssignments, setStaffAssignments] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);

  // Bulk Batch Modal
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [batchModalHostel, setBatchModalHostel] = useState(null);

  // ── Data fetching ──────────────────────────────────────────
  const loadHostels = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchHostels();
      setHostels(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load hostels:", err);
      notifications.show({
        title: "Error",
        message: "Failed to load hostels. Please try again.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHostels();
  }, [loadHostels]);

  // ── Create hostel ──────────────────────────────────────────
  const handleCreateHostel = async (data) => {
    setCreateLoading(true);
    try {
      await createHostel(data);
      notifications.show({
        title: "Hostel Created",
        message: `"${data.name}" has been created successfully with auto-generated rooms.`,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      setCreateModalOpen(false);
      loadHostels();
    } catch (err) {
      const msg =
        err.response?.data?.name?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        "Failed to create hostel.";
      notifications.show({
        title: "Creation Failed",
        message: msg,
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  // ── Status change ──────────────────────────────────────────
  const handleStatusChange = async (hostelId, newStatus) => {
    try {
      await updateHostelStatusApi(hostelId, newStatus);
      notifications.show({
        title: "Status Updated",
        message: `Hostel status changed to "${newStatus}".`,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      loadHostels();
    } catch (err) {
      const msg =
        err.response?.data?.status?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Status change failed.";
      notifications.show({
        title: "Status Change Failed",
        message: msg,
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  // ── Staff assignment ───────────────────────────────────────
  const handleOpenAssignWarden = (hostel) => {
    setAssignHostel(hostel);
    setAssignRole("Warden");
    setAssignModalOpen(true);
  };

  const handleOpenAssignCaretaker = (hostel) => {
    setAssignHostel(hostel);
    setAssignRole("Caretaker");
    setAssignModalOpen(true);
  };

  const handleAssignStaff = async (data) => {
    if (!assignHostel) return;
    setAssignLoading(true);

    try {
      const assignFn =
        assignRole === "Warden" ? assignHostelWarden : assignHostelCaretaker;
      const result = await assignFn(assignHostel.hall_id, data);

      if (result.warning) {
        notifications.show({
          title: "Warning",
          message: result.warning,
          color: "yellow",
          icon: <IconX size={16} />,
        });
      }

      notifications.show({
        title: `${assignRole} Assigned`,
        message: `${assignRole} has been assigned to "${assignHostel.name}".`,
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      setAssignModalOpen(false);
      loadHostels();
    } catch (err) {
      const msg =
        err.response?.data?.user_id?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.error ||
        `Failed to assign ${assignRole.toLowerCase()}.`;
      notifications.show({
        title: "Assignment Failed",
        message: msg,
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setAssignLoading(false);
    }
  };

  // ── View staff history ─────────────────────────────────────
  const handleViewStaff = async (hostel) => {
    setStaffModalHostel(hostel);
    setStaffModalOpen(true);
    setStaffLoading(true);

    try {
      const data = await fetchHostelStaff(hostel.hall_id);
      setStaffAssignments(Array.isArray(data) ? data : data?.results || []);
    } catch (err) {
      console.error("Failed to load staff:", err);
      setStaffAssignments([]);
    } finally {
      setStaffLoading(false);
    }
  };

  // ── Remove staff assignment ───────────────────────────────
  const handleRemoveStaff = async (assignmentId) => {
    try {
      await removeStaffAssignment(assignmentId);
      notifications.show({
        title: "Staff Removed",
        message: "Assignment has been deactivated successfully.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      // Refresh current history and main list
      if (staffModalHostel) {
        handleViewStaff(staffModalHostel);
      }
      loadHostels();
    } catch (err) {
      notifications.show({
        title: "Removal Failed",
        message:
          err.response?.data?.error || "Failed to remove staff assignment.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  // ── Remove hostel ──────────────────────────────────────────
  const handleDeleteHostel = (hostel) => {
    modals.openConfirmModal({
      title: "Delete Hostel",
      children: (
        <Stack gap="xs">
          <Text size="sm">
            Are you sure you want to permanently delete <b>{hostel.name}</b> (
            {hostel.hall_id})?
          </Text>
          <Text size="sm" c="red" fw={600}>
            This action cannot be undone. All associated rooms, staff
            assignments, and audit logs will be permanently removed.
          </Text>
        </Stack>
      ),
      labels: { confirm: "Delete Hostel", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteHostel(hostel.hall_id);
          notifications.show({
            title: "Hostel Deleted",
            message: `"${hostel.name}" has been removed successfully.`,
            color: "teal",
            icon: <IconCheck size={16} />,
          });
          loadHostels();
        } catch (err) {
          notifications.show({
            title: "Deletion Failed",
            message: err.response?.data?.error || "Failed to delete hostel.",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  // ── Bulk Batch Allotment ─────────────────────────────────────
  const handleOpenBatchAllot = (hostel) => {
    setBatchModalHostel(hostel);
    setBatchModalOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <Container size={1200} p={0}>
      <Stack gap="lg">
        {/* Header */}
        <Paper
          p="lg"
          radius="md"
          style={{
            background:
              "linear-gradient(135deg, rgba(34,139,230,0.04), rgba(32,201,151,0.08))",
          }}
        >
          <Flex justify="space-between" align="center">
            <Group gap="md">
              <IconBuildingSkyscraper
                size={34}
                color="var(--mantine-color-blue-6)"
              />
              <div>
                <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
                  Hall Management
                </Title>
                <Text size="sm" c="dimmed" fw={500}>
                  Admin Portal — Configure hostels, staff, and status
                </Text>
              </div>
            </Group>
            <Button
              id="create-hostel-btn"
              leftSection={<IconPlus size={18} />}
              radius="md"
              size="md"
              onClick={() => setCreateModalOpen(true)}
              variant="gradient"
              gradient={{ from: "blue", to: "cyan" }}
            >
              Setup New Hostel
            </Button>
          </Flex>
        </Paper>

        <HostelList
          hostels={hostels}
          loading={loading}
          onStatusChange={handleStatusChange}
          onAssignWarden={handleOpenAssignWarden}
          onAssignCaretaker={handleOpenAssignCaretaker}
          onViewStaff={handleViewStaff}
          onBulkBatchAllot={handleOpenBatchAllot}
          onRemove={handleDeleteHostel}
        />

        {/* Create Hostel Modal */}
        <HostelCreateModal
          opened={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSubmit={handleCreateHostel}
          loading={createLoading}
        />

        {/* Assign Staff Modal */}
        <AssignStaffModal
          opened={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          role={assignRole}
          hostelName={assignHostel?.name}
          onSubmit={handleAssignStaff}
          loading={assignLoading}
        />

        {/* Staff History Modal */}
        <Modal
          opened={staffModalOpen}
          onClose={() => setStaffModalOpen(false)}
          title={`Staff Assignment History — ${staffModalHostel?.name}`}
          size="xl"
          radius="md"
        >
          <StaffAssignmentTable
            assignments={staffAssignments}
            loading={staffLoading}
            onRemove={handleRemoveStaff}
          />
        </Modal>

        {/* Bulk Batch Allotment Modal */}
        <BatchAllocationModal
          opened={batchModalOpen}
          onClose={() => setBatchModalOpen(false)}
          hostel={batchModalHostel}
          onFinish={loadHostels}
        />
      </Stack>
    </Container>
  );
}
