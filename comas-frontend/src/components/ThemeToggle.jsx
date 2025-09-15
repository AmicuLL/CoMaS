import {
  ActionIcon,
  useComputedColorScheme,
  useMantineColorScheme,
} from "@mantine/core";
import { IconSun, IconMoonStars } from "@tabler/icons-react";

function ThemeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  return (
    <ActionIcon
      variant={computedColorScheme === "light" ? "default" : "light"}
      onClick={() => toggleColorScheme()}
      size="lg"
      radius="md"
      aria-label="Toggle color scheme"
    >
      {colorScheme === "dark" ? (
        <IconSun size={20} />
      ) : (
        <IconMoonStars size={20} />
      )}
    </ActionIcon>
  );
}

export default ThemeToggle;
