import React, { useCallback, useEffect, useRef, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import {
  Button,
  Group,
  Stack,
  Center,
  Text,
  ScrollArea,
  Blockquote,
  Container,
  Grid,
  Avatar,
  useMantineTheme,
  Select,
  Divider,
  Textarea,
  Space,
  Popover,
  Transition,
  Paper,
  Loader,
  HoverCard,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import useAuth from "../hooks/useAuth";
import dayjs from "dayjs";
import { useMediaQuery, useScrollIntoView } from "@mantine/hooks";
import {
  IconArrowDown,
  IconMessageCircle,
  IconMessageCirclePlus,
  IconSend,
} from "@tabler/icons-react";
import useServerSentEvent from "../hooks/useServerSentEvent";

function MessagesPage() {
  const { auth } = useAuth();
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const batchSize = 10;
  const [lastMessageId, setLastMessageId] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setFetching] = useState(true);
  const [sendFetching, setSendFetching] = useState(false);
  const { lastServerSentNotification } = useServerSentEvent();
  const [updateConversation, setUpdateConversation] = useState(null);
  const [userPeerId, setUserPeerId] = useState(
    sessionStorage?.getItem("userPeerId")
      ? parseInt(sessionStorage?.getItem("userPeerId"), 10)
      : 0
  );
  const theme = useMantineTheme();
  const { scrollableRef } = useScrollIntoView({
    threshold: 1,
    triggerOnce: true,
  });
  const [showButton, setShowButton] = useState(false);
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.md})`);
  const scrollPositionRef = useRef(0);
  const axiosPrivate = useAxiosPrivate();
  const { t } = useTranslation("message");

  const sendMessage = async (content) => {
    if (!content.trim()) return;
    const controller = new AbortController();
    setSendFetching(true);

    try {
      const response = await axiosPrivate.post(
        userPeerId === 0
          ? "/api/v1/messages"
          : `/api/v1/messages?receiver_id=${userPeerId}`,
        { content },
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setMessage("");
        setMessages((prev) => [...prev, ...response.data]);
        requestAnimationFrame(() => scrollBottom("always"));
        if (
          userPeerId !== 0 &&
          users.find((user) => user.id === userPeerId).hasConversation ===
            "false"
        ) {
          await loadSenders();
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSendFetching(false);
    }
  };
  useEffect(() => {
    if (
      updateConversation != true &&
      lastServerSentNotification?.notificationType === "MESSAGE_RECEIVED" &&
      lastServerSentNotification?.senderId == parseInt(userPeerId, 10)
    ) {
      setLastMessageId(
        parseInt(
          lastServerSentNotification?.content.match(/Message id:\s*(\d+)/)[1],
          10
        ) + 1
      );
      setUpdateConversation(true);
    }
    return;
  }, [lastServerSentNotification]);

  async function loadSenders() {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("/api/v1/messages/senders", {
        signal: controller.signal,
        withCredentials: true,
      });

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  }

  const loadMessages = useCallback(async () => {
    if (!updateConversation && (isFetching || !hasMore)) return;
    setFetching(true);
    const controller = new AbortController();

    try {
      const response = await axiosPrivate.get(
        userPeerId == 0
          ? `/api/v1/messages?batch_size=${batchSize}&last_id=${
              lastMessageId ? lastMessageId : ""
            }`
          : `/api/v1/messages?sender_id=${userPeerId}&batch_size=${batchSize}&last_id=${
              lastMessageId ? lastMessageId : ""
            }`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );

      const newMessages = response.data;
      if (newMessages.length < batchSize) setHasMore(false);

      const viewport = scrollableRef.current;
      let prevHeight;

      if (updateConversation && viewport) {
        prevHeight = viewport.scrollHeight;
      }

      setMessages((prev) => [...newMessages, ...prev]);
      setLastMessageId(newMessages[0]?.id);

      requestAnimationFrame(() => {
        if (updateConversation && viewport) {
          const addedHeight = viewport.scrollHeight - prevHeight;
          viewport.scrollTop += addedHeight;
        } else if (messages.length === 0) {
          scrollBottom("always");
        }
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        setHasMore(false);
      }
    } finally {
      setFetching(false);
      setUpdateConversation(false);
    }
  });

  useEffect(() => {
    loadSenders();
    scrollBottom("always");
  }, []);

  useEffect(() => {
    const fetchAndScroll = async () => {
      if (messages.length === 0) {
        await loadMessages();
        requestAnimationFrame(() => {
          scrollBottom("always");
        });
      } else if (updateConversation) {
        await loadMessages();
      }
    };

    fetchAndScroll();
  }, [loadMessages, updateConversation]);

  useEffect(() => {
    sessionStorage.setItem("userPeerId", userPeerId);
  }, [userPeerId]);

  useEffect(() => {
    const viewport = scrollableRef.current;
    if (!viewport) return;
    const handleScroll = () => {
      const isNearBottom =
        Math.abs(
          viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
        ) < 300;
      if (!isNearBottom) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
      if (viewport.scrollTop < 300 && hasMore) {
        scrollPositionRef.current = viewport.scrollHeight - viewport.scrollTop;
        messages.length >= 0 && setUpdateConversation(true);
      }
    };
    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [scrollableRef, hasMore]);

  const scrollBottom = (param) => {
    if (scrollableRef.current) {
      const viewport = scrollableRef.current;
      if (param === "always") {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  };

  const handleChangeConversation = (id) => {
    setMessages([]);
    setLastMessageId(0);
    setHasMore(true);
    setFetching(false);
    setUserPeerId(id);
  };

  return (
    <Container
      fluid
      style={{
        height: "85dvh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Center>
        <Text>{t("title")}</Text>
        {userPeerId != 0 ? (
          <>
            <Space w="md" />
            <HoverCard shadow="md" radius="xl" openDelay={1000}>
              <HoverCard.Target>
                <Avatar
                  src={users.find((user) => user.id == userPeerId)?.avatar}
                  size={24}
                />
              </HoverCard.Target>
              <HoverCard.Dropdown bg="var(--mantine-color-violet-light)">
                <Avatar
                  src={users.find((user) => user.id == userPeerId)?.avatar}
                  size={160}
                />
                <Center>
                  <Text size="lg">
                    {users.find((user) => user.id == userPeerId)?.username}
                  </Text>
                </Center>
              </HoverCard.Dropdown>
            </HoverCard>
            <Space w="xs" />
            <Text size="md">
              {users.find((user) => user.id == userPeerId)?.username}
            </Text>
          </>
        ) : (
          <>
            <Space w="sm" />
            <Text> {t("all_messages")}</Text>
          </>
        )}
      </Center>
      <Divider my="md" />
      <Grid>
        <Grid.Col span={{ base: 12, md: "content" }}>
          {isMobile ? (
            <Select
              label={t("select_conversation")}
              value={userPeerId != null ? String(userPeerId) : "0"}
              allowDeselect={false}
              withCheckIcon={false}
              searchable
              onChange={(value) => {
                if (value === "0") {
                  handleChangeConversation(0);
                } else {
                  const selectedUser = users.find((user) => user.id === value);
                  if (selectedUser) {
                    handleChangeConversation(selectedUser.id);
                  }
                }
              }}
              data={[
                {
                  value: "0",
                  label: t("all_messages"),
                  avatar: <IconMessageCircle size={30} />,
                },
                ...users.map((user) => ({
                  value: user.id,
                  label: user.username,
                  avatar: <Avatar src={user.avatar} size={30} />,
                })),
              ]}
              renderOption={(item) => {
                return (
                  <Group
                    gap="sm"
                    style={{
                      width: "100%",
                      backgroundColor:
                        item.option.value ===
                        (userPeerId === 0 ? "0" : userPeerId)
                          ? "teal"
                          : "transparent",
                      padding: "5px",
                      borderRadius: "5px",
                    }}
                  >
                    {item.option?.avatar}
                    <Text size="sm">{item.option.label}</Text>
                  </Group>
                );
              }}
            />
          ) : (
            <ScrollArea
              style={{ width: "100%", height: isMobile ? "60dvh" : "70dvh" }}
            >
              <Stack>
                <Button
                  onClick={() => {
                    if (userPeerId === 0 || userPeerId === "0") return;
                    handleChangeConversation(0);
                  }}
                  leftSection={<IconMessageCircle size={30} />}
                >
                  {t("all_messages")}
                </Button>
                <Popover width={300} position="right" offset={10}>
                  <Popover.Target>
                    <Button leftSection={<IconMessageCirclePlus size={30} />}>
                      {t("new_message")}
                    </Button>
                  </Popover.Target>
                  <Popover.Dropdown>
                    <Select
                      label={t("send_new_message_to")}
                      placeholder={t("new_message")}
                      allowDeselect={false}
                      withCheckIcon={false}
                      searchable
                      onChange={(value) => {
                        if (value === "0" && 0 !== userPeerId) {
                          handleChangeConversation(0);
                        } else {
                          const selectedUser = users.find(
                            (user) => user.id === value
                          );
                          if (selectedUser && selectedUser.id !== userPeerId) {
                            handleChangeConversation(selectedUser.id);
                          }
                        }
                      }}
                      data={[
                        {
                          value: "0",
                          label: t("send_new_message_to_all"),
                          avatar: <IconMessageCircle size={30} />,
                        },
                        ...users.map((user) => ({
                          value: user.id,
                          label: user.username,
                          avatar: <Avatar src={user.avatar} size={30} />,
                        })),
                      ]}
                      renderOption={(item) => {
                        return (
                          <Group
                            gap="sm"
                            style={{
                              width: "100%",
                              padding: "5px",
                              borderRadius: "5px",
                            }}
                          >
                            {item.option?.avatar}
                            <Text size="sm">{item.option.label}</Text>
                          </Group>
                        );
                      }}
                    />
                  </Popover.Dropdown>
                </Popover>
                {users?.length > 0 &&
                  users?.map(
                    (user) =>
                      user.hasConversation === "true" && (
                        <Button
                          onClick={() => {
                            if (
                              user?.id === userPeerId ||
                              parseInt(user?.id, 10) === userPeerId
                            )
                              return;
                            handleChangeConversation(user?.id);
                          }}
                          leftSection={<Avatar size={30} src={user?.avatar} />}
                        >
                          {user?.username}
                        </Button>
                      )
                  )}
              </Stack>
            </ScrollArea>
          )}
        </Grid.Col>
        {!isMobile && <Divider mx="md" orientation="vertical" />}
        <Grid.Col span="auto" style={{ width: "100%" }}>
          <ScrollArea
            h={isMobile ? "60dvh" : "72dvh"}
            viewportRef={scrollableRef}
            type="scroll"
            offsetScrollbars
            scrollbarSize={4}
          >
            <Paper
              style={{
                position: "absolute",
                zIndex: -5,
                width: "100%",
                top: 0,
              }}
              justify="center"
              align="center"
            >
              {isFetching && <Loader />}
            </Paper>
            {[...new Map(messages.map((msg) => [msg.id, msg])).values()]
              .sort((a, b) => a.id - b.id)
              .map((msg, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection:
                      msg.senderId == auth?.id ? "row-reverse" : "row",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      paddingLeft: "16px",
                      paddingTop: "18px",
                      alignItems: "center",
                    }}
                  >
                    <Blockquote
                      color={
                        msg.senderId == auth?.id
                          ? "var(--mantine-color-green-light-color)"
                          : "var(--mantine-color-cyan-light-color)"
                      }
                      cite={
                        (msg?.senderUsername
                          ? msg.senderUsername
                          : msg.senderId == auth?.id
                          ? auth?.user
                          : users?.find((user) => user.id == msg.senderId)
                              ?.username || "N/A") +
                        " • " +
                        (msg?.createdAt
                          ? dayjs(msg.createdAt).format("DD.MM.YYYY HH:mm")
                          : "??.??.?? ??:??")
                      }
                      iconSize={30}
                      icon={
                        msg.senderId != auth?.id ? (
                          <Avatar
                            src={
                              msg?.senderAvatar
                                ? msg.senderAvatar
                                : users?.find((user) => user.id == msg.senderId)
                                    ?.avatar || null
                            }
                          />
                        ) : null
                      }
                      style={{
                        backgroundColor:
                          msg.senderId == auth?.id
                            ? "var(--mantine-color-grape-light)"
                            : "var(--mantine-color-indigo-light)",
                        padding: "15px",
                        width: "100%",
                      }}
                    >
                      {msg.content}
                    </Blockquote>
                  </div>
                </div>
              ))}
            <Paper
              style={{
                position: "absolute",
                bottom: 20,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
                backgroundColor: "transparent",
              }}
            >
              <Transition transition="slide-up" mounted={showButton}>
                {(transitionStyles) => (
                  <Button
                    leftSection={<IconArrowDown size={16} />}
                    style={transitionStyles}
                    onClick={() => scrollBottom("always")} //scrollIntoView({})}
                    variant="gradient"
                    gradient={{ from: "blue", to: "cyan" }}
                    radius="xl"
                  >
                    {t("newest_button")}
                  </Button>
                )}
              </Transition>
            </Paper>
          </ScrollArea>
        </Grid.Col>
      </Grid>
      <Divider my="md" />
      <Group grow spacing="xs" align="flex-end">
        <Center>
          <Textarea
            placeholder={t("message_input_placeholder")}
            autosize
            minRows={isMobile ? 1 : 2}
            maxRows={isMobile ? 2 : 4}
            onFocus={(e) => {
              setTimeout(() => {
                e.target.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }, 300);
            }}
            onChange={(e) => setMessage(e.currentTarget.value)}
            value={message}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(message);
              }
            }}
            w={isMobile ? "auto" : "80%"}
          />
          <Space w="sm" />
          <Button
            loading={sendFetching}
            rightSection={<IconSend />}
            onClick={() => sendMessage(message)}
          >
            {t("send_button")}
          </Button>
        </Center>
      </Group>
    </Container>
  );
}

export default MessagesPage;
