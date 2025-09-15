//I DON'T WAMT IT ANYMORE. WHO TF TOLD ME TO DO SHITTY DB DATA RELATIONS?! WHY I WAS SO F STUPID ?!?! Listen here ... teamId_employeId like: 0_1 if is not in a team... fucking stupid
//Taticule, imi iau licenta, sanatate. Delete direct, ce mai...
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useTranslation } from "react-i18next";
import {
  Flex,
  Text,
  Container,
  Center,
  Paper,
  Grid,
  TextInput,
  Checkbox,
  NumberInput,
  Slider,
  Select,
  MultiSelect,
  Accordion,
  List,
  Fieldset,
  Button,
  ActionIcon,
} from "@mantine/core";
import Spinner from "../components/Spinner";
import { DateInput } from "@mantine/dates";
import {
  IconArrowBackUp,
  IconPencilCheck,
  IconTrash,
  IconUpload,
} from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";

function ProjectAdminPage() {
  const { t } = useTranslation("project");
  const axiosPrivate = useAxiosPrivate();
  const [isFetching, setFetching] = useState(false);
  const [projects, setProjects] = useState([]); //array of objects. Anyway, it doesn't matter this
  const [editActive, setEditActive] = useState(false);
  const [employeeNames, setEmployeeNames] = useState(); //back end returns array of objects
  const [editProject, setEditProject] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deletedTasks, setDeletedTasks] = useState({});

  const loadProjects = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("api/v1/project", {
        signal: controller.signal,
        withCredentials: true,
      });
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        setProjects(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };
  const loadEmployees = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("api/v1/employee/names", {
        signal: controller.signal,
        withCredentials: true,
      });
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        setEmployeeNames(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const updateProject = async (project_id) => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.patch(
        `api/v1/project?project_id=${project_id}`,
        {
          name: editProject?.[project_id].name,
          status: editProject?.[project_id].status,
          completion_percentage: editProject?.[project_id].completionPercentage,
          start_date: editProject?.[project_id].startDate,
          end_date: editProject?.[project_id].endDate,
          project_manager: editProject?.[project_id].projectManager,
          project_members: editProject?.[project_id].projectMembers.map(
            (id) => `0_${id}`
          ),
          budget: editProject?.[project_id].budget,
          tasks: editProject?.[project_id].tasks.map((task) => {
            return {
              task_name: task.name,
              task_detail: task.details,
              task_employees: task.employeeId,
              task_completion: task.completionPercentage,
              task_id: task.id,
            };
          }),

          client: editProject?.[project_id].client,
        },
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        setEditActive(null);
        loadProjects();
        notifications.show({
          icon: <IconPencilCheck size={20} />,
          color: "teal",
          title: t("admin.notification.project_update"),
          message: t("admin.notification.project_update_content"),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };
  const deleteProject = async (project_id) => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.delete(
        `api/v1/project?project_id=${project_id}`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        setEditActive(null);
        notifications.show({
          icon: <IconTrash size={20} />,
          color: "teal",
          title: t("admin.notification.project_update"),
          message: t("admin.notification.project_update_content"),
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    loadProjects();
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    console.log(editProject);
  }, [editProject]);

  const handleUndoDelete = (taskId, project) => {
    const taskToRestore = deletedTasks[taskId];
    if (!taskToRestore) return;

    setEditProject((prev) => {
      const currentTasks = prev?.[project.id]?.tasks || project.tasks || [];

      return {
        ...prev,
        [project.id]: {
          ...prev?.[project.id],
          tasks: [...currentTasks, taskToRestore],
        },
      };
    });
    setDeletedTasks((d) => {
      const copy = { ...d };
      delete copy[taskId];
      return copy;
    });
    setTaskToDelete((prev) => ({
      ...prev,
      [taskId]: false,
    }));
    console.log(editProject);
  };
  return (
    <Container fluid h="99%">
      <Text ta="center">{t("title")}</Text>
      <Flex h="100%" justify="center" align="center">
        {isFetching ? (
          <Spinner />
        ) : projects.length > 0 ? (
          <Flex h="100%" w="100%" direction="column">
            <Select
              label="Filter projects"
              placeholder="Filtrează după proiect"
              data={["Proiect 1", "Proiect 2"]}
            />
            <Flex justify="center">
              <Grid mt={20} w="100%" key={projects}>
                {projects?.length > 0 &&
                  projects?.map((project) => (
                    <Grid.Col span={{ base: 12, md: 6 }} key={project.id}>
                      <Paper withBorder p="md" w="100%">
                        <Flex
                          direction="column"
                          justify="center"
                          align="center"
                          gap="sm"
                        >
                          <Checkbox
                            label={t("admin.activate_edit")}
                            color="red"
                            checked={editActive?.[project.id] ?? false}
                            onChange={(event) => {
                              const isChecked = event.currentTarget.checked;
                              setEditActive({
                                [project.id]: isChecked,
                              });
                              if (isChecked && project) {
                                setEditProject(() => ({
                                  [project.id]: {
                                    client: project.client ?? "",
                                    name: project.name ?? "",
                                    startDate: project.startDate ?? "",
                                    endDate: project.endDate ?? "",
                                    projectMembers:
                                      project.projectMembers ?? "",
                                    projectManager:
                                      project.projectManager ?? "",
                                    budget: project.budget ?? "",
                                    status: project.status ?? "",
                                    completionPercentage:
                                      project.completionPercentage ?? "",
                                    tasks: project.tasks ?? [],
                                  },
                                }));
                                setTaskToDelete(null);
                              } else {
                                setEditProject((prev) => ({
                                  ...prev,
                                  [project.id]: {
                                    client: "",
                                    name: "",
                                    startDate: "",
                                    endDate: "",
                                    projectMembers: "",
                                    projectManager: "",
                                    budget: "",
                                    status: "",
                                    completionPercentage: "",
                                    tasks: [],
                                  },
                                }));
                                setTaskToDelete(null);
                              }
                            }}
                          />
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.client.name")}
                            </Text>
                            <TextInput
                              w="50%"
                              placeholder={t("admin.client.placeholder")}
                              value={
                                editProject?.[project.id]?.client ||
                                project?.client ||
                                t("admin.client.not_set")
                              }
                              onChange={(e) =>
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev,
                                    client: e.currentTarget.value,
                                  },
                                }))
                              }
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project.name")}
                            </Text>
                            <TextInput
                              w="50%"
                              placeholder={t("admin.project.placeholder")}
                              value={
                                editProject?.[project.id]?.name ||
                                project?.name ||
                                t("admin.project.not_set")
                              }
                              onChange={(e) =>
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    name: e.currentTarget.value,
                                  },
                                }))
                              }
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.start_date.title")}
                            </Text>
                            <DateInput
                              w="50%"
                              onChange={(value) => {
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    startDate: value.toISOString().slice(0, 10),
                                  },
                                }));
                              }}
                              value={
                                editProject?.[project.id]?.startDate
                                  ? new Date(
                                      editProject?.[project.id]?.startDate
                                    )
                                  : project?.startDate
                                  ? new Date(project?.startDate)
                                  : undefined
                              }
                              placeholder={t("admin.start_date.placeholder")}
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.end_date.title")}
                            </Text>
                            <DateInput
                              w="50%"
                              onChange={(value) => {
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    endDate: value.toISOString().slice(0, 10),
                                  },
                                }));
                              }}
                              value={
                                editProject?.[project.id]?.endDate
                                  ? new Date(editProject?.[project.id]?.endDate)
                                  : project?.endDate
                                  ? new Date(project?.endDate)
                                  : undefined
                              }
                              placeholder={t("admin.end_date.placeholder")}
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project_manager.title")}
                            </Text>
                            <Select
                              placeholder={t(
                                "admin.project_manager.placeholder"
                              )}
                              allowDeselect={false}
                              searchable
                              nothingFoundMessage={t("admin.no_employee")}
                              value={
                                editProject?.[project.id]?.projectManager ||
                                project?.projectManager ||
                                t("admin.project_manager.not_set")
                              }
                              data={[
                                {
                                  value: "0",
                                  label: t("admin.project_manager.not_set"),
                                },
                                ...(employeeNames?.map((employee) => ({
                                  value: String(employee.id),
                                  label: `${employee.first_name} ${employee.last_name}`,
                                })) || []),
                              ]}
                              onChange={(value) => {
                                console.log(value);
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    projectManager: value,
                                  },
                                }));
                              }}
                              w="50%"
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project_members.title")}
                            </Text>
                            <MultiSelect
                              w="50%"
                              placeholder={t(
                                "admin.project_members.placeholder"
                              )}
                              searchable
                              nothingFoundMessage={t("admin.no_employee")}
                              value={
                                (editProject?.[project.id]?.projectMembers &&
                                  editProject?.[
                                    project.id
                                  ]?.projectMembers?.map((id) => String(id))) ||
                                (project?.projectMembers &&
                                  project?.projectMembers?.map((id) =>
                                    String(id)
                                  )) || ["0"]
                              }
                              data={[
                                {
                                  value: "0",
                                  label: t("admin.project_members.not_set"),
                                },
                                ...(employeeNames?.map((employee) => ({
                                  value: String(employee.id),
                                  label: `${employee.first_name} ${employee.last_name}`,
                                })) || []),
                              ]}
                              onChange={(value) => {
                                console.log(value[0], value.length);
                                const isEmpty =
                                  !value ||
                                  (Array.isArray(value)
                                    ? value.length === 0
                                    : value.length === 0);
                                if (value[1] != "0" && value[0] == "0") {
                                  setEditProject((prev) => ({
                                    [project.id]: {
                                      ...prev?.[project.id],
                                      projectMembers: [value[1]],
                                    },
                                  }));
                                } else if (value.includes("0") || isEmpty) {
                                  setEditProject((prev) => ({
                                    [project.id]: {
                                      ...prev?.[project.id],
                                      projectMembers: ["0"],
                                    },
                                  }));
                                } else {
                                  setEditProject((prev) => ({
                                    [project.id]: {
                                      ...prev?.[project.id],
                                      projectMembers: value,
                                    },
                                  }));
                                }
                              }}
                              onBlur={() => {
                                if (
                                  !editProject?.[project.id]?.projectMembers ||
                                  editProject[project.id].projectMembers
                                    .length === 0
                                ) {
                                  setEditProject((prev) => ({
                                    [project.id]: {
                                      ...prev?.[project.id],
                                      projectMembers: ["0"],
                                    },
                                  }));
                                }
                              }}
                              acceptValueOnBlur={false}
                              readOnly={!editActive?.[project.id]}
                              mt="md"
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project_budget.title")}
                            </Text>
                            <NumberInput
                              w="50%"
                              placeholder={t(
                                "admin.project_budget.placeholder"
                              )}
                              value={
                                editProject?.[project.id]?.budget ||
                                project?.budget ||
                                0
                              }
                              onChange={(value) => {
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    budget: value,
                                  },
                                }));
                              }}
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project_completion.title")}
                            </Text>
                            <Slider
                              color="blue"
                              mb={10}
                              value={
                                editProject?.[project.id]
                                  ?.completionPercentage ||
                                project?.completionPercentage ||
                                0
                              }
                              onChange={(value) => {
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    completionPercentage: value,
                                  },
                                }));
                              }}
                              w="50%"
                              placeholder={t(
                                "admin.project_completion.placeholder"
                              )}
                              disabled={!editActive?.[project.id]}
                              marks={[
                                { value: 20, label: "20%" },
                                { value: 50, label: "50%" },
                                { value: 80, label: "80%" },
                              ]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Text w="30%" ta="right">
                              {t("admin.project_status.title")}
                            </Text>
                            <Select
                              allowDeselect={false}
                              data={[
                                {
                                  value: "PRIORITY",
                                  label: t("status.PRIORITY"),
                                },
                                {
                                  value: "NOT_SET",
                                  label: t("status.NOT_SET"),
                                },
                                {
                                  value: "INITIATED",
                                  label: t("status.INITIATED"),
                                },
                                {
                                  value: "IN_PROGRESS",
                                  label: t("status.IN_PROGRESS"),
                                },
                                {
                                  value: "FINISHED",
                                  label: t("status.FINISHED"),
                                },
                                {
                                  value: "STOPPED",
                                  label: t("status.STOPPED"),
                                },
                              ]}
                              w="50%"
                              placeholder={t(
                                "admin.project_status.placeholder"
                              )}
                              value={
                                editProject?.[project.id]?.status ||
                                project?.status ||
                                "NOT_SET"
                              }
                              onChange={(value) => {
                                setEditProject((prev) => ({
                                  [project.id]: {
                                    ...prev?.[project.id],
                                    status: value,
                                  },
                                }));
                              }}
                              readOnly={!editActive?.[project.id]}
                            />
                          </Flex>
                          <Flex
                            justify="center"
                            align="center"
                            direction="row"
                            gap="xs"
                            w="100%"
                          >
                            <Fieldset
                              legend={t("admin.project_tasks.title")}
                              w="100%"
                            >
                              <Accordion
                                disabled={!editActive?.[project.id]}
                                withBorder
                              >
                                {project.tasks.map((task) => (
                                  <Accordion.Item
                                    key={task.name}
                                    value={task.name}
                                    bg={
                                      taskToDelete?.[task.id] === true
                                        ? "red"
                                        : ""
                                    }
                                  >
                                    <Flex
                                      align="center"
                                      justify="space-between"
                                    >
                                      <Accordion.Control>
                                        {`[${task.id}] ${task.name}`}
                                      </Accordion.Control>
                                      {editActive?.[project.id] && (
                                        <ActionIcon
                                          variant="subtle"
                                          color={
                                            taskToDelete?.[task.id]
                                              ? "blue"
                                              : "red"
                                          }
                                          mr="10px"
                                          onClick={() => {
                                            setTaskToDelete((prev) => ({
                                              ...prev,
                                              [task.id]: true,
                                            })); // marchează pentru ștergere
                                            modals.openConfirmModal({
                                              title: t(
                                                "admin.project_tasks.modal_title"
                                              ),
                                              children: `${t(
                                                "admin.project_tasks.modal_content"
                                              )} "${task.name}"?`,
                                              labels: {
                                                confirm: t(
                                                  "admin.project_tasks.modal_buttons.confirm"
                                                ),
                                                cancel: t(
                                                  "admin.project_tasks.modal_buttons.cancel"
                                                ),
                                              },
                                              confirmProps: { color: "red" },
                                              onConfirm: () => {
                                                setEditProject((prev) => {
                                                  const oldTasks =
                                                    prev?.[project.id]?.tasks ||
                                                    project.tasks ||
                                                    [];
                                                  const taskToRemove =
                                                    oldTasks.find(
                                                      (t) => t.id === task.id
                                                    );
                                                  if (!taskToRemove)
                                                    return prev;

                                                  const newTasks =
                                                    oldTasks.filter(
                                                      (t) => t.id !== task.id
                                                    );

                                                  setDeletedTasks((d) => ({
                                                    ...d,
                                                    [task.id]: taskToRemove,
                                                  }));

                                                  return {
                                                    ...prev,
                                                    [project.id]: {
                                                      ...prev?.[project.id],
                                                      tasks: newTasks,
                                                    },
                                                  };
                                                });
                                                setTaskToDelete((prev) => ({
                                                  ...prev,
                                                  [task.id]: true,
                                                }));
                                              },
                                              onCancel: () => {
                                                setTaskToDelete((prev) => ({
                                                  ...prev,
                                                  [task.id]: false,
                                                }));
                                              },
                                            });
                                          }}
                                        >
                                          <IconTrash size={16} />
                                        </ActionIcon>
                                      )}
                                      {editActive?.[project.id] &&
                                        taskToDelete?.[task.id] && (
                                          <ActionIcon
                                            variant="subtle"
                                            color={
                                              taskToDelete?.[task.id] && "teal"
                                            }
                                            mr="10px"
                                            onClick={() =>
                                              handleUndoDelete(task.id, project)
                                            }
                                          >
                                            <IconArrowBackUp />
                                          </ActionIcon>
                                        )}
                                    </Flex>

                                    <Accordion.Panel>
                                      {editActive?.[project.id] ? (
                                        <>
                                          <TextInput
                                            label={t(
                                              "admin.project_tasks.name"
                                            )}
                                            placeholder={t(
                                              "admin.project_tasks.name_placeholder"
                                            )}
                                            value={
                                              editProject?.[
                                                project.id
                                              ]?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.name ??
                                              project?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.name ??
                                              t("admin.not_set")
                                            }
                                            onChange={(e) =>
                                              setEditProject((prev) => {
                                                const oldTasks =
                                                  prev?.[project.id]?.tasks ||
                                                  project.tasks ||
                                                  [];
                                                const taskIndex =
                                                  oldTasks.findIndex(
                                                    (t) => t.id === task.id
                                                  );
                                                if (taskIndex === -1)
                                                  return prev;

                                                const newTasks = [...oldTasks];
                                                newTasks[taskIndex] = {
                                                  ...newTasks[taskIndex],
                                                  name: e.currentTarget.value,
                                                };

                                                return {
                                                  ...prev,
                                                  [project.id]: {
                                                    ...prev[project.id],
                                                    tasks: newTasks,
                                                  },
                                                };
                                              })
                                            }
                                          />
                                          <TextInput
                                            label={t(
                                              "admin.project_tasks.detail"
                                            )}
                                            placeholder={t(
                                              "admin.project_tasks.detail_placeholder"
                                            )}
                                            value={
                                              editProject?.[
                                                project.id
                                              ]?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.details ??
                                              project?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.details ??
                                              t("admin.project.not_set")
                                            }
                                            onChange={(e) =>
                                              setEditProject((prev) => {
                                                const oldTasks =
                                                  prev?.[project.id]?.tasks ||
                                                  project.tasks ||
                                                  [];
                                                const taskIndex =
                                                  oldTasks.findIndex(
                                                    (t) => t.id === task.id
                                                  );
                                                if (taskIndex === -1)
                                                  return prev;

                                                const newTasks = [...oldTasks];
                                                newTasks[taskIndex] = {
                                                  ...newTasks[taskIndex],
                                                  details:
                                                    e.currentTarget.value,
                                                };

                                                return {
                                                  ...prev,
                                                  [project.id]: {
                                                    ...prev[project.id],
                                                    tasks: newTasks,
                                                  },
                                                };
                                              })
                                            }
                                          />
                                          <Slider
                                            label={t(
                                              "admin.project_tasks.completion"
                                            )}
                                            color="teal"
                                            mb={10}
                                            marks={[
                                              { value: 20, label: "20%" },
                                              { value: 50, label: "50%" },
                                              { value: 80, label: "80%" },
                                            ]}
                                            value={
                                              editProject?.[
                                                project.id
                                              ]?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.completionPercentage ??
                                              project?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.completionPercentage ??
                                              t("admin.not_set")
                                            }
                                            onChange={(value) =>
                                              setEditProject((prev) => {
                                                const oldTasks =
                                                  prev?.[project.id]?.tasks ||
                                                  project.tasks ||
                                                  [];
                                                const taskIndex =
                                                  oldTasks.findIndex(
                                                    (t) => t.id === task.id
                                                  );
                                                if (taskIndex === -1)
                                                  return prev;

                                                const newTasks = [...oldTasks];
                                                newTasks[taskIndex] = {
                                                  ...newTasks[taskIndex],
                                                  completionPercentage: value,
                                                };

                                                return {
                                                  ...prev,
                                                  [project.id]: {
                                                    ...prev[project.id],
                                                    tasks: newTasks,
                                                  },
                                                };
                                              })
                                            }
                                          />
                                          <MultiSelect
                                            placeholder={t(
                                              "admin.project_tasks.employee_placeholder"
                                            )}
                                            searchable
                                            nothingFoundMessage={t(
                                              "admin.no_employee"
                                            )}
                                            value={
                                              editProject?.[project.id]?.tasks
                                                ?.find((t) => t.id === task.id)
                                                ?.employeeId?.map(String) ||
                                              project?.tasks
                                                ?.find((t) => t.id === task.id)
                                                ?.employeeId?.map(String) || [
                                                "0",
                                              ]
                                            }
                                            data={[
                                              {
                                                value: "0",
                                                label: t(
                                                  "admin.project_members.not_set"
                                                ),
                                              },
                                              ...(employeeNames?.map(
                                                (employee) => ({
                                                  value: String(employee.id),
                                                  label: `${employee.first_name} ${employee.last_name}`,
                                                })
                                              ) || []),
                                            ]}
                                            onChange={(value) => {
                                              const isEmpty =
                                                !value ||
                                                (Array.isArray(value)
                                                  ? value.length === 0
                                                  : value.length === 0);

                                              if (
                                                value[1] !== "0" &&
                                                value[0] === "0"
                                              ) {
                                                setEditProject((prev) => {
                                                  const oldTasks =
                                                    prev?.[project.id]?.tasks ||
                                                    project.tasks ||
                                                    [];
                                                  const taskIndex =
                                                    oldTasks.findIndex(
                                                      (t) => t.id === task.id
                                                    );
                                                  if (taskIndex === -1)
                                                    return prev;

                                                  const newTasks = [
                                                    ...oldTasks,
                                                  ];
                                                  newTasks[taskIndex] = {
                                                    ...newTasks[taskIndex],
                                                    employeeId: [
                                                      Number(value[1]),
                                                    ],
                                                  };

                                                  return {
                                                    ...prev,
                                                    [project.id]: {
                                                      ...prev[project.id],
                                                      tasks: newTasks,
                                                    },
                                                  };
                                                });
                                              } else if (
                                                value.includes("0") ||
                                                isEmpty
                                              ) {
                                                setEditProject((prev) => {
                                                  const oldTasks =
                                                    prev?.[project.id]?.tasks ||
                                                    project.tasks ||
                                                    [];
                                                  const taskIndex =
                                                    oldTasks.findIndex(
                                                      (t) => t.id === task.id
                                                    );
                                                  if (taskIndex === -1)
                                                    return prev;

                                                  const newTasks = [
                                                    ...oldTasks,
                                                  ];
                                                  newTasks[taskIndex] = {
                                                    ...newTasks[taskIndex],
                                                    employeeId: ["0"],
                                                  };

                                                  return {
                                                    ...prev,
                                                    [project.id]: {
                                                      ...prev[project.id],
                                                      tasks: newTasks,
                                                    },
                                                  };
                                                });
                                              } else {
                                                setEditProject((prev) => {
                                                  const oldTasks =
                                                    prev?.[project.id]?.tasks ||
                                                    project.tasks ||
                                                    [];
                                                  const taskIndex =
                                                    oldTasks.findIndex(
                                                      (t) => t.id === task.id
                                                    );
                                                  if (taskIndex === -1)
                                                    return prev;

                                                  const newTasks = [
                                                    ...oldTasks,
                                                  ];
                                                  newTasks[taskIndex] = {
                                                    ...newTasks[taskIndex],
                                                    employeeId: value.map((v) =>
                                                      Number(v)
                                                    ),
                                                  };

                                                  return {
                                                    ...prev,
                                                    [project.id]: {
                                                      ...prev[project.id],
                                                      tasks: newTasks,
                                                    },
                                                  };
                                                });
                                              }
                                            }}
                                            onBlur={() => {
                                              if (
                                                !editProject?.[
                                                  project.id
                                                ]?.tasks?.find(
                                                  (t) => t.id === task.id
                                                )?.employeeId ||
                                                editProject[
                                                  project.id
                                                ].tasks.find(
                                                  (t) => t.id === task.id
                                                ).employeeId.length === 0
                                              ) {
                                                setEditProject((prev) => {
                                                  const oldTasks =
                                                    prev?.[project.id]?.tasks ||
                                                    project.tasks ||
                                                    [];
                                                  const taskIndex =
                                                    oldTasks.findIndex(
                                                      (t) => t.id === task.id
                                                    );
                                                  if (taskIndex === -1)
                                                    return prev;

                                                  const newTasks = [
                                                    ...oldTasks,
                                                  ];
                                                  newTasks[taskIndex] = {
                                                    ...newTasks[taskIndex],
                                                    employeeId: ["0"],
                                                  };

                                                  return {
                                                    ...prev,
                                                    [project.id]: {
                                                      ...prev[project.id],
                                                      tasks: newTasks,
                                                    },
                                                  };
                                                });
                                              }
                                            }}
                                            acceptValueOnBlur={false}
                                            readOnly={!editActive?.[project.id]}
                                            mt="md"
                                          />
                                        </>
                                      ) : (
                                        <>
                                          <Text size="md">{task.details}</Text>
                                          <Text>
                                            <List>
                                              {task.employeeId.map(
                                                (employeeId) => {
                                                  const employee =
                                                    employeeNames?.find((e) => {
                                                      return e.id == employeeId;
                                                    });

                                                  return (
                                                    <List.Item key={employeeId}>
                                                      {employee
                                                        ? `${employee.first_name} ${employee.last_name}`
                                                        : t(
                                                            "admin.no_employee"
                                                          )}
                                                    </List.Item>
                                                  );
                                                }
                                              )}
                                            </List>
                                          </Text>
                                          <Text size="sm">
                                            {t(
                                              "admin.project_tasks.completion"
                                            )}
                                            :
                                          </Text>
                                          <Slider
                                            color="teal"
                                            mb={10}
                                            label={(value) => `${value}%`}
                                            marks={[
                                              { value: 20, label: "20%" },
                                              { value: 50, label: "50%" },
                                              { value: 80, label: "80%" },
                                            ]}
                                            value={
                                              editProject?.[
                                                project.id
                                              ]?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.completionPercentage ??
                                              project?.tasks?.find(
                                                (t) => t.id === task.id
                                              )?.completionPercentage ??
                                              t("admin.not_set")
                                            }
                                          />
                                        </>
                                      )}
                                    </Accordion.Panel>
                                  </Accordion.Item>
                                ))}
                              </Accordion>
                            </Fieldset>
                          </Flex>
                          {editActive?.[project.id] && (
                            <Flex gap="sm" direction="row">
                              <Button
                                size="compact-md"
                                leftSection={<IconTrash />}
                                c="red"
                                variant="outline"
                                onClick={() => {
                                  deleteProject(project.id);
                                }}
                              >
                                {t("admin.buttons.delete_project")}
                              </Button>
                              <Button
                                size="compact-md"
                                rightSection={<IconUpload />}
                                c="teal"
                                variant="outline"
                                onClick={() => updateProject(project.id)}
                              >
                                {t("admin.buttons.modify")}
                              </Button>
                            </Flex>
                          )}
                        </Flex>
                      </Paper>
                    </Grid.Col>
                  ))}
              </Grid>
            </Flex>
          </Flex>
        ) : (
          <Center>
            <Text>{t("no_projects")}</Text>
          </Center>
        )}
      </Flex>
    </Container>
  );
}

export default ProjectAdminPage;
