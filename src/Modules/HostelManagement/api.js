/**
 * Hostel Management API Service
 * Axios instance and centralized API calls for the hostel management module
 *
 * CRITICAL RULES:
 * - This is the SINGLE SOURCE OF TRUTH for backend communication
 * - All API calls go through this service
 * - Request/Response interceptors handle auth tokens and errors
 * - No direct axios calls in components - use these methods
 */

import axios from "axios";
import {
  // Leave Management (HM-WF-101)
  leavesRoute,
  leaveDetailRoute,
  leaveApproveRoute,
  leaveRejectRoute,
  // Complaint Management (HM-WF-102)
  complaintsRoute,
  complaintDetailRoute,
  complaintStartRoute,
  complaintEscalateRoute,
  complaintResolveRoute,
  complaintReportRoute,
  // Accommodation Management (HM-WF-103)
  accommodationWindowsRoute,
  accommodationSubmitRequestRoute,
  accommodationRequestsRoute,
  accommodationCapacityRoute,
  accommodationBulkAllotRoute,
  accommodationMyAllotmentRoute,
  accommodationAllotmentsRoute,
  accommodationDeleteAllotmentRoute,
  // Room Changes (HM-WF-104)
  roomChangesRoute,
  roomChangeDetailRoute,
  roomChangeApproveRoute,
  roomChangeRejectRoute,
  // Fine Management (HM-WF-105)
  finesRoute,
  // fineDetailRoute,
  // fineMarkPaidRoute,
  // fineWaiveRoute,
  // Staff Scheduling (HM-WF-107)
  schedulesRoute,
  scheduleDetailRoute,
  // Inventory Management (HM-WF-108)
  inventoryRoute,
  // Attendance Management
  listAttendanceRoute,
  // Notice Board (HM-WF-110)
  noticesRoute,
  noticeDetailRoute,
  noticeHistoryRoute,
  // Guest Room Booking (HM-WF-112)
  guestBookingsRoute,
  guestRegistryRoute,
  guestAvailableRoomsRoute,
  guestPolicyRoute,
  guestBookingDetailRoute,
  guestBookingApproveRoute,
  guestBookingCheckInRoute,
  guestBookingCheckOutRoute,
  // Attendance Management
  attendanceUploadRoute,
  attendanceSummaryRoute,
  studentAttendanceStatsRoute,
  // Batch Identification & Management
  syncBatchRoute,
  // Hall Room Routes
  hallRoomsRoute,
  // Super Admin Routes
  facultyListRoute,
  staffListRoute,
  activeBatchYearsRoute,
  roomRenameRoute,
  // Hostel Setup Foundation
  hostelsRoute,
  hostelCreateRoute,
  hostelDetailRoute,
  hostelStatusRoute,
  hostelAssignWardenRoute,
  hostelAssignCaretakerRoute,
  hostelRemoveStaffRoute,
  hostelDeleteRoute,
  hostelStaffRoute,
  hostelBulkBatchAllotRoute,
  hostelBulkVacateRoute,
  // Security Management (NEW)
  securityGuardsRoute,
  securityGuardDetailRoute,
  securityShiftsRoute,
  securityShiftCreateRoute,
  securityShiftUpdateRoute,
  securityShiftDeleteRoute,
  securityStatusRoute,
  securityLogsRoute,
} from "../../routes/hostelManagementRoutes";

// ══════════════════════════════════════════════════════════════
// AXIOS INSTANCE & INTERCEPTORS
// ══════════════════════════════════════════════════════════════

const getAuthToken = () => localStorage.getItem("authToken");

const apiClient = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/accounts/login";
    }
    return Promise.reject(error);
  },
);

// ══════════════════════════════════════════════════════════════
// HM-WF-101: LEAVE MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

