/**
 * Hostel Management Module
 * Main entry point with tab navigation
 * Role-based access:
 * - super_admin: Hall Creation, Warden/Caretaker Assignment, Batch Allocation
 * - warden: Leave, Complaints, Fines, Attendance, Bookings
 * - caretaker: Same as warden plus Halls & Rooms access
 * - student: Leave, Complaints, Fines, Bookings, Room Allocation, Vacation, Extended Stay
 */

import React, { useState, useEffect, useMemo } from "react";
import { Container, Box, Flex, Alert } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import { IconAlertCircle } from "@tabler/icons-react";
import { useDispatch, useSelector } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import ModuleTabs from "../../components/moduleTabs";
import { setActiveTab_ } from "../../redux/moduleslice";

// Feature Components
import HallManagement from "./HallManagement";
import GuestRoomBookings from "./GuestRoomBookings";
import NoticeBoard from "./NoticeBoard";
import LeaveManagement from "./LeaveManagement";
import ComplaintManagement from "./ComplaintManagement";
import FineManagement from "./FineManagement";
import InventoryManagement from "./InventoryManagement";
import AttendanceManagement from "./AttendanceManagement";
import AccommodationAllotment from "./components/allotment/AccommodationAllotment";
import SemesterEndProcess from "./SemesterEndProcess";
import SecurityManagement from "./SecurityManagement";

