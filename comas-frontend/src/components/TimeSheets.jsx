import { DataTable, useDataTableColumns } from "mantine-datatable";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Button,
  Group,
  Stack,
  Select,
  Grid,
  Center,
  Text,
} from "@mantine/core";
import { sortBy } from "lodash";
import { useTranslation } from "react-i18next";

function TimeSheets({
  DATEPICKER = true,
  EMPLOYEE_FINDER = true,
  TABLE_MAX_HEIGHT = 400,
  TABLE_HEIGHT = "70dvh",
  TABLE_BORDER = true,
  COLUMN_BORDER = true,
  PIN_LAST = false,
  PAGE_SIZE = 100,
  KEY = "default",
}) {
  const [timesheets, setTimesheets] = useState({});
  const [employees, setEmployees] = useState([{ value: "", label: "" }]);
  const [duration, setDuration] = useState(null);
  const [employee_id, setEmployeeId] = useState(null);
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();
  const [isFetching, setFetching] = useState(true);
  const { t } = useTranslation("timesheet");
  const [page, setPage] = useState(1);

  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "date",
    direction: "desc",
  });
  const [records, setRecords] = useState();
  const data = useMemo(() => {
    const sorted = sortBy(timesheets, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [timesheets, sortStatus]);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(data.slice(from, to));
  }, [data, page, PAGE_SIZE]);

  const props = {
    resizable: true,
    sortable: true,
    toggleable: true,
    draggable: true,
  };

  useEffect(() => {
    async function loadTimeSheets() {
      try {
        const timesheetData = await axiosPrivate.post(
          "/api/v1/timesheet",
          {
            duration: duration ? duration : null,
            employee_id: employee_id ? employee_id : null,
          },
          {
            signal: controller.signal,
            withCredentials: true,
          }
        );
        if (timesheetData.status === 200) {
          resetColumnsOrder();
          if (timesheetData.data[0]?.employee_name) {
            const apiResponse = await axiosPrivate.get(
              "/api/v1/employee/names",
              {
                signal: controller.signal,
                withCredentials: true,
              }
            );

            const mappedEmployees = apiResponse?.data.map((emp) => ({
              value: emp.id,
              label: `${emp.first_name} ${emp.last_name}`,
            }));

            setEmployees(mappedEmployees);
          }
          setFetching(false);
          setTimesheets(timesheetData.data);
        }
      } catch (error) {
        if (error.status == 404) {
          setRecords([]);
          setFetching(false);
        }
      }
    }

    loadTimeSheets();
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, employee_id]);

  const buildColumns = () => {
    const cols = [];
    if (timesheets[0]?.id) {
      cols.push({
        accessor: "id",
        title: "#id",
        textAlign: "right",
        ...props,
      });
    }
    if (timesheets[0]?.employee_name) {
      cols.push({
        accessor: "employee_name",
        title: t("employee"),
        ...props,
      });
    }
    cols.push({
      accessor: "date",
      title: t("day"),
      ...props,
    });
    cols.push({
      accessor: "clock_in",
      title: t("clock_in"),
      ...props,
    });
    cols.push({
      accessor: "clock_out",
      title: t("clock_out"),
      ...props,
    });
    cols.push({
      accessor: "penalization",
      title: t("penalization"),
      ...props,
    });
    cols.push({
      accessor: "work_time",
      title: t("work_time"),
      ...props,
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
        <Text>{t("timesheet_title")}</Text>
      </Center>
      {DATEPICKER && EMPLOYEE_FINDER && (
        <Grid gutter="sm">
          {DATEPICKER && (
            <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
              <DatePickerInput
                type="range"
                allowSingleDateInRange
                clearable
                label={t("duration")}
                placeholder={t("duration_placeholder")}
                w="100%"
                onChange={(value) => {
                  if (!value) {
                    setDuration(null);
                    return;
                  }

                  const formatted = `${dayjs(value[0]).format(
                    "YYYY-MM-DD"
                  )}_${dayjs(value[1]).format("YYYY-MM-DD")}`;
                  if (value[0] && value[1]) setDuration(formatted);
                  else if (!value[0] && !value[1]) setDuration(null);
                }}
              />
            </Grid.Col>
          )}
          {timesheets[0]?.employee_name && EMPLOYEE_FINDER && (
            <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
              <Select
                label={t("employee")}
                placeholder={t("employee_placeholder")}
                clearable
                limit={5}
                data={[
                  { value: "", label: t("employee_dont_sort") },
                  ...employees,
                ]}
                onChange={(value) => {
                  value == ""
                    ? setEmployeeId(null)
                    : (setEmployeeId(value), setPage(1));
                }}
                value={employee_id ?? null}
                searchable
                w="100%"
              />
            </Grid.Col>
          )}
        </Grid>
      )}
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
        verticalAlign="top"
        striped
        highlightOnHover
        storeColumnsKey={key}
        borderRadius="md"
        columns={effectiveColumns}
        loaderType="bars"
        records={records}
        totalRecords={timesheets.length}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        paginationText={({ from, to, totalRecords }) =>
          `${t("timesheet_title")} ${from} - ${to} ${t("of")} ${totalRecords}`
        }
        fetching={isFetching}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        {...(PIN_LAST ? { pinLastColumn: true } : {})}
        rowColor={(record) => {
          const day = new Date(record.date).getDay();
          return day === 0 || day === 6 ? "red" : "";
        }}
      />
    </Stack>
  );
}

export default TimeSheets;
