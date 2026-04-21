/**
 * AttendanceManagement Component
 * Modernized attendance dashboard with role-based features
 * - Staff: Bulk upload, hostel-wide summary, absence tracking
 * - Students: Personal attendance stats and history
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Group,
  Alert,
  Select,
  Stack,
  Button,
  Text,
  Divider,
  Loader,
  SimpleGrid,
  Paper,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconUpload,
  IconFileAnalytics,
  IconHistory,
  IconCalendarCheck,
  IconCalendarX,
  IconCalendarUser,
} from "@tabler/icons-react";
import PropTypes from "prop-types";
import AttendanceSummaryTable from "./components/AttendanceSummaryTable";
import UploadAttendanceModal from "./components/UploadAttendanceModal";
import AbsenceHistoryModal from "./components/AbsenceHistoryModal";
import {
  fetchHalls,
  fetchAttendanceSummary,
  fetchStudentAttendanceStats,
} from "./api";

export default function AttendanceManagement({ userRole }) {
  const [summaryData, setSummaryData] = useState([]);
  const [activePage, setActivePage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(50); // Matches backend StandardPagination
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [uploadOpened, setUploadOpened] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Student specific state
  const [studentStats, setStudentStats] = useState(null);

  const isStaff =
    userRole === "warden" ||
    userRole === "caretaker" ||
    userRole === "super_admin";

  const loadHalls = useCallback(async () => {
    if (!isStaff) return;
    try {
      const hallsData = await fetchHalls();
      setHalls(hallsData);
      if (hallsData.length > 0 && !selectedHall) {
        setSelectedHall(String(hallsData[0].hall_id));
      }
    } catch (err) {
      console.error("Failed to load halls:", err);
    }
  }, [isStaff, selectedHall]);

  const loadSummary = useCallback(
    async (page = 1) => {
      if (!selectedHall) return;
      try {
        setLoading(true);
        const data = await fetchAttendanceSummary(selectedHall, page);
        setSummaryData(data.results || []);
        setTotalItems(data.count || 0);
        setActivePage(page);
      } catch (err) {
        setError("Failed to load attendance summary.");
      } finally {
        setLoading(false);
      }
    },
    [selectedHall],
  );

  const loadStudentStats = useCallback(async () => {
    if (isStaff) return;
    try {
      setLoading(true);
      const data = await fetchStudentAttendanceStats();
      setStudentStats(data);
    } catch (err) {
      setError("Failed to load your attendance records.");
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    if (isStaff) {
      loadHalls();
    } else {
      loadStudentStats();
    }
  }, [isStaff, loadHalls, loadStudentStats]);

  useEffect(() => {
    if (isStaff) {
      loadSummary(1);
    }
  }, [isStaff, selectedHall, loadSummary]);

  const handleViewAbsences = async (student) => {
    setSelectedStudent(student);
    setHistoryOpened(true);
    setHistoryLoading(true);
    try {
      const data = await fetchStudentAttendanceStats(student.id);
      setSelectedStudent({ ...student, absence_dates: data.absence_dates });
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (!isStaff) {
    return (
      <Stack gap="lg">
        <Title order={2}>My Attendance</Title>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader />
          </Group>
        ) : error ? (
          <Alert icon={<IconAlertCircle />} color="red">
            {error}
          </Alert>
        ) : (
          <>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <StatsCard
                title="Total Present"
                value={studentStats?.stats?.present_count}
                icon={IconCalendarCheck}
                color="green"
              />
              <StatsCard
                title="Total Absent"
                value={studentStats?.stats?.absent_count}
                icon={IconCalendarX}
                color="red"
              />
              <StatsCard
                title="On Leave"
                value={studentStats?.stats?.on_leave_count}
                icon={IconCalendarUser}
                color="blue"
              />
            </SimpleGrid>

            <Card withBorder radius="md" padding="xl">
              <Group mb="md">
                <IconHistory size={20} />
                <Title order={4}>Absence History</Title>
              </Group>
              <Divider mb="lg" />
              {studentStats?.absence_dates?.length > 0 ? (
                <Stack gap="xs">
                  {studentStats.absence_dates.map((date, i) => (
                    <Group
                      key={i}
                      justify="space-between"
                      p="xs"
                      style={{ borderBottom: "1px solid #eee" }}
                    >
                      <Text size="sm">
                        {new Date(date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                      <Badge color="red">Absent</Badge>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text c="dimmed" size="sm" ta="center" py="xl">
                  No absence records found. Keep it up!
                </Text>
              )}
            </Card>
          </>
        )}
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <Stack gap={0}>
          <Title order={2}>Attendance Dashboard</Title>
          <Text size="sm" c="dimmed">
            Track and manage student attendance records
          </Text>
        </Stack>
        <Group>
          {userRole === "caretaker" && (
            <Button
              leftSection={<IconUpload size={18} />}
              onClick={() => setUploadOpened(true)}
              variant="filled"
              color="blue"
            >
              Bulk Upload
            </Button>
          )}
        </Group>
      </Group>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={500} size="lg">
              Hostel Attendance Overview
            </Text>

            <Select
              placeholder="Select Hostel"
              data={halls.map((h) => ({
                value: String(h.hall_id),
                label: h.name,
              }))}
              value={selectedHall}
              onChange={setSelectedHall}
              style={{ width: 220 }}
              leftSection={<IconFileAnalytics size={16} />}
            />
          </Group>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red">
              {error}
            </Alert>
          )}

          <AttendanceSummaryTable
            data={summaryData}
            loading={loading}
            onViewAbsences={handleViewAbsences}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            activePage={activePage}
            onPageChange={(page) => loadSummary(page)}
          />
        </Stack>
      </Card>

      <UploadAttendanceModal
        opened={uploadOpened}
        onClose={() => setUploadOpened(false)}
        hallId={selectedHall}
        onUploadSuccess={() => {
          loadSummary();
        }}
      />

      <AbsenceHistoryModal
        opened={historyOpened}
        onClose={() => {
          setHistoryOpened(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        loading={historyLoading}
      />
    </Stack>
  );
}

AttendanceManagement.propTypes = {
  userRole: PropTypes.string.isRequired,
};

function StatsCard({ title, value, icon: Icon, color }) {
  return (
    <Paper withBorder radius="md" p="md">
      <Group justify="space-between">
        <Stack gap={0}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase">
            {title}
          </Text>
          <Text fw={700} size="xl">
            {value ?? 0}
          </Text>
        </Stack>
        <ThemeIcon color={color} variant="light" size={48} radius="md">
          <Icon size={30} />
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.elementType.isRequired,
  color: PropTypes.string.isRequired,
};
