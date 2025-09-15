import "@mantine/core/styles.layer.css";
import "mantine-datatable/styles.layer.css";
import {
  AppShell,
  Burger,
  Flex,
  Stack,
  Center,
  Text,
  Avatar,
  Group,
  Space,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import { APP_CONFIG } from "../config/config";
import LanguageSelector from "./LanguageSelector";
import useServerSentEvent from "../hooks/useServerSentEvent";
function LayoutAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [minWidth, maxWidth] = [80, 300];
  useServerSentEvent();
  return (
    <AppShell
      header={{ height: { base: 80, md: 50 } }}
      navbar={{
        width: isCollapsed ? 80 : 300,
        breakpoint: "md",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header align="center">
        <Flex
          h={{ base: 80, md: 50 }}
          justify={{ base: "space-between", md: "center" }}
          align="center"
          p="sm"
        >
          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
          <Space w="sm" />
          <Group>
            <Center
              pos={{ base: "relative", md: "absolute" }}
              style={{ left: "50%", transform: "translateX(-50%)" }}
            >
              <Avatar src={APP_CONFIG.companyAvatarUrl} />
              <Space w="xs" />
              <Text>{APP_CONFIG.companyAbbreviation}</Text>
              <Text visibleFrom="md">
                &nbsp;-&nbsp;{APP_CONFIG.companyName}
              </Text>
            </Center>
            <Group
              visibleFrom="md"
              style={{ position: "absolute", right: "10px" }}
            >
              <LanguageSelector />
              <ThemeToggle />
            </Group>
          </Group>

          <Stack gap="3" align="center" hiddenFrom="md">
            <ThemeToggle />
            <LanguageSelector />
          </Stack>
        </Flex>
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          maxWidth: isCollapsed ? { minWidth } : { maxWidth },
        }}
      >
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          minWidth={minWidth}
          maxWidth={maxWidth}
          toggleCollapse={toggle}
        />
      </AppShell.Navbar>

      <AppShell.Main style={{ height: "100dvh", overflowX: "hidden" }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}

export default LayoutAppShell;
