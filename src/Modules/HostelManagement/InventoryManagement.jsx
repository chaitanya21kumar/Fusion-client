/**
 * InventoryManagement - MODERNIZED VIEW (HM-WF-108)
 * Orchestrates role-based inventory workflows: inspections, updates, and procurement.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  Title,
  Stack,
  Group,
  Paper,
  Text,
  Badge,
  Alert,
  Button,
} from "@mantine/core";
import {
  IconClipboardList,
  IconAlertTriangle,
  IconTruckLoading,
  IconAlertCircle,
  IconUpload,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";

import PropTypes from "prop-types";
import InventoryTable from "./components/inventory/InventoryTable";
import InspectionModal from "./components/inventory/InspectionModal";
import ResourceRequestForm from "./components/inventory/ResourceRequestForm";
import DiscrepancyTable from "./components/inventory/DiscrepancyTable";
import AuditTrailDrawer from "./components/inventory/AuditTrailDrawer";
import BulkUploadModal from "./components/inventory/BulkUploadModal";

import {
  fetchInventoryItems,
  recordInventoryInspection,
  updateInventoryRecord,
  fetchInventoryDiscrepancies,
  fetchInventoryAuditTrail,
  fetchResourceRequests,
  submitResourceRequest,
  reviewResourceRequest,
  bulkUploadInventoryItems,
  deleteInventoryItem,
  resolveDiscrepancy,
  fetchHalls,
} from "./api";

export default function InventoryManagement() {
  const userRole = useSelector((state) => state.user.role);
  const [activeTab, setActiveTab] = useState("inventory");

  // Data State (initialized to empty arrays)
  const [items, setItems] = useState([]);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [resourceRequests, setResourceRequests] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [halls, setHalls] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalMode, setModalMode] = useState(null); // 'inspect' or 'update'
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [bulkModalOpened, setBulkModalOpened] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);

  // ══════════════════════════════════════════════════════════════
  // DATA LOADING
  // ══════════════════════════════════════════════════════════════

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [itemsRes, discRes, reqRes, hallsData] = await Promise.all([
        fetchInventoryItems(),
        fetchInventoryDiscrepancies(),
        fetchResourceRequests(),
        fetchHalls(),
      ]);

      // Unpack DRF paginated responses if necessary
      setItems(itemsRes?.results || itemsRes || []);
      setDiscrepancies(discRes?.results || discRes || []);
      setResourceRequests(reqRes?.results || reqRes || []);
      setHalls(hallsData);
      setError(null);
    } catch (err) {
      setError("Failed to synchronize inventory data. Check your connection.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ══════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ══════════════════════════════════════════════════════════════

  const handleInspectionSubmit = async (data) => {
    try {
      if (modalMode === "inspect") {
        await recordInventoryInspection(data.itemId, {
          actual_qty: data.quantity,
          condition: data.condition,
          remarks: data.remarks,
        });
        notifications.show({
          title: "Inspection Recorded",
          message: "Discrepancies (if any) have been logged.",
          color: "green",
        });
      } else {
        await updateInventoryRecord(data.itemId, {
          current_quantity: data.quantity,
          condition: data.condition,
          remarks: data.remarks,
        });
        notifications.show({
          title: "Record Updated",
          message: "Quantity and condition updated successfully.",
          color: "blue",
        });
      }
      setModalMode(null);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Action Failed",
        message: err.response?.data?.detail || "Could not save change.",
        color: "red",
      });
    }
  };

  const handleResourceSubmit = async (data) => {
    try {
      setLoading(true);
      await submitResourceRequest(data);
      notifications.show({
        title: "Request Submitted",
        message: "Warden/Admin will review your procurement request.",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Submission Failed",
        message: err.response?.data?.detail || "Invalid request.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (item) => {
    setSelectedItem(item);
    setDrawerOpened(true);
    setAuditLoading(true);
    try {
      const logs = await fetchInventoryAuditTrail(item.id);
      setAuditLogs(logs);
    } catch (err) {
      notifications.show({
        title: "History Unavailable",
        message: "Could not fetch audit trail.",
        color: "red",
      });
    } finally {
      setAuditLoading(false);
    }
  };
  const handleDeleteInventoryItem = async (itemId) => {
    try {
      setLoading(true);
      await deleteInventoryItem(itemId);
      notifications.show({
        title: "Item Deleted",
        message: "Inventory record and audit trail removed.",
        color: "gray",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Delete Failed",
        message: err.response?.data?.detail || "Action unauthorized.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDiscrepancy = async (discrepancyId) => {
    try {
      setLoading(true);
      await resolveDiscrepancy(discrepancyId);
      notifications.show({
        title: "Discrepancy Resolved",
        message: "Inventory synced to actual quantity.",
        color: "green",
      });
      loadData();
    } catch (err) {
      notifications.show({
        title: "Resolution Failed",
        message: err.response?.data?.detail || "Could not resolve.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpload = async (file) => {
    if (halls.length === 0) {
      notifications.show({
        title: "No Hostel Selected",
        message: "Please ensure you have an assigned hostel.",
        color: "red",
      });
      return;
    }

    try {
      setLoading(true);
      // For simplicity, upload to the first assigned hostel if multiple exist,
      // or ideally add a selector. Here we assume the user picks the hostel
      // context. We'll use the first one as default for now.
      const hostelId = halls[0].hall_id;
      const results = await bulkUploadInventoryItems(hostelId, file);

      notifications.show({
        title: "Bulk Upload Complete",
        message: `Created: ${results.created}, Updated: ${results.updated}. Errors: ${results.errors.length}`,
        color: results.errors.length > 0 ? "orange" : "green",
      });

      setBulkModalOpened(false);
      loadData();
    } catch (err) {
      notifications.show({
        title: "Upload Failed",
        message: err.response?.data?.detail || "Invalid Excel format.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ══════════════════════════════════════════════════════════════

  const safeItems = Array.isArray(items) ? items : [];
  const lowStockCount = safeItems.filter(
    (i) => i.current_quantity <= i.expected_quantity * 0.2,
  ).length;

  return (
    <Stack gap="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={2}>Inventory & Resource Management</Title>
            <Text size="sm" c="dimmed">
              HM-WF-108: Modernized stock tracking and procurement workflow
            </Text>
          </div>
          <Group>
            {(userRole === "super_admin" || userRole === "warden") && (
              <Button
                variant="light"
                leftSection={<IconUpload size={16} />}
                onClick={() => setBulkModalOpened(true)}
              >
                Bulk Upload
              </Button>
            )}
            {lowStockCount > 0 && (
              <Badge
                color="red"
                variant="filled"
                size="lg"
                leftSection={<IconAlertTriangle size={14} />}
              >
                {lowStockCount} items critically low
              </Badge>
            )}
          </Group>
        </Group>

        {error && (
          <Alert
            icon={<IconAlertCircle />}
            title="Sync Error"
            color="red"
            variant="light"
          >
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
              value="inventory"
              leftSection={<IconClipboardList size={16} />}
            >
              Inventory List
            </Tabs.Tab>
            {userRole !== "super_admin" && (
              <>
                <Tabs.Tab
                  value="discrepancies"
                  leftSection={<IconAlertTriangle size={16} />}
                >
                  Discrepancies
                </Tabs.Tab>
                <Tabs.Tab
                  value="requests"
                  leftSection={<IconTruckLoading size={16} />}
                >
                  Resource Requests
                </Tabs.Tab>
              </>
            )}
          </Tabs.List>

          <Tabs.Panel value="inventory" pt="xl">
            <Paper withBorder radius="md" p="md">
              <InventoryTable
                items={items}
                loading={loading}
                userRole={userRole}
                onInspect={(item) => {
                  setSelectedItem(item);
                  setModalMode("inspect");
                }}
                onUpdate={(item) => {
                  setSelectedItem(item);
                  setModalMode("update");
                }}
                onDelete={handleDeleteInventoryItem}
                onViewHistory={handleViewHistory}
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="discrepancies" pt="xl">
            <Paper withBorder radius="md" p="md">
              <DiscrepancyTable
                discrepancies={discrepancies}
                loading={loading}
                userRole={userRole}
                onResolve={handleResolveDiscrepancy}
              />
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="requests" pt="xl">
            <Stack gap="xl">
              {userRole === "caretaker" && (
                <ResourceRequestForm
                  hostels={halls}
                  onSubmit={handleResourceSubmit}
                  loading={loading}
                />
              )}

              <Paper withBorder radius="md" p="md">
                <Title order={4} mb="md">
                  Procurement Status
                </Title>
                <ResourceRequestList
                  requests={resourceRequests}
                  userRole={userRole}
                  onReview={(id, data) =>
                    reviewResourceRequest(id, data).then(() => loadData())
                  }
                />
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>
      </Stack>

      <InspectionModal
        opened={!!modalMode}
        onClose={() => setModalMode(null)}
        item={selectedItem}
        mode={modalMode}
        onSubmit={handleInspectionSubmit}
      />

      <AuditTrailDrawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        item={selectedItem}
        logs={auditLogs}
        loading={auditLoading}
      />

      <BulkUploadModal
        opened={bulkModalOpened}
        onClose={() => setBulkModalOpened(false)}
        onUpload={handleBulkUpload}
        loading={loading}
      />
    </Stack>
  );
}

// ... (existing code remains, adding PropTypes at the bottom or before usage)

// Internal Helper for Request List
function ResourceRequestList({ requests, userRole, onReview }) {
  if (!requests || requests.length === 0)
    return (
      <Text c="dimmed" ta="center" py="xl">
        No resource requests found.
      </Text>
    );

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "blue";
    }
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "1px solid #eee" }}>
            <th style={{ padding: "12px" }}>Date</th>
            <th style={{ padding: "12px" }}>Item</th>
            <th style={{ padding: "12px" }}>Qty</th>
            <th style={{ padding: "12px" }}>Type</th>
            <th style={{ padding: "12px" }}>Requested By</th>
            <th style={{ padding: "12px" }}>Status</th>
            {(userRole === "super_admin" || userRole === "warden") && (
              <th style={{ padding: "12px" }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {requests.map((req) => (
            <tr key={req.id} style={{ borderBottom: "1px solid #f9f9f9" }}>
              <td style={{ padding: "12px", fontSize: "12px" }}>
                {new Date(req.created_at).toLocaleDateString()}
              </td>
              <td style={{ padding: "12px", fontWeight: 500 }}>
                {req.item_name}
              </td>
              <td style={{ padding: "12px" }}>{req.quantity}</td>
              <td style={{ padding: "12px" }}>{req.request_type}</td>
              <td style={{ padding: "12px" }}>{req.requested_by_name}</td>
              <td style={{ padding: "12px" }}>
                <Badge color={getStatusColor(req.status)} variant="light">
                  {req.status}
                </Badge>
              </td>
              {(userRole === "super_admin" || userRole === "warden") &&
                req.status === "Pending" && (
                  <td style={{ padding: "12px" }}>
                    <Group gap={4}>
                      <Button
                        size="compact-xs"
                        color="green"
                        onClick={() => onReview(req.id, { status: "Approved" })}
                      >
                        Approve
                      </Button>
                      <Button
                        size="compact-xs"
                        color="red"
                        variant="outline"
                        onClick={() => onReview(req.id, { status: "Rejected" })}
                      >
                        Reject
                      </Button>
                    </Group>
                  </td>
                )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

ResourceRequestList.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      item_name: PropTypes.string,
      quantity: PropTypes.number,
      request_type: PropTypes.string,
      status: PropTypes.string,
      requested_by_name: PropTypes.string,
      created_at: PropTypes.string,
    }),
  ).isRequired,
  userRole: PropTypes.string.isRequired,
  onReview: PropTypes.func.isRequired,
};
