import { useEffect, useState } from "react";
import {
  Drawer,
  Flex,
  Fieldset,
  ScrollArea,
  Loader,
  Text,
  ActionIcon,
  Tooltip,
  Popover,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  IconBellRinging,
  IconInfoCircle,
  IconMessage,
  IconPointerExclamation,
  IconTrash,
} from "@tabler/icons-react";
import { axiosPrivate } from "../api/axios";
import dayjs from "dayjs";

const Notification = ({ opened, onClose }) => {
  const { t } = useTranslation("notification");
  const [isFetching, setFetching] = useState(false);
  const [messageNotif, setMessageNotif] = useState([]);
  const [actionNotif, setActionNotif] = useState([]);

  async function loadNotification() {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("/api/v1/notification", {
        signal: controller.signal,
        withCredentials: true,
      });
      //setNotifications(response.data);
      if (response.status === 204) {
        setActionNotif([]);
        setMessageNotif([]);
        return;
      }
      if (response.status === 200) {
        const all = response.data;
        const sorted = [...all].sort((a, b) => b.id - a.id);
        setMessageNotif(
          sorted.filter((n) => n.notificationType === "MESSAGE_RECEIVED")
        );
        setActionNotif(
          sorted.filter((n) => n.notificationType === "ACTION_RECEIVED")
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  }

  const dismissNotification = async (id, type, notifType) => {
    try {
      await axiosPrivate.delete(
        `/api/v1/notification?notification_id=${id}&notification_type=${type}`,
        { withCredentials: true }
      );
      notifType == 0 &&
        setMessageNotif((prev) => prev.filter((notif) => notif.id !== id));
      notifType == 1 &&
        setActionNotif((prev) => prev.filter((notif) => notif.id !== id));
    } catch (error) {
      console.error("Delete notification error:", error);
    }
  };

  useEffect(() => {
    loadNotification();
  }, [opened]);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={
        <>
          <IconBellRinging
            size={34}
            style={{ verticalAlign: "middle", marginRight: 5 }}
          />
          {t("title")}
          <Popover width={200} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Tooltip label={t("info")}>
                <ActionIcon
                  variant="light"
                  color="yellow"
                  size="md"
                  style={{ verticalAlign: "middle", marginLeft: 25 }}
                >
                  <IconInfoCircle />
                </ActionIcon>
              </Tooltip>
            </Popover.Target>
            <Popover.Dropdown>
              <Text size="xs" style={{ whiteSpace: "pre-wrap" }}>
                {t("info_text")}
              </Text>
            </Popover.Dropdown>
          </Popover>
        </>
      }
      overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
      position="right"
    >
      {isFetching ? (
        <Flex h="90dvh" justify="center" align="center">
          <Loader />
        </Flex>
      ) : (
        <ScrollArea justify="center" w="100%" h="100%">
          <Flex
            w="100%"
            h="100%"
            direction="column"
            justify="center"
            align="center"
            wrap="wrap"
            gap="md"
            style={{ minHeight: "100%" }}
          >
            {actionNotif.length === 0 && messageNotif.length === 0 ? (
              <Text>{t("no_notification")}</Text>
            ) : (
              <>
                {actionNotif.length > 0 && (
                  <Fieldset
                    w="90%"
                    legend={
                      <>
                        <IconPointerExclamation
                          style={{ verticalAlign: "middle", marginRight: 5 }}
                        />{" "}
                        {t("action_field")}
                      </>
                    }
                    radius="lg"
                  >
                    {actionNotif.map((notif) => (
                      <Fieldset>
                        <Flex>
                          <Text key={notif.id}>
                            {(() => {
                              const content = notif.content;

                              if (content.includes("Project added:")) {
                                const projectName =
                                  content.match(/Project added:\s*(.+)/)?.[1] ||
                                  "UNKNOWN";
                                return `${t(
                                  "action_notif.project_added"
                                )} ${projectName}. ${t(
                                  "action_notif.project_added_timestamp"
                                )} ${dayjs(notif.timestamp).format(
                                  "DD.MM.YYYY HH:mm:ss"
                                )}`;
                              }

                              if (content.includes("Project assigned:")) {
                                const projectName =
                                  content.match(
                                    /Project assigned:\s*(.+)/
                                  )?.[1] || "UNKNOWN";
                                return `${t(
                                  "action_notif.project_assigned"
                                )} ${projectName}. ${t(
                                  "action_notif.project_assigned_timestamp"
                                )} ${dayjs(notif.timestamp).format(
                                  "DD.MM.YYYY HH:mm:ss"
                                )}`;
                              }

                              if (
                                content.includes("Project assigned as manager:")
                              ) {
                                const projectName =
                                  content.match(
                                    /Project assigned as manager:\s*(.+)/
                                  )?.[1] || "UNKNOWN";
                                return `${t(
                                  "action_notif.project_assigned_as_manager"
                                )} ${projectName}. ${t(
                                  "action_notif.project_assigned_timestamp"
                                )} ${dayjs(notif.timestamp).format(
                                  "DD.MM.YYYY HH:mm:ss"
                                )}`;
                              }
                              if (content.includes("Project deleted:")) {
                                const projectName =
                                  content.match(
                                    /Project deleted:\s*(.+)/
                                  )?.[1] || "UNKNOWN";
                                return `${t(
                                  "action_notif.project_deleted"
                                )} ${projectName}. ${t(
                                  "action_notif.project_deleted_timestamp"
                                )} ${dayjs(notif.timestamp).format(
                                  "DD.MM.YYYY HH:mm:ss"
                                )}`;
                              }

                              return "ERROR: Unrecognized notification format";
                            })()}
                          </Text>
                          <Tooltip label={t("message_tooltip.delete")}>
                            <ActionIcon
                              variant="light"
                              color="cyan"
                              size="sm"
                              onClick={() =>
                                dismissNotification(notif.id, null, 1)
                              }
                            >
                              <IconTrash />
                            </ActionIcon>
                          </Tooltip>
                        </Flex>
                      </Fieldset>
                    ))}
                  </Fieldset>
                )}

                {messageNotif.length > 0 && (
                  <Fieldset
                    w="90%"
                    legend={
                      <>
                        <IconMessage
                          style={{ verticalAlign: "middle", marginRight: 5 }}
                        />{" "}
                        {t("message_field")}
                      </>
                    }
                    radius="lg"
                  >
                    {messageNotif.map((notif) => (
                      <Fieldset>
                        <Flex>
                          <Text key={notif.id}>{`${
                            notif.content.match(/Sender:\s*(\S+)/)?.[1] ||
                            "UNKNOWN"
                          } ${t("sent_message")} ${t("sent_at")} ${dayjs(
                            notif.timestamp
                          ).format("DD.MM.YYYY HH:mm:ss")}`}</Text>
                          <Tooltip label={t("message_tooltip.delete")}>
                            <ActionIcon
                              variant="light"
                              color="cyan"
                              size="sm"
                              onClick={() =>
                                dismissNotification(notif.id, null, 0)
                              }
                            >
                              <IconTrash />
                            </ActionIcon>
                          </Tooltip>
                        </Flex>
                      </Fieldset>
                    ))}
                  </Fieldset>
                )}
              </>
            )}
          </Flex>
        </ScrollArea>
      )}
    </Drawer>
  );
};

export default Notification;
