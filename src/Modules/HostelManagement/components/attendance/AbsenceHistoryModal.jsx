/**
 * AbsenceHistoryModal Component
 * Displays specific dates of absence for a student
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Modal,
  Stack,
  Text,
  Badge,
  ScrollArea,
  List,
  Group,
  ThemeIcon,
  Loader,
} from "@mantine/core";
import { IconCalendarEvent, IconMoodHappy } from "@tabler/icons-react";

export default function AbsenceHistoryModal({
  opened,
  onClose,
  student,
  loading,
}) {
  if (!student && !loading) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Absence History: ${student?.name || "Loading..."}`}
      size="sm"
    >
      <Stack>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader size="md" />
            <Text size="sm">Fetching absence history...</Text>
          </Group>
        ) : (
          <>
            <Group justify="space-between">
              <Text size="sm">
                Roll Number: <b>{student?.roll_number}</b>
              </Text>
              <Badge color="red" variant="filled">
                {student?.absent_count ?? 0} Absences
              </Badge>
            </Group>

            <Text size="sm" fw={500} mt="sm">
              Dates of Absence:
            </Text>

            <ScrollArea h={300} offsetScrollbars>
              {student?.absence_dates && student.absence_dates.length > 0 ? (
                <List
                  spacing="xs"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="red" size={24} radius="xl">
                      <IconCalendarEvent size={16} />
                    </ThemeIcon>
                  }
                >
                  {student.absence_dates.map((date, index) => {
                    const d = new Date(date);
                    const formattedDate = Number.isNaN(d.getTime())
                      ? date
                      : d.toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        });
                    return <List.Item key={index}>{formattedDate}</List.Item>;
                  })}
                </List>
              ) : (
                <Group justify="center" p="xl" style={{ textAlign: "center" }}>
                  <IconMoodHappy size={32} color="gray" opacity={0.5} />
                  <Text c="dimmed" size="sm">
                    No absence records found. <br /> Excellent attendance!
                  </Text>
                </Group>
              )}
            </ScrollArea>
          </>
        )}
      </Stack>
    </Modal>
  );
}

AbsenceHistoryModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  student: PropTypes.shape({
    name: PropTypes.string,
    roll_number: PropTypes.string,
    absent_count: PropTypes.number,
    absence_dates: PropTypes.arrayOf(PropTypes.string),
  }),
};
