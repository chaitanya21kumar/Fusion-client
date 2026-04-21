import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  Group,
  Text,
  Paper,
  Stack,
  Select,
  Pagination,
  Center,
  Loader,
  Badge,
  TextInput,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconSearch, IconFilter, IconTrash, IconX } from "@tabler/icons-react";
import {
  fetchRoomAllocations,
  fetchHalls,
  deleteRoomAllocation,
} from "../../api";

function AllotmentListView({ isSuperAdmin }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ results: [], count: 0 });
  const [page, setPage] = useState(1);
  const [halls, setHalls] = useState([]);
  const [selectedHall, setSelectedHall] = useState(null);
  const [search, setSearch] = useState("");

  const loadHalls = async () => {
    try {
      const hallData = await fetchHalls();
      setHalls(
        hallData.map((h) => ({
          value: h.hall_id,
          label: h.hall_name || h.hall_id || "Unspecified Hall",
        })),
      );
    } catch (error) {
      console.error("Failed to load halls", error);
    }
  };

  useEffect(() => {
    loadHalls();
  }, []);
  const loadAllotments = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        hall: selectedHall || undefined,
      };
      const result = await fetchRoomAllocations(params);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch allotments", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllotments();
  }, [page, selectedHall]);

  const handleDelete = (id, studentName) => {
    modals.openConfirmModal({
      title: "Delete Room Allocation",
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to permanently remove the allocation for{" "}
          <b>{studentName}</b>? This will free up the room space and cannot be
          undone.
        </Text>
      ),
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteRoomAllocation(id);
          notifications.show({
            title: "Success",
            message: "Allocation removed successfully",
            color: "green",
            icon: <IconTrash size={16} />,
          });
          loadAllotments();
        } catch (error) {
          const detail = error.response?.data?.detail;
          const errorMessage = Array.isArray(detail)
            ? detail[0]
            : typeof detail === "object"
              ? JSON.stringify(detail)
              : detail;

          notifications.show({
            title: "Action Failed",
            message:
              errorMessage ||
              error.message ||
              "An unexpected error occurred during deletion",
            color: "red",
            icon: <IconX size={16} />,
          });
        }
      },
    });
  };

  const filteredResults = data.results.filter((item) => {
    const name = (item.student_name || "").toLowerCase();
    const id = (item.student_id || "").toLowerCase();
    const query = search.toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  return (
    <Stack gap="md">
      <Paper p="md" radius="md" withBorder>
        <Group grow align="flex-end">
          <TextInput
            label="Search Student"
            placeholder="Name or Username..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
          />
          {isSuperAdmin && (
            <Select
              label="Filter by Hall"
              placeholder="All Halls"
              data={halls}
              value={selectedHall}
              onChange={setSelectedHall}
              clearable
              leftSection={<IconFilter size={16} />}
            />
          )}
        </Group>
      </Paper>

      <Paper radius="md" withBorder style={{ overflow: "hidden" }}>
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Student Name</Table.Th>
              <Table.Th>Hostel</Table.Th>
              <Table.Th>Room</Table.Th>
              <Table.Th>Status</Table.Th>
              {isSuperAdmin && <Table.Th>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center py="xl">
                    <Loader size="sm" />
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : filteredResults.length > 0 ? (
              filteredResults.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text fw={500}>{item.student_id}</Text>
                  </Table.Td>
                  <Table.Td>{item.student_name}</Table.Td>
                  <Table.Td>{item.hostel_name}</Table.Td>
                  <Table.Td>
                    {item.room
                      ? `${item.room.block_number}-${item.room.room_number}`
                      : "N/A"}
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={item.is_active ? "green" : "red"}
                      variant="light"
                    >
                      {item.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </Table.Td>
                  {isSuperAdmin && (
                    <Table.Td>
                      <Tooltip
                        label="Delete Allocation"
                        position="left"
                        withArrow
                      >
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() =>
                            handleDelete(item.id, item.student_name)
                          }
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Center py="xl">
                    <Text c="dimmed">No allocations found</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {data.count > 50 && (
        <Center mt="md">
          <Pagination
            total={Math.ceil(data.count / 50)}
            value={page}
            onChange={setPage}
            radius="md"
          />
        </Center>
      )}
    </Stack>
  );
}

AllotmentListView.propTypes = {
  isSuperAdmin: PropTypes.bool.isRequired,
};

export default AllotmentListView;
