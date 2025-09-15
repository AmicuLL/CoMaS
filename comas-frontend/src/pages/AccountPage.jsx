import {
  Badge,
  Button,
  Card,
  Center,
  Divider,
  Fieldset,
  Grid,
  Group,
  Image,
  PasswordInput,
  Space,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { useEffect, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useTranslation } from "react-i18next";
import { openModal, closeAllModals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { isEqual } from "lodash";
import { APP_CONFIG } from "../config/config";

function ChangeInformationsModal({ userData }) {
  const { t } = useTranslation("account");
  const [username, setUsername] = useState(userData.dbusername);
  const [email, setEmail] = useState(userData.email);
  const [avatar, setAvatar] = useState(userData.avatar);
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();

  async function updateInfromations() {
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("information_change.notification.error_title"),
        message: t("information_change.notification.email_wrong"),
      });
      return;
    }
    if (username.trim().length < 5) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("information_change.notification.error_title"),
        message: t("information_change.notification.username_wrong"),
      });
      return;
    }
    try {
      const apiData = await axiosPrivate.patch(
        "api/v1/user",
        {
          username,
          email,
          avatar,
        },
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (apiData.status === 200) {
        closeAllModals();
        if (isEqual(apiData.data.api.split(",")[0], "[username]")) {
          notifications.show({
            icon: <IconCheck size={20} />,
            color: "teal",
            title: t("information_change.notification.success_title"),
            message: t(
              "information_change.notification.success_mesage_username"
            ),
          });
          setTimeout(() => {
            window.location.reload();
          }, 10000);
        } else {
          notifications.show({
            icon: <IconCheck size={20} />,
            color: "teal",
            title: t("information_change.notification.success_title"),
            message: t("information_change.notification.success_mesage"),
          });
          setTimeout(() => {
            window.location.reload();
          }, 5000);
        }
      } else {
        notifications.show({
          icon: <IconX size={20} />,
          color: "red",
          title: t("information_change.notification.error_title"),
          message:
            t("information_change.notification.error_message") +
            (apiData?.data?.message ||
              apiData?.data?.error ||
              apiData?.message),
        });
      }
    } catch (error) {
      if (error?.status === 304) {
        notifications.show({
          icon: <IconX size={20} />,
          color: "red",
          title: t("information_change.notification.no_change_title"),
          message: t("information_change.notification.no_change_message"),
        });
      } else {
        notifications.show({
          icon: <IconX size={20} />,
          color: "red",
          title: t("information_change.notification.error_title"),
          message:
            t("information_change.notification.error_message") +
            (error?.response?.data?.message || error?.message),
        });
      }
    }
  }

  return (
    <Stack>
      <TextInput
        autoComplete="current-password"
        label={t("information_change.username")}
        placeholder={t("information_change.username_placeholder")}
        value={username}
        onChange={(event) => setUsername(event.currentTarget.value)}
      />
      <TextInput
        autoComplete="new-password"
        label={t("information_change.email")}
        placeholder={t("information_change.email_placeholder")}
        value={email}
        onChange={(event) => setEmail(event.currentTarget.value)}
      />
      <TextInput
        autoComplete="confirm-password"
        label={t("information_change.avatar")}
        placeholder={t("information_change.avatar_placeholder")}
        value={avatar}
        onChange={(event) => setAvatar(event.currentTarget.value)}
      />
      <Center>
        <Button
          fullWidth
          onClick={async () => {
            await updateInfromations();
          }}
        >
          {t("account_details.button_personal_information")}
        </Button>
      </Center>
    </Stack>
  );
}

function ChangePasswordModal() {
  const { t } = useTranslation("account");
  const [current_password, setCurrentPassword] = useState("");
  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();

  async function updatePassword() {
    if (!current_password) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("password_change.notification.password_error_title"),
        message: t("password_change.notification.empty_current_password"),
      });
      return;
    }
    if (!new_password) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("password_change.notification.password_error_title"),
        message: t("password_change.notification.empty_new_password"),
      });
      return;
    }
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$&+,:;=?@#|'<>.^*()%!-]).{6,}$/.test(
        new_password
      )
    ) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("password_change.notification.password_error_title"),
        message: t("password_change.notification.password_strength_error"),
      });
      return;
    }
    if (new_password !== confirm_password) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("password_change.notification.password_error_title"),
        message: t("password_change.notification.password_match_error"),
      });
      return;
    }
    try {
      const apiData = await axiosPrivate.patch(
        "api/v1/user",
        {
          current_password,
          new_password,
          confirm_password,
        },
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (apiData.status === 200) {
        closeAllModals();
        notifications.show({
          icon: <IconCheck size={20} />,
          color: "teal",
          title: t("password_change.notification.success_title"),
          message: t("password_change.notification.success_mesage"),
        });
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        notifications.show({
          icon: <IconX size={20} />,
          color: "red",
          title: t("password_change.notification.error_title"),
          message:
            t("password_change.notification.error_message") +
              apiData?.data?.message || apiData?.data?.error,
        });
      }
    } catch (error) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("password_change.notification.error_title"),
        message:
          t("password_change.notification.error_message") +
          error.response.data.message,
      });
    }
  }

  return (
    <Stack>
      <PasswordInput
        autoComplete="current-password"
        label={t("password_change.current_password")}
        placeholder={t("password_change.current_password_placeholder")}
        value={current_password}
        onChange={(event) => setCurrentPassword(event.currentTarget.value)}
      />
      <PasswordInput
        autoComplete="new-password"
        label={t("password_change.new_password")}
        placeholder={t("password_change.new_password_placeholder")}
        value={new_password}
        onChange={(event) => setNewPassword(event.currentTarget.value)}
      />
      <PasswordInput
        autoComplete="confirm-password"
        label={t("password_change.confirm_password")}
        placeholder={t("password_change.confirm_password_placeholder")}
        value={confirm_password}
        onChange={(event) => setConfirmPassword(event.currentTarget.value)}
      />
      <Center>
        <Button
          fullWidth
          onClick={async () => {
            await updatePassword();
          }}
        >
          {t("account_details.button_change_password")}
        </Button>
      </Center>
    </Stack>
  );
}
function openCustomModal(modalTitle, children) {
  openModal({
    title: modalTitle,
    children: children, //<ChangePasswordModal />
  });
}