export const submitLeave = async (leaveData) => {
  const isFormData = leaveData instanceof FormData;
  const response = await apiClient.post(leavesRoute, leaveData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

// Alias for consistency with component imports
export const createLeave = submitLeave;

export const fetchLeaves = async () => {
  const response = await apiClient.get(leavesRoute);
  return response.data;
};

export const fetchMyLeaves = async () => {
  // Assuming backend supports /leaves/my/ endpoint, otherwise fetch all and filter
  try {
    const response = await apiClient.get(`${leavesRoute}my/`);
    return response.data;
  } catch (error) {
    // Fallback: fetch all leaves
    return fetchLeaves();
  }
};

export const fetchLeaveDetail = async (leaveId) => {
  const response = await apiClient.get(leaveDetailRoute(leaveId));
  return response.data;
};

export const approveLeave = async (leaveId, data) => {
  const response = await apiClient.post(leaveApproveRoute(leaveId), data);
  return response.data;
};

export const rejectLeave = async (leaveId, data) => {
  const response = await apiClient.post(leaveRejectRoute(leaveId), data);
  return response.data;
};

export const updateLeaveStatus = async (leaveId, status, data) => {
  // Route to update leave status (approve/reject based on status)
  const normalizedStatus = (status || "").toLowerCase();
  if (normalizedStatus === "approved") {
    return approveLeave(leaveId, data);
  }
  if (normalizedStatus === "rejected") {
    return rejectLeave(leaveId, data);
  }
  throw new Error("Invalid leave status");
};

// ══════════════════════════════════════════════════════════════
// HM-WF-102: COMPLAINT MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

export const submitComplaint = async (complaintData) => {
  const isFormData = complaintData instanceof FormData;
  const response = await apiClient.post(complaintsRoute, complaintData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const createComplaint = submitComplaint;

export const fetchComplaints = async () => {
  const response = await apiClient.get(complaintsRoute);
  return response.data;
};

export const fetchMyComplaints = async () => {
  // Assuming backend supports /complaints/my/ endpoint, otherwise fetch all
  try {
    const response = await apiClient.get(`${complaintsRoute}my/`);
    return response.data;
  } catch (error) {
    // Fallback: fetch all complaints (similar to leaves)
    return fetchComplaints();
  }
};

export const fetchComplaintDetail = async (complaintId) => {
  const response = await apiClient.get(complaintDetailRoute(complaintId));
  return response.data;
};

export const updateComplaint = async (complaintId, data) => {
  const response = await apiClient.put(complaintDetailRoute(complaintId), data);
  return response.data;
};

export const escalateComplaint = async (complaintId, data) => {
  const response = await apiClient.post(
    complaintEscalateRoute(complaintId),
    data,
  );
  return response.data;
};

export const resolveComplaint = async (complaintId, data) => {
  const response = await apiClient.post(
    complaintResolveRoute(complaintId),
    data,
  );
  return response.data;
};

export const startComplaint = async (complaintId) => {
  const response = await apiClient.post(complaintStartRoute(complaintId));
  return response.data;
};

export const fetchComplaintReport = async () => {
  const response = await apiClient.get(complaintReportRoute);
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-103: ACCOMMODATION API CALLS
// ══════════════════════════════════════════════════════════════

export const fetchAccommodationWindows = async () => {
  const response = await apiClient.get(accommodationWindowsRoute);
  return response.data;
};

export const submitAccommodationRequest = async (requestData) => {
  const response = await apiClient.post(
    accommodationSubmitRequestRoute,
    requestData,
  );
  return response.data;
};

export const fetchAccommodationRequests = async (params = {}) => {
  const response = await apiClient.get(accommodationRequestsRoute, { params });
  return response.data;
};

export const fetchRoomCapacityDashboard = async () => {
  const response = await apiClient.get(accommodationCapacityRoute);
  return response.data;
};

export const performBulkAllotment = async (requestIds) => {
  const response = await apiClient.post(accommodationBulkAllotRoute, {
    request_ids: requestIds,
  });
  return response.data;
};

export const fetchMyAllotment = async () => {
  const response = await apiClient.get(accommodationMyAllotmentRoute);
  return response.data;
};

/**
 * Fetch all room allocations (paginated)
 * @param {Object} params - Query parameters (hall, page, page_size)
 */
export const fetchRoomAllocations = async (params = {}) => {
  try {
    const response = await apiClient.get(accommodationAllotmentsRoute, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch room allocations:", error);
    throw error;
  }
};

/**
 * Create an individual room allotment
 * @param {Object} data - { student, room, allocation_date }
 */
export const createRoomAllotment = async (data) => {
  try {
    const response = await apiClient.post(accommodationAllotmentsRoute, data);
    return response.data;
  } catch (error) {
    console.error("Failed to create room allotment:", error);
    throw error;
  }
};

export const deleteRoomAllocation = async (allocationId) => {
  const response = await apiClient.delete(
    accommodationDeleteAllotmentRoute(allocationId),
  );
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-104: ROOM CHANGE API CALLS
// ══════════════════════════════════════════════════════════════

export const requestRoomChange = async (changeData) => {
  const response = await apiClient.post(roomChangesRoute, changeData);
  return response.data;
};

export const fetchRoomChanges = async () => {
  const response = await apiClient.get(roomChangesRoute);
  return response.data;
};

export const fetchRoomChangeDetail = async (changeId) => {
  const response = await apiClient.get(roomChangeDetailRoute(changeId));
  return response.data;
};

export const approveRoomChange = async (changeId, data) => {
  const response = await apiClient.put(roomChangeApproveRoute(changeId), data);
  return response.data;
};

export const rejectRoomChange = async (changeId, data) => {
  const response = await apiClient.put(roomChangeRejectRoute(changeId), data);
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-105: FINE MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

export const fetchFines = async (params = {}) => {
  const response = await apiClient.get(finesRoute, { params });
  return response.data;
};

export const fetchRepeatOffenders = async (threshold = 3) => {
  const response = await apiClient.get(`${finesRoute}repeat-offenders/`, {
    params: { threshold },
  });
  return response.data;
};

export const fetchFineReport = async () => {
  const response = await apiClient.get(`${finesRoute}report/`);
  return response.data;
};

export const imposeFine = async (fineData) => {
  const isFormData = fineData instanceof FormData;
  const response = await apiClient.post(finesRoute, fineData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const markFinePaid = async (fineId) => {
  const response = await apiClient.post(`${finesRoute}${fineId}/mark-paid/`);
  return response.data;
};

export const waiveFine = async (fineId, remarks) => {
  const response = await apiClient.patch(`${finesRoute}${fineId}/waive/`, {
    waive_reason: remarks,
  });
  return response.data;
};

export const fetchStudentByRoll = async (rollNumber) => {
  const response = await apiClient.get(`${finesRoute}student/${rollNumber}/`);
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-107: STAFF SCHEDULING API CALLS
// ══════════════════════════════════════════════════════════════

export const createSchedule = async (scheduleData) => {
  const response = await apiClient.post(schedulesRoute, scheduleData);
  return response.data;
};

export const fetchSchedules = async () => {
  const response = await apiClient.get(schedulesRoute);
  return response.data;
};

export const fetchScheduleDetail = async (scheduleId) => {
  const response = await apiClient.get(scheduleDetailRoute(scheduleId));
  return response.data;
};

export const updateSchedule = async (scheduleId, data) => {
  const response = await apiClient.put(scheduleDetailRoute(scheduleId), data);
  return response.data;
};

export const deleteSchedule = async (scheduleId) => {
  const response = await apiClient.delete(scheduleDetailRoute(scheduleId));
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-108: MODERN INVENTORY MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Fetch all inventory items (scoped to roles)
 */
export const fetchInventoryItems = async () => {
  const response = await apiClient.get(`${inventoryRoute}items/`);
  return response.data;
};

/**
 * Record an inventory inspection (Caretaker only)
 * @param {number} itemId
 * @param {Object} data - { actual_qty, condition, remarks }
 */
export const recordInventoryInspection = async (itemId, data) => {
  const response = await apiClient.post(
    `${inventoryRoute}items/${itemId}/inspect/`,
    data,
  );
  return response.data;
};

/**
 * Delete inventory item (Warden/Admin only)
 */
export const deleteInventoryItem = async (itemId) => {
  const response = await apiClient.delete(`${inventoryRoute}items/${itemId}/`);
  return response.data;
};

/**
 * Update inventory record directly (Caretaker only)
 * @param {number} itemId
 * @param {Object} data - { current_quantity, condition, remarks }
 */
export const updateInventoryRecord = async (itemId, data) => {
  const response = await apiClient.post(
    `${inventoryRoute}items/${itemId}/update_record/`,
    data,
  );
  return response.data;
};

/**
 * Review resource procurement request (Admin/Warden only)
 */
export const reviewResourceRequest = async (id, data) => {
  const response = await apiClient.post(
    `${inventoryRoute}resource-requests/${id}/review/`,
    data,
  );
  return response.data;
};

/**
 * Bulk upload inventory from Excel
 */
export const bulkUploadInventoryItems = async (hostelId, file) => {
  const formData = new FormData();
  formData.append("hostel_id", hostelId);
  formData.append("file", file);
  const response = await apiClient.post(
    `${inventoryRoute}items/bulk-upload/`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
};

/**
 * Fetch all inventory discrepancies
 */
export const fetchInventoryDiscrepancies = async () => {
  const response = await apiClient.get(`${inventoryRoute}discrepancies/`);
  return response.data;
};

/**
 * Resolve a discrepancy by syncing inventory
 */
export const resolveDiscrepancy = async (id) => {
  const response = await apiClient.post(
    `${inventoryRoute}discrepancies/${id}/resolve/`,
  );
  return response.data;
};

/**
 * Fetch inventory audit trail
 * @param {number} itemId - Optional filter
 */
export const fetchInventoryAuditTrail = async (itemId = null) => {
  const params = itemId ? { item_id: itemId } : {};
  const response = await apiClient.get(`${inventoryRoute}audit-trail/`, {
    params,
  });
  return response.data;
};

/**
 * Fetch all resource procurement requests
 */
export const fetchResourceRequests = async () => {
  const response = await apiClient.get(`${inventoryRoute}resource-requests/`);
  return response.data;
};

/**
 * Submit a new resource procurement request (Caretaker only)
 * @param {Object} data - { hostel, request_type, item_name, quantity, justification }
 */
export const submitResourceRequest = async (data) => {
  const response = await apiClient.post(
    `${inventoryRoute}resource-requests/`,
    data,
  );
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-110: NOTICE BOARD API CALLS
// ══════════════════════════════════════════════════════════════

export const fetchNotices = async () => {
  const response = await apiClient.get(noticesRoute);
  return response.data;
};

export const fetchNoticeHistory = async () => {
  const response = await apiClient.get(noticeHistoryRoute);
  return response.data;
};

export const fetchNoticeDetail = async (noticeId) => {
  const response = await apiClient.get(noticeDetailRoute(noticeId));
  return response.data;
};

export const createNotice = async (noticeData) => {
  const isFormData = noticeData instanceof FormData;
  const response = await apiClient.post(noticesRoute, noticeData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const updateNotice = async (noticeId, data) => {
  const isFormData = data instanceof FormData;
  const response = await apiClient.put(noticeDetailRoute(noticeId), data, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
  return response.data;
};

export const deleteNotice = async (noticeId) => {
  const response = await apiClient.delete(noticeDetailRoute(noticeId));
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HM-WF-112: GUEST ROOM BOOKING API CALLS
// ══════════════════════════════════════════════════════════════

export const requestGuestBooking = async (bookingData) => {
  const response = await apiClient.post(guestBookingsRoute, bookingData);
  return response.data;
};

export const fetchGuestBookings = async (params = {}) => {
  const response = await apiClient.get(guestBookingsRoute, { params });
  return response.data;
};

export const fetchGuestBookingDetail = async (bookingId) => {
  const response = await apiClient.get(guestBookingDetailRoute(bookingId));
  return response.data;
};

export const approveGuestBooking = async (bookingId, data) => {
  const response = await apiClient.post(
    guestBookingApproveRoute(bookingId),
    data,
  );
  return response.data;
};

export const checkInGuest = async (bookingId, data) => {
  const response = await apiClient.post(
    guestBookingCheckInRoute(bookingId),
    data,
  );
  return response.data;
};

export const checkOutGuest = async (bookingId, data) => {
  const response = await apiClient.post(
    guestBookingCheckOutRoute(bookingId),
    data,
  );
  return response.data;
};

// Registry & Policy
export const fetchGuestRoomRegistry = async (params = {}) => {
  const response = await apiClient.get(guestRegistryRoute, { params });
  return response.data;
};

export const registerGuestRoom = async (data) => {
  const response = await apiClient.post(guestRegistryRoute, data);
  return response.data;
};

export const deleteGuestRoom = async (id) => {
  const response = await apiClient.delete(`${guestRegistryRoute}${id}/`);
  return response.data;
};

export const fetchAvailableRoomsForGuest = async (hallId) => {
  const response = await apiClient.get(guestAvailableRoomsRoute, {
    params: { hall_id: hallId },
  });
  return response.data;
};

export const fetchGuestRoomPolicy = async (hallId) => {
  const response = await apiClient.get(guestPolicyRoute(hallId));
  return response.data;
};

export const updateGuestRoomPolicy = async (hallId, data) => {
  const response = await apiClient.post(guestPolicyRoute(hallId), data);
  return response.data;
};

export const deleteGuestRoomPolicy = async (hallId) => {
  const response = await apiClient.delete(guestPolicyRoute(hallId));
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HALL MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

export const fetchHalls = async () => {
  const response = await apiClient.get(hostelsRoute);
  return response.data;
};

export const fetchHallDetail = async (hallId) => {
  const response = await apiClient.get(hostelDetailRoute(hallId));
  return response.data;
};

export const createHall = async (hallData) => {
  const response = await apiClient.post(hostelCreateRoute, hallData);
  return response.data;
};

export const updateHall = async (hallId, data) => {
  const response = await apiClient.patch(hostelStatusRoute(hallId), data);
  return response.data;
};

export const deleteHall = async (hallId) => {
  const response = await apiClient.delete(hostelDeleteRoute(hallId));
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HALL ROOM MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Create a new room in a hall
 * @param {number} hallId - The ID of the hall
 * @param {Object} roomData - Room data (room_number, block_number, room_type, capacity)
 * @returns {Promise<Object>} Created room object
 */
export const createRoomInHall = async (hallId, roomData) => {
  try {
    const response = await apiClient.post(hallRoomsRoute(hallId), roomData);
    return response.data;
  } catch (error) {
    console.error(`Failed to create room in hall ${hallId}:`, error);
    throw error;
  }
};

/**
 * Fetch all rooms in a specific hall
 * @param {number} hallId - The ID of the hall
 * @returns {Promise<Array>} Array of room objects
 */
export const fetchRoomsInHall = async (hallId) => {
  try {
    const response = await apiClient.get(hallRoomsRoute(hallId));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch rooms for hall ${hallId}:`, error);
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// ATTENDANCE MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Fetch attendance records for a specific hall
 * @param {number|string} hallId - The ID of the hall
 * @returns {Promise<Array>} Array of attendance records for the hall
 */
export const fetchAttendance = async (hallId) => {
  try {
    const response = await apiClient.get(listAttendanceRoute(hallId));
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch attendance for hall ${hallId}:`, error);
    throw error;
  }
};

/**
 * Upload attendance from Excel
 * @param {string} hallId
 * @param {string} date
 * @param {File} file
 */
export const uploadAttendance = async (hallId, date, file) => {
  const formData = new FormData();
  formData.append("hall_id", hallId);
  formData.append("date", date);
  formData.append("file", file);
  const response = await apiClient.post(attendanceUploadRoute, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Fetch attendance summary statistics for a hall
 * @param {string} hallId
 * @param {number} page
 */
export const fetchAttendanceSummary = async (hallId, page = 1) => {
  const response = await apiClient.get(attendanceSummaryRoute, {
    params: { hall_id: hallId, page },
  });
  return response.data;
};

/**
 * Fetch individual student attendance stats and history
 * @param {string} studentId
 */
export const fetchStudentAttendanceStats = async (studentId = "") => {
  const response = await apiClient.get(studentAttendanceStatsRoute(studentId));
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// BATCH IDENTIFICATION & MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Fetch all running batches (active batches including PG)
 * Uses /programme_curriculum/api/batches/sync/ endpoint instead of /admin_batches/
 * because sync endpoint doesn't require 'acadadmin' role
 * Returns all active academic batches that can be used for room allocation
 * Normalizes batch_id → id for component compatibility
 * @returns {Promise<Array>} Array of batch objects with name, discipline, year, capacity info
 */
export const fetchAllActiveBatches = async () => {
  try {
    const response = await apiClient.get(syncBatchRoute);
    // Extract batches from response (sync endpoint returns { success, batches: [] })
    if (response.data && response.data.batches) {
      // Normalize batch data: map batch_id to id for component compatibility
      return response.data.batches.map((batch) => ({
        ...batch,
        id: batch.batch_id, // Normalize: sync endpoint uses batch_id, components expect id
      }));
    }
    return response.data;
  } catch (error) {
    console.error("Failed to fetch active batches from sync endpoint:", error);
    // Log the error status for debugging
    if (error.response) {
      console.error("Error status:", error.response.status);
      console.error("Error message:", error.response.data);
    }
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// SUPER ADMIN MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Get all faculty members for warden assignment
 * @returns {Promise<Array>} Array of faculty members
 */
export const fetchFacultyList = async () => {
  try {
    const response = await apiClient.get(facultyListRoute);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch faculty list:", error);
    throw error;
  }
};

/**
 * Get all staff members for caretaker assignment
 * @returns {Promise<Array>} Array of staff members
 */
export const fetchStaffList = async () => {
  try {
    const response = await apiClient.get(staffListRoute);
    return response.data;
  } catch (error) {
    console.error("Failed to sync batch:", error);
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// SECURITY MANAGEMENT API CALLS
// ══════════════════════════════════════════════════════════════

/**
 * Fetch all security guards
 */
export const fetchSecurityGuards = async () => {
  const response = await apiClient.get(securityGuardsRoute);
  return response.data;
};

/**
 * Register a new security guard
 */
export const registerSecurityGuard = async (guardData) => {
  const response = await apiClient.post(securityGuardsRoute, guardData);
  return response.data;
};

/**
 * Update security guard profile
 */
export const updateSecurityGuard = async (guardId, guardData) => {
  const response = await apiClient.patch(
    securityGuardDetailRoute(guardId),
    guardData,
  );
  return response.data;
};

/**
 * Permanently remove a security guard
 */
export const deleteSecurityGuard = async (guardId) => {
  const response = await apiClient.delete(securityGuardDetailRoute(guardId));
  return response.data;
};

/**
 * Fetch guard shifts with optional filtering
 */
export const fetchGuardShifts = async (params = {}) => {
  const response = await apiClient.get(securityShiftsRoute, { params });
  return response.data;
};

/**
 * Create a new guard shift
 */
export const createGuardShift = async (shiftData) => {
  const response = await apiClient.post(securityShiftCreateRoute, shiftData);
  return response.data;
};

/**
 * Update an existing guard shift
 */
export const updateGuardShift = async (shiftId, shiftData) => {
  const response = await apiClient.patch(
    securityShiftUpdateRoute(shiftId),
    shiftData,
  );
  return response.data;
};

/**
 * Delete a guard shift
 */
export const deleteGuardShift = async (shiftId) => {
  const response = await apiClient.delete(securityShiftDeleteRoute(shiftId));
  return response.data;
};

/**
 * Fetch security deployment summary (Dashboard status)
 */
export const fetchSecurityStatus = async (params = {}) => {
  const response = await apiClient.get(securityStatusRoute, { params });
  return response.data;
};

/**
 * Fetch security audit logs
 */
export const fetchSecurityLogs = async (params = {}) => {
  const response = await apiClient.get(securityLogsRoute, { params });
  return response.data;
};

/**
 * Assign a warden to a hall (Super Admin only)
 * @param {number} hallId - The ID of the hall
 * @param {number} facultyId - The ID of the faculty to assign as warden
 * @returns {Promise<Object>} Assignment result with warden_id
 */
export const assignWarden = async (hallId, data) => {
  try {
    const response = await apiClient.post(
      hostelAssignWardenRoute(hallId),
      data,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to assign warden to hostel ${hallId}:`, error);
    throw error;
  }
};

/**
 * Assign a caretaker to a hall (Super Admin only)
 * @param {number} hallId - The ID of the hall
 * @param {number} staffId - The ID of the staff to assign as caretaker
 * @returns {Promise<Object>} Assignment result with caretaker_id
 */
export const assignCaretaker = async (hallId, data) => {
  try {
    const response = await apiClient.post(
      hostelAssignCaretakerRoute(hallId),
      data,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to assign caretaker to hostel ${hallId}:`, error);
    throw error;
  }
};

/**
 * Allocate an academic batch to a hall (Super Admin only)
 * @param {number} hallId - The ID of the hall
 * @param {number} batchId - The ID of the batch to allocate
 * @returns {Promise<Object>} Allocation result
 */
export const allocateBatch = async (hallId, allocationData) => {
  try {
    const response = await apiClient.post(
      hostelBulkBatchAllotRoute(hallId),
      allocationData,
    );
    return response.data;
  } catch (error) {
    console.error(`Failed to allocate batch to hostel ${hallId}:`, error);
    throw error;
  }
};

/**
 * Get all active batch years for assignment (Super Admin only)
 * @returns {Promise<Array>} Array of active batch years
 */
export const getActiveBatchYears = async () => {
  try {
    const response = await apiClient.get(activeBatchYearsRoute);
    return response.data.batches || [];
  } catch (error) {
    console.error("Failed to fetch active batch years:", error);
    throw error;
  }
};

/**
 * Rename a room in a hall (Warden/Caretaker can rename rooms)
 * @param {number} roomId - The ID of the room to rename
 * @param {string} newRoomNumber - The new room number (e.g., 'A101')
 * @param {string} newBlockNumber - The new block number (optional, e.g., 'A')
 * @returns {Promise<Object>} Updated room object
 */
export const renameRoom = async (
  roomId,
  newRoomNumber,
  newBlockNumber = null,
) => {
  try {
    const payload = { room_number: newRoomNumber };
    if (newBlockNumber) {
      payload.block_number = newBlockNumber;
    }
    const response = await apiClient.patch(roomRenameRoute(roomId), payload);
    return response.data;
  } catch (error) {
    console.error(`Failed to rename room ${roomId}:`, error);
    throw error;
  }
};

// ══════════════════════════════════════════════════════════════
// ROOM VACATION API CALLS (Phase 5)
// ══════════════════════════════════════════════════════════════
const vacationsRoute = "/vacations/";

export const fetchRoomVacations = async () => {
  const response = await apiClient.get(vacationsRoute);
  return response.data;
};

export const submitRoomVacation = async (data) => {
  const response = await apiClient.post(vacationsRoute, data);
  return response.data;
};

export const verifyRoomVacation = async (id, remarks) => {
  const response = await apiClient.put(`${vacationsRoute}${id}/verify/`, {
    remarks,
  });
  return response.data;
};

export const approveRoomVacation = async (id, remarks) => {
  const response = await apiClient.put(`${vacationsRoute}${id}/approve/`, {
    remarks,
  });
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// EXTENDED STAY API CALLS (Phase 6)
// ══════════════════════════════════════════════════════════════
const extendedStaysRoute = "/extended-stays/";

export const fetchExtendedStays = async () => {
  const response = await apiClient.get(extendedStaysRoute);
  return response.data;
};

export const submitExtendedStay = async (data) => {
  const response = await apiClient.post(extendedStaysRoute, data);
  return response.data;
};

export const approveExtendedStay = async (id, remarks) => {
  const response = await apiClient.put(`${extendedStaysRoute}${id}/approve/`, {
    remarks,
  });
  return response.data;
};

export const rejectExtendedStay = async (id, remarks) => {
  const response = await apiClient.put(`${extendedStaysRoute}${id}/reject/`, {
    remarks,
  });
  return response.data;
};

export const updateHallStatus = async (id, status) => {
  const response = await apiClient.patch(`/halls/${id}/`, { status });
  return response.data;
};

// ══════════════════════════════════════════════════════════════
// HOSTEL SETUP FOUNDATION API
// ══════════════════════════════════════════════════════════════

/** Fetch all hostels with staff and room info */
export const fetchHostels = async () => {
  const response = await apiClient.get(hostelsRoute);
  return response.data;
};

/** Create a new hostel */
export const createHostel = async (data) => {
  const response = await apiClient.post(hostelCreateRoute, data);
  return response.data;
};

/** Fetch a single hostel's details by hall_id */
export const fetchHostelDetail = async (hallId) => {
  const response = await apiClient.get(hostelDetailRoute(hallId));
  return response.data;
};

/** Update hostel status by hall_id */
export const updateHostelStatus = async (hallId, status) => {
  const response = await apiClient.patch(hostelStatusRoute(hallId), { status });
  return response.data;
};

/** Assign warden by hall_id */
export const assignHostelWarden = async (hallId, data) => {
  const response = await apiClient.post(hostelAssignWardenRoute(hallId), data);
  return response.data;
};

/** Assign caretaker by hall_id */
export const assignHostelCaretaker = async (hallId, data) => {
  const response = await apiClient.post(
    hostelAssignCaretakerRoute(hallId),
    data,
  );
  return response.data;
};

/** Remove (deactivate) staff assignment */
export const removeStaffAssignment = async (assignmentId) => {
  const response = await apiClient.post(hostelRemoveStaffRoute(assignmentId));
  return response.data;
};

/** Permanently delete a hostel */
export const deleteHostel = async (hallId) => {
  const response = await apiClient.delete(hostelDeleteRoute(hallId));
  return response.data;
};

/** Fetch assignments for a hostel by hall_id */
export const fetchHostelStaff = async (hallId) => {
  const response = await apiClient.get(hostelStaffRoute(hallId));
  return response.data;
};

/** Perform sequential bulk batch allocation for a hostel */
export const bulkBatchAllotHostel = async (hallId, data) => {
  const response = await apiClient.post(
    hostelBulkBatchAllotRoute(hallId),
    data,
  );
  return response.data;
};

export default apiClient;
export const processBulkHostelVacation = async (hostelIds) => {
  const response = await apiClient.post(hostelBulkVacateRoute, {
    hostel_ids: hostelIds,
  });
  return response.data;
};
