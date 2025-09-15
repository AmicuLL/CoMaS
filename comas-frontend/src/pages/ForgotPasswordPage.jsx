import {
  Alert,
  Box,
  Button,
  Center,
  CloseButton,
  Flex,
  Group,
  Image,
  Paper,
  SegmentedControl,
  Text,
  Title,
  Container,
  TextInput,
  Popover,
  PasswordInput,
  Progress,
} from "@mantine/core";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";
import { useLazyLoad } from "../hooks/useLazyLoad";
import { APP_CONFIG } from "../config/config";

const PasswordRequirement = ({ meets, label }) => (
  <Text
    c={meets ? "teal" : "red"}
    style={{ display: "flex", alignItems: "center" }}
    mt={7}
    size="sm"
  >
    {meets ? <IconCheck size={14} /> : <IconX size={14} />}
    <Box ml={10}>{label}</Box>
  </Text>
);

const getRequirements = (t) => [
  { re: /[0-9]/, label: t("user_fields.password.requirements.number") },
  { re: /[a-z]/, label: t("user_fields.password.requirements.lowercase") },
  { re: /[A-Z]/, label: t("user_fields.password.requirements.uppercase") },
  {
    re: /[$&+,:;=?@#|'<>.^*()%!-]/,
    label: t("user_fields.password.requirements.symbol"),
  },
];

const getStrength = (password, requirements) => {
  let multiplier = password.length > 5 ? 0 : 1;
  requirements.forEach((req) => {
    if (!req.re.test(password)) multiplier++;
  });
  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 10);
};

const validateFields = ({ t, data, isClient, setAlert }) => {
  let message = "";
  let isShown = false;

  const addError = (condition, msgKey) => {
    if (condition) {
      message += t(msgKey) + " ";
      isShown = true;
    }
  };

  addError(!data.password || !data.confirmPassword, "alert.password_empty");
  addError(
    data.password &&
      data.confirmPassword &&
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$&+,:;=?@#|'<>.^*()%!-]).{6,}$/.test(
        data.password
      ),
    "alert.password_weak"
  );
  addError(
    data.password &&
      data.confirmPassword &&
      data.password !== data.confirmPassword,
    "alert.password_not_same"
  );
  addError(!data.username, "alert.username_empty");
  addError(
    data.username && data.username.trim().length < 5,
    "alert.username_incorrect"
  );

  addError(isClient && !data.contactPerson, "alert.company_contact_person");

  addError(!isClient && !data.euuid, "alert.euuid");
  addError(
    !isClient &&
      data.euuid &&
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        data.euuid
      ),
    "alert.euuid_wrong"
  );

  setAlert({ isShown, content: message, title: "Alert" });
  return isShown;
};

