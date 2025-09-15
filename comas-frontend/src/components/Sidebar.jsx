import { useLocation, useNavigate } from "react-router-dom";
import {
  IconAxe,
  IconBellRinging,
  IconBriefcase,
  IconBuildingWarehouse,
  IconCalendarStats,
  IconChevronLeft,
  IconChevronRight,
  IconClipboardPlus,
  IconDesk,
  IconDeviceWatchStar,
  IconDotsVertical,
  IconFileSettings,
  IconGauge,
  IconLogout,
  IconMessage,
  IconSettings,
  IconTerminal2,
  IconUser,
  IconUserCog,
  IconUserDollar,
  IconWreckingBall,
} from "@tabler/icons-react";
import {
  Avatar,
  Center,
  Text,
  Group,
  Stack,
  Tooltip,
  UnstyledButton,
  Grid,
  Space,
  Image,
  Box,
  ThemeIcon,
  Collapse,
  ScrollArea,
  Divider,
} from "@mantine/core";

import {
  userEditPermissionsList,
  userDeletePermissionList,
  employeeEditPermissionsList,
  employeeDeletePermissionsList,
  userViewPermissionsList,
} from "../config/permissions.js";
import classes from "../Styles/Sidebar.module.css";
import { APP_CONFIG } from "../config/config.jsx";
import useAuth from "../hooks/useAuth.jsx";
import useLogout from "../hooks/useLogout.jsx";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Notification from "./Notification.jsx";

