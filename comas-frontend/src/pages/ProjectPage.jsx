import {
  Accordion,
  ActionIcon,
  Center,
  Container,
  Fieldset,
  Flex,
  Grid,
  Group,
  Loader,
  NumberFormatter,
  Paper,
  Popover,
  Progress,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { DateInput } from "@mantine/dates";
import { IconInfoCircle } from "@tabler/icons-react";

function ProjectPage() {
  const { t } = useTranslation("project");
  const axiosPrivate = useAxiosPrivate();
  const [isFetching, setFetching] = useState(false);
  const [projects, setProjects] = useState({});

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
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Container fluid h="100%">
      <Center>
        <Text>{t("title")}</Text>
      </Center>
      <Flex h="100%" justify="center" align="center">
        {isFetching ? (
          <Loader />
        ) : projects.length > 0 ? (
          <Flex w="100%" h="100%">
            <Grid mt={20} grow justify="center" align="center" miw="100%">
              {projects.map((project) => (
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Fieldset legend={`Id:${project.id} | ${project.name}`}>
                    <Flex
                      gap="xl"
                      justify="center"
                      align="center"
                      direction="row"
                      wrap="wrap"
                    >
                      <Text>{`Client: ${
                        project?.client != ""
                          ? project.client
                          : t("lack_client")
                      }`}</Text>
                      <Group>
                        <Text>{`${t("budget")}:`}</Text>
                        <NumberFormatter
                          value={project.budget}
                          suffix=" €"
                          thousandSeparator="."
                          decimalSeparator=","
                        />
                      </Group>
                    </Flex>
                    <Grid mt={20}>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Flex
                          direction={{ base: "row", md: "column" }}
                          justify="center"
                          gap="md"
                        >
                          <DateInput
                            value={
                              project?.startDate
                                ? new Date(project.startDate)
                                : undefined
                            }
                            label={t("start_date")}
                            placeholder={t("start_date")}
                            readOnly
                          />
                          <DateInput
                            value={
                              project?.startDate
                                ? new Date(project.endDate)
                                : undefined
                            }
                            label={t("end_date")}
                            placeholder={t("end_date")}
                            readOnly
                          />
                        </Flex>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack justify="center">
                          <Text ta="center">
                            {`${t("status.title")}:
                              ${t(`status.${project.status.toUpperCase()}`)}
                              `}
                          </Text>
                          <Stack gap={0}>
                            <Text>{t("completion_percentage")}:</Text>
                            <Progress.Root size="xl">
                              <Progress.Section
                                value={project?.completionPercentage}
                                color="cyan"
                              >
                                <Progress.Label>
                                  {`${project?.completionPercentage}%`}
                                </Progress.Label>
                              </Progress.Section>
                            </Progress.Root>
                          </Stack>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                    <Grid>
                      {project?.projectMembers?.length > 0 && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Fieldset legend={t("project_employees")}>
                            {project.employees
                              .filter((employee) =>
                                project.projectMembers.includes(employee.id)
                              )
                              .sort((a, b) => {
                                const managerId = parseInt(
                                  project.projectManager,
                                  10
                                );
                                if (a.id === managerId) return -1;
                                if (b.id === managerId) return 1;
                                return 0;
                              })
                              .map((employee) => (
                                <Paper
                                  key={employee.id}
                                  shadow="xs"
                                  withBorder
                                  p="xs"
                                >
                                  <Flex direction="row" justify="space-between">
                                    <Text
                                      c={
                                        employee.id ===
                                        parseInt(project.projectManager, 10)
                                          ? "red"
                                          : ""
                                      }
                                    >
                                      {`${employee.firstName} ${employee.lastName}`}
                                    </Text>

                                    <Popover
                                      width={200}
                                      position="bottom"
                                      withArrow
                                      shadow="md"
                                    >
                                      <Popover.Target>
                                        <Tooltip
                                          label={
                                            <Text ta="center">
                                              {employee.id ===
                                                parseInt(
                                                  project.projectManager,
                                                  10
                                                ) && (
                                                <>
                                                  {t(
                                                    "tooltips.project_employee_manager"
                                                  )}
                                                  <br />
                                                </>
                                              )}
                                              {t(
                                                "tooltips.project_employee_info"
                                              )}
                                            </Text>
                                          }
                                        >
                                          <ActionIcon variant="light">
                                            <IconInfoCircle />
                                          </ActionIcon>
                                        </Tooltip>
                                      </Popover.Target>
                                      <Popover.Dropdown
                                        style={{ pointerEvents: "none" }}
                                      >
                                        {employee.id ===
                                          parseInt(
                                            project.projectManager,
                                            10
                                          ) && (
                                          <Text ta="center">
                                            {t("employee_project_manager")}
                                          </Text>
                                        )}
                                        <Text size="xs">{`Email: ${employee.email}`}</Text>
                                        <Text size="xs">{`Phone: ${employee.phone}`}</Text>
                                      </Popover.Dropdown>
                                    </Popover>
                                  </Flex>
                                </Paper>
                              ))}
                          </Fieldset>
                        </Grid.Col>
                      )}
                      {project?.tasks.length > 0 && (
                        <Grid.Col span={{ base: 12, md: 6 }}>
                          <Fieldset mt="sm" legend={t("task")}>
                            <Accordion variant="separated" defaultValue="None">
                              {project?.tasks.map((task) => (
                                <Accordion.Item
                                  key={task?.id}
                                  value={task?.name}
                                >
                                  <Accordion.Control>
                                    <>
                                      {task?.name}
                                      <Progress.Root size="xl">
                                        <Progress.Section
                                          value={task?.completionPercentage}
                                          color="cyan"
                                        >
                                          <Progress.Label>
                                            {`${
                                              task?.completionPercentage
                                            }% ${t("completion_percentage")}`}
                                          </Progress.Label>
                                        </Progress.Section>
                                      </Progress.Root>
                                    </>
                                  </Accordion.Control>
                                  <Accordion.Panel>
                                    <Paper p="sm" withBorder>
                                      <Text ta="center">
                                        {t("task_employee")}
                                      </Text>
                                      {project.employees
                                        .filter((emp) =>
                                          task.employeeId.includes(emp.id)
                                        )
                                        .map((emp) => (
                                          <Text c="blue" fw={500} key={emp.id}>
                                            {emp.firstName} {emp.lastName}
                                          </Text>
                                        ))}
                                    </Paper>
                                    <Paper
                                      withBorder
                                      p="sm"
                                      style={{
                                        width: "100%",
                                        maxWidth: "200",
                                        overflowWrap: "break-word",
                                        wordBreak: "break-all",
                                      }}
                                    >
                                      <Text
                                        style={{
                                          whiteSpace: "pre-wrap",
                                          overflowWrap: "break-word",
                                          wordBreak: "break-all",
                                        }}
                                      >
                                        {task?.details}
                                      </Text>
                                    </Paper>
                                  </Accordion.Panel>
                                </Accordion.Item>
                              ))}
                            </Accordion>
                          </Fieldset>
                        </Grid.Col>
                      )}
                    </Grid>
                  </Fieldset>
                </Grid.Col>
              ))}
            </Grid>
          </Flex>
        ) : (
          <Flex h="100%" justify="center" align="center">
            <Text>{t("no_projects")}</Text>
          </Flex>
        )}
      </Flex>
    </Container>
  );
}

export default ProjectPage;
