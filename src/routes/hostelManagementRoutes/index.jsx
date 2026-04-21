/**
 * Hostel Management Routes
 * All API endpoint routes for the hostel management module
 *
 * These routes map to the DRF-based backend API at:
 * /api/hostel/<resource>/
 */

const host = "http://127.0.0.1:8000";
const BASE_URL = `${host}/api/hostel`;

// ═══════════════════════════════════════════════════════════════
// HALL MANAGEMENT ROUTES
// ═══════════════════════════════════════════════════════════════

// Hall Management
export const hallsRoute = `${BASE_URL}/halls/`;
export const hallDetailRoute = (hallId) => `${BASE_URL}/halls/${hallId}/`;

// Hall Room Routes
export const hallRoomsRoute = (hallId) =>
  `${BASE_URL}/hostels/${hallId}/rooms/`;
export const hallRoomDetailRoute = (hallId, roomId) =>
  `${BASE_URL}/hostels/${hallId}/rooms/${roomId}/`;

// Super Admin Routes
export const assignWardenRoute = `${BASE_URL}/admin/assign-warden/`;
export const assignCaretakerRoute = `${BASE_URL}/admin/assign-caretaker/`;
export const facultyListRoute = `${BASE_URL}/admin/faculty/`;
export const staffListRoute = `${BASE_URL}/admin/staff/`;
export const allocateBatchRoute = `${BASE_URL}/admin/allocate-batch/`;
export const activeBatchYearsRoute = `${BASE_URL}/admin/active-batches/`;
export const roomRenameRoute = (roomId) =>
  `${BASE_URL}/admin/rooms/${roomId}/rename/`;

// ═══════════════════════════════════════════════════════════════
// WORKFLOW ROUTES (DRF-STYLE)
// ═══════════════════════════════════════════════════════════════

// Leave Management (HM-WF-101)
export const leavesRoute = `${BASE_URL}/leaves/`;
export const leaveDetailRoute = (leaveId) => `${BASE_URL}/leaves/${leaveId}/`;
export const leaveApproveRoute = (leaveId) =>
  `${BASE_URL}/leaves/${leaveId}/approve/`;
export const leaveRejectRoute = (leaveId) =>
  `${BASE_URL}/leaves/${leaveId}/reject/`;

// Complaint Management (HM-WF-102)
export const complaintsRoute = `${BASE_URL}/complaints/`;
export const complaintDetailRoute = (complaintId) =>
  `${BASE_URL}/complaints/${complaintId}/`;
export const complaintStartRoute = (complaintId) =>
  `${BASE_URL}/complaints/${complaintId}/start/`;
export const complaintEscalateRoute = (complaintId) =>
  `${BASE_URL}/complaints/${complaintId}/escalate/`;
export const complaintResolveRoute = (complaintId) =>
  `${BASE_URL}/complaints/${complaintId}/resolve/`;
export const complaintReportRoute = `${BASE_URL}/complaints/report/`;

// Accommodation Management (HM-WF-103)
export const accommodationWindowsRoute = `${BASE_URL}/accommodation/windows/`;
export const accommodationSubmitRequestRoute = `${BASE_URL}/accommodation/request/`;
export const accommodationRequestsRoute = `${BASE_URL}/accommodation/requests/`;
export const accommodationCapacityRoute = `${BASE_URL}/accommodation/capacity/`;
export const accommodationBulkAllotRoute = `${BASE_URL}/accommodation/bulk-allot/`;
export const accommodationMyAllotmentRoute = `${BASE_URL}/accommodation/my-allotment/`;
export const accommodationAllotmentsRoute = `${BASE_URL}/accommodation/allotments/`;
export const accommodationDeleteAllotmentRoute = (id) =>
  `${BASE_URL}/accommodation/allotments/${id}/delete/`;

// Room Changes (HM-WF-104)
export const roomChangesRoute = `${BASE_URL}/room-changes/`;
export const roomChangeDetailRoute = (changeId) =>
  `${BASE_URL}/room-changes/${changeId}/`;
export const roomChangeApproveRoute = (changeId) =>
  `${BASE_URL}/room-changes/${changeId}/approve/`;
export const roomChangeRejectRoute = (changeId) =>
  `${BASE_URL}/room-changes/${changeId}/reject/`;

// Fine Management (HM-WF-105)
export const finesRoute = `${BASE_URL}/fines/`;
export const fineDetailRoute = (fineId) => `${BASE_URL}/fines/${fineId}/`;
export const fineMarkPaidRoute = (fineId) =>
  `${BASE_URL}/fines/${fineId}/mark-paid/`;
export const fineWaiveRoute = (fineId) => `${BASE_URL}/fines/${fineId}/waive/`;

// Staff Scheduling (HM-WF-107)
export const schedulesRoute = `${BASE_URL}/schedules/`;
export const scheduleDetailRoute = (scheduleId) =>
  `${BASE_URL}/schedules/${scheduleId}/`;

