import {
  Accordion,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Modal,
  Select,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { DateInput, TimeInput } from "@mantine/dates";

function EmployeeModal({
  opened,
  setOpened,
  employeeAux,
  t,
  type,
  axiosPrivate,
}) {
  const [employee, setEmployee] = useState();
  useEffect(() => {
    if (opened) setEmployee(employeeAux);
  }, [opened, employeeAux]);

  const checkData = () =>
    !(
      employee?.firstName?.trim().length > 1 &&
      employee?.lastName?.trim().length > 1 &&
      employee?.position &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        employee?.email
      ) &&
      /^(\+4)?0\d{9}$/.test(employee?.phone)
    );

  const deleteEmployee = async (employee) => {
    const controller = new AbortController();
    try {
      const response = await axiosPrivate.delete(
        `api/v1/employee?employee_id=${employee.id}`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateEmployee = async () => {
    const controller = new AbortController();
    try {
      const response = await axiosPrivate.patch(
        `api/v1/employee?employee_id=${employee.id}`,
        employee,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addEmployee = async () => {
    const controller = new AbortController();
    try {
      const response = await axiosPrivate.post(
        `api/v1/employee/add`,
        employee,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={t(`modal.type.${type}`)}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      {type === "delete" ? (
        <>
          <Text>{`${t("modal.confirm_delete")} ${employee?.firstName} ${
            employee?.lastName
          }?`}</Text>
          <Group mt="md" position="apart">
            <Button variant="default" onClick={() => setOpened(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button
              color="red"
              onClick={() => {
                deleteEmployee(employee);
                setOpened(false);
              }}
            >
              {t("buttons.confirm")}
            </Button>
          </Group>
        </>
      ) : (
        <Flex gap="xs" justify="center" align="center" direction="column">
          <TextInput
            label={t("employee.last_name")}
            withAsterisk
            value={employee?.lastName || ""}
            onChange={(value) => {
              const newValue = value.currentTarget.value;
              setEmployee((prev) => ({
                ...prev,
                lastName: newValue,
              }));
            }}
          />
          <TextInput
            label={t("employee.first_name")}
            withAsterisk
            value={employee?.firstName || ""}
            onChange={(value) => {
              const newValue = value.currentTarget.value;
              setEmployee((prev) => ({
                ...prev,
                firstName: newValue,
              }));
            }}
          />
          <TextInput
            label={t("employee.position")}
            withAsterisk
            value={employee?.position || ""}
            onChange={(value) => {
              const newValue = value.currentTarget.value;
              setEmployee((prev) => ({
                ...prev,
                position: newValue,
              }));
            }}
            onBlur={() => {
              if (!employee?.position || employee.position.trim() === "") {
                setEmployee((prev) => ({
                  ...prev,
                  position: "Angajat",
                }));
              }
            }}
          />
          <TextInput
            label={t("employee.email")}
            error={
              !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                employee?.email
              )
                ? t("error.email")
                : false
            }
            withAsterisk
            value={employee?.email || ""}
            onChange={(value) => {
              const newValue = value.currentTarget.value;
              setEmployee((prev) => ({
                ...prev,
                email: newValue,
              }));
            }}
          />
          <TextInput
            label={t("employee.phone")}
            error={
              !/^(\+4)?0\d{9}$/.test(employee?.phone) ? t("error.phone") : false
            }
            withAsterisk
            defaultValue="07"
            value={employee?.phone}
            onChange={(value) => {
              const newValue = value.currentTarget.value;
              setEmployee((prev) => ({
                ...prev,
                phone: newValue,
              }));
            }}
          />
          <DateInput
            value={
              employee?.hireDate
                ? new Date(employee?.hireDate)
                : setEmployee((prev) => ({
                    ...prev,
                    hireDate: new Date(),
                  }))
            }
            withAsterisk
            onChange={(value) =>
              setEmployee((prev) => ({
                ...prev,
                hireDate: value,
              }))
            }
            label={t("employee.hire_date")}
          />
          <Flex align="center" justify="center" direction="column" gap={0}>
            <Text>{t("employee.working_hours")}:</Text>
            <Group>
              <TimeInput
                withAsterisk
                label={t("employee.start_hour")}
                value={
                  employee?.working_hours?.split("-")[0] ||
                  setEmployee((prev) => ({
                    ...prev,
                    working_hours: "08:00-17:00",
                  }))
                }
                onChange={(value) =>
                  setEmployee((prev) => ({
                    ...prev,
                    working_hours:
                      value?.currentTarget?.value +
                      "-" +
                      employee?.working_hours?.split("-")[1],
                  }))
                }
              />
              <TimeInput
                withAsterisk
                label={t("employee.end_hour")}
                value={
                  employee?.working_hours?.split("-")[1] ||
                  setEmployee((prev) => ({
                    ...prev,
                    working_hours:
                      employee?.working_hours?.split("-")[0] ||
                      "08:00" + "-17:00",
                  }))
                }
                onChange={(value) =>
                  setEmployee((prev) => ({
                    ...prev,
                    working_hours:
                      employee?.working_hours?.split("-")[0] +
                      "-" +
                      value?.currentTarget?.value,
                  }))
                }
              />
            </Group>
          </Flex>
          <TimeInput
            withAsterisk
            label={t("employee.break_time")}
            value={
              employee?.break_time?.slice(0, -3) ||
              setEmployee((prev) => ({
                ...prev,
                break_time: "01:00:00",
              }))
            }
            onChange={(value) =>
              setEmployee((prev) => ({
                ...prev,
                break_time: value?.currentTarget?.value + ":00",
              }))
            }
          />
          <Group>
            <Button
              variant="filled"
              color="teal"
              disabled={checkData()}
              onClick={() => {
                type === "add" && addEmployee();
                type === "edit" && updateEmployee();
              }}
            >
              {type === "add" && t("buttons.add")}
              {type === "edit" && t("buttons.edit")}
            </Button>
            <Button
              onClick={() => setOpened(false)}
              variant="light"
              color="pink"
            >
              {t("buttons.cancel")}
            </Button>
          </Group>
        </Flex>
      )}
    </Modal>
  );
}

function EmployeeAdminPage() {
  const { t } = useTranslation("employee");
  const axiosPrivate = useAxiosPrivate();
  const [isFetching, setFetching] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchedEmployee, setSearchEmployee] = useState("");
  const [employeeAux, setEmployeeAux] = useState({});
  const [modalOpened, setModalOpened] = useState(false);
  const [modalType, setModalType] = useState("add");

  const loadEmployees = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("api/v1/employee/all", {
        signal: controller.signal,
        withCredentials: true,
      });
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        //sortare dupa numele de familie, dupa sorteaza dupa prenume
        const sortedData = [...response.data].sort(
          (a, b) =>
            a.lastName.localeCompare(b.lastName, "ro", {
              sensitivity: "base",
            }) ||
            a.firstName.localeCompare(b.firstName, "ro", {
              sensitivity: "base",
            })
        );
        setEmployees(sortedData);
        setFilteredEmployees(sortedData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const employeeOptions = filteredEmployees.map((employee) => ({
    value: String(employee.id),
    label: `${employee?.lastName} ${employee?.firstName} [${employee?.email}, ${employee?.phone}]`,
  }));

  useEffect(() => {
    loadEmployees();
  }, []);

  return (
    <>
      <Container fluid h="99%">
        <Text ta="center">{t("title")}</Text>
        <Flex h="100%" justify="center" align="center">
          {isFetching ? (
            <Spinner />
          ) : employees.length > 0 ? (
            <Flex h="100%" w="100%" direction="column">
              <Flex
                w="100%"
                gap="md"
                justify="center"
                align="center"
                direction="row"
                wrap="wrap"
                mb="20"
              >
                <Select
                  w="40%"
                  label={t("filter.title")}
                  clearable
                  searchable
                  defaultValue=""
                  value={searchedEmployee}
                  data={[
                    { value: "", label: t("filter.placeholder") },
                    ...employeeOptions,
                  ]}
                  onChange={(value) => {
                    console.log(filteredEmployees);
                    setSearchEmployee(value);
                    if (!value || value === "") {
                      setFilteredEmployees(employees);
                      return;
                    }
                    const filtered = filteredEmployees.filter(
                      (employee) => employee.id === Number(value)
                    );
                    setFilteredEmployees(filtered);
                  }}
                />
                <Button
                  variant="filled"
                  color="cyan"
                  size="md"
                  radius="md"
                  onClick={() => {
                    setEmployeeAux({});
                    setModalType("add");
                    setModalOpened(true);
                  }}
                >
                  {t("buttons.add")}
                </Button>
              </Flex>
              {filteredEmployees.length > 1
                ? filteredEmployees.map((employee) => {
                    console.log(employee.id);
                    return (
                      <Accordion
                        withBorder
                        key={employee?.euuid + 1}
                        variant="contained"
                      >
                        <Accordion.Item
                          value={employee?.euuid}
                          key={employee?.id}
                        >
                          <Accordion.Control>
                            {`${employee.lastName} ${employee.firstName}`}
                          </Accordion.Control>
                          <Accordion.Panel>
                            <Grid>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.id}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                  wrap="nowrap"
                                >
                                  <Text>{t("employee.id")}:</Text>
                                  <TextInput w="60%" value={employee.id} />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.firstName}
                                w="100%"
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text wrap="nowrap">
                                    {t("employee.first_name")}:
                                  </Text>
                                  <TextInput
                                    w="60%"
                                    value={employee.firstName}
                                  />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.lastName}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.last_name")}:</Text>
                                  <TextInput
                                    w="60%"
                                    value={employee.lastName}
                                  />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.phone}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.phone")}:</Text>
                                  <TextInput w="60%" value={employee.phone} />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.email}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.email")}:</Text>
                                  <TextInput w="60%" value={employee.email} />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.hireDate}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.hire_date")}:</Text>
                                  <TextInput
                                    w="60%"
                                    value={employee.hireDate}
                                  />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.working_hours}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.working_hours")}:</Text>
                                  <TextInput
                                    w="60%"
                                    value={employee.working_hours}
                                  />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.break_time}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.break_time")}:</Text>
                                  <TextInput
                                    w="60%"
                                    value={employee.break_time.slice(0, -3)}
                                  />
                                </Flex>
                              </Grid.Col>
                              <Grid.Col
                                span={{ base: 12, md: 6, xl: 4 }}
                                key={employee.euuid}
                              >
                                <Flex
                                  direction="row"
                                  w="100%"
                                  align="center"
                                  gap="md"
                                  justify="center"
                                >
                                  <Text>{t("employee.euuid")}:</Text>
                                  <TextInput w="60%" value={employee.euuid} />
                                </Flex>
                              </Grid.Col>
                            </Grid>
                            <Flex
                              mt="20"
                              gap="lg"
                              justify="center"
                              align="center"
                              direction="row"
                              wrap="wrap"
                            >
                              <Button
                                variant="outline"
                                color="red"
                                onClick={() => {
                                  setEmployeeAux(employee);
                                  setModalType("delete");
                                  setModalOpened(true);
                                }}
                              >
                                {t("buttons.delete")}
                              </Button>
                              <Button
                                variant="light"
                                color="orange"
                                onClick={() => {
                                  setEmployeeAux(employee);
                                  setModalType("edit");
                                  setModalOpened(true);
                                }}
                              >
                                {t("buttons.edit")}
                              </Button>
                            </Flex>
                          </Accordion.Panel>
                        </Accordion.Item>
                      </Accordion>
                    );
                  })
                : "nu"}
            </Flex>
          ) : (
            <Center>
              <Text>{t("no_employees")}</Text>
            </Center>
          )}
        </Flex>
      </Container>
      <EmployeeModal
        opened={modalOpened}
        setOpened={setModalOpened}
        employeeAux={employeeAux}
        t={t}
        axiosPrivate={axiosPrivate}
        type={modalType}
      />
    </>
  );
}

export default EmployeeAdminPage;
