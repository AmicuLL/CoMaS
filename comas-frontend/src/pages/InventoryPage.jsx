import {
  Badge,
  Box,
  Card,
  Fieldset,
  Grid,
  Image,
  Select,
  Text,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { APP_CONFIG } from "../config/config";
import { useTranslation } from "react-i18next";
import Spinner from "../components/Spinner";

function InventoryPage() {
  const axiosPrivate = useAxiosPrivate();
  const { t } = useTranslation("inventory");
  const [isFetching, setFetching] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);
  const [sortType, setSortType] = useState("ALL");
  const filteredItems = useMemo(() => {
    if (sortType === "ALL") return inventoryItems;
    return inventoryItems.filter((item) => item.type === sortType);
  }, [inventoryItems, sortType]);
  const [searchItem, setSearchItem] = useState("");
  const loadItems = async () => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get("api/v1/inventory", {
        signal: controller.signal,
        withCredentials: true,
      });
      //setNotifications(response.data);
      if (response.status === 204) {
        return;
      }
      if (response.status === 200) {
        setInventoryItems(response.data);
        setSortedItems(response.data); //first time
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };

  const itemOptions = useMemo(() => {
    return filteredItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturer} ${item.name}${
        item.code ? ` (${item.code})` : ""
      }`,
    }));
  }, [filteredItems]);

  useEffect(() => {
    loadItems();
  }, []);
  return (
    <>
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
          <Select
            label={t("item_types.sort_type")}
            defaultValue={"ALL"}
            allowDeselect={false}
            data={[
              { value: "ALL", label: t("item_types.ALL") },
              { value: "TOOL", label: t("item_types.TOOL") },
              { value: "MATERIAL", label: t("item_types.MATERIAL") },
              { value: "EQUIPMENT", label: t("item_types.EQUIPMENT") },
              { value: "DEVICES", label: t("item_types.DEVICES") },
              { value: "MISCELLANEOUS", label: t("item_types.MISCELLANEOUS") },
            ]}
            onChange={(value) => {
              setSearchItem("");
              setSortType(value);
              setSortedItems(
                value === "ALL"
                  ? inventoryItems
                  : inventoryItems.filter((item) => item.type === value)
              );
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
          <Select
            label={t("item_types.search")}
            clearable
            searchable
            defaultValue=""
            value={searchItem}
            data={[{ value: "", label: t("item_types.ALL") }, ...itemOptions]}
            onChange={(value) => {
              setSearchItem(value);
              if (!value || value === "") {
                setSortedItems(filteredItems);
                return;
              }
              const filtered = filteredItems.filter(
                (item) => item.id === value
              );
              setSortedItems(filtered);
            }}
          />
        </Grid.Col>
      </Grid>
      {isFetching ? (
        <Spinner />
      ) : (
        <Grid mt={20} grow justify="center" align="center">
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3, xl: 2 }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Card.Section>
                    <Image
                      src={item?.image}
                      fallbackSrc={APP_CONFIG.logoUrl}
                      alt={item.name}
                    />
                  </Card.Section>

                  <Box
                    mt="md"
                    mb="xs"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      rowGap: 0,
                    }}
                  >
                    <Text fw={500}>{item.name}</Text>
                    {item.isQuantityLow === "true" && (
                      <Badge color="red" mt={2}>
                        {t("item_is_quantity_low.low_stock")}
                      </Badge>
                    )}
                  </Box>
                  <Text size="sm" c="dimmed">
                    {t("item_manufacturer") + ": " + item.manufacturer}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {t("item_code") + ": " + item.code}
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {t("item_type") +
                      ": " +
                      t(
                        `item_types.${
                          item?.type != "" ? item.type : "MISCELLANEOUS" //backend sends always an item type. Safety ?
                        }`
                      )}
                  </Text>

                  <Text size="sm" c="dimmed" mt="xs">
                    {t("item_quantity") + ": " + item.quantity}
                  </Text>
                  <Text size="sm" c="dimmed" mt="xs">
                    {t("item_location") + ": " + item.location}
                  </Text>
                  <Fieldset legend={t("item_description")} mt="xs">
                    <Text size="sm">{item.description}</Text>
                  </Fieldset>
                </Card>
              </Grid.Col>
            ))
          ) : (
            <Text>{t("no_items")}</Text>
          )}
        </Grid>
      )}
    </>
  );
}

export default InventoryPage;
