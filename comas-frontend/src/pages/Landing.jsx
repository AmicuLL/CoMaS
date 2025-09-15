import {
  Container,
  Title,
  Text,
  Button,
  Card,
  Grid,
  Box,
  Group,
  Flex,
  Avatar,
} from "@mantine/core";
import { useEffect } from "react";
import { APP_CONFIG } from "../config/config";
import { useTranslation } from "react-i18next";
import { useComputedColorScheme } from "@mantine/core";
import ThemeToggle from "../components/ThemeToggle";
import LanguageSelector from "../components/LanguageSelector";

const Landing = () => {
  const { t } = useTranslation("landingpage");
  const computedColorScheme = useComputedColorScheme("light");
  const theme = computedColorScheme;

  useEffect(() => {
    document.body.style.minHeight = "100vh";
    document.body.style.backgroundImage = `url(${
      theme === "dark"
        ? APP_CONFIG.backgroundImageLandingPageNight
        : APP_CONFIG.backgroundImageLandingPageDay
    })`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundAttachment = "fixed";

    return () => {
      document.body.style = "";
    };
  }, [theme]);

  return (
    <Box style={{ width: "100dvw", overflowX: "hidden" }}>
      <Container size="xl" py="md">
        <Flex justify="space-between" align="center" mb="lg">
          <Group align="center" justify="center">
            <Avatar src={APP_CONFIG.companyAvatarUrl} />
            <Title order={2} color="red">
              {APP_CONFIG.companyAbbreviation}
            </Title>
          </Group>
          <Group align="center" justify="center">
            <Button
              variant={theme === "light" ? "filled" : "light"}
              color="green"
              onClick={() => (window.location.href = "/login")}
            >
              Login
            </Button>
            <LanguageSelector />
            <ThemeToggle />
          </Group>
        </Flex>

        <Card
          shadow="xl"
          radius="md"
          padding="lg"
          bg={theme === "dark" ? "dark.7" : "white"}
          style={{ backdropFilter: "blur(5px)" }}
        >
          <Title order={1} align="center" mb="lg">
            {t("welcome") + APP_CONFIG.companyName}
          </Title>

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text fw={700}>{t("introduction.title")}</Text>
              <Text>{t("introduction.detail")}</Text>
              <ul>
                <li>{t("introduction.task_message")}</li>
                <li>{t("introduction.project_message")}</li>
                <li>{t("introduction.inventory_message")}</li>
                <li>{t("introduction.messages_message")}</li>
                <li>{t("introduction.notifications_message")}</li>
              </ul>

              <Text ta="center" fw={700}>
                {t("roles_and_capabilities.title")}
              </Text>

              <Text mt="md" fw={700}>
                {t("roles_and_capabilities.employee.user_type")}
              </Text>
              <Text>{t("roles_and_capabilities.employee.title")}</Text>
              <ul>
                <li>
                  {t("roles_and_capabilities.employee.task_project_message")}
                </li>
                <li>
                  {t("roles_and_capabilities.employee.timesheet_message")}
                </li>
                <li>{t("roles_and_capabilities.employee.messages_message")}</li>
                <li>
                  {t("roles_and_capabilities.employee.inventory_message")}
                </li>
                <li>
                  {t("roles_and_capabilities.employee.notifications_message")}
                </li>
              </ul>
              <Text>{t("roles_and_capabilities.employee.detail")}</Text>

              <Text mt="xl" fw={700}>
                {t("roles_and_capabilities.client.user_type")}
              </Text>
              <Text>{t("roles_and_capabilities.client.title")}</Text>
              <ul>
                <li>{t("roles_and_capabilities.client.project_message")}</li>
                <li>{t("roles_and_capabilities.client.task_message")}</li>
                <li>{t("roles_and_capabilities.client.messages_message")}</li>
                <li>{t("roles_and_capabilities.client.employee_details")}</li>
              </ul>
              <Text>{t("roles_and_capabilities.client.detail")}</Text>

              <Text mt="xl" fw={700}>
                {t("roles_and_capabilities.admin.user_type")}
              </Text>
              <Text>{t("roles_and_capabilities.admin.title")}</Text>
              <ul>
                <li>{t("roles_and_capabilities.admin.user_manage")}</li>
                <li>{t("roles_and_capabilities.admin.permissions_manage")}</li>
                <li>{t("roles_and_capabilities.admin.timesheet_manage")}</li>
                <li>{t("roles_and_capabilities.admin.project_task_manage")}</li>
                <li>{t("roles_and_capabilities.admin.inventory_manage")}</li>
              </ul>
              <Text>{t("roles_and_capabilities.admin.detail")}</Text>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <Text ta="center" fw={700}>
                {t("features.title")}
              </Text>

              <Text mt="md" fw={700}>
                {t("features.dashboard.title")}
              </Text>
              <ul>
                <li>{t("features.dashboard.brief")}</li>
                <li>{t("features.dashboard.use")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.timesheets.title")}
              </Text>
              <ul>
                <li>{t("features.timesheets.checkin")}</li>
                <li>{t("features.timesheets.filter")}</li>
                <li>{t("features.timesheets.admin")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.tasks_projects.title")}
              </Text>
              <ul>
                <li>{t("features.tasks_projects.project")}</li>
                <li>{t("features.tasks_projects.task")}</li>
                <li>{t("features.tasks_projects.admin")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.messages.title")}
              </Text>
              <ul>
                <li>{t("features.messages.sending")}</li>
                <li>{t("features.messages.history")}</li>
                <li>{t("features.messages.notifications")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.inventory.title")}
              </Text>
              <ul>
                <li>{t("features.inventory.view")}</li>
                <li>{t("features.inventory.edit")}</li>
                <li>{t("features.inventory.filter")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.ui_interface.title")}
              </Text>
              <ul>
                <li>{t("features.ui_interface.multi_language")}</li>
                <li>{t("features.ui_interface.theme")}</li>
              </ul>

              <Text mt="xl" fw={700}>
                {t("features.security.title")}
              </Text>
              <ul>
                <li>{t("features.security.http_only")}</li>
                <li>{t("features.security.permissions")}</li>
                <li>{t("features.security.validation")}</li>
                <li>{t("features.security.data_leak")}</li>
              </ul>
            </Grid.Col>
          </Grid>
          <Flex justify="center" miw="100%" mt="lg">
            <Grid w="50%">
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Button
                  fullWidth
                  variant={theme === "light" ? "filled" : "light"}
                  color="green"
                  onClick={() => (window.location.href = "/login")}
                >
                  Login
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Button
                  fullWidth
                  variant={theme === "light" ? "filled" : "light"}
                  color="grape"
                  onClick={() => (window.location.href = "/register")}
                >
                  Register
                </Button>
              </Grid.Col>
            </Grid>
          </Flex>
        </Card>
      </Container>
    </Box>
  );
};

export default Landing;
