import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Flex,
  Image,
  Box,
  Alert,
  CloseButton,
} from "@mantine/core";
import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import { APP_CONFIG } from "../config/config";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";
import { useLazyLoad } from "../hooks/useLazyLoad";
import { IconInfoCircle } from "@tabler/icons-react";

export function LoginPage() {
  const loadedHighRes = useLazyLoad(APP_CONFIG.backgroundImageLogin);

  useEffect(() => {
    const imageToUse = loadedHighRes || APP_CONFIG.backgroundImageLowResLogin;

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

  const { setAuth, persist, setPersist } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  var from = location.state?.from?.pathname || "/dashboard";
  const [username, setUser] = useState("");
  const [password, setPwd] = useState("");
  const [isFetching, setFetching] = useState(false);
  const { t } = useTranslation("login");
  const [alert, setAlert] = useState({
    isShown: false,
    title: "",
    content: "",
  });

  const togglePersist = () => {
    setPersist((prev) => !prev);
  };

  useEffect(() => {
    localStorage.setItem("RememberME?", persist);
  }, [persist]);

  const handleLogin = async () => {
    if (!password || !username) {
      setAlert({
        title: t("alert.title"),
        content: t("alert.empty_fields"),
        isShown: true,
      });
      return;
    }
    try {
      setFetching(true);
      const response = await axios.post(
        "/api/v1/auth/login",
        JSON.stringify({ username, password }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      const access_token = response?.data?.access_token;
      //localStorage.setItem("access_token", access_token);
      //localStorage.setItem("refresh_token", response?.data?.refresh_token);

      try {
        const decoded = jwtDecode(access_token);
        setAuth({
          user: response?.data?.username,
          id: response?.data?.id,
          roles: decoded.roles || [],
          permissions: decoded.permissions || [],
          access_token,
          refresh_token: response?.data?.refresh_token,
          firstName: response?.data?.firstName || "N/A",
          lastName: response?.data?.lastName || "N/A",
          email: response?.data?.email || "N/A",
          phoneNumber: response?.data?.phoneNumber || "N/A",
          avatar: response?.data?.avatar,
        });
        if (decoded.roles == "ROLE_CLIENT")
          //this one is buggy... (if auth as employee before and going to /login, it will came from another path. In real world it is posisible?)
          from = location.state?.from?.pathname || "/project";
      } catch (error) {
        console.error(error);
        setUser("");
      }

      setUser("");
      setPwd("");

      navigate(from, { replace: true });
    } catch (error) {
      if (error.status === 401) {
        setAlert({
          title: t("alert.title"),
          content: t("alert.user_pass_wrong"),
          isShown: true,
        });
        return;
      }
      setAlert({
        title: t("alert.title"),
        content: t("alert.server_error") + error?.message || error,
        isShown: true,
      });
    } finally {
      setFetching(false);
    }
  };

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
            c="light-dark(rgb(0, 60, 255), rgb(12, 33, 78))"
            style={{
              textShadow:
                "1px 1px 10px rgb(209, 5, 5),1px 1px 10px rgba(204, 0, 255, 0.9)",
              backdropFilter: "blur(2.5px)",
            }}
          >
            {t("title")}
          </Title>
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
            <TextInput
              label={t("username")}
              placeholder={t("username_placeholder")}
              onChange={(e) => setUser(e.target.value)}
              value={username}
              required
            />
            <PasswordInput
              label={t("password")}
              placeholder={t("password_placeholder")}
              required
              onChange={(e) => setPwd(e.target.value)}
              value={password}
              mt="md"
            />
            <Group justify="space-between" mt="lg">
              <Checkbox
                label={t("remember_me")}
                onChange={togglePersist}
                checked={persist}
              />
              <Anchor
                component="button"
                size="sm"
                onClick={() => navigate("/forgot-password")}
              >
                {t("forgot_password")}
              </Anchor>
            </Group>
            <Button
              fullWidth
              mt="xl"
              loading={isFetching}
              onClick={() => handleLogin()}
            >
              {t("button_login")}
            </Button>
          </Paper>
        </Container>
      </Flex>
    </Box>
  );
}
export default LoginPage;
