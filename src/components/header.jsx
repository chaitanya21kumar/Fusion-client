import { useState, useEffect } from "react";
import {
  User,
  SignOut,
  Bell,
  UserSwitch,
  Article,
} from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  Avatar,
  Burger,
  Flex,
  Indicator,
  Popover,
  Group,
  Stack,
  Text,
  Button,
  Select,
  Box,
} from "@mantine/core";
// import { useQueryClient } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { setRole, setCurrentAccessibleModules } from "../redux/userslice";
import classes from "../Modules/Dashboard/Dashboard.module.css";
import avatarImage from "../assets/avatar.png";
import { setPfNo } from "../redux/pfNoSlice";

import {
  logoutRoute,
  updateRoleRoute,
  getNotificationsRoute,
  host,
} from "../routes/dashboardRoutes";
import { setUnreadCount } from "../redux/moduleslice";

function Header({ opened, toggleSidebar }) {
  const [popoverOpened, setPopoverOpened] = useState(false);
  const [notifPopoverOpened, setNotifPopoverOpened] = useState(false);
  const [notificationsData, setNotificationsData] = useState([]);
  const unreadCount = useSelector((state) => state.module.unreadCount);
  const username = useSelector((state) => state.user.username);
  const roles = useSelector((state) => state.user.roles);
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchNotifications = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const response = await axios.get(getNotificationsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      // Handle both array and object response patterns
      const notifs = Array.isArray(response.data)
        ? response.data
        : response.data.notifications || [];

      // Parse the 'data' field which often comes as a string representation
      const parsedNotifs = notifs.map((n) => {
        let extraData = {};
        if (typeof n.data === "string") {
          try {
            extraData = JSON.parse(n.data.replace(/'/g, '"'));
          } catch (e) {
            console.warn("Failed to parse notification data:", e);
          }
        } else {
          extraData = n.data || {};
        }
        return { ...n, extraData };
      });

      setNotificationsData(parsedNotifs.slice(0, 5)); // Show only recent 5 in popover
      dispatch(setUnreadCount(parsedNotifs.filter((n) => n.unread).length));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const handleNotificationClick = async (notif) => {
    const token = localStorage.getItem("authToken");
    setNotifPopoverOpened(false);

    // Mark as read if unread
    if (notif.unread) {
      try {
        await axios.post(
          `${host}/api/notificationread`,
          { id: notif.id },
          { headers: { Authorization: `Token ${token}` } },
        );
        // Let the poll or dashboard update the count, or dispatch an update here for instant feedback
        // dispatch(setUnreadCount(Math.max(0, unreadCount - 1)));
      } catch (err) {
        console.error("Error marking notification as read:", err);
      }
    }

    // Navigate to specific URL if provided
    if (notif.extraData && notif.extraData.url) {
      navigate(`/${notif.extraData.url}`);
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 1 minute
    return () => clearInterval(interval);
  }, []);
  // const queryclient = useQueryClient();

  const handleRoleChange = async (newRole) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.patch(
        updateRoleRoute,
        {
          last_selected_role: newRole,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      notifications.show({
        title: "Role Updated",
        message: (
          <Flex gap="4px">
            <Text fz="sm">Your role has been changed to </Text>
            <Text fz="sm" fw="500" c="dark">
              {newRole}
            </Text>
          </Flex>
        ),
        color: "green",
      });
      console.log(response.data.message);
      dispatch(setRole(newRole));
      dispatch(setCurrentAccessibleModules());
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating last selected role:", error.response.data);
    }
  };
  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.post(
        logoutRoute,
        {},
        {
          // 3 hours got wasted just because of an empty brackets :)
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (localStorage.getItem("pfNo") != null) {
        dispatch(setPfNo(null));
      }
      localStorage.removeItem("authToken");
      navigate("/accounts/login");
      // queryclient.invalidateQueries();
      console.log("User logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <Flex
      bg="#F5F7F8"
      justify="space-between"
      align="center"
      pl="sm"
      h="64px" // Height has already been set in layout.jsx but had to set the height here as well for properly aligning the avatar
    >
      <Box>
        <Burger
          opened={opened}
          onClick={toggleSidebar}
          hiddenFrom="sm"
          size="sm"
        />
      </Box>
      <Flex
        justify={{ base: "space-between" }}
        align="center"
        h="100%"
        w="100%"
      >
        <Text fz={{ base: "h2", xs: "h3" }} visibleFrom="sm">
          FUSION - IIITDMJ's ERP Portal
        </Text>
        <Flex
          justify="flex-end"
          align="center"
          gap="2rem"
          px={{ base: "sm", md: "lg" }}
        >
          <Select
            classNames={{
              option: classes.selectoptions,
              input: classes.selectinputs,
            }}
            variant="default"
            rightSection={<UserSwitch size="24px" />}
            data={roles}
            value={role}
            onChange={handleRoleChange}
            placeholder="Role"
          />
          <Popover
            opened={notifPopoverOpened}
            onChange={setNotifPopoverOpened}
            width={340}
            position="bottom-end"
            withArrow
            shadow="xl"
          >
            <Popover.Target>
              <Indicator
                label={unreadCount}
                disabled={unreadCount === 0}
                color="red"
                size={20}
              >
                <Bell
                  color="orange"
                  size="32px"
                  cursor="pointer"
                  onClick={() => setNotifPopoverOpened((o) => !o)}
                />
              </Indicator>
            </Popover.Target>
            <Popover.Dropdown p="xs">
              <Stack gap="xs">
                <Flex justify="space-between" align="center">
                  <Text fw={700}>Notifications</Text>
                  <Button
                    variant="subtle"
                    size="compact-xs"
                    onClick={() => navigate("/dashboard")}
                  >
                    View All
                  </Button>
                </Flex>
                {notificationsData.length > 0 ? (
                  notificationsData.map((notif) => (
                    <Box
                      key={notif.id}
                      p="xs"
                      style={{
                        borderBottom: "1px solid #eee",
                        cursor: "pointer",
                        backgroundColor: notif.unread
                          ? "#fdf8f0"
                          : "transparent",
                      }}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <Group gap="xs" wrap="nowrap">
                        <Article size={20} color="#ff922b" />
                        <Stack gap={0}>
                          <Text
                            size="xs"
                            fw={notif.unread ? 600 : 400}
                            lineClamp={2}
                          >
                            {notif.verb}
                          </Text>
                          <Text size="10px" c="dimmed">
                            {new Date(notif.timestamp).toLocaleString()}
                          </Text>
                        </Stack>
                      </Group>
                    </Box>
                  ))
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="md">
                    No new notifications
                  </Text>
                )}
              </Stack>
            </Popover.Dropdown>
          </Popover>
          <Popover
            opened={popoverOpened}
            onChange={setPopoverOpened}
            width={{ xxs: "320px", xs: "340px" }}
            position="bottom-end"
            withArrow
            shadow="xl"
          >
            <Popover.Target>
              <Avatar
                size="46px"
                radius="xl"
                src={avatarImage}
                onClick={() => setPopoverOpened((open) => !open)}
                style={{ cursor: "pointer" }}
                mr="12px"
              />
            </Popover.Target>
            <Popover.Dropdown
              style={{
                border: "1px solid #f0f0f0",
              }}
              width={{ xxs: "320px", xs: "340px" }}
            >
              <Group spacing="xs">
                <Avatar size="xl" radius="xl" src={avatarImage} />
                <Stack gap={8}>
                  <Text size="lg" fz={{ xxs: 18, xs: 24 }} fw={700}>
                    {username?.length > 18
                      ? `${username.slice(0, 18)}...`
                      : username}
                  </Text>

                  <Flex gap="xs" direction={{ xxs: "column", xs: "row" }}>
                    <Button
                      rightSection={<User size={16} />}
                      variant="light"
                      color="blue"
                      size="xs"
                      onClick={() =>
                        navigate(
                          role === "student"
                            ? "/profile"
                            : "/facultyprofessionalprofile",
                        )
                      }
                    >
                      Profile
                    </Button>
                    <Button
                      rightSection={<SignOut size={16} />}
                      variant="light"
                      color="pink"
                      size="xs"
                      onClick={handleLogout}
                    >
                      Log out
                    </Button>
                  </Flex>
                </Stack>
              </Group>
            </Popover.Dropdown>
          </Popover>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default Header;

Header.propTypes = {
  opened: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
};
