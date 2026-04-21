/**
 * RoomAllocationManagement - Main Component
 * Complete room management with creation, allocation, and batch allocation
 * Orchestrates forms, state, and API calls
 */

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Button,
  Group,
  Stack,
  Card,
  Title,
  Alert,
  Badge,
  Table,
  Loader,
  Center,
  ActionIcon,
  Tooltip,
  Text,
  Pagination,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconAlertCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import RoomCreationForm from "./components/RoomCreationForm";
import RoomAllocationForm from "./components/RoomAllocationForm";
import BatchAllocationForm from "./components/BatchAllocationForm";
import RoomChangeRequestForm from "./components/RoomChangeRequestForm";
import {
  fetchAllActiveBatches,
  fetchHalls,
  fetchRoomAllocations,
  createRoomInHall,
  createRoomAllotment,
  allocateBatch,
  deleteRoomAllocation,
  requestRoomChange,
  fetchRoomChanges,
  approveRoomChange,
  rejectRoomChange,
  fetchRoomsInHall,
  fetchRoomVacations,
  submitRoomVacation,
  verifyRoomVacation,
  approveRoomVacation,
  fetchExtendedStays,
  submitExtendedStay,
  approveExtendedStay,
  rejectExtendedStay,
} from "./api";
import "@mantine/core/styles.css";