function AccountPage() {
  const axiosPrivate = useAxiosPrivate();
  const controller = new AbortController();
  const [userData, setUserData] = useState();
  const { t } = useTranslation("account");
  useEffect(() => {
    async function loadUserData() {
      try {
        const apiData = await axiosPrivate.get("/api/v1/user/me", {
          signal: controller.signal,
          withCredentials: true,
        });
        setUserData(apiData.data);
      } catch (error) {
        console.log(error);
      }
    }

    loadUserData();
    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Center>Account</Center>
      <Space h="md" />
      <Grid justify="space-between" overflow="hidden">
        <Grid.Col
          span={{ base: 12, md: 12, lg: 3 }}
          style={{ overflow: "hidden" }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={userData?.avatar}
                height="100%"
                alt="User Logo"
                fallbackSrc={APP_CONFIG.avatarPlaceholder}
              />
            </Card.Section>

            <Group justify="space-between" mt="md" mb="xs">
              <Text fw={500}>
                {t("account_details.username") + ": "}
                <Text
                  component="span"
                  variant="gradient"
                  gradient={{ from: "indigo", to: "teal", deg: 45 }}
                  fw={700}
                >
                  {userData?.dbusername}
                </Text>
              </Text>
              <Badge color="green">{userData?.role}</Badge>
            </Group>
          </Card>
        </Grid.Col>
        <Grid.Col
          span={{ base: 12, md: 12, lg: 9 }}
          style={{ overflow: "hidden" }}
        >
          <Divider my="md" />
          <Text>{t("account_details.title")}</Text>
          <Divider my="md" />
          <Fieldset legend={t("account_details.personal_information")}>
            <TextInput
              label={t("account_details.username")}
              readOnly
              value={userData?.dbusername}
              mt="md"
            />
            <TextInput label="Email" readOnly value={userData?.email} mt="md" />
            <TextInput
              label={t("account_details.avatar")}
              readOnly
              value={userData?.avatar}
              mt="md"
            />
            <Divider my="md" />
            <Center>
              <Button
                style={{ fontSize: 11 }}
                onClick={() =>
                  openCustomModal(
                    t("information_change.title"),
                    <ChangeInformationsModal userData={userData} />
                  )
                }
              >
                {t("account_details.button_personal_information")}
              </Button>
              <Space w="sm" />
              <Button
                style={{ fontSize: 11 }}
                onClick={() =>
                  openCustomModal(
                    t("password_change.title"),
                    <ChangePasswordModal />
                  )
                }
              >
                {t("account_details.button_change_password")}
              </Button>
            </Center>
          </Fieldset>

          <Space h="md" />

          <Fieldset legend={t("account_information.title")}>
            <TextInput
              label={t("account_information.id")}
              readOnly
              value={userData?.id}
              mt="md"
            />
            <TextInput
              label={t("account_information.creation_date")}
              readOnly
              value={
                userData?.creation_date
                  .split("T")[0]
                  .split("-")
                  .reverse()
                  .join(".") +
                " " +
                t("account_information.creation_date_at") +
                " " +
                userData?.creation_date.split("T")[1].split(".")[0]
              }
              mt="md"
            />
            <TextInput
              label={t("account_information.type")}
              readOnly
              value={userData?.userType}
              mt="md"
            />
            <TextInput
              label={t("account_information.user_ref_id")}
              readOnly
              value={userData?.userRefId}
              mt="md"
            />
            <TextInput
              label={t("account_information.role")}
              readOnly
              value={userData?.role}
              mt="md"
            />
            <TextInput
              label={t("account_information.permissions")}
              readOnly
              value={userData?.permissions}
              mt="md"
            />
          </Fieldset>
        </Grid.Col>
      </Grid>
    </>
  );
}

export default AccountPage;

/*
<Divider my="md" />
          <Text>Employee details</Text>
          <Divider my="md" />
          <Fieldset legend="Personal information">
            <TextInput label="First Name" readOnly value="Popescu" mt="md" />
            <TextInput label="Last Name" readOnly value="Mihai" mt="md" />
            <TextInput
              label="Email"
              readOnly
              value="company@mail.com"
              mt="md"
            />
            <TextInput label="Phone" readOnly value="0743434343" mt="md" />
            <Divider my="md" />
            <Center>
              <Button> Edit Personal Information</Button>
            </Center>
          </Fieldset>

          <Space h="md" />

          <Fieldset legend="Employee information">
            <TextInput label="Hire Date" readOnly value="06.03.2019" mt="md" />
            <TextInput label="Department id" readOnly value="1" mt="md" />
            <TextInput
              label="Working Hours"
              readOnly
              value="08:00-17:00"
              mt="md"
            />
            <TextInput label="Break time" readOnly value="1:00" mt="md" />
          </Fieldset>

*/
