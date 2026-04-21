import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Title,
  Text,
  Tabs,
  Alert,
  Loader,
  Divider,
  Grid,
  Group,
  Stack,
  Center,
  Card,
  Badge,
  ThemeIcon,
  Table,
  ActionIcon,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconBuildingSkyscraper,
  IconUserCog,
  IconBuilding,
  IconKey,
  IconHistory,
  IconLayoutDashboard,
  IconListCheck,
  IconHome,
  IconPlus,
  IconCheck,
  IconX,
  IconBuildingCommunity,
  IconAlertCircle,
} from "@tabler/icons-react";

// Components
import ApplicationWindowBanner from "./ApplicationWindowBanner";
import AccommodationRequestForm from "./AccommodationRequestForm";
import CapacityHeatmap from "./CapacityHeatmap";
import AllotmentListView from "./AllotmentListView";
import RoomChangeRequestForm from "../RoomChangeRequestForm";

// API
import * as api from "../../api";

/**
 * AccommodationAllotment Component (HM-WF-103)
 *
 * Orchestrates the Student Accommodation Request and Super Admin Bulk Allotment workflow.
 * Handles state management, role-based views, and real-time dashboard updates using Mantine UI.
 */
function AccommodationAllotment({ userRole }) {
  // State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [windows, setWindows] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [myAllotment, setMyAllotment] = useState(null);
  const [roomChanges, setRoomChanges] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [changeModalOpen, setChangeModalOpen] = useState(false);

  const role = (userRole || "").toLowerCase();
  const isSuperAdmin = role === "superadmin" || role === "super_admin";
  const isCaretaker = role === "caretaker";
  const isWarden = role === "warden";
  const isStaff = isWarden || isCaretaker;
  const isStudent = role === "student" || (!isSuperAdmin && !isStaff);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const windowData = await api.fetchAccommodationWindows();
      setWindows(windowData);

      if (isStudent) {
        try {
          const allotment = await api.fetchMyAllotment();
          setMyAllotment(allotment);
        } catch (e) {
          // No allotment found is expected for new students
        }
      }

      if (isSuperAdmin || isStaff) {
        const reports = await api.fetchRoomCapacityDashboard();
        setCapacityData(reports);
      }

      // Fetch Room Changes for all relevant roles & load Halls for student modal
      const changes = await api.fetchRoomChanges().catch(() => []);
      setRoomChanges(Array.isArray(changes) ? changes : []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to load accommodation data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };
  // Initial Data Fetch
  useEffect(() => {
    loadInitialData();
  }, [userRole]);

  // Handlers
  const handleRequestSubmit = async (data) => {
    setActionLoading(true);
    try {
      await api.submitAccommodationRequest(data);
      notifications.show({
        title: "Success",
        message: "Request submitted successfully!",
        color: "green",
      });
      loadInitialData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.detail || "Submission failed",
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // --- ROOM CHANGE HANDLERS ---
  const handleRequestRoomChange = async (formData) => {
    try {
      setActionLoading(true);
      const payload = {
        requested_room: parseInt(formData.requested_room, 10),
        reason: formData.reason,
      };
      await api.requestRoomChange(payload);

      notifications.show({
        title: "Success",
        message: "Room change request submitted successfully",
        color: "green",
      });
      setChangeModalOpen(false);
      loadInitialData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        (typeof err.response?.data === "object"
          ? JSON.stringify(err.response?.data)
          : null) ||
        err.message ||
        "Failed to request room change";
      notifications.show({
        title: "Error",
        message: errorMsg,
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveChange = async (changeId) => {
    try {
      setActionLoading(true);
      await api.approveRoomChange(changeId, { approve: true, remarks: "" });

      notifications.show({
        title: "Success",
        message: "Room change approved",
        color: "green",
      });
      loadInitialData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to approve room change";
      notifications.show({
        title: "Error",
        message: errorMsg,
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectChange = async (changeId) => {
    const reason = window.prompt("Please provide a reason for rejection:");
    if (!reason || reason.trim().length < 5) {
      notifications.show({
        title: "Error",
        message: "Rejection reason must be at least 5 characters.",
        color: "red",
      });
      return;
    }
    try {
      setActionLoading(true);
      await api.rejectRoomChange(changeId, {
        approve: false,
        rejection_reason: reason.trim(),
        remarks: reason.trim(),
      });

      notifications.show({
        title: "Success",
        message: "Room change rejected",
        color: "green",
      });
      loadInitialData();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Failed to reject room change";
      notifications.show({
        title: "Error",
        message: errorMsg,
        color: "red",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch available rooms specifically when student attempts room change
  useEffect(() => {
    if (changeModalOpen && myAllotment) {
      const loadRoomsForChange = async () => {
        try {
          const hallId =
            myAllotment.hostel || myAllotment.hostel_id || myAllotment.hall?.id;
          if (!hallId) return;

          const roomsData = await api.fetchRoomsInHall(hallId);
          if (Array.isArray(roomsData)) {
            const flattenedRooms = roomsData
              .filter(
                (r) =>
                  r.current_occupancy < r.capacity &&
                  String(r.room_number) !== String(myAllotment.room_number),
              )
              .map((r) => ({
                id: r.id,
                number: r.room_number,
                capacity: r.capacity,
                current_occupancy: r.current_occupancy,
                hall: { id: hallId, name: myAllotment.hostel_name },
              }));
            setAvailableRooms(flattenedRooms);
          }
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
      };
      loadRoomsForChange();
    }
  }, [changeModalOpen, myAllotment]);

  const activeWindow = windows.find((w) => w.is_active);

  if (loading) {
    return (
      <Center style={{ height: "60vh" }}>
        <Loader size={60} type="dots" />
      </Center>
    );
  }

  return (
    <Box>
      <Box mb="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={4}>
            <Title order={1} fw={800} style={{ letterSpacing: "-1px" }}>
              Hall Accommodation
            </Title>
            <Text c="dimmed" size="sm">
              {isStudent
                ? "Request and manage your hostel allotment"
                : "Multi-hostel capacity & student assignment management"}
            </Text>
          </Stack>
        </Group>
      </Box>

      <Divider mb="xl" />

      {isSuperAdmin && (
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" mb="xl">
          <Tabs.List>
            <Tabs.Tab
              value="dashboard"
              leftSection={<IconLayoutDashboard size={16} />}
            >
              Capacity Dashboard
            </Tabs.Tab>
            <Tabs.Tab
              value="allotments"
              leftSection={<IconUserCog size={16} />}
            >
              Allotment List
            </Tabs.Tab>
          </Tabs.List>

          <Box mt="xl">
            <Tabs.Panel value="dashboard">
              <CapacityHeatmap capacityData={capacityData} />
            </Tabs.Panel>

            <Tabs.Panel value="allotments">
              <AllotmentListView isSuperAdmin={isSuperAdmin} />
            </Tabs.Panel>
          </Box>
        </Tabs>
      )}

      {isStaff && (
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills" mb="xl">
          <Tabs.List>
            <Tabs.Tab
              value="dashboard"
              leftSection={<IconLayoutDashboard size={16} />}
            >
              Capacity Dashboard
            </Tabs.Tab>

            <Tabs.Tab
              value="allotments"
              leftSection={<IconUserCog size={16} />}
            >
              Allotment List
            </Tabs.Tab>
            <Tabs.Tab
              value="room_changes"
              leftSection={<IconBuildingCommunity size={16} />}
            >
              Room Changes
            </Tabs.Tab>
          </Tabs.List>

          <Box mt="xl">
            <Tabs.Panel value="dashboard">
              <CapacityHeatmap capacityData={capacityData} />
            </Tabs.Panel>

            <Tabs.Panel value="allotments">
              <AllotmentListView isSuperAdmin={false} />
            </Tabs.Panel>

            <Tabs.Panel value="room_changes">
              <Stack>
                <Title order={3}>Room Change Requests</Title>
                <Alert
                  icon={<IconListCheck />}
                  color="blue"
                  title="Manage Room Changes"
                >
                  Review and approve/reject student room change requests. Each
                  change must be reviewed and approved before updating
                  allocations.
                </Alert>

                {roomChanges.length > 0 ? (
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Student</Table.Th>
                        <Table.Th>From Room</Table.Th>
                        <Table.Th>To Room</Table.Th>
                        <Table.Th>Reason</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {roomChanges.map((change) => (
                        <Table.Tr key={change.id}>
                          <Table.Td>{change.student_name}</Table.Td>
                          <Table.Td>{change.current_room_number}</Table.Td>
                          <Table.Td>{change.requested_room_number}</Table.Td>
                          <Table.Td>
                            <Text size="sm" c="dimmed">
                              {change.reason?.length > 30
                                ? `${change.reason.substring(0, 30)}...`
                                : change.reason}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              variant="light"
                              color={
                                change.status === "requested"
                                  ? "yellow"
                                  : change.status === "approved_warden"
                                    ? "blue"
                                    : change.status === "completed"
                                      ? "green"
                                      : change.status === "rejected"
                                        ? "red"
                                        : "gray"
                              }
                            >
                              {change.status}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {(change.status === "requested" ||
                              change.status === "approved_warden") && (
                              <Group gap="xs">
                                <ActionIcon
                                  variant="subtle"
                                  color="green"
                                  onClick={() => handleApproveChange(change.id)}
                                  loading={actionLoading}
                                >
                                  <IconCheck size={18} />
                                </ActionIcon>
                                <ActionIcon
                                  variant="subtle"
                                  color="red"
                                  onClick={() => handleRejectChange(change.id)}
                                  loading={actionLoading}
                                >
                                  <IconX size={18} />
                                </ActionIcon>
                              </Group>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                ) : (
                  <Text c="dimmed">No room changes found.</Text>
                )}
              </Stack>
            </Tabs.Panel>
          </Box>
        </Tabs>
      )}

      {isStudent && (
        <Box>
          {myAllotment ? (
            <Card withBorder radius="md" p={0}>
              <Box
                p="md"
                style={{
                  borderBottom: "1px solid #eee",
                }}
              >
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon
                      color="green"
                      variant="light"
                      size="lg"
                      radius="md"
                    >
                      <IconBuilding size={20} />
                    </ThemeIcon>
                    <Stack gap={0}>
                      <Title order={3} fw={800}>
                        Your Hostel Allotment
                      </Title>
                      <Text size="xs" c="dimmed" fw={500}>
                        Active Residence Assignment
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    {myAllotment.is_legacy && (
                      <Badge
                        variant="dot"
                        color="orange"
                        size="md"
                        leftSection={<IconHistory size={12} />}
                      >
                        Legacy Record
                      </Badge>
                    )}
                    <Badge variant="light" color="blue" size="lg" radius="sm">
                      ACTIVE
                    </Badge>
                  </Group>
                </Group>
              </Box>

              <Box p="xl">
                <Grid gutter={40}>
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group align="flex-start" wrap="nowrap">
                      <ThemeIcon variant="transparent" color="dimmed" size="sm">
                        <IconBuildingSkyscraper size={18} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={700}
                          tt="uppercase"
                          style={{ letterSpacing: "1px" }}
                        >
                          Assigned Hostel
                        </Text>
                        <Text size="xl" fw={800}>
                          {myAllotment.hostel_name}
                        </Text>
                      </Stack>
                    </Group>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Group align="flex-start" wrap="nowrap">
                      <ThemeIcon variant="transparent" color="dimmed" size="sm">
                        <IconKey size={18} />
                      </ThemeIcon>
                      <Stack gap={0}>
                        <Text
                          size="xs"
                          c="dimmed"
                          fw={700}
                          tt="uppercase"
                          style={{ letterSpacing: "1px" }}
                        >
                          Room Selection
                        </Text>
                        <Text size="xl" fw={800}>
                          {myAllotment.room_number || "N/A"}
                        </Text>
                      </Stack>
                    </Group>
                  </Grid.Col>
                </Grid>

                {myAllotment.allotted_at && (
                  <Box
                    mt="xl"
                    pt="md"
                    style={{
                      borderTop: "1px dashed var(--mantine-color-gray-3)",
                    }}
                  >
                    <Text size="xs" c="dimmed">
                      Occupied since{" "}
                      {new Date(myAllotment.allotted_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </Text>
                  </Box>
                )}
              </Box>
            </Card>
          ) : (
            <>
              <ApplicationWindowBanner
                window={activeWindow}
                isStudent
                onApply={() =>
                  notifications.show({
                    message: "Scroll down to submit preferences",
                    color: "blue",
                  })
                }
              />
              {!activeWindow && (
                <Alert
                  icon={<IconHome size={16} />}
                  title="Notice"
                  color="blue"
                  radius="md"
                >
                  There are no active application windows at this time.
                </Alert>
              )}
              {activeWindow && (
                <AccommodationRequestForm
                  window={activeWindow}
                  onSubmit={handleRequestSubmit}
                  loading={actionLoading}
                />
              )}
            </>
          )}

          {/* STUDENT ROOM CHANGE HISTORY (Only visible if they have an active allotment) */}
          {myAllotment && (
            <Box mt="xl">
              <Group justify="space-between" mb="md">
                <Title order={3}>Room Change Requests</Title>
                <button
                  onClick={() => setChangeModalOpen(true)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "var(--mantine-color-blue-filled)",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <IconPlus size={16} /> Request Room Change
                </button>
              </Group>
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="blue"
                title="Room Change Process"
                mb="md"
              >
                Submit a request to move to a different room. Your request must
                be approved by both the Warden and Caretaker before taking
                effect.
              </Alert>

              {roomChanges.length > 0 ? (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>From Room</Table.Th>
                      <Table.Th>To Room</Table.Th>
                      <Table.Th>Reason</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Date Requested</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {roomChanges.map((change) => (
                      <Table.Tr key={change.id}>
                        <Table.Td>{change.current_room_number}</Table.Td>
                        <Table.Td>{change.requested_room_number}</Table.Td>
                        <Table.Td>{change.reason}</Table.Td>
                        <Table.Td>
                          <Badge
                            variant="light"
                            color={
                              change.status === "requested"
                                ? "yellow"
                                : change.status === "approved_warden"
                                  ? "blue"
                                  : change.status === "completed"
                                    ? "green"
                                    : change.status === "rejected"
                                      ? "red"
                                      : "gray"
                            }
                          >
                            {change.status === "requested"
                              ? "Pending"
                              : change.status === "approved_warden"
                                ? "Warden Approved"
                                : change.status === "completed"
                                  ? "Completed"
                                  : change.status === "rejected"
                                    ? "Rejected"
                                    : change.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{change.requested_date}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              ) : (
                <Text c="dimmed">No room change requests found.</Text>
              )}
            </Box>
          )}

          {/* STUDENT ROOM CHANGE MODAL (Only rendered if they have an active allotment) */}
          {isStudent && myAllotment && (
            <RoomChangeRequestForm
              opened={changeModalOpen}
              onClose={() => setChangeModalOpen(false)}
              onSubmit={handleRequestRoomChange}
              loading={actionLoading}
              availableRooms={availableRooms}
            />
          )}
        </Box>
      )}
    </Box>
  );
}

AccommodationAllotment.propTypes = {
  userRole: PropTypes.string.isRequired,
};

export default AccommodationAllotment;
