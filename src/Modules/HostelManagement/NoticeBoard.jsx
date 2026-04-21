/**
 * NoticeBoard - Unified Management & View Port
 * HM-WF-110: Robust Notice Lifecycle implementation.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Title,
  Button,
  Group,
  Stack,
  Tabs,
  Badge,
  Modal,
  Text,
  SimpleGrid,
  Loader,
  Center,
  ScrollArea,
  Divider,
  Container,
} from "@mantine/core";
import {
  IconPlus,
  IconHistory,
  IconLayoutGrid,
  IconTable,
  IconCalendarEvent,
  IconUser,
  IconDownload,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import NoticeCard from "./components/notices/NoticeCard";
import NoticesTable from "./components/notices/NoticesTable";
import CreateNoticeModal from "./components/notices/CreateNoticeModal";
import {
  fetchNotices,
  fetchNoticeHistory,
  createNotice,
  deleteNotice,
  fetchNoticeDetail,
  fetchHostels,
} from "./api";

// Helper Component for Consistent Empty States
function BoardEmptyState({ title, description, icon: Icon }) {
  const PlaceholderIcon = Icon || IconLayoutGrid;
  return (
    <Center py={100} px="md">
      <Stack align="center" gap="md">
        <div
          style={{
            padding: "20px",
            color: "var(--mantine-color-gray-5)",
          }}
        >
          <PlaceholderIcon size={48} stroke={1.5} />
        </div>
        <Stack align="center" gap={4}>
          <Text fw={700} size="xl" ta="center">
            {title}
          </Text>
          <Text c="dimmed" size="sm" maw={320} ta="center" lh={1.5}>
            {description}
          </Text>
        </Stack>
      </Stack>
    </Center>
  );
}

BoardEmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
};

export default function NoticeBoard({ onlyGlobal = false }) {
  const [notices, setNotices] = useState([]);
  const [history, setHistory] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  // Specific Detail Modal State
  const [detailNotice, setDetailNotice] = useState(null);

  // Creation Modal State
  const [createOpened, setCreateOpened] = useState(false);

  const userRole = useSelector((state) => state.user.role);
  const isSuperAdmin = userRole === "super_admin";
  const isStaff =
    isSuperAdmin || userRole === "caretaker" || userRole === "warden";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [activeData, historyData, hostelsData] = await Promise.all([
        fetchNotices(),
        fetchNoticeHistory(),
        isStaff ? fetchHostels() : Promise.resolve([]),
      ]);

      let active = activeData?.results || activeData || [];
      let hist = historyData?.results || historyData || [];

      if (onlyGlobal) {
        // Global notices have no associated hostel/hall
        active = active.filter((n) => !n.hostel && !n.hostel_name);
        hist = hist.filter((n) => !n.hostel && !n.hostel_name);
      }

      setNotices(active);
      setHistory(hist);
      setHostels(hostelsData || []);
    } catch (err) {
      notifications.show({
        title: "Load Error",
        message: "Could not sync notice board data.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenDetail = async (notice) => {
    try {
      setDetailNotice(notice);
      // Fetching detail triggers "mark as read" logic on backend for students
      const fullNotice = await fetchNoticeDetail(notice.id);
      setDetailNotice(fullNotice);

      // Update local state to remove unread indicator immediately
      setNotices((prev) =>
        prev.map((n) => (n.id === notice.id ? { ...n, is_read: true } : n)),
      );
    } catch (err) {
      console.error("Failed to mark check read status");
    }
  };

  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await createNotice(formData);
      notifications.show({
        title: "Published",
        message: "The new notice is now live.",
        color: "green",
      });
      setCreateOpened(false);
      loadData();
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Check validation rules.";

      if (typeof errorData === "string") {
        errorMessage = errorData.slice(0, 150);
      } else if (typeof errorData === "object" && errorData !== null) {
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.error) errorMessage = errorData.error;
        else if (errorData.non_field_errors)
          errorMessage = errorData.non_field_errors.join(", ");
        else {
          // Combine field-specific errors
          errorMessage = Object.entries(errorData)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
            )
            .join(" | ");
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      notifications.show({
        title: "Broadcast Failed",
        message: errorMessage,
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (notice) => {
    if (window.confirm(`Permanently delete notice: ${notice.title}?`)) {
      try {
        await deleteNotice(notice.id);
        notifications.show({
          title: "Deleted",
          message: "Notice removed from board.",
          color: "gray",
        });
        loadData();
      } catch (err) {
        notifications.show({
          title: "Error",
          message: "Could not remove notice.",
          color: "red",
        });
      }
    }
  };

  if (loading && !notices.length) {
    return (
      <Container size={1200}>
        <Center style={{ height: "60vh" }}>
          <Loader size="lg" variant="dots" />
        </Center>
      </Container>
    );
  }

  return (
    <Container size={1200} p={0}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-end">
          <Stack gap={0}>
            <Title order={1} fw={800} style={{ letterSpacing: "-1px" }}>
              {onlyGlobal ? "Global Announcements" : "Hostel Notice Board"}
            </Title>
            <Text c="dimmed" size="sm">
              {onlyGlobal
                ? "University-wide updates and administrative notices"
                : "Official updates and announcements for residents"}
            </Text>
          </Stack>

          {isStaff && (
            <Button
              size="md"
              leftSection={<IconPlus size={20} />}
              onClick={() => setCreateOpened(true)}
              variant="filled"
              color="blue"
              radius="md"
            >
              Compose Notice
            </Button>
          )}
        </Group>

        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          style={{ minHeight: "600px" }}
        >
          <Tabs.List>
            <Tabs.Tab value="active" leftSection={<IconLayoutGrid size={18} />}>
              Active Board
            </Tabs.Tab>
            <Tabs.Tab value="history" leftSection={<IconHistory size={18} />}>
              History
            </Tabs.Tab>
            {isStaff && (
              <Tabs.Tab value="manage" leftSection={<IconTable size={18} />}>
                Management View
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="active" pt="xl">
            {notices.length === 0 ? (
              <BoardEmptyState
                icon={IconLayoutGrid}
                title="All Clear for Today"
                description="There are no active notices at the moment. New announcements will appear here as they are published."
              />
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {notices.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onView={() => handleOpenDetail(notice)}
                    onDelete={() => handleDelete(notice)}
                    canDelete={isStaff}
                    showActions
                  />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="xl">
            {history.length === 0 ? (
              <BoardEmptyState
                icon={IconHistory}
                title="Clean Slate"
                description="Your notice history is currently empty. Expired or archived notices will be automatically moved here."
              />
            ) : (
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {history.map((notice) => (
                  <NoticeCard
                    key={notice.id}
                    notice={notice}
                    onView={() => handleOpenDetail(notice)}
                    showActions
                  />
                ))}
              </SimpleGrid>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="manage" pt="xl">
            <NoticesTable
              notices={[...notices, ...history]}
              loading={loading}
              onView={(row) => handleOpenDetail(row)}
              onDelete={handleDelete}
              canDelete
            />
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <CreateNoticeModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        onSubmit={handleCreateSubmit}
        loading={submitting}
        hostels={hostels}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Notice Detail Modal */}
      <Modal
        opened={!!detailNotice}
        onClose={() => setDetailNotice(null)}
        title={`${detailNotice?.priority} Announcement`}
        size="lg"
        radius="md"
        centered
      >
        {detailNotice && (
          <ScrollArea.Autosize mah="70vh">
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={2}>{detailNotice.title}</Title>
                <Badge
                  color={
                    detailNotice.priority === "Urgent"
                      ? "red"
                      : detailNotice.priority === "Important"
                        ? "orange"
                        : "gray"
                  }
                  size="lg"
                >
                  {detailNotice.priority}
                </Badge>
              </Group>

              <Group gap="xl">
                <Group gap="xs">
                  <IconUser size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    {detailNotice.created_by_name}
                  </Text>
                </Group>
                <Group gap="xs">
                  <IconCalendarEvent size={16} color="gray" />
                  <Text size="sm" c="dimmed">
                    Starts:{" "}
                    {new Date(detailNotice.start_date).toLocaleDateString()}
                  </Text>
                </Group>
              </Group>

              <Divider />

              <Text style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                {detailNotice.description}
              </Text>

              {detailNotice.attachment && (
                <Stack gap={5} mt="lg">
                  <Text fw={600} size="sm">
                    Attachment:
                  </Text>
                  <Button
                    component="a"
                    href={detailNotice.attachment}
                    target="_blank"
                    download
                    leftSection={<IconDownload size={18} />}
                    variant="light"
                    fullWidth
                  >
                    Download Attachment
                  </Button>
                </Stack>
              )}

              <Group justify="flex-end" mt="xl">
                <Button variant="light" onClick={() => setDetailNotice(null)}>
                  Close
                </Button>
              </Group>
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Modal>
    </Container>
  );
}

NoticeBoard.propTypes = {
  onlyGlobal: PropTypes.bool,
};
