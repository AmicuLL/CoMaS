import { useEffect, useRef, useState } from "react";
import { APP_CONFIG } from "../config/config";
import useRefreshToken from "./useRefreshToken";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { IconMessageUp } from "@tabler/icons-react";
import useAuth from "./useAuth";

const useServerSentEvent = () => {
  const lastNotificationIdRef = useRef(null);
  const [lastServerSentNotification, setLastServerSentNotification] =
    useState("not initialized");
  const eventSourceRef = useRef(null);
  const refresh = useRefreshToken();
  const { t } = useTranslation("message");
  const { auth } = useAuth();
  const initializeEventSource = async () => {
    if (!auth || Object.keys(auth).length === 0) return;
    let es;
    setLastServerSentNotification("initializedEventSource");
    try {
      es = new EventSource(APP_CONFIG.sseSubscribeUrl, {
        withCredentials: true,
      });
      if (es.readyState === 0) setLastServerSentNotification("Connecting");

      es.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (lastNotificationIdRef.current === data.id) return;

        data
          ? setLastServerSentNotification(data)
          : setLastServerSentNotification({ content: "INITIal_STATE" });
        lastNotificationIdRef.current = data.id;
        console.log(lastNotificationIdRef);
        let userPeerId = sessionStorage?.getItem("userPeerId")
          ? parseInt(sessionStorage?.getItem("userPeerId"), 10)
          : 0;
        if (
          data?.notificationType === "MESSAGE_RECEIVED" &&
          (data?.senderId !== userPeerId ||
            window.location.pathname !== "/messages")
        ) {
          const senderName =
            data?.content.match(/Sender:\s*(\S+)/)?.[1] || "Not found...";

          notifications.show({
            icon: <IconMessageUp size={20} />,
            color: "teal",
            title: t("notification.received_message_title"),
            message: `${senderName} ${t(
              "notification.received_message_content"
            )}`,
          });
        }
      };

      es.onerror = async (error) => {
        if (error?.status === 401) {
          try {
            await refresh();

            if (eventSourceRef.current) eventSourceRef.current.close();
            initializeEventSource();
          } catch (err) {
            console.error(err);
          }
        } else {
          console.error("SSE Error: ", error);
          es.close();
          setTimeout(() => {
            initializeEventSource();
          }, 995000);
        }
      };

      eventSourceRef.current = es;
    } catch (error) {
      console.error("Nu s-a putut initializa EventSource: ", error);
      setTimeout(() => {
        initializeEventSource();
      }, 995000);
    }
  };

  useEffect(() => {
    initializeEventSource();

    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    lastServerSentNotification,
  };
};

export default useServerSentEvent;
