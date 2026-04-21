import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Modal,
  FileInput,
  Button,
  Stack,
  Text,
  Group,
  Alert,
  List,
} from "@mantine/core";
import {
  IconUpload,
  IconInfoCircle,
  IconFileSpreadsheet,
} from "@tabler/icons-react";

export default function BulkUploadModal({
  opened,
  onClose,
  onUpload,
  loading,
}) {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (file) {
      onUpload(file);
      setFile(null);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Bulk Upload Inventory"
      size="lg"
    >
      <Stack>
        <Alert
          icon={<IconInfoCircle size={16} />}
          title="Excel Template Requirements"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            Your Excel file must contain these exact headers:
          </Text>
          <List size="sm" mt="xs">
            <List.Item>
              <Text span fw={700}>
                item_name
              </Text>
              : Unique name of the item
            </List.Item>
            <List.Item>
              <Text span fw={700}>
                category
              </Text>
              : Maintenance, Cleaning, Bedding, Equipment, Furniture,
              Electronics, or Other
            </List.Item>
            <List.Item>
              <Text span fw={700}>
                unit
              </Text>
              : e.g., Pcs, Kg, Ltr
            </List.Item>
            <List.Item>
              <Text span fw={700}>
                expected_quantity
              </Text>
              : Target stock level
            </List.Item>
            <List.Item>
              <Text span fw={700}>
                current_quantity
              </Text>
              : (Optional) Current stock count
            </List.Item>
          </List>
          <Text size="xs" mt="md" italic>
            Existing items (matched by name) will have their quantity and
            category updated.
          </Text>
        </Alert>

        <FileInput
          placeholder="Select .xlsx file"
          label="Choose Excel File"
          accept=".xlsx, .xls"
          icon={<IconFileSpreadsheet size={16} />}
          value={file}
          onChange={setFile}
          required
        />

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconUpload size={16} />}
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            Upload Inventory
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

BulkUploadModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
