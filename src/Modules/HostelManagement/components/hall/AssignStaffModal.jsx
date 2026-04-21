/**
 * AssignStaffModal — Modal dialog for assigning Warden or Caretaker to a hostel
 *
 * Features:
 * - Searchable user dropdown (fetches faculty/staff from existing endpoints)
 * - Role pre-filled from parent component
 * - Start/End date pickers
 * - Warning toast for concurrent active assignments
 */

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Select,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Loader,
  Center,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import {
  IconUserPlus,
  IconAlertCircle,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { fetchFacultyList, fetchStaffList } from "../../api";

export default function AssignStaffModal({
  opened,
  onClose,
  onSubmit,
  hostelName,
  role,
  loading,
}) {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(null);
  const [error, setError] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);

  const loadUsers = async () => {
    setFetchingUsers(true);
    try {
      let data;
      if (role === "Warden") {
        data = await fetchFacultyList();
      } else {
        data = await fetchStaffList();
      }

      // Normalize to [{value, label}] for Select
      const options = (Array.isArray(data) ? data : data?.results || []).map(
        (u) => ({
          value: String(u.id || u.user_id || u.pk),
          label:
            u.full_name ||
            u.name ||
            u.username ||
            `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
            `User #${u.id}`,
        }),
      );
      setUsers(options);
    } catch (err) {
      console.error("Failed to fetch users for assignment:", err);
      setUsers([]);
    } finally {
      setFetchingUsers(false);
    }
  };
  useEffect(() => {
    if (opened) {
      loadUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, role]);

  const handleSubmit = () => {
    setError("");

    if (!selectedUserId) {
      setError("Please select a user to assign.");
      return;
    }
    if (!startDate) {
      setError("Start date is required.");
      return;
    }

    const formatDate = (d) => {
      if (!d) return null;
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const data = {
      user_id: parseInt(selectedUserId, 10),
      start_date: formatDate(startDate),
      end_date: endDate ? formatDate(endDate) : null,
    };

    onSubmit(data);
  };

  const handleClose = () => {
    setSelectedUserId(null);
    setStartDate(new Date());
    setEndDate(null);
    setError("");
    onClose();
  };

  const roleLabel = role === "Warden" ? "Warden" : "Caretaker";
  const roleColor = role === "Warden" ? "violet" : "indigo";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconUserPlus
            size={22}
            color={`var(--mantine-color-${roleColor}-6)`}
          />
          <Text fw={600} size="lg">
            Assign {roleLabel}
          </Text>
        </Group>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        {hostelName && (
          <Alert
            color={roleColor}
            variant="light"
            icon={<IconAlertTriangle size={16} />}
          >
            Assigning a new {roleLabel.toLowerCase()} to{" "}
            <Text span fw={600}>
              {hostelName}
            </Text>
            . Any existing active {roleLabel.toLowerCase()} will be deactivated.
          </Alert>
        )}

        {error && (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        )}

        {fetchingUsers ? (
          <Center p="xl">
            <Loader size="sm" />
            <Text ml="sm" size="sm" c="dimmed">
              Loading {role === "Warden" ? "faculty" : "staff"} list...
            </Text>
          </Center>
        ) : (
          <Select
            id="assign-staff-user-select"
            label={`Select ${roleLabel}`}
            placeholder={`Search ${role === "Warden" ? "faculty" : "staff"}...`}
            data={users}
            value={selectedUserId}
            onChange={setSelectedUserId}
            searchable
            clearable
            nothingFoundMessage="No users found"
            required
          />
        )}

        <Group grow>
          <DateInput
            id="assign-staff-start-date"
            label="Start Date"
            value={startDate}
            onChange={setStartDate}
            required
          />
          <DateInput
            id="assign-staff-end-date"
            label="End Date (optional)"
            value={endDate}
            onChange={setEndDate}
            clearable
            placeholder="No end date"
          />
        </Group>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            id="assign-staff-submit-btn"
            onClick={handleSubmit}
            loading={loading}
            color={roleColor}
          >
            Assign {roleLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

AssignStaffModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  hostelName: PropTypes.string,
  role: PropTypes.string.isRequired,
  loading: PropTypes.bool,
};
