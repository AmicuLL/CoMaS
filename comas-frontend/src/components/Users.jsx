import { DataTable, useDataTableColumns } from "mantine-datatable";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  userViewPermissionsList,
  employeeViewPermissionsList,
  hasPermission,
} from "../config/permissions";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Accordion,
  Anchor,
  List,
  Button,
  Tooltip,
  Group,
  Stack,
  Text,
  TextInput,
  Center,
  Popover,
  Image,
} from "@mantine/core";
import { openModal, closeAllModals } from "@mantine/modals";
import { sortBy } from "lodash";
import classes from "../Styles/Users.module.css";
import { useTranslation } from "react-i18next";
import { useForm } from "@mantine/form";
import { APP_CONFIG } from "../config/config";

function Users({
  TABLE_MAX_HEIGHT = 400,
  TABLE_HEIGHT = "70dvh",
  TABLE_BORDER = true,
  COLUMN_BORDER = true,
  SCROLLABLE = false,
  PIN_LAST = false,
  PAGE_SIZE = 100,
  KEY = "default",
}) {
  const { auth } = useAuth();
  const [users, setUsers] = useState({ backendUsers: [], selectedUser: [] });
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();
  const [isFetching, setFetching] = useState(true);
  const scrollViewportRef = useRef(null);
  const [page, setPage] = useState(1);
  const [openAfterLoad, setOpenAfterLoad] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const { t } = useTranslation("user");
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "name",
    direction: "asc",
  });
  const [records, setRecords] = useState();

  const loadMoreRecords = () => {
    if (records.length < data.length) {
      setFetching(true);
      setTimeout(() => {
        setRecords(data.slice(0, records.length + PAGE_SIZE));
        setFetching(false);
      }, 2);
    }
  };

  const data = useMemo(() => {
    const sorted = sortBy(users.backendUsers, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [users.backendUsers, sortStatus]);

  useEffect(() => {
    if (SCROLLABLE) {
      setRecords(data.slice(0, PAGE_SIZE));
    } else {
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      setRecords(data.slice(from, to));
    }
  }, [data, page, SCROLLABLE, PAGE_SIZE]);

  const props = {
    resizable: true,
    sortable: true,
    toggleable: true,
    draggable: true,
  };

  const perm = auth?.permissions;
  useEffect(() => {
    async function loadUsers() {
      if (hasPermission(perm, userViewPermissionsList)) {
        const usersData = await axiosPrivate.get("/api/v1/user", {
          signal: controller.signal,
          withCredentials: true,
        });
        usersData?.status == 200 ? setFetching(false) : setFetching(true);
        const permissionFilteredData = usersData?.data?.map((user) => {
          const filteredUser = {};
          if (hasPermission(perm, userViewPermissionsList[0])) {
            return user;
          }
          if (hasPermission(perm, userViewPermissionsList[1])) {
            //this one should be always on? What's the point to see useless data if you don't know the related account (just by id?),  But, just partially...
            //UPDATE dto backend, so this are useless for now, we could check if values were null. [backend return 12345**** if no perm]
            filteredUser.username = user.username;
          } else {
            filteredUser.username = user.username; //.slice(0, 5) + "..."; //backend update, more secure
          }
          if (hasPermission(perm, userViewPermissionsList[2])) {
            filteredUser.password_hash = user.password_hash;
          }
          if (hasPermission(perm, userViewPermissionsList[3])) {
            filteredUser.email = user.email;
          }
          if (hasPermission(perm, userViewPermissionsList[4])) {
            filteredUser.avatar = user.avatar;
          }
          if (hasPermission(perm, userViewPermissionsList[5])) {
            filteredUser.role = user.role;
          }
          if (hasPermission(perm, userViewPermissionsList[6])) {
            filteredUser.permissions = user.permissions;
          }
          if (hasPermission(perm, userViewPermissionsList[7])) {
            filteredUser.createdAt = user.createdAt;
          }
          if (hasPermission(perm, userViewPermissionsList[8])) {
            filteredUser.userType = user.userType;
          }
          if (hasPermission(perm, userViewPermissionsList[9])) {
            filteredUser.linkedAccount = user.linkedAccount;
          }
          filteredUser.id = user.id;
          return filteredUser;
        });
        setUsers({
          backendUsers: permissionFilteredData,
        });
      }
    }
    loadUsers();
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      id: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      fullName: "",
      position: "",
      hireDate: "",
      departmentId: "",
      regKey: "",
      working_hours: "",
      break_time: "",
      euuid: "",
    },
  });

  useEffect(() => {
    if (!selectedEmpId) return;

    async function getEmployee() {
      try {
        const employeeData = await axiosPrivate.get("/api/v1/employee", {
          params: { employee_id: selectedEmpId },
          signal: controller.signal,
          withCredentials: true,
        });
        if (employeeData?.status === 200) {
          form.setValues(employeeData.data);
          form.resetDirty(employeeData.data);
          form.setValues({
            fullName:
              employeeData.data.firstName + " " + employeeData.data.lastName,
          });

          if (openAfterLoad) {
            setOpenAfterLoad(false);
            openModal({
              key: selectedEmpId,
              title: `${t("user_type_employee")} ${selectedEmpId}`,
              onClose:
                (closeAllModals(),
                setSelectedEmpId(null),
                form.setValues(form.initialValues)),
              children: (
                <Stack>
                  <TextInput
                    label={t("employee_full_name")}
                    placeholder={t("employee_full_name")}
                    readOnly
                    key={form.key("fullName")}
                    {...form.getInputProps("fullName")}
                  />
                  {form.getValues().email ? (
                    <TextInput
                      label={t("employee_email")}
                      placeholder={t("employee_email")}
                      readOnly
                      key={form.key("email")}
                      {...form.getInputProps("email")}
                    />
                  ) : undefined}
                  {form.getValues().phone ? (
                    <TextInput
                      label={t("employee_phone")}
                      placeholder={t("employee_phone")}
                      readOnly
                      key={form.key("phone")}
                      {...form.getInputProps("phone")}
                    />
                  ) : undefined}
                  {form.getValues().position ? (
                    <TextInput
                      label={t("employee_position")}
                      placeholder={t("employee_position")}
                      readOnly
                      key={form.key("position")}
                      {...form.getInputProps("position")}
                    />
                  ) : undefined}
                  {form.getValues().hireDate ? (
                    <TextInput
                      label={t("employee_hire_date")}
                      placeholder={t("employee_hire_date")}
                      readOnly
                      key={form.key("hireDate")}
                      {...form.getInputProps("hireDate")}
                    />
                  ) : undefined}
                  {form.getValues().departmentId ? (
                    <TextInput
                      label={t("employee_department_id")}
                      placeholder={t("employee_department_id")}
                      readOnly
                      key={form.key("departmentId")}
                      {...form.getInputProps("departmentId")}
                    />
                  ) : undefined}
                  {form.getValues().working_hours ? (
                    <TextInput
                      label={t("employee_working_hours")}
                      placeholder={t("employee_working_hours")}
                      readOnly
                      key={form.key("working_hours")}
                      {...form.getInputProps("working_hours")}
                    />
                  ) : undefined}
                  {form.getValues().break_time ? (
                    <TextInput
                      label={t("employee_break_time")}
                      placeholder={t("employee_break_time")}
                      readOnly
                      key={form.key("break_time")}
                      {...form.getInputProps("break_time")}
                    />
                  ) : undefined}
                  {form.getValues().euuid ? (
                    <TextInput
                      label={t("employee_euuid")}
                      placeholder={t("employee_euuid")}
                      readOnly
                      key={form.key("euuid")}
                      {...form.getInputProps("euuid")}
                    />
                  ) : undefined}
                  <Center>
                    <Button
                      fullWidth
                      onClick={() => {
                        closeAllModals();
                      }}
                    >
                      OK
                    </Button>
                  </Center>
                </Stack>
              ),
            });
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    getEmployee();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmpId]);

  const buildColumns = () => {
    const cols = [];

    cols.push({
      accessor: "id",
      title: "#id",
      textAlign: "right",
      ...props,
    });
    //if (hasPermission(perm, userViewPermissionsList[1])) // we don't care if it has, we truncated the full username
    cols.push({
      accessor: "username",
      title: t("username"),
      ...props,
      render: ({ username }) => {
        return username.localeCompare(auth?.user, "en", {
          sensitivity: "base",
        }) === 0
          ? auth?.user + ` ${t("you")}`
          : username;
      },
    });
    if (hasPermission(perm, userViewPermissionsList[2]))
      cols.push({
        accessor: "password_hash",
        title: t("password"),
        ...props,
        render: ({ password_hash }) => {
          return (
            <Tooltip
              label={password_hash}
              position="top"
              transitionProps={{ duration: 2 }}
            >
              <span>{password_hash.slice(0, 15) + "..."}</span>
            </Tooltip>
          );
        },
      });
    if (hasPermission(perm, userViewPermissionsList[3]))
      cols.push({
        accessor: "email",
        title: t("email"),
        ...props,
      });
    if (hasPermission(perm, userViewPermissionsList[4]))
      cols.push({
        accessor: "avatar",
        title: t("avatar"),
        ...props,
        render: ({ username, avatar }) => (
          <Popover width={200} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Button>{username + ` ${t("avatar_link")}`}</Button>
            </Popover.Target>
            <Popover.Dropdown>
              <Image src={avatar} fallbackSrc={APP_CONFIG.defaultAvatar} />
              <Center>
                <Anchor
                  href={avatar ? avatar : APP_CONFIG.defaultAvatar}
                  target="_blank"
                  underline="always"
                >
                  {t("avatar_link")}
                </Anchor>
              </Center>
            </Popover.Dropdown>
          </Popover>
        ),
      });
    if (hasPermission(perm, userViewPermissionsList[5]))
      cols.push({ accessor: "role", title: t("role"), ...props });
    if (hasPermission(perm, userViewPermissionsList[6]))
      cols.push({
        accessor: "permissions",
        title: t("permissions"),
        ...props,
        render: ({ permissions }) =>
          permissions.length > 0 ? (
            <Accordion>
              <Accordion.Item value={"Permissions"}>
                <Accordion.Control
                  className={(classes.label, classes.control)}
                  style={{ paddingLeft: 5, paddingRight: 5, margin: 0 }}
                >
                  {permissions.length + ` ${t("permissions")}`}
                </Accordion.Control>
                <Accordion.Panel>
                  <List type="ordered">
                    {permissions.map((perm, i) => (
                      <List.Item fz="sm" lh="xs" key={i}>
                        {perm}
                      </List.Item>
                    ))}
                  </List>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          ) : (
            "User has no permissions"
          ),
      });
    if (hasPermission(perm, userViewPermissionsList[7]))
      cols.push({
        accessor: "createdAt",
        title: t("created_at"),
        ...props,
        render: ({ createdAt }) => createdAt.split("T")[0],
      });
    if (
      hasPermission(perm, userViewPermissionsList[8]) &&
      hasPermission(perm, userViewPermissionsList[9])
    )
      cols.push({
        accessor: "userRefId",
        title: t("linked_account"),
        ...props,
        render: ({ userType, userRefId }) =>
          hasPermission(perm, employeeViewPermissionsList[0]) ||
          hasPermission(perm, employeeViewPermissionsList[1]) ||
          hasPermission(perm, employeeViewPermissionsList[2]) ||
          hasPermission(perm, employeeViewPermissionsList[3]) ||
          hasPermission(perm, employeeViewPermissionsList[4]) ||
          hasPermission(perm, employeeViewPermissionsList[5]) ||
          hasPermission(perm, employeeViewPermissionsList[6]) ||
          hasPermission(perm, employeeViewPermissionsList[7]) ||
          hasPermission(perm, employeeViewPermissionsList[8]) ||
          hasPermission(perm, employeeViewPermissionsList[9]) ? (
            <Text
              onClick={() => {
                if (userType === "EMPLOYEE") {
                  form.setValues(form.initialValues);
                  setSelectedEmpId(userRefId);
                  setOpenAfterLoad(true);
                } else {
                  setSelectedEmpId(null);
                }
              }}
              style={{
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 4,
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = "#828282";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              ta="center"
            >
              {`${
                userType == "EMPLOYEE"
                  ? t("user_type_employee")
                  : userType == "CLIENT"
                  ? t("user_type_client")
                  : t("user_type_user")
              }_${userRefId}`}
            </Text>
          ) : (
            <Text ta="center">
              {`${
                userType == "EMPLOYEE"
                  ? t("user_type_employee")
                  : userType == "CLIENT"
                  ? t("user_type_client")
                  : t("user_type_user")
              }_${userRefId}`}
            </Text>
          ),
      });
    return cols;
  };
  const key = KEY;
  const columns = buildColumns();
  const {
    effectiveColumns,
    resetColumnsWidth,
    resetColumnsOrder,
    resetColumnsToggle,
  } = useDataTableColumns({
    key,
    columns,
  });

  return (
    <Stack>
      <Center>
        <Text>{/*t("user_title")*/ "Sarcini"}</Text>
      </Center>
      <Group grow justify="space-between">
        <Button size="compact-xs" onClick={resetColumnsWidth}>
          {t("reset_width")}
        </Button>
        <Button size="compact-xs" onClick={resetColumnsOrder}>
          {t("reset_order")}
        </Button>
        <Button size="compact-xs" onClick={resetColumnsToggle}>
          {t("reset_toggle")}
        </Button>
      </Group>
      <DataTable
        height={TABLE_HEIGHT}
        maxHeight={TABLE_MAX_HEIGHT}
        withTableBorder={TABLE_BORDER}
        withColumnBorders={COLUMN_BORDER}
        verticalAlign="center"
        striped
        highlightOnHover
        storeColumnsKey={key}
        borderRadius="md"
        columns={effectiveColumns}
        loaderType="bars"
        records={records}
        totalRecords={users.backendUsers.length}
        {...(!SCROLLABLE
          ? {
              recordsPerPage: PAGE_SIZE,
              page,
              onPageChange: (p) => setPage(p),
              paginationText: ({ from, to, totalRecords }) =>
                `${t("user_title")} ${from} - ${to} ${t("of")} ${totalRecords}`,
            }
          : {
              onScrollToBottom: loadMoreRecords,
              scrollViewportRef: scrollViewportRef,
            })}
        fetching={isFetching}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        {...(PIN_LAST ? { pinLastColumn: true } : {})}
        rowColor={({ username }) => {
          if (username === auth?.user) return "violet";
          if (username === "SysOP") return "red";
        }}
      />
    </Stack>
  );
}

export default Users;