export default function HostelManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("0");
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);
  const [isAllocated, setIsAllocated] = useState(true);

  // Map sub-paths to tab indices
  const pathToTab = useMemo(() => {
    const baseMapping = {
      "guest-booking": "0",
      "notice-board": "1",
      leave: "2",
      complaints: "3",
      fines: "4",
    };

    if (userRole === "super_admin") {
      return {
        "hall-management": "0",
        "room-allocation": "1",
        "notice-board": "2",
        inventory: "3",
        "semester-end": "4",
      };
    }

    if (userRole === "caretaker" || userRole === "warden") {
      return {
        ...baseMapping,
        inventory: "5",
        attendance: "6",
        "room-allocation": "7",
        security: "8",
      };
    }

    // Student
    return {
      ...baseMapping,
      attendance: "5",
      "room-allocation": "6",
      security: "7",
    };
  }, [userRole]);

  useEffect(() => {
    const subPath = location.pathname.split("/hostel-management/")[1];
    if (subPath) {
      const cleanPath = subPath.replace(/\/$/, ""); // remove trailing slash
      if (pathToTab[cleanPath]) {
        setActiveTab(pathToTab[cleanPath]);
      }
    } else {
      setActiveTab("0");
    }
  }, [location.pathname, pathToTab]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    const tabName = Object.keys(pathToTab).find(
      (key) => pathToTab[key] === val,
    );
    if (tabName) {
      navigate(`/hostel-management/${tabName}/`);
    } else {
      navigate(`/hostel-management/`);
    }
  };

  useEffect(() => {
    const checkResidency = async () => {
      if (userRole === "student") {
        try {
          const { fetchMyAllotment } = await import("./api");
          await fetchMyAllotment();
          setIsAllocated(true);
        } catch (error) {
          if (error.response?.status === 403) {
            setIsAllocated(false);
          }
        }
      }
    };
    checkResidency();
  }, [userRole]);

  // Define tabs based on user role from Redux
  const getTabsAndComponents = () => {
    // SUPER ADMIN: Only Hall Creation, Warden/Caretaker Assignment, Batch Allocation
    if (userRole === "super_admin") {
      return {
        tabItems: [
          { title: "Hall Management" },
          { title: "Hostel Allocation" },
          { title: "Global Notices" },
          { title: "Inventory" },
          { title: "Semester End" },
        ],
        tabComponents: [
          HallManagement,
          AccommodationAllotment,
          NoticeBoard,
          InventoryManagement,
          SemesterEndProcess,
        ],
      };
    }

    // CARETAKER: Full access to hall management
    if (userRole === "caretaker") {
      return {
        tabItems: [
          { title: "Guest Bookings" },
          { title: "Notice Board" },
          { title: "Leave Requests" },
          { title: "Complaints" },
          { title: "Fines" },
          { title: "Inventory" },
          { title: "Attendance" },
          { title: "Hostel Allocation" },
          { title: "Security" },
        ],
        tabComponents: [
          GuestRoomBookings,
          NoticeBoard,
          LeaveManagement,
          ComplaintManagement,
          FineManagement,
          InventoryManagement,
          AttendanceManagement,
          AccommodationAllotment,
          SecurityManagement,
        ],
      };
    }

    // WARDEN: Limited access
    if (userRole === "warden") {
      return {
        tabItems: [
          { title: "Guest Bookings" },
          { title: "Notice Board" },
          { title: "Leave Requests" },
          { title: "Complaints" },
          { title: "Fines" },
          { title: "Inventory" },
          { title: "Attendance" },
          { title: "Hostel Allocation" },
          { title: "Security" },
        ],
        tabComponents: [
          GuestRoomBookings,
          NoticeBoard,
          LeaveManagement,
          ComplaintManagement,
          FineManagement,
          InventoryManagement,
          AttendanceManagement,
          AccommodationAllotment,
          SecurityManagement,
        ],
      };
    }

    // STUDENT: Personal features only
    return {
      tabItems: [
        { title: "Guest Bookings" },
        { title: "Notice Board" },
        { title: "Leave Requests" },
        { title: "Complaints" },
        { title: "Fines" },
        { title: "Attendance" },
        { title: "Hostel Allocation" },
        { title: "Security" },
      ],
      tabComponents: [
        GuestRoomBookings,
        NoticeBoard,
        LeaveManagement,
        ComplaintManagement,
        FineManagement,
        AttendanceManagement,
        AccommodationAllotment,
        SecurityManagement,
      ],
    };
  };

  const { tabItems, tabComponents } = getTabsAndComponents();

  useEffect(() => {
    if (tabItems && tabItems[parseInt(activeTab, 10)]) {
      dispatch(setActiveTab_(tabItems[parseInt(activeTab, 10)].title));
    }
  }, [activeTab, dispatch, tabItems]);

  const ActiveComponent =
    tabComponents[parseInt(activeTab, 10)] || tabComponents[0];

  return (
    <ModalsProvider>
      <Box style={{ width: "100%", minHeight: "100dvh" }}>
        <Container
          size="xl"
          py="xl"
          style={{
            width: "100%",
            maxWidth: "1200px",
            marginLeft: "auto",
            marginRight: "auto",
            scrollbarGutter: "stable",
          }}
        >
          <Flex direction="column" gap="xl">
            <CustomBreadcrumbs />
            {userRole === "super_admin" && (
              <Alert
                icon={<IconAlertCircle />}
                color="blue"
                title="Super Admin Mode"
              >
                You have access to hostel management administrative functions
                only: Hall Creation, Warden/Caretaker Assignment, and Batch
                Allocation.
              </Alert>
            )}

            {userRole === "student" && !isAllocated ? (
              <Box py="50px">
                <Alert
                  icon={<IconAlertCircle />}
                  title="Access Restricted"
                  color="red"
                  variant="filled"
                >
                  Your account is not currently associated with an active hostel
                  allotment. Student features in this module are restricted to
                  residents only. Please contact the Hostel Administration if
                  you believe this is an error or if you are awaiting admission.
                </Alert>
              </Box>
            ) : (
              <>
                <ModuleTabs
                  tabs={tabItems}
                  activeTab={activeTab}
                  setActiveTab={handleTabChange}
                />

                <Box style={{ minHeight: "60vh" }}>
                  <ActiveComponent
                    userRole={userRole}
                    setActiveTab={handleTabChange}
                    onlyGlobal={
                      userRole === "super_admin" &&
                      tabItems[parseInt(activeTab, 10)]?.title ===
                        "Global Notices"
                    }
                  />
                </Box>
              </>
            )}
          </Flex>
        </Container>
      </Box>
    </ModalsProvider>
  );
}
