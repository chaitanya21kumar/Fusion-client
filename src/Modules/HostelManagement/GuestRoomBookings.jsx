/**
 * GuestRoomBookings - Thin View
 * Manages guest room bookings lifecycle, registry, and policies.
 * Orchestrates components and handles state, calls api.js
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
  Container,
  Text,
  Center,
  Select,
} from "@mantine/core";
import {
  IconPlus,
  IconAlertCircle,
  IconBuildingCommunity,
  IconSettings,
  IconHistory,
  IconClock,
  IconCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";

// Components
import GuestBookingCard from "./components/GuestBookingCard";
import GuestRoomBookingForm from "./components/GuestRoomBookingForm";
import ApproveGuestBookingModal from "./components/ApproveGuestBookingModal";
import GuestCheckInModal from "./components/GuestCheckInModal";
import GuestCheckOutModal from "./components/GuestCheckOutModal";
import GuestRoomRegistryPanel from "./components/GuestRoomRegistryPanel";
import GuestRoomPolicyPanel from "./components/GuestRoomPolicyPanel";

// API
import {
  fetchGuestBookings,
  requestGuestBooking,
  fetchHalls,
  fetchMyAllotment,
} from "./api";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

const MAX_WIDTH = 1200;

export default function GuestRoomBookings() {
  const [bookings, setBookings] = useState([]);
  const [, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");

  // Modal States
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [currentHallId, setCurrentHallId] = useState(null);

  const userRole = useSelector((state) => state.user.role);
  // User selector

  const isCaretaker = userRole === "caretaker";
  const isWarden = userRole === "warden";
  const isStaff = isCaretaker || isWarden;
  const isStudent = userRole === "student";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingsData = await fetchGuestBookings();
      setBookings(bookingsData);
    } catch (err) {
      setError("Failed to load bookings history.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch hall assignment or list based on role
  useEffect(() => {
    const fetchRelevantHalls = async () => {
      try {
        if (isStudent) {
          const allotment = await fetchMyAllotment();
          if (allotment && (allotment.hostel_id || allotment.hostel)) {
            setCurrentHallId(allotment.hostel_id || allotment.hostel);
          }
        } else if (isStaff) {
          const hallsData = await fetchHalls();
          const list = Array.isArray(hallsData)
            ? hallsData
            : hallsData?.results || [];
          setHostels(list);
          if (list.length > 0) {
            // Default to first hall if none selected
            setCurrentHallId(list[0].hall_id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch hall info:", err);
      }
    };
    fetchRelevantHalls();
  }, [isStudent, isStaff]);

  const handleSubmitRequest = async (payload) => {
    try {
      setSubmitting(true);
      await requestGuestBooking(payload);
      notifications.show({
        title: "Request Submitted",
        message: "Your guest room booking request has been sent for approval.",
        color: "green",
      });
      setBookingFormOpen(false);
      loadData();
      return true;
    } catch (err) {
      notifications.show({
        title: "Error",
        message: err.response?.data?.detail || "Failed to submit request",
        color: "red",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  const openCheckInModal = (booking) => {
    setSelectedBooking(booking);
    setCheckInModalOpen(true);
  };

  const openCheckOutModal = (booking) => {
    setSelectedBooking(booking);
    setCheckOutModalOpen(true);
  };

  const renderEmptyState = (msg) => (
    <Card withBorder py={60} radius="md" style={{ borderStyle: "dashed" }}>
      <Center>
        <Stack align="center" gap="xs">
          <IconHistory size={48} color="var(--mantine-color-gray-4)" />
          <Text color="dimmed" fw={500}>
            {msg}
          </Text>
        </Stack>
      </Center>
    </Card>
  );

  const filterBookings = (status) => {
    const statusMap = {
      pending: "Pending",
      approved: "Approved",
      checked_in: "CheckedIn",
    };
    return bookings.filter(
      (b) => b.status === statusMap[status] || b.status === status,
    );
  };

  return (
    <Container size={MAX_WIDTH} p={0} style={{ width: "100%" }}>
      <Stack gap="xl">
        <Group justify="space-between" align="center">
          <Stack gap={0}>
            <Title order={2}>Guest Room Management</Title>
            <Group gap="xs">
              <Text size="sm" color="dimmed">
                {isStaff
                  ? "Managing bookings and policies for"
                  : "Request and track your guest room bookings"}
              </Text>
              {isStaff && currentHallId && (
                <Badge variant="outline" color="blue">
                  {hostels.find((h) => h.hall_id === currentHallId)?.name ||
                    `Hall ${currentHallId}`}
                </Badge>
              )}
            </Group>
          </Stack>

          <Group gap="md">
            {isStaff && hostels.length > 1 && (
              <Select
                placeholder="Select Hall"
                data={hostels.map((h) => ({ value: h.hall_id, label: h.name }))}
                value={currentHallId}
                onChange={setCurrentHallId}
                size="sm"
                style={{ width: 200 }}
              />
            )}
            {isStudent && (
              <Button
                leftSection={<IconPlus size={18} />}
                onClick={() => setBookingFormOpen(true)}
                size="md"
              >
                Book Guest Room
              </Button>
            )}
          </Group>
        </Group>

        {error && (
          <Alert icon={<IconAlertCircle />} color="red" title="Error">
            {error}
          </Alert>
        )}

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="outline"
          radius="md"
        >
          <Tabs.List>
            <Tabs.Tab
              value="pending"
              leftSection={<IconClock size={16} />}
              rightSection={
                <Badge size="xs" variant="light">
                  {filterBookings("pending").length}
                </Badge>
              }
            >
              Pending
            </Tabs.Tab>
            <Tabs.Tab
              value="approved"
              leftSection={<IconCheck size={16} />}
              rightSection={
                <Badge size="xs" variant="light">
                  {filterBookings("approved").length}
                </Badge>
              }
            >
              Approved
            </Tabs.Tab>
            <Tabs.Tab
              value="checked_in"
              leftSection={<IconUserCheck size={16} />}
              rightSection={
                <Badge size="xs" variant="light">
                  {filterBookings("checked_in").length}
                </Badge>
              }
            >
              Active
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={16} />}>
              History
            </Tabs.Tab>

            {isStaff && (
              <>
                <Tabs.Tab
                  value="registry"
                  leftSection={<IconBuildingCommunity size={16} />}
                >
                  Room Registry
                </Tabs.Tab>
                <Tabs.Tab
                  value="policy"
                  leftSection={<IconSettings size={16} />}
                >
                  Policies
                </Tabs.Tab>
              </>
            )}
          </Tabs.List>

          <Tabs.Panel value="pending" pt="xl">
            <Stack gap="md">
              {filterBookings("pending").length === 0
                ? renderEmptyState("No pending booking requests")
                : filterBookings("pending").map((b) => (
                    <GuestBookingCard
                      key={b.id}
                      booking={b}
                      canApprove={isStaff}
                      onApprove={() => openReviewModal(b)}
                    />
                  ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="approved" pt="xl">
            <Stack gap="md">
              {filterBookings("approved").length === 0
                ? renderEmptyState("No approved bookings awaiting arrival")
                : filterBookings("approved").map((b) => (
                    <GuestBookingCard
                      key={b.id}
                      booking={b}
                      canCheckIn={isStaff}
                      onCheckIn={() => openCheckInModal(b)}
                    />
                  ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="checked_in" pt="xl">
            <Stack gap="md">
              {filterBookings("checked_in").length === 0
                ? renderEmptyState("No guests currently checked in")
                : filterBookings("checked_in").map((b) => (
                    <GuestBookingCard
                      key={b.id}
                      booking={b}
                      canCheckOut={isStaff}
                      onCheckOut={() => openCheckOutModal(b)}
                    />
                  ))}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="xl">
            <Stack gap="md">
              {bookings.filter((b) =>
                ["Completed", "Rejected", "Cancelled"].includes(b.status),
              ).length === 0
                ? renderEmptyState("No previous booking history")
                : bookings
                    .filter((b) =>
                      ["Completed", "Rejected", "Cancelled"].includes(b.status),
                    )
                    .map((b) => (
                      <GuestBookingCard
                        key={b.id}
                        booking={b}
                        showActions={false}
                      />
                    ))}
            </Stack>
          </Tabs.Panel>

          {isStaff && (
            <>
              <Tabs.Panel value="registry" pt="xl">
                <GuestRoomRegistryPanel hallId={currentHallId} />
              </Tabs.Panel>
              <Tabs.Panel value="policy" pt="xl">
                <GuestRoomPolicyPanel hallId={currentHallId} />
              </Tabs.Panel>
            </>
          )}
        </Tabs>
      </Stack>

      <GuestRoomBookingForm
        opened={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSubmit={handleSubmitRequest}
        loading={submitting}
      />

      <ApproveGuestBookingModal
        opened={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        booking={selectedBooking}
        hallId={currentHallId}
        onApproveSuccess={loadData}
      />

      <GuestCheckInModal
        opened={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        booking={selectedBooking}
        onSuccess={loadData}
      />

      <GuestCheckOutModal
        opened={checkOutModalOpen}
        onClose={() => setCheckOutModalOpen(false)}
        booking={selectedBooking}
        onSuccess={loadData}
      />
    </Container>
  );
}