function NavbarLink({
  isCollapsed,
  // eslint-disable-next-line no-unused-vars
  icon: Icon,
  label,
  openedProp,
  links,
  permissions,
  roles,
  active,
  onClick,
  linkCollapse,
}) {
  const navigate = useNavigate();
  const [opened, setOpened] = useState(openedProp);
  const hasLinks = Array.isArray(links);

  const filteredItems = (hasLinks ? links : []).filter((item) => {
    const itemPermissions = Array.isArray(item.permissions)
      ? item.permissions
      : item.permissions
      ? [item.permissions]
      : [];

    const itemRoles = Array.isArray(item.roles)
      ? item.roles
      : item.roles
      ? [item.roles]
      : [];

    const hasPermission =
      itemPermissions.length === 0 ||
      itemPermissions[0] === "" ||
      itemPermissions.some((perm) => permissions.includes(perm));
    const hasRole =
      itemRoles.length === 0 ||
      itemRoles[0] === "" ||
      itemRoles.some((role) => roles.includes(role));

    return hasPermission && hasRole; //should be || if the role doesn't matter. In my case, i'll change it to or when done testing
  });

  const items = filteredItems.map((link) =>
    isCollapsed ? (
      <>
        <Tooltip
          key={link.label}
          label={link.label}
          position="right"
          transitionProps={{ duration: 2 }}
        >
          <a
            className={classes.link}
            style={{
              paddingRight: "0px",
              paddingLeft: "calc(var(--mantine-spacing-xs) - 3px)",
              marginLeft: "var(--mantine-spacing-xs)",
            }}
            data-active={location.pathname === link.path || undefined}
            onClick={() => {
              onClick?.();
              linkCollapse();
              navigate(link.path);
            }}
          >
            <link.icon />
          </a>
        </Tooltip>
      </>
    ) : (
      <a
        className={classes.link}
        key={link.label}
        data-active={location.pathname === link.path || undefined}
        onClick={() => {
          onClick?.();
          linkCollapse();
          navigate(link.path);
        }}
      >
        <link.icon />
        <Space w="sm" />
        <Text>{link.label}</Text>
      </a>
    )
  );
  return isCollapsed ? (
    <>
      <Tooltip label={label} position="right" transitionProps={{ duration: 2 }}>
        <UnstyledButton
          onClick={() => {
            onClick?.();
            hasLinks && setOpened((opened) => !opened);
          }}
          className={classes.linkCollapsed}
          data-active={active || undefined}
        >
          <Icon size={20} stroke={1.5} />
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{
                transform: opened || false ? "rotate(-90deg)" : "none",
              }}
            />
          )}
        </UnstyledButton>
      </Tooltip>
      {hasLinks ? (
        <Collapse in={opened} className={classes.collapseDivCollapsed}>
          {items}
        </Collapse>
      ) : null}
    </>
  ) : (
    <>
      <a
        className={classes.control}
        data-active={active || undefined}
        key={label}
        onClick={() => {
          onClick?.();
          hasLinks && setOpened((opened) => !opened);
        }}
      >
        <Group justify="space-between" gap={0}>
          <Box style={{ display: "flex", alignItems: "center" }}>
            <ThemeIcon variant="light" size={30}>
              <Icon size={20} stroke={1.5} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>
          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              size={16}
              style={{ transform: opened ? "rotate(-90deg)" : "none" }}
            />
          )}
        </Group>
      </a>
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  minWidth,
  maxWidth,
  toggleCollapse,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const activePath = location.pathname;
  const { auth } = useAuth();
  const logout = useLogout();
  const permissions = auth?.permissions || [];
  const roles = auth?.roles || [];
  const { t } = useTranslation("sidebar");

  const signOut = async () => {
    await logout(); ///api/v1/auth/logout
  };

  const sidebarItems = [
    {
      icon: IconGauge,
      label: t("dashboard"),
      permissions: [""],
      roles: ["ROLE_EMPLOYEE", "ROLE_ADMIN", "ROLE_SysOP"],
      path: "/dashboard",
    },
    {
      icon: IconCalendarStats,
      label: t("timesheet"),
      permissions: [""],
      roles: ["ROLE_EMPLOYEE", "ROLE_SysOP", "ROLE_ADMIN"],
      path: "/timesheet",
    },
    {
      icon: IconDesk,
      label: t("project"),
      permissions: [""],
      roles: [],
      path: "/project",
    },
    {
      icon: IconTerminal2,
      label: t("administration.title"),
      permissions: [...userViewPermissionsList, ...userEditPermissionsList],
      roles: [],
      path: "",
      links: [
        {
          icon: IconUserCog,
          label: t("administration.add_edit_user_account"),
          permissions: [
            ...userEditPermissionsList,
            ...userDeletePermissionList,
          ],
          roles: [],
          path: "/admin/users",
        },
        {
          icon: IconWreckingBall,
          label: t("administration.add_edit_employee_account"),
          permissions: [
            ...employeeEditPermissionsList,
            ...employeeDeletePermissionsList,
          ],
          roles: [],
          path: "/admin/employee",
        },
        {
          icon: IconDeviceWatchStar,
          label: t("administration.add_edit_timesheet"),
          permissions: ["timesheets:edit", "timesheets:delete"],
          roles: [],
          path: "/admin/timesheet",
        },
        {
          icon: IconBuildingWarehouse,
          label: t("administration.add_edit_inventory"),
          permissions: ["inventory:add", "inventory:edit", "inventory:delete"],
          roles: [],
          path: "/admin/inventory",
        },
        {
          icon: IconClipboardPlus,
          label: t("administration.add_edit_task"),
          permissions: ["task:add", "task:edit", "task:delete"],
          roles: [],
          path: "/admin/task",
        },
        {
          label: t("administration.add_edit_project"),
          permissions: ["projects:add", "projects:edit", "projects:delete"],
          roles: [],
          path: "/admin/project",
          icon: IconFileSettings,
        },
      ],
    },
    {
      icon: IconMessage,
      label: t("messages"),
      permissions: [""],
      roles: [],
      path: "/messages",
    },
    {
      icon: IconBellRinging,
      label: t("notifications"),
      permissions: [""],
      roles: [],
      path: "Open|notifications",
    },
    {
      icon: IconAxe,
      label: t("inventory"),
      permissions: ["inventory:view"],
      roles: ["ROLE_EMPLOYEE", "ROLE_SysOP", "ROLE_ADMIN"], //this one is not really needed. All employees get view perm
      path: "/inventory",
    },
    {
      icon: IconSettings,
      label: t("settings.title"),
      permissions: [""],
      roles: [],
      path: "",
      links: [
        {
          label: t("settings.account_user"),
          permissions: [],
          roles: [],
          path: "/account",
          icon: IconUser,
        },
        !roles.includes("ROLE_CLIENT")
          ? {
              label: t("settings.account_employee"),
              path: "/employee",
              icon: IconBriefcase,
            }
          : {
              label: t("settings.account_client"),
              path: "/client",
              icon: IconUserDollar,
            },
      ],
    },
  ];

  const filteredItems = sidebarItems.filter((item) => {
    const itemPermissions = Array.isArray(item.permissions)
      ? item.permissions
      : item.permissions
      ? [item.permissions]
      : [];

    const itemRoles = Array.isArray(item.roles)
      ? item.roles
      : item.roles
      ? [item.roles]
      : [];

    const hasPermission =
      itemPermissions.length === 0 ||
      itemPermissions[0] === "" ||
      itemPermissions.some((perm) => permissions.includes(perm));
    const hasRole =
      itemRoles.length === 0 ||
      itemRoles[0] === "" ||
      itemRoles.some((role) => roles.includes(role));

    return hasPermission && hasRole; //should be || if the role doesn't matter. In my case, i'll change it to or when done testing
  });
  const [notifOpen, setNotifOpen] = useState(false);
  const links = filteredItems.map((link) => (
    <NavbarLink
      isCollapsed={isCollapsed}
      {...link}
      key={link.label}
      active={
        link?.path === activePath ||
        link?.links?.some((subLink) => subLink.path === activePath)
      }
      openedProp={
        link?.path === activePath ||
        link?.links?.some((subLink) => subLink.path === activePath)
      }
      permissions={permissions}
      roles={roles}
      onClick={() => {
        if (!Array.isArray(link?.links)) {
          toggleCollapse();
          link?.path === "Open|notifications"
            ? setNotifOpen(true)
            : navigate(link?.path || "/missing");
        }
      }}
      linkCollapse={link?.links ? toggleCollapse : undefined}
    />
  ));

  return (
    <>
      <nav
        className={classes.sidebar}
        style={{
          width: isCollapsed ? { minWidth } : { maxWidth },
          overflow: "hidden",
        }}
      >
        <Grid>
          {isCollapsed ? (
            <Space w="sm" />
          ) : (
            <Grid.Col span={10}>
              <Center>
                <Image
                  style={{ paddingLeft: "20%" }}
                  w={maxWidth / 1}
                  fit="contain"
                  fallbackSrc={APP_CONFIG.logoPlaceholder}
                  src={APP_CONFIG.companyLogoUrl}
                />
              </Center>
            </Grid.Col>
          )}
          <Grid.Col span={1}>
            <UnstyledButton visibleFrom="md" className={classes.collapser}>
              {isCollapsed ? (
                <IconChevronRight onClick={toggleSidebar} />
              ) : (
                <IconChevronLeft onClick={toggleSidebar} />
              )}
            </UnstyledButton>
          </Grid.Col>
        </Grid>
        <Divider my="md" />
        <ScrollArea className={classes.links}>
          <Box mih={220} p="md">
            <div className={classes.linksInner}>{links}</div>
          </Box>
        </ScrollArea>
        <Divider my="xs" />

        <NavbarLink
          isCollapsed={isCollapsed}
          icon={IconLogout}
          label={t("logout")}
          onClick={async () => {
            toggleCollapse();
            await signOut();
          }}
        />

        {/* FOOTER */}
        <div className={classes.footer}>
          <UnstyledButton
            className={classes.user}
            onClick={() => {
              navigate("/account");
              toggleCollapse();
            }}
          >
            <Group gap="0" justify="space-between">
              <Group gap="0" style={{ padding: "10px 0px 10px 10px" }}>
                <Avatar src={auth?.avatar} radius="xl" />
                {!isCollapsed && (
                  <Stack gap="0" style={{ marginLeft: "15px" }}>
                    <Text size="sm" fw={500}>
                      {auth?.firstName + " " + auth?.lastName}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {auth?.email}
                    </Text>
                  </Stack>
                )}
              </Group>
              <IconDotsVertical
                size={20}
                stroke={2}
                style={{ marginRight: "5px" }}
              />
            </Group>
          </UnstyledButton>
        </div>
      </nav>
      <Notification opened={notifOpen} onClose={() => setNotifOpen(false)} />
    </>
  );
}
export default Sidebar;