// Inventory Management (HM-WF-108)
export const inventoryRoute = `${BASE_URL}/inventory/`;
export const inventoryDetailRoute = (inventoryId) =>
  `${BASE_URL}/inventory/${inventoryId}/`;

// Notice Board (HM-WF-110)
export const noticesRoute = `${BASE_URL}/notices/`;
export const noticeDetailRoute = (noticeId) =>
  `${BASE_URL}/notices/${noticeId}/`;
export const noticeHistoryRoute = `${BASE_URL}/notices/history/`;

// Guest Room Booking (HM-WF-112)
export const guestBookingsRoute = `${BASE_URL}/guest-bookings/bookings/`;
export const guestRegistryRoute = `${BASE_URL}/guest-bookings/registry/`;
export const guestAvailableRoomsRoute = `${BASE_URL}/guest-bookings/registry/available-rooms/`;
export const guestPolicyRoute = (hallId) =>
  `${BASE_URL}/guest-bookings/policy/${hallId}/`;

export const guestBookingDetailRoute = (bookingId) =>
  `${BASE_URL}/guest-bookings/bookings/${bookingId}/`;
export const guestBookingApproveRoute = (bookingId) =>
  `${BASE_URL}/guest-bookings/bookings/${bookingId}/approve/`;
export const guestBookingCheckInRoute = (bookingId) =>
  `${BASE_URL}/guest-bookings/bookings/${bookingId}/check-in/`;
export const guestBookingCheckOutRoute = (bookingId) =>
  `${BASE_URL}/guest-bookings/bookings/${bookingId}/check-out/`;

// Attendance Management
export const listAttendanceRoute = (hallId) =>
  `${BASE_URL}/attendance/hostel/${hallId}/`;
export const attendanceUploadRoute = `${BASE_URL}/attendance/upload/`;
export const attendanceSummaryRoute = `${BASE_URL}/attendance/summary/`;
export const studentAttendanceStatsRoute = (studentId = "") =>
  studentId
    ? `${BASE_URL}/attendance/student/${studentId}/`
    : `${BASE_URL}/attendance/student/`;

// Batch Identification & Management
export const batchesRoute = `${host}/programme_curriculum/api/admin_batches/`;
export const batchDetailRoute = (batchId) =>
  `${host}/programme_curriculum/api/batches/${batchId}/`;
export const syncBatchRoute = `${host}/programme_curriculum/api/batches/sync/`;
export const listBatchesStatusRoute = `${host}/programme_curriculum/api/batches/list/`;

// ═══════════════════════════════════════════════════════════════
// HOSTEL SETUP FOUNDATION ROUTES
// ═══════════════════════════════════════════════════════════════
export const hostelsRoute = `${BASE_URL}/hostels/`;
export const hostelCreateRoute = `${BASE_URL}/hostels/create/`;
export const hostelDetailRoute = (id) => `${BASE_URL}/hostels/${id}/`;
export const hostelStatusRoute = (id) => `${BASE_URL}/hostels/${id}/status/`;
export const hostelAssignWardenRoute = (id) =>
  `${BASE_URL}/hostels/${id}/assign-warden/`;
export const hostelAssignCaretakerRoute = (id) =>
  `${BASE_URL}/hostels/${id}/assign-caretaker/`;
export const hostelRemoveStaffRoute = (id) =>
  `${BASE_URL}/hostels/staff-assignments/${id}/remove/`;
export const hostelReassignStaffRoute = (id) =>
  `${BASE_URL}/hostels/${id}/reassign-staff/`;
export const hostelDeleteRoute = (id) => `${BASE_URL}/hostels/${id}/delete/`;
export const hostelStaffRoute = (id) => `${BASE_URL}/hostels/${id}/staff/`;
export const hostelBulkBatchAllotRoute = (id) =>
  `${BASE_URL}/hostels/${id}/bulk-batch-allot/`;
export const hostelBulkVacateRoute = `${BASE_URL}/hostels/bulk-vacate/`;

// ═══════════════════════════════════════════════════════════════
// SECURITY MANAGEMENT ROUTES (NEW)
// ═══════════════════════════════════════════════════════════════
export const securityGuardsRoute = `${BASE_URL}/security/guards/`;
export const securityGuardDetailRoute = (id) =>
  `${BASE_URL}/security/guards/${id}/`;
export const securityShiftsRoute = `${BASE_URL}/security/shifts/`;
export const securityShiftCreateRoute = `${BASE_URL}/security/shifts/create/`;
export const securityShiftUpdateRoute = (id) =>
  `${BASE_URL}/security/shifts/${id}/`;
export const securityShiftDeleteRoute = (id) =>
  `${BASE_URL}/security/shifts/${id}/delete/`;
export const securityStatusRoute = `${BASE_URL}/security/status/`;
export const securityLogsRoute = `${BASE_URL}/security/logs/`;
