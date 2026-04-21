/**
 * Hostel Management Module
 * Main entry point with tab navigation
 * Role-based access:
 * - super_admin: Hall Creation, Warden/Caretaker Assignment, Batch Allocation
 * - warden: Leave, Complaints, Fines, Attendance, Bookings
 * - caretaker: Same as warden plus Halls & Rooms access
 * - student: Leave, Complaints, Fines, Bookings, Room Allocation, Vacation, Extended Stay
 */

import React, { useState, useEffect } from "react";
import { Container, Box, Flex, Alert } from "@mantine/core";
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

export default function HostelManagementPage() {
  const [activeTab, setActiveTab] = useState("0");
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.user.role);
  const [isAllocated, setIsAllocated] = useState(true);

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
      ],
      tabComponents: [
        GuestRoomBookings,
        NoticeBoard,
        LeaveManagement,
        ComplaintManagement,
        FineManagement,
        AttendanceManagement,
        AccommodationAllotment,
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
                  setActiveTab={setActiveTab}
                />

                <Box style={{ minHeight: "60vh" }}>
                  <ActiveComponent
                    userRole={userRole}
                    setActiveTab={setActiveTab}
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
