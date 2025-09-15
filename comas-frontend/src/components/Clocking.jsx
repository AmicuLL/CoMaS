import { useEffect, useState } from "react";
import { TimeInput } from "@mantine/dates";
import { ActionIcon, Center, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconSend2, IconX } from "@tabler/icons-react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

function Clocking({ onClockAction }) {
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();
  const { t } = useTranslation("clocking");
  const [clock_in, setClockIn] = useState("08:00");
  const [clock_out, setClockOut] = useState("17:00");

  useEffect(() => {
    async function loadData() {
      const apiData = await axiosPrivate.get("/api/v1/employee", {
        signal: controller.signal,
        withCredentials: true,
      });
      //if put to disabled input, user cannot edit data.
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes(); //current time in minutes

      const work_time = apiData.data.working_hours.split("-");

      const [startHour, startMinute] = work_time[0].split(":").map(Number);
      const startMinutes = startHour * 60 + startMinute; //api start time in minutes

      setClockIn(
        currentMinutes >= startMinutes //if employee didn't clocked in before his starting hour, it will be the current time, otherwise it will be api time
          ? dayjs()
              .hour(now.getHours())
              .minute(now.getMinutes())
              .format("HH:mm")
          : work_time[0]
      );

      const [endHour, endMinute] = work_time[1].split(":").map(Number);
      const endMinutes = endHour * 60 + endMinute;
      setClockOut(
        currentMinutes >= endMinutes
          ? dayjs()
              .hour(now.getHours())
              .minute(now.getMinutes())
              .format("HH:mm")
          : work_time[1]
      );
    }
    loadData();
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const clock_in_button = (
    <ActionIcon
      variant="outline"
      color="blue"
      onClick={async () => {
        try {
          const response = await axiosPrivate.post(
            "/api/v1/timesheet/employee",
            JSON.stringify({ clock_in }),
            {
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (response.status === 201) {
            onClockAction?.();
            notifications.show({
              icon: <IconCheck size={20} />,
              color: "teal",
              title: t("notification.clock_in_success_title"),
              message: t("notification.clock_in_success_message") + clock_in,
            });
          } else {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.general_error_title"),
              message:
                t("notification.general_error_message") + response.data.message,
            });
          }
        } catch (error) {
          if (error.response.status === 409) {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.clock_in_error_title"),
              message: t("notification.clock_in_error_message"),
            });
          } else {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.general_error_title"),
              message:
                t("notification.general_error_message") +
                error.response.data.message,
            });
          }
        }
      }}
    >
      <IconSend2 size={16} stroke={1.5} />
    </ActionIcon>
  );

  const clock_out_button = (
    <ActionIcon
      variant="outline"
      color="blue"
      title={t("clock_out")}
      onClick={async () => {
        try {
          const response = await axiosPrivate.post(
            "/api/v1/timesheet/employee",
            JSON.stringify({ clock_out }),
            {
              signal: controller.signal,
              headers: { "Content-Type": "application/json" },
              withCredentials: true,
            }
          );
          if (response.status === 201) {
            onClockAction?.();
            notifications.show({
              icon: <IconCheck size={20} />,
              color: "teal",
              title: t("notification.clock_out_success_title"),
              message: t("notification.clock_out_success_message") + clock_out,
            });
          } else {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.general_error_title"),
              message:
                t("notification.general_error_message") + response.data.message,
            });
          }
        } catch (error) {
          if (error.response.status === 409) {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.clock_out_error_title"),
              message: t("notification.clock_out_error_message"),
            });
          } else if (error.response.status === 406) {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.clock_out_error_title"),
              message: t(
                "notification.clock_out_error_message_before_clock_in"
              ),
            });
          } else {
            notifications.show({
              icon: <IconX size={20} />,
              color: "red",
              title: t("notification.general_error_title"),
              message:
                t("notification.general_error_message") +
                error.response.data.message,
            });
          }
        }
      }}
    >
      <IconSend2 size={16} stroke={1.5} />
    </ActionIcon>
  );
  return (
    <>
      <Center>{t("title")}</Center>
      <Group grow wrap="nowrap">
        <TimeInput
          rightSection={clock_in_button}
          label={t("clock_in")}
          value={clock_in}
          onChange={(event) => setClockIn(event.currentTarget.value)}
        />
        <TimeInput
          rightSection={clock_out_button}
          label={t("clock_out")}
          value={clock_out}
          onChange={(event) => setClockOut(event.currentTarget.value)}
        />
      </Group>
    </>
  );
}

export default Clocking;
