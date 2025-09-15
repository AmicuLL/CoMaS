/* eslint-disable no-unused-vars */
import {
  Button,
  Center,
  Flex,
  Input,
  Space,
  Text,
  Container,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";

function ClientPage() {
  const { t } = useTranslation("client");
  const axiosPrivate = useAxiosPrivate();
  const [isFetching, setFetching] = useState(false);
  const [clientData, setClientData] = useState({});
  const [updateData, setUpdateData] = useState({});
  const loadClient = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("api/v1/client", {
        signal: controller.signal,
        withCredentials: true,
      });
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        console.log(response.data);
        setClientData(response.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateClient = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.patch("api/v1/client", updateData, {
        signal: controller.signal,
        withCredentials: true,
      });
      if (response.status === 204) {
        notifications.show({
          icon: <IconX size={20} />,
          color: "red",
          title: t("information_change.notification.error_nocontent_title"),
          message: t("information_change.notification.error_nocontent_message"),
        });
        return;
      }
      if (response.status === 200) {
        setUpdateData({});
        setClientData(response.data);
        notifications.show({
          icon: <IconCheck size={20} />,
          color: "teal",
          title: t("notification.success_title"),
          message: t("notification.success_message"),
        });
        setTimeout(() => {
          window.location.reload();
        }, 5000);
        return;
      }
      notifications.show({
        icon: <IconCheck size={20} />,
        color: "teal",
        title: t("notification.success_title"),
        message: t("notification.success_message"),
      });
    } catch (error) {
      notifications.show({
        icon: <IconX size={20} />,
        color: "red",
        title: t("information_change.notification.error_occured_title"),
        message:
          t("information_change.notification.error_occured_message") +
          (error?.response?.data?.message || error?.message),
      });
    } finally {
      setFetching(false);
    }
  };
  return (
    <Container>
      <Text ta="center">{t("title")}</Text>
      <Center h="70dvh">
        <Flex direction="column" w="70dvh">
          <Input.Wrapper
            withAsterisk
            label={t("company_name.label")}
            description={t("company_name.description")}
          >
            <Input
              placeholder={t("company_name.placeholder")}
              onChange={(event) => {
                const value = event.target.value;
                setUpdateData((prev) => {
                  if (value === clientData?.companyName) {
                    const { company_name, ...rest } = prev;
                    return rest;
                  }
                  return {
                    ...prev,
                    company_name: value,
                  };
                });
              }}
              value={updateData?.company_name ?? clientData?.companyName}
            />
          </Input.Wrapper>
          <Space h="md" />
          <Input.Wrapper
            withAsterisk
            label={t("contact_person.label")}
            description={t("contact_person.description")}
          >
            <Input
              placeholder={t("contact_person.placeholder")}
              onChange={(event) => {
                const value = event.target.value;
                setUpdateData((prev) => {
                  if (value === clientData?.contactPerson) {
                    const { contact_person, ...rest } = prev;
                    return rest;
                  }
                  return {
                    ...prev,
                    contact_person: value,
                  };
                });
              }}
              value={updateData?.contact_person ?? clientData?.contactPerson}
            />
          </Input.Wrapper>
          <Space h="md" />
          <Input.Wrapper
            withAsterisk
            label={t("email.label")}
            description={t("email.description")}
          >
            <Input
              placeholder={t("email.placeholder")}
              onChange={(event) => {
                const value = event.target.value;
                setUpdateData((prev) => {
                  if (value === clientData?.email) {
                    const { company_email, ...rest } = prev;
                    return rest;
                  }
                  return {
                    ...prev,
                    company_email: value,
                  };
                });
              }}
              value={updateData?.company_email ?? clientData?.email}
            />
          </Input.Wrapper>
          <Space h="md" />
          <Input.Wrapper
            withAsterisk
            label={t("phone.label")}
            description={t("phone.description")}
          >
            <Input
              placeholder={t("phone.placeholder")}
              onChange={(event) => {
                const value = event.target.value;
                setUpdateData((prev) => {
                  if (value === clientData?.phone) {
                    const { company_phone, ...rest } = prev;
                    return rest;
                  }
                  return {
                    ...prev,
                    company_phone: value,
                  };
                });
              }}
              value={updateData?.company_phone ?? clientData?.phone}
            />
          </Input.Wrapper>
          <Space h="md" />
          <Flex direction="row" justify="space-between" gap="md">
            <Button
              fullWidth
              loading={isFetching}
              disabled={Object.keys(updateData).length === 0}
              onClick={() => setUpdateData({})}
            >
              {t("button.revert")}
            </Button>
            <Button
              fullWidth
              loading={isFetching}
              disabled={Object.keys(updateData).length === 0}
              onClick={() => updateClient()}
            >
              {t("button.update")}
            </Button>
          </Flex>
        </Flex>
      </Center>
    </Container>
  );
}

export default ClientPage;
