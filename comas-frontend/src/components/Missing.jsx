import { Badge, Button, Card, Center, Group, Image, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { APP_CONFIG } from "../config/config";

function Missing() {
  const navigate = useNavigate();
  const { t } = useTranslation("missing");
  return (
    <Center h="100%">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src={APP_CONFIG.MissingError}
            height={160}
            alt="404 Not found"
          />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{t("title")}</Text>
          <Badge color="pink">{t("badge")}</Badge>
        </Group>

        <Text size="sm" c="dimmed" style={{ whiteSpace: "pre-line" }}>
          {t("message")}
        </Text>

        <Button
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          onClick={() => navigate(-1)}
        >
          {t("button")}
        </Button>
      </Card>
    </Center>
  );
}

export default Missing;