export default function ForgotPasswordPage() {
  const loadedHighRes = useLazyLoad(APP_CONFIG.backgroundImageRegister);
  useEffect(() => {
    const imageToUse =
      loadedHighRes || APP_CONFIG.backgroundImageLowResRegister;

    document.body.style.backgroundImage = `url(${imageToUse})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
    document.body.style.transition = "background-image 0.5s ease-in-out";

    return () => {
      document.body.style.backgroundImage = "";
      document.body.style.backgroundSize = "";
      document.body.style.backgroundRepeat = "";
      document.body.style.backgroundPosition = "";
      document.body.style.transition = "";
    };
  }, [loadedHighRes]);

  const { t } = useTranslation("forgotpassword");
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState("true");
  const [isFetching, setFetching] = useState(false);
  const [data, setData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    contactPerson: "",
    euuid: "",
    isClient: isClient,
  });
  const [alert, setAlert] = useState({
    isShown: false,
    title: "",
    content: "",
  });

  const requirements = getRequirements(t);
  const checks = requirements.map((req, i) => (
    <PasswordRequirement
      key={i}
      label={req.label}
      meets={req.re.test(data.password)}
    />
  ));
  const strength = getStrength(data.password, requirements);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  //API PATCH
  const changePassword = async () => {
    try {
      setFetching(true);
      const response = await axios.patch(`/api/v1/user/forgot_password`, {
        username: data?.username,
        new_password: data?.password,
        confirm_password: data?.confirmPassword,
        contact_person: data?.contactPerson,
        euuid: data?.euuid,
        isClient: isClient,
      });
      if (response.status === 200) {
        setAlert({
          isShown: true,
          title: t("alert.success.title"),
          content: t("alert.success.message"),
        });
      } else if (response.status === 204) {
        setAlert({
          isShown: true,
          title: t("alert.error.title"),
          content: t("alert.error.not_found"),
        });
      } else {
        setAlert({
          isShown: true,
          title: t("alert.error.title"),
          content: `${t("alert.error.message")} ${
            response?.error || response?.data
          }`,
        });
      }
    } catch (e) {
      setAlert({
        isShown: true,
        title: t("alert.error.title"),
        content: `${t("alert.error.exception")} ${e.message}`,
      });
    } finally {
      setFetching(false);
    }
  };
  const [passwordPopOver, setPasswordPopOver] = useState(false);

  return (
    <Box
      w="100dvw"
      h="100dvh"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Group align="center" justify="space-between" ml="md" mr="md" mt="xl">
        <a
          style={{
            cursor: "pointer",
            backgroundColor: "rgba(255,255,255,0.06)",
            padding: "2px",
            borderRadius: "7px",
          }}
          onClick={() => navigate("/")}
        >
          <Image w="150" src={APP_CONFIG.companyLogoUrl} />
        </a>
        <Flex gap="sm">
          <LanguageSelector />
          <ThemeToggle />
        </Flex>
      </Group>
      <Flex flex={1} w="100%" align="center" justify="center" pos="relative">
        {alert.isShown && (
          <Alert
            variant="filled"
            color="red"
            style={{
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 100,
            }}
          >
            <Flex justify="space-between" align="center" w="100%">
              <Group>
                <IconInfoCircle style={{ marginRight: 5 }} />
                {alert.title}
              </Group>
              <CloseButton
                style={{ marginLeft: 5 }}
                variant="transparent"
                onClick={() => setAlert({ ...alert, isShown: false })}
              />
            </Flex>
            {alert.content}
          </Alert>
        )}
        <Container size={420}>
          <Title
            ta="center"
            c="light-dark(rgba(163, 184, 211, 0.81), rgb(0, 9, 22))"
            style={{
              textShadow:
                "1px 1px 10px rgb(255, 255, 255),1px 1px 10px rgb(0, 247, 255),",
              backdropFilter: "blur(2.5px)",
            }}
          ></Title>

          <Paper
            withBorder
            shadow="md"
            p={30}
            mt={30}
            radius="md"
            style={{
              background:
                "light-dark(rgba(199, 199, 199, 0.7),rgba(0, 0, 0, 0.6))",
            }}
          >
            <SegmentedControl
              color="light-dark(rgba(99, 99, 99, 0.8),rgba(190, 190, 190, 0.6))"
              data={[
                { label: t("slider.employee"), value: "false" },
                { label: t("slider.client"), value: "true" },
              ]}
              fullWidth
              value={isClient.toString()}
              onChange={(value) => setIsClient(value === "true")}
            />
            {isClient ? (
              <TextInput
                label={t("user_fields.contact_person")}
                placeholder={t("user_fields.contact_person_placeholder")}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    contactPerson: e.target.value,
                  }))
                }
                value={data.contactPerson}
                required
              />
            ) : (
              <TextInput
                label={t("user_fields.euuid")}
                placeholder={t("user_fields.euuid_placeholder")}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    euuid: e.target.value,
                  }))
                }
                value={data.euuid}
                required
              />
            )}
            <TextInput
              label={t("user_fields.username_title")}
              placeholder={t("user_fields.username_placeholder")}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  username: e.target.value,
                }))
              }
              value={data.username}
              required
            />
            <Popover
              opened={passwordPopOver}
              position="bottom"
              width="target"
              transitionProps={{ transition: "pop" }}
            >
              <Popover.Target>
                <div
                  onFocusCapture={() => setPasswordPopOver(true)}
                  onBlurCapture={() => setPasswordPopOver(false)}
                >
                  <PasswordInput
                    withAsterisk
                    label={t("user_fields.password.title")}
                    placeholder={t("user_fields.password.placeholder")}
                    value={data?.password}
                    onChange={(e) =>
                      setData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
              </Popover.Target>
              <Popover.Dropdown>
                <Progress color={color} value={strength} size={5} mb="xs" />
                <PasswordRequirement
                  label={t("user_fields.password.requirements.length")}
                  meets={data?.password.length > 5}
                />
                {checks}
              </Popover.Dropdown>
            </Popover>
            <PasswordInput
              label={t("user_fields.password.confirm_title")}
              placeholder={t("user_fields.password.confirm_placeholder")}
              required
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              value={data.confirmPassword}
            />
            <Button
              fullWidth
              mt="lg"
              loading={isFetching}
              onClick={() => {
                const hasError = validateFields({
                  t,
                  data,
                  isClient,
                  setAlert,
                });

                if (hasError) return;

                changePassword();
              }}
            >
              {t("button.change_password")}
            </Button>
          </Paper>
          <Center>
            <Button fullWidth mt="lg" onClick={() => navigate("/login")}>
              {t("button.back_to_login")}
            </Button>
          </Center>
        </Container>
      </Flex>
    </Box>
  );
}
