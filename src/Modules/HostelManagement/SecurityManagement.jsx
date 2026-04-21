import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Title,
  Group,
  Stack,
  Paper,
  Text,
  Flex,
  Container,
  Tabs,
  Box,
  rem,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconShieldLock,
  IconLayoutDashboard,
  IconShieldHalf,
  IconCalendarEvent,
  IconHistory,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import SecurityDashboard from "./components/security/SecurityDashboard";
import GuardList from "./components/security/GuardList";
import ShiftSchedule from "./components/security/ShiftSchedule";
import ShiftAuditLogs from "./components/security/ShiftAuditLogs";
import RegisterGuardModal from "./components/security/RegisterGuardModal";
import AssignShiftModal from "./components/security/AssignShiftModal";

import {
  fetchSecurityGuards,
  registerSecurityGuard,
  updateSecurityGuard,
  deleteSecurityGuard,
  fetchGuardShifts,
  createGuardShift,
  deleteGuardShift,
  fetchSecurityStatus,
  fetchSecurityLogs,
  fetchHalls,
  fetchMyAllotment,
} from "./api";

export default function SecurityManagement({ userRole }) {
  // Tabs state - Students/Caretakers only see shifts
  const [activeTab, setActiveTab] = useState(
    userRole === "warden" || userRole === "super_admin"
      ? "dashboard"
      : "shifts",
  );

  // Data state
  const [guards, setGuards] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [userHostel, setUserHostel] = useState(null); // The primary hostel for this user
  const [selectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Modals state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // ── User Context Initialization ────────────────────────────

  useEffect(() => {
    const initContext = async () => {
      try {
        if (userRole === "student") {
          const allotment = await fetchMyAllotment();
          if (allotment?.hostel) {
            setUserHostel(allotment.hostel);
            setSelectedHostel(allotment.hostel.hall_id);
          }
        } else if (userRole === "warden" || userRole === "caretaker") {
          const hallsData = await fetchHalls();
          if (hallsData && hallsData.length > 0) {
            setUserHostel(hallsData[0]);
            setSelectedHostel(hallsData[0].hall_id);
          }
        }
      } catch (err) {
        console.error("Failed to initialize security context:", err);
      }
    };
    initContext();
  }, [userRole]);

  // ── Data Loading ───────────────────────────────────────────

  const refreshTabData = useCallback(
    async (tab) => {
      try {
        if (
          tab === "dashboard" &&
          (userRole === "warden" || userRole === "super_admin")
        ) {
          const statsData = await fetchSecurityStatus({
            hostel: selectedHostel,
          });
          setStats(statsData);
        } else if (tab === "shifts") {
          const shiftsData = await fetchGuardShifts({
            date: selectedDate,
            hostel: selectedHostel,
          });
          setShifts(shiftsData);
        } else if (
          tab === "logs" &&
          (userRole === "warden" || userRole === "super_admin")
        ) {
          const logsData = await fetchSecurityLogs({ hostel: selectedHostel });
          setLogs(logsData);
        }
      } catch (err) {
        console.error(`Failed to refresh ${tab} data:`, err);
      }
    },
    [userRole, selectedHostel, selectedDate],
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const guardsData = await fetchSecurityGuards();
      setGuards(guardsData);

      // Load specific tab data
      refreshTabData(activeTab);
    } catch (err) {
      console.error("Failed to load security data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, refreshTabData]);

  useEffect(() => {
    loadData();
  }, [loadData, selectedHostel]);

  // ── Actions ────────────────────────────────────────────────

  const handleSaveGuard = async (data) => {
    setActionLoading(true);
    try {
      if (editingGuard) {
        await updateSecurityGuard(editingGuard.id, data);
        notifications.show({
          title: "Guard Updated",
          message: `${data.name}'s profile has been updated.`,
          color: "teal",
          icon: <IconCheck size={16} />,
        });
      } else {
        await registerSecurityGuard(data);
        notifications.show({
          title: "Guard Registered",
          message: `${data.name} has been added to the security pool.`,
          color: "teal",
          icon: <IconCheck size={16} />,
        });
      }
      setRegisterModalOpen(false);
      setEditingGuard(null);
      loadData();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = err.message || "Failed to save guard details.";

      if (errorData) {
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === "object") {
          const firstErrField = Object.keys(errorData)[0];
          const firstErr = errorData[firstErrField];
          errorMessage = `${firstErrField}: ${Array.isArray(firstErr) ? firstErr[0] : firstErr}`;
        }
      }

      notifications.show({
        title: "Action Failed",
        message: errorMessage,
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGuard = async (guardId) => {
    try {
      await deleteSecurityGuard(guardId);
      notifications.show({
        title: "Guard Removed",
        message: "The guard has been removed from the registry.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Deletion Failed",
        message:
          err.response?.data?.detail ||
          "Could not remove guard record. They might have assigned shifts.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const handleCreateShift = async (data) => {
    setActionLoading(true);
    try {
      await createGuardShift(data);
      notifications.show({
        title: "Shift Assigned",
        message: "Guard has been deployed successfully.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      setAssignModalOpen(false);
      refreshTabData("shifts");
      refreshTabData("dashboard");
    } catch (err) {
      notifications.show({
        title: "Assignment Failed",
        message:
          err.response?.data?.detail || "Conflict detected or invalid data.",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId) => {
    try {
      await deleteGuardShift(shiftId);
      notifications.show({
        title: "Shift Removed",
        message: "Assignment cancelled successfully.",
        color: "teal",
        icon: <IconCheck size={16} />,
      });
      refreshTabData("shifts");
      refreshTabData("dashboard");
    } catch (err) {
      notifications.show({
        title: "Action Failed",
        message: "Failed to remove shift assignment.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  // ── Render ─────────────────────────────────────────────────

  const iconStyle = { width: rem(16), height: rem(16) };

  return (
    <Container size={1200} p={0}>
      <Stack gap="lg">
        {/* Header Section */}
        <Paper p="lg" radius="md" withBorder>
          <Flex justify="space-between" align="center">
            <Group gap="md">
              <Paper
                p="xs"
                radius="md"
                bg="blue.6"
                style={{ display: "flex", alignItems: "center" }}
              >
                <IconShieldLock size={28} color="white" stroke={2} />
              </Paper>
              <Box>
                <Title order={2} fw={800} style={{ letterSpacing: "-0.5px" }}>
                  Hostel Security Management
                </Title>
                <Text size="sm" c="dimmed" fw={500}>
                  Security deployment, guard monitoring and shift scheduling
                </Text>
              </Box>
            </Group>
          </Flex>
        </Paper>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          radius="md"
        >
          <Tabs.List mb="md">
            {(userRole === "warden" || userRole === "super_admin") && (
              <>
                <Tabs.Tab
                  value="dashboard"
                  leftSection={<IconLayoutDashboard style={iconStyle} />}
                >
                  Status Dashboard
                </Tabs.Tab>
                <Tabs.Tab
                  value="guards"
                  leftSection={<IconShieldHalf style={iconStyle} />}
                >
                  Guard Registry
                </Tabs.Tab>
              </>
            )}
            <Tabs.Tab
              value="shifts"
              leftSection={<IconCalendarEvent style={iconStyle} />}
            >
              Shift Schedule
            </Tabs.Tab>
            {(userRole === "warden" || userRole === "super_admin") && (
              <Tabs.Tab
                value="logs"
                leftSection={<IconHistory style={iconStyle} />}
              >
                Audit logs
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="dashboard">
            <Stack gap="lg">
              <SecurityDashboard stats={stats} loading={loading} />
              <ShiftSchedule
                shifts={shifts.slice(0, 5)}
                loading={loading}
                onAssign={() => setAssignModalOpen(true)}
                onRemove={handleDeleteShift}
                selectedDate={selectedDate}
                userRole={userRole}
              />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="guards">
            <GuardList
              guards={guards}
              loading={loading}
              onRegister={() => {
                setEditingGuard(null);
                setRegisterModalOpen(true);
              }}
              onEdit={(guard) => {
                setEditingGuard(guard);
                setRegisterModalOpen(true);
              }}
              onDelete={handleDeleteGuard}
            />
          </Tabs.Panel>

          <Tabs.Panel value="shifts">
            <ShiftSchedule
              shifts={shifts}
              loading={loading}
              onAssign={() => setAssignModalOpen(true)}
              onRemove={handleDeleteShift}
              selectedDate={selectedDate}
              userRole={userRole}
            />
          </Tabs.Panel>

          <Tabs.Panel value="logs">
            <ShiftAuditLogs logs={logs} loading={loading} />
          </Tabs.Panel>
        </Tabs>

        {/* Modals */}
        <RegisterGuardModal
          opened={registerModalOpen}
          onClose={() => {
            setRegisterModalOpen(false);
            setEditingGuard(null);
          }}
          fixedHostel={userHostel}
          onSubmit={handleSaveGuard}
          initialData={editingGuard}
          loading={actionLoading}
        />

        <AssignShiftModal
          opened={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          guards={guards}
          fixedHostel={userHostel}
          onSubmit={handleCreateShift}
          loading={actionLoading}
          initialDate={selectedDate}
        />
      </Stack>
    </Container>
  );
}

SecurityManagement.propTypes = {
  userRole: PropTypes.string,
};