export default function RoomAllocationManagement() {
  const userRole = useSelector((state) => state.user.role);
  const [activeTab, setActiveTab] = useState("0");
  // States
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [halls, setHalls] = useState([]);
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [roomChanges, setRoomChanges] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [extendedStays, setExtendedStays] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [paginationData, setPaginationData] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  // Modal states
  const [roomCreationOpen, setRoomCreationOpen] = useState(false);
  const [roomAllocationOpen, setRoomAllocationOpen] = useState(false);
  const [batchAllocationOpen, setBatchAllocationOpen] = useState(false);
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [vacationModalOpen, setVacationModalOpen] = useState(false);
  const [extendedStayModalOpen, setExtendedStayModalOpen] = useState(false);
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Define loadData function
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch halls, batches, and allocations from centralized API functions
      const [
        hallsData,
        batchesData,
        allocationsResponse,
        changesData,
        vacationsData,
        extendedStaysData,
      ] = await Promise.all([
        fetchHalls().catch(() => []),
        fetchAllActiveBatches().catch(() => []),
        fetchRoomAllocations({
          page: currentPage,
          page_size: pageSize,
        }).catch(() => ({
          results: [],
          count: 0,
          next: null,
          previous: null,
        })),
        fetchRoomChanges().catch(() => []),
        fetchRoomVacations().catch(() => []),
        fetchExtendedStays().catch(() => []),
      ]); // Ensure halls have required properties for Select components
      const processedHalls = Array.isArray(hallsData)
        ? hallsData.map((h) => ({
            ...h,
            name: h.name || h.hall_name || `Hall ${h.id}`,
          }))
        : [];
      console.log("Processed halls data:", processedHalls);
      setHalls(processedHalls);
      setBatches(Array.isArray(batchesData) ? batchesData : []);
      setRooms([]); // Rooms will be managed through room creation form

      if (allocationsResponse && allocationsResponse.results) {
        setAllocations(allocationsResponse.results);
        setPaginationData({
          count: allocationsResponse.count || 0,
          next: allocationsResponse.next,
          previous: allocationsResponse.previous,
        });
      } else {
        setAllocations(
          Array.isArray(allocationsResponse) ? allocationsResponse : [],
        );
        setPaginationData({
          count: allocationsResponse.length || 0,
          next: null,
          previous: null,
        });
      }

      setRoomChanges(Array.isArray(changesData) ? changesData : []);
      setVacations(Array.isArray(vacationsData) ? vacationsData : []);
      setExtendedStays(
        Array.isArray(extendedStaysData) ? extendedStaysData : [],
      );
      setStudents([]); // Students will be managed through allocation form
    } catch (error) {
      console.error("Failed to load data:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }; // Fetch all data on mount and when page changes
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize]); // Load rooms for change request form when modal opens
  useEffect(() => {
    if (changeModalOpen && halls.length > 0 && availableRooms.length === 0) {
      const loadRoomsForChange = async () => {
        try {
          const allRooms = await Promise.allSettled(
            halls.map(async (hall) => {
              try {
                const roomsData = await fetchRoomsInHall(hall.id);
                if (Array.isArray(roomsData)) {
                  return roomsData
                    .filter((r) => r.current_occupancy < r.capacity) // Filter by actual occupancy
                    .map((r) => ({
                      id: r.id,
                      number: r.room_number,
                      room_type: r.room_type || "single",
                      capacity: r.capacity,
                      current_occupancy: r.current_occupancy,
                      status: r.status,
                      hall: { id: hall.id, name: hall.name },
                    }));
                }
                return [];
              } catch (error) {
                console.warn(
                  `Failed to fetch rooms for hall ${hall.id}:`,
                  error,
                );
                return [];
              }
            }),
          );

          const flattenedRooms = allRooms
            .filter((result) => result.status === "fulfilled")
            .flatMap((result) => result.value || []);

          console.log("Rooms loaded for change:", flattenedRooms.length);
          setAvailableRooms(flattenedRooms);
        } catch (error) {
          console.error("Error loading rooms:", error);
        }
      };
      loadRoomsForChange();
    }
  }, [changeModalOpen]);
  const handleCreateRoom = async (formData) => {
    try {
      setSubmitting(true);
      await createRoomInHall(formData.hall_id, {
        room_number: formData.room_number,
        block_number: formData.block_number,
        room_type: formData.room_type,
        capacity: formData.capacity,
      });

      notifications.show({
        title: "Success",
        message: "Room created successfully",
        color: "green",
      });
      setRoomCreationOpen(false);
      loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleAllocateRoom = async (formData) => {
    try {
      setSubmitting(true);

      const payload = {
        student: formData.student_id,
        room: formData.room_id,
        allotted_at: formData.allocation_date
          ? formData.allocation_date.toISOString()
          : new Date().toISOString(),
      };

      await createRoomAllotment(payload);

      notifications.show({
        title: "Success",
        message: "Room allocated successfully",
        color: "green",
      });
      setRoomAllocationOpen(false);
      loadData();
    } catch (error) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to allocate room",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleBatchAllocation = async (allocationData, hallId) => {
    try {
      setSubmitting(true);
      const data = {
        ...allocationData,
        allocation_date: allocationData.allocation_date
          ? allocationData.allocation_date.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };

      const result = await allocateBatch(hallId, data);

      notifications.show({
        title: "Success",
        message: `${result.allocated_count || result.count || 0} students allocated successfully`,
        color: "green",
      });
      setBatchAllocationOpen(false);
      loadData();
    } catch (error) {
      console.error("Batch allocation error:", error);
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.error ||
          error.message ||
          "Failed to allocate batch",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Delete Room Allocation (Superadmin only)
  const handleDeleteAllocation = async (allocationId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this allocation? This will free up the room space.",
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteRoomAllocation(allocationId);

      notifications.show({
        title: "Success",
        message: "Allocation removed successfully",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to delete allocation",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handler: Request Room Change
  const handleRequestRoomChange = async (formData) => {
    try {
      setSubmitting(true);
      // Transform form data: backend only needs requested_room (ID) and reason
      const payload = {
        requested_room: parseInt(formData.requested_room, 10),
        reason: formData.reason,
      };
      await requestRoomChange(payload);

      notifications.show({
        title: "Success",
        message: "Room change request submitted successfully",
        color: "green",
      });
      setChangeModalOpen(false);
      loadData();
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
      setSubmitting(false);
    }
  };

  // Handler: Approve Room Change (Caretaker/Warden)
  const handleApproveChange = async (changeId) => {
    try {
      setSubmitting(true);
      await approveRoomChange(changeId, { approve: true, remarks: "" });

      notifications.show({
        title: "Success",
        message: "Room change approved",
        color: "green",
      });
      loadData();
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
      setSubmitting(false);
    }
  };

  // Handler: Reject Room Change (Caretaker/Warden)
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
      setSubmitting(true);
      await rejectRoomChange(changeId, {
        approve: false,
        rejection_reason: reason.trim(),
        remarks: reason.trim(),
      });

      notifications.show({
        title: "Success",
        message: "Room change rejected",
        color: "green",
      });
      loadData();
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
      setSubmitting(false);
    }
  };
  // Handlers for Room Vacation
  const handleRequestVacation = async (formData) => {
    try {
      setSubmitting(true);
      await submitRoomVacation(formData);
      notifications.show({
        title: "Success",
        message: "Vacation requested",
        color: "green",
      });
      setVacationModalOpen(false);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to request",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyVacation = async (id) => {
    try {
      await verifyRoomVacation(id, "Caretaker verified");
      notifications.show({
        title: "Success",
        message: "Verified",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    }
  };

  const handleApproveVacation = async (id) => {
    try {
      await approveRoomVacation(id, "Warden approved");
      notifications.show({
        title: "Success",
        message: "Approved",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    }
  };

  // Handlers for Extended Stays
  const handleRequestExtendedStay = async (formData) => {
    try {
      setSubmitting(true);
      await submitExtendedStay(formData);
      notifications.show({
        title: "Success",
        message: "Extended stay requested",
        color: "green",
      });
      setExtendedStayModalOpen(false);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message || "Failed to request",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveExtendedStay = async (id) => {
    try {
      await approveExtendedStay(id, "Approved");
      notifications.show({
        title: "Success",
        message: "Approved",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    }
  };

  const handleRejectExtendedStay = async (id) => {
    try {
      await rejectExtendedStay(id, "Rejected");
      notifications.show({
        title: "Success",
        message: "Rejected",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    }
  };

  if (loading) {
    return (
      <Center h="50vh">
        <Loader size="lg" />
      </Center>
    );
  }

  // Get role-based tabs
  const getRoleBasedTabs = () => {
    if (userRole === "super_admin") {
      return [
        { value: "0", label: "Batch Allocation" },
        { value: "1", label: "View Allocations" },
      ];
    }

    if (userRole === "caretaker") {
      return [
        { value: "0", label: "Create Rooms" },
        { value: "1", label: "Individual Allocation" },
        { value: "2", label: "Room Changes" },
        { value: "3", label: "View Allocations" },
        { value: "4", label: "Room Vacations" },
        { value: "5", label: "Extended Stays" },
      ];
    }

    if (userRole === "warden") {
      return [
        { value: "2", label: "Room Changes" },
        { value: "1", label: "View Allocations" },
        { value: "4", label: "Room Vacations" },
        { value: "5", label: "Extended Stays" },
      ];
    }

    // Student role
    return [
      { value: "0", label: "Room Change Request" },
      { value: "1", label: "View Allocations" },
      { value: "2", label: "Room Vacation" },
      { value: "3", label: "Extended Stays" },
    ];
  };
  const roleBasedTabs = getRoleBasedTabs();
  return (
    <Stack gap="lg">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          {roleBasedTabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {/* SUPER ADMIN: Batch Allocation */}
        {userRole === "super_admin" && (
          <Tabs.Panel value="0" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Batch Allocate Rooms</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setBatchAllocationOpen(true)}
                  color="blue"
                >
                  Batch Allocate
                </Button>
              </Group>

              <Alert
                icon={<IconAlertCircle />}
                color="gray"
                title="Batch Allocation"
              >
                Allocate rooms to multiple students from a specific academic
                batch in a selected hall. The system will automatically assign
                available rooms sequentially.
              </Alert>
            </Stack>
          </Tabs.Panel>
        )}
        {/* CARETAKER: Create Rooms */}
        {userRole === "caretaker" && (
          <Tabs.Panel value="0" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Create New Rooms</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setRoomCreationOpen(true)}
                >
                  Create Room
                </Button>
              </Group>

              <Alert
                icon={<IconAlertCircle />}
                color="gray"
                title="Room Creation"
              >
                Create hostel rooms before allocating them to students. Specify
                the hall, room number, block, type, and capacity.
              </Alert>

              {rooms.length > 0 && (
                <Card withBorder>
                  <Title order={4} mb="md">
                    Created Rooms ({rooms.length})
                  </Title>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Hall</Table.Th>
                        <Table.Th>Room Number</Table.Th>
                        <Table.Th>Block</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Capacity</Table.Th>
                        <Table.Th>Status</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {rooms.map((room) => (
                        <Table.Tr key={room.id}>
                          <Table.Td>{room.hall_name}</Table.Td>
                          <Table.Td>{room.room_number}</Table.Td>
                          <Table.Td>{room.block_number}</Table.Td>
                          <Table.Td>{room.room_type}</Table.Td>
                          <Table.Td>{room.capacity}</Table.Td>
                          <Table.Td>
                            <Badge>{room.status}</Badge>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>
        )}
        {/* CARETAKER: Individual Allocation */}
        {userRole === "caretaker" && (
          <Tabs.Panel value="1" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Allocate Rooms to Students</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setRoomAllocationOpen(true)}
                >
                  Allocate Room
                </Button>
              </Group>

              <Alert
                icon={<IconAlertCircle />}
                color="gray"
                title="Individual Allocation"
              >
                Allocate specific rooms to individual students. For allocating
                to multiple students from a batch, use Batch Allocation.
              </Alert>

              {allocations.length > 0 && (
                <Card withBorder>
                  <Title order={4} mb="md">
                    Room Allocations ({allocations.length})
                  </Title>
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Student</Table.Th>
                        <Table.Th>Room</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Allocation Date</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {allocations.map((allocation) => (
                        <Table.Tr key={allocation.id}>
                          <Table.Td>
                            {allocation.student_name || "N/A"}
                          </Table.Td>
                          <Table.Td>
                            {allocation.room?.room_number || "N/A"}
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={allocation.is_active ? "green" : "gray"}
                            >
                              {allocation.is_active ? "active" : "inactive"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {allocation.allotted_at
                              ? new Date(
                                  allocation.allotted_at,
                                ).toLocaleDateString()
                              : "-"}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>
        )}
        {/* STAFF: Room Changes */}
        {(userRole === "caretaker" || userRole === "warden") && (
          <Tabs.Panel value="2" pt="md">
            <Stack>
              <Title order={3}>Room Change Requests</Title>
              <Alert
                icon={<IconAlertCircle />}
                color="gray"
                title="Manage Room Changes"
              >
                Review and approve/reject student room change requests. Each
                change must be reviewed and approved before updating
                allocations.
              </Alert>

              {roomChanges.length > 0 ? (
                <Card withBorder>
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
                                <Tooltip
                                  label={
                                    change.status === "requested"
                                      ? "Approve (Warden Step)"
                                      : "Approve (Caretaker Step)"
                                  }
                                >
                                  <ActionIcon
                                    color="green"
                                    variant="light"
                                    onClick={() =>
                                      handleApproveChange(change.id)
                                    }
                                    loading={submitting}
                                  >
                                    <IconCheck size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Reject">
                                  <ActionIcon
                                    color="red"
                                    variant="light"
                                    onClick={() =>
                                      handleRejectChange(change.id)
                                    }
                                    loading={submitting}
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </Group>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Card>
              ) : (
                <Alert icon={<IconAlertCircle />} color="yellow">
                  No room change requests pending.
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>
        )}
        {/* STUDENT: Room Change Request */}
        {userRole === "student" && (
          <Tabs.Panel value="0" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Request Room Change</Title>
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setChangeModalOpen(true)}
                >
                  Submit Request
                </Button>
              </Group>

              <Alert
                icon={<IconAlertCircle />}
                color="gray"
                title="Room Change Request"
              >
                Submit a room change request if you wish to move to a different
                room. Your request must be approved by the caretaker before the
                change takes effect.
              </Alert>

              {roomChanges.length > 0 ? (
                <Card withBorder>
                  <Title order={4} mb="md">
                    Your Room Change Requests
                  </Title>
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
                </Card>
              ) : (
                <Alert icon={<IconAlertCircle />} color="yellow">
                  You have not submitted any room change requests yet.
                </Alert>
              )}
            </Stack>
          </Tabs.Panel>
        )}{" "}
        {/* View Allocations Tab - For All Roles */}
        <Tabs.Panel
          value={
            userRole === "super_admin"
              ? "1"
              : userRole === "caretaker"
                ? "3"
                : userRole === "warden"
                  ? "1"
                  : "1"
          }
          pt="md"
        >
          <Stack>
            <Title order={3}>All Room Allocations</Title>{" "}
            {allocations.length > 0 ? (
              <Card withBorder p="lg">
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <Table
                    striped
                    highlightOnHover
                    style={{ width: "100%", minWidth: "900px" }}
                  >
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Student</Table.Th>
                        <Table.Th>Hall</Table.Th>
                        <Table.Th>Room</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Allocation Date</Table.Th>
                        <Table.Th>Release Date</Table.Th>
                        {userRole === "super_admin" && (
                          <Table.Th>Actions</Table.Th>
                        )}
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {allocations.map((allocation) => (
                        <Table.Tr key={allocation.id}>
                          <Table.Td>
                            {allocation.student_name || "N/A"}
                          </Table.Td>
                          <Table.Td>{allocation.hostel_name || "N/A"}</Table.Td>
                          <Table.Td>
                            {allocation.room?.room_number || "N/A"}
                          </Table.Td>
                          <Table.Td>
                            <Badge
                              color={allocation.is_active ? "green" : "gray"}
                            >
                              {allocation.is_active ? "active" : "inactive"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            {allocation.allotted_at
                              ? new Date(
                                  allocation.allotted_at,
                                ).toLocaleDateString()
                              : "-"}
                          </Table.Td>
                          <Table.Td>{allocation.vacated_at || "-"}</Table.Td>
                          {userRole === "super_admin" && (
                            <Table.Td>
                              <Tooltip label="Remove allocation">
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteAllocation(allocation.id)
                                  }
                                >
                                  <IconX size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Table.Td>
                          )}
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </div>
              </Card>
            ) : (
              <Alert icon={<IconAlertCircle />} color="yellow">
                No room allocations yet. Start by creating rooms and then
                allocating them to students.
              </Alert>
            )}
            {allocations.length > 0 && (
              <Group justify="space-around" align="center" mt="md">
                <Text size="sm" c="dimmed">
                  Total: {paginationData.count} allocations (
                  {allocations.length} on current page)
                </Text>
                <Group gap="xs">
                  <Pagination
                    value={currentPage}
                    onChange={setCurrentPage}
                    total={Math.ceil(paginationData.count / pageSize) || 1}
                    size="sm"
                  />
                  <Select
                    placeholder="50"
                    data={["25", "50", "100", "250", "500"]}
                    value={pageSize.toString()}
                    onChange={(val) => {
                      setPageSize(parseInt(val || "50", 10));
                      setCurrentPage(1);
                    }}
                    searchable={false}
                    clearable={false}
                    w={80}
                    size="sm"
                  />
                </Group>
              </Group>
            )}
          </Stack>
        </Tabs.Panel>
        {/* STUDENT: Room Vacation */}
        {userRole === "student" && (
          <Tabs.Panel value="2" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Room Vacation</Title>
                <Button onClick={() => setVacationModalOpen(true)}>
                  Request Room Vacation
                </Button>
              </Group>
              <Card withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {vacations.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td>{v.vacation_date}</Table.Td>
                        <Table.Td>
                          <Badge>{v.status}</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          </Tabs.Panel>
        )}
        {/* STUDENT: Extended Stay */}
        {userRole === "student" && (
          <Tabs.Panel value="3" pt="md">
            <Stack>
              <Group justify="space-between">
                <Title order={3}>Extended Stays</Title>
                <Button onClick={() => setExtendedStayModalOpen(true)}>
                  Request Extended Stay
                </Button>
              </Group>
              <Card withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Start</Table.Th>
                      <Table.Th>End</Table.Th>
                      <Table.Th>Status</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {extendedStays.map((s) => (
                      <Table.Tr key={s.id}>
                        <Table.Td>{s.start_date}</Table.Td>
                        <Table.Td>{s.end_date}</Table.Td>
                        <Table.Td>
                          <Badge>{s.status}</Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          </Tabs.Panel>
        )}
        {/* STAFF: Room Vacations */}
        {(userRole === "caretaker" || userRole === "warden") && (
          <Tabs.Panel value="4" pt="md">
            <Stack>
              <Title order={3}>Room Vacations Verification</Title>
              <Card withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Room</Table.Th>
                      <Table.Th>Date</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {vacations.map((v) => (
                      <Table.Tr key={v.id}>
                        <Table.Td>{v.student_name}</Table.Td>
                        <Table.Td>{v.room_number}</Table.Td>
                        <Table.Td>{v.vacation_date}</Table.Td>
                        <Table.Td>
                          <Badge>{v.status}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {v.status === "pending" && (
                              <Button
                                size="xs"
                                onClick={() => handleVerifyVacation(v.id)}
                              >
                                Verify
                              </Button>
                            )}
                            {v.status === "verified" &&
                              (userRole === "caretaker" ||
                                userRole === "warden") && (
                                <Button
                                  size="xs"
                                  color="green"
                                  onClick={() => handleApproveVacation(v.id)}
                                >
                                  Approve
                                </Button>
                              )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          </Tabs.Panel>
        )}
        {/* STAFF: Extended Stays */}
        {(userRole === "caretaker" || userRole === "warden") && (
          <Tabs.Panel value="5" pt="md">
            <Stack>
              <Title order={3}>Extended Stays Approval</Title>
              <Card withBorder>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Student</Table.Th>
                      <Table.Th>Room</Table.Th>
                      <Table.Th>Range</Table.Th>
                      <Table.Th>Reason</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {extendedStays.map((s) => (
                      <Table.Tr key={s.id}>
                        <Table.Td>{s.student_name}</Table.Td>
                        <Table.Td>{s.room_number}</Table.Td>
                        <Table.Td>
                          {s.start_date} - {s.end_date}
                        </Table.Td>
                        <Table.Td>{s.reason}</Table.Td>
                        <Table.Td>
                          <Badge>{s.status}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {s.status === "submitted" && (
                              <>
                                <Button
                                  size="xs"
                                  color="green"
                                  onClick={() =>
                                    handleApproveExtendedStay(s.id)
                                  }
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  color="red"
                                  onClick={() => handleRejectExtendedStay(s.id)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Card>
            </Stack>
          </Tabs.Panel>
        )}
      </Tabs>
      {/* Modals */}
      {userRole === "caretaker" && (
        <>
          <RoomCreationForm
            opened={roomCreationOpen}
            onClose={() => setRoomCreationOpen(false)}
            onSubmit={handleCreateRoom}
            loading={submitting}
            halls={halls}
          />
          <RoomAllocationForm
            opened={roomAllocationOpen}
            onClose={() => setRoomAllocationOpen(false)}
            onSubmit={handleAllocateRoom}
            loading={submitting}
            students={students}
            rooms={rooms}
          />
        </>
      )}
      {userRole === "super_admin" && (
        <BatchAllocationForm
          opened={batchAllocationOpen}
          onClose={() => setBatchAllocationOpen(false)}
          onSubmit={handleBatchAllocation}
          loading={submitting}
          batches={batches}
          halls={halls}
        />
      )}{" "}
      {userRole === "student" && (
        <>
          <RoomChangeRequestForm
            opened={changeModalOpen}
            onClose={() => setChangeModalOpen(false)}
            onSubmit={handleRequestRoomChange}
            loading={submitting}
            halls={halls}
            availableRooms={availableRooms}
          />

          {/* Simple Modals for Vacations and Extended Stays */}
          {vacationModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Card style={{ width: 400 }}>
                <Title order={4} mb="md">
                  Request Room Vacation
                </Title>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    // const room = allocations.find(a => a.student_name); // simplistic
                    handleRequestVacation({
                      vacation_date: e.target.date.value,
                      hall: allocations[0]?.hall_id || 1,
                      room: allocations[0]?.room || 1,
                    });
                  }}
                >
                  <input
                    type="date"
                    name="date"
                    required
                    style={{ width: "100%", marginBottom: 15, padding: 8 }}
                  />
                  <Group justify="flex-end">
                    <Button
                      variant="default"
                      onClick={() => setVacationModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Submit
                    </Button>
                  </Group>
                </form>
              </Card>
            </div>
          )}

          {extendedStayModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Card style={{ width: 400 }}>
                <Title order={4} mb="md">
                  Request Extended Stay
                </Title>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRequestExtendedStay({
                      start_date: e.target.start.value,
                      end_date: e.target.end.value,
                      reason: e.target.reason.value,
                      hall: allocations[0]?.hall_id || 1,
                      room: allocations[0]?.room || 1,
                    });
                  }}
                >
                  <input
                    type="date"
                    name="start"
                    required
                    style={{ width: "100%", marginBottom: 15, padding: 8 }}
                  />
                  <input
                    type="date"
                    name="end"
                    required
                    style={{ width: "100%", marginBottom: 15, padding: 8 }}
                  />
                  <textarea
                    name="reason"
                    placeholder="Reason"
                    required
                    style={{
                      width: "100%",
                      marginBottom: 15,
                      padding: 8,
                      height: 100,
                    }}
                  />
                  <Group justify="flex-end">
                    <Button
                      variant="default"
                      onClick={() => setExtendedStayModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Submit
                    </Button>
                  </Group>
                </form>
              </Card>
            </div>
          )}
        </>
      )}
    </Stack>
  );
}
