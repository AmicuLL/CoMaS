import { useEffect, useState, useMemo } from "react";
import {
  Grid,
  Select,
  Button,
  Stack,
  Center,
  Text,
  Image,
  Group,
  Loader,
  Flex,
  TextInput,
  NumberInput,
  Textarea,
} from "@mantine/core";
import { DataTable, useDataTableColumns } from "mantine-datatable";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useTranslation } from "react-i18next";
import { sortBy } from "lodash";
import { notifications } from "@mantine/notifications";
import {
  IconBasketPlus,
  IconDatabaseEdit,
  IconPencilCheck,
  IconPencilX,
  IconRestore,
  IconTrashOff,
  IconTrashX,
  IconX,
} from "@tabler/icons-react";
import { APP_CONFIG } from "../config/config";

function Inventory({
  TABLE_MAX_HEIGHT = 400,
  TABLE_HEIGHT = "70dvh",
  TABLE_BORDER = true,
  COLUMN_BORDER = true,
  PIN_LAST = false,
  PAGE_SIZE = 100,
  KEY = "inventory",
}) {
  const axiosPrivate = useAxiosPrivate();
  const { t } = useTranslation("inventory");

  const [inventoryItems, setInventoryItems] = useState([]);
  const [sortedItems, setSortedItems] = useState([]);
  const [sortType, setSortType] = useState("ALL");
  const [searchItem, setSearchItem] = useState("");
  const [isFetching, setFetching] = useState(false);
  const [isButtonFetching, setButtonFetching] = useState(false);

  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "id",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);

  const filteredItems = useMemo(() => {
    if (sortType === "ALL") return inventoryItems;
    return inventoryItems.filter((item) => item.type === sortType);
  }, [inventoryItems, sortType]);

  const data = useMemo(() => {
    const sorted = sortBy(sortedItems, sortStatus.columnAccessor);
    return sortStatus.direction === "desc" ? sorted.reverse() : sorted;
  }, [sortedItems, sortStatus]);

  const itemOptions = useMemo(() => {
    return filteredItems.map((item) => ({
      value: item.id,
      label: `${item.manufacturer} ${item.name}${
        item.code ? ` (${item.code})` : ""
      }`,
    }));
  }, [filteredItems]);

  const [editingCell, setEditingCell] = useState(null);
  const [inventoryItemChanged, setInventoryItemChanged] = useState([]);
  const [newItem, setNewItem] = useState({ item: {}, isOpened: false });
  const loadItems = async (id) => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.get(
        `api/v1/inventory${id ? "?item_id=" + id : ""}`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        if (id) {
          setInventoryItems((prev) =>
            prev.map((item) =>
              item.id === response.data[0].id ? response.data[0] : item
            )
          );

          setSortedItems((prev) =>
            prev.map((item) =>
              item.id === response.data[0].id ? response.data[0] : item
            )
          );
        } else {
          setInventoryItems(response.data);
          setSortedItems(response.data);
        }
      }
    } catch (error) {
      if (error.status === 404) {
        if (!id) {
          setInventoryItems([]);
          setSortedItems([]);
        } else loadItems(); //if error 404 when reseting an item, means someone else had done some changes
      }
    } finally {
      setFetching(false);
    }
  };

  const deleteItem = async (id, name) => {
    const controller = new AbortController();
    setFetching(true);
    try {
      const response = await axiosPrivate.delete(
        `api/v1/inventory?item_id=${id}`,
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 204) {
        loadItems();
        notifications.show({
          icon: <IconTrashX size={20} />,
          color: "teal",
          title: t("notification.item_removed"),
          message: `"${name}" ${t("notification.item_removed_content")}`,
        });
      }
    } catch (error) {
      notifications.show({
        icon: <IconTrashOff size={20} />,
        color: "red",
        title: t("notification.item_remove_error"),
        message: `${t("notification.item_remove_error_content")} "${
          error.message
        }"`,
      });
    } finally {
      setFetching(false);
    }
  };

  const updateItem = async (item_id) => {
    const controller = new AbortController();
    setButtonFetching(true);
    try {
      const response = await axiosPrivate.patch(
        `api/v1/inventory?item_id=${item_id}`,
        inventoryItemChanged[item_id],
        {
          signal: controller.signal,
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setInventoryItemChanged((prev) => {
          //removing item after updated
          const updated = { ...prev };
          delete updated[item_id];
          return updated;
        });
        loadItems();
        notifications.show({
          icon: <IconPencilCheck size={20} />,
          color: "teal",
          title: t("notification.item_update"),
          message: `"${inventoryItemChanged[item_id]?.[name]}" ${t(
            "notification.item_update_content"
          )}`,
        });
      }
    } catch (error) {
      notifications.show({
        icon: <IconPencilX size={20} />,
        color: "red",
        title: t("notification.item_update_error"),
        message: `${t("notification.item_update_error_content")} "${
          error.message
        }"`,
      });
    } finally {
      setButtonFetching(false);
    }
  };

  useEffect(() => {
    let newItems = inventoryItems;

    if (sortType !== "ALL") {
      newItems = newItems.filter((item) => item.type === sortType);
    }

    if (searchItem) {
      newItems = newItems.filter((item) => item.id === searchItem);
    }

    setSortedItems(newItems);
  }, [inventoryItems, sortType, searchItem, isButtonFetching]);

  const handleChange = (id, accessor, value, clickedUpdate) => {
    if (clickedUpdate) {
      updateItem(id);
      return;
    }

    if (inventoryItems.find((item) => item.id === id)?.[accessor] !== value) {
      setInventoryItemChanged((prev) => {
        return {
          ...prev,
          [id]: {
            ...(prev?.[id] || {}),
            [accessor]: value,
          },
        };
      });
    } else {
      setInventoryItemChanged((prev) => {
        const updated = { ...prev };
        delete updated[id]?.[accessor];
        return updated;
      });
    }
  };

  const handleNewItem = async (opener, accessor, data, post) => {
    if (opener && !newItem?.isOpened) {
      const pushItem = {
        id: "randomstringforid",
        name: "",
        manufacturer: "",
        code: "",
        location: "",
        type: "",
        image: "",
        description: "",
        quantity: "",
        minimum_quantity: "",
      };
      setRecords((prev) => [pushItem, ...prev]);
      setNewItem((prev) => ({ ...prev, isOpened: true }));
      return;
    }
    if (!opener && !post) {
      setNewItem((prev) => ({
        ...prev,
        item: { ...prev.item, [accessor]: data },
      }));
    }
    if (!opener && post) {
      const controller = new AbortController();
      setFetching(true);
      try {
        const setItem = await axiosPrivate.post(
          `api/v1/inventory`,
          newItem.item,
          {
            signal: controller.signal,
            withCredentials: true,
          }
        );
        if (setItem.status === 201) {
          notifications.show({
            icon: <IconBasketPlus size={20} />,
            color: "teal",
            title: t("notification.item_added"),
            message: `"${newItem.item.name}" ${t(
              "notification.item_added_content"
            )}`,
          });
          setNewItem({ item: {}, isOpened: false });
          loadItems();
        }
      } catch (error) {
        if (error) {
          notifications.show({
            icon: <IconX size={20} />,
            color: "red",
            title: t("notification.item_add_error"),
            message: `${t("notification.item_add_error_content")} "${
              error.message
            }"`,
          });
          return;
        }
      } finally {
        setFetching(false);
      }
    }
  };
  useEffect(() => {
    console.log(newItem);
  }, [newItem]);
  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    setRecords(data.slice(from, to));
    setNewItem((prev) => ({ ...prev, isOpened: false }));
  }, [data, page, PAGE_SIZE]);

  const buildColumns = () => {
    const props = {
      resizable: true,
      sortable: true,
      toggleable: true,
      draggable: true,
    };
    return [
      //manufacturer
      {
        accessor: "manufacturer",
        title: t("item_manufacturer"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "manufacturer";
          return !isNew ? (
            isEditing ? (
              <TextInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["manufacturer"] ??
                  record.manufacturer
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(record.id, "manufacturer", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({
                    rowId: record.id,
                    columnKey: "manufacturer",
                  })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["manufacturer"] ??
                  record.manufacturer}
              </Text>
            )
          ) : (
            <TextInput
              defaultValue={newItem?.item?.manufacturer ?? ""}
              onBlur={(e) => {
                handleNewItem(false, "manufacturer", e.target.value, false);
              }}
            />
          );
        },
      },
      //code
      {
        accessor: "code",
        title: t("item_code"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "code";
          return !isNew ? (
            isEditing ? (
              <TextInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["code"] ?? record.code
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(record.id, "code", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "code" })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["code"] ?? record.code}
              </Text>
            )
          ) : (
            <TextInput
              defaultValue={newItem?.item?.code ?? ""}
              onBlur={(e) => {
                handleNewItem(false, "code", e.target.value, false);
              }}
            />
          );
        },
      },
      //name
      {
        accessor: "name",
        title: t("item_name"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "name";
          return !isNew ? (
            isEditing ? (
              <TextInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["name"] ?? record.name
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(record.id, "name", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "name" })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["name"] ?? record.name}
              </Text>
            )
          ) : (
            <TextInput
              defaultValue={newItem?.item?.name ?? ""}
              onBlur={(e) => {
                handleNewItem(false, "name", e.target.value, false);
              }}
            />
          );
        },
      },
      //type
      {
        accessor: "type",
        title: t("item_type"),
        ...props,
        render: (record) => {
          const isNewItem = record.id == "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "type";
          return !isNewItem ? (
            isEditing ? (
              <Select
                data={[
                  { value: "TOOL", label: t("item_types.TOOL") },
                  { value: "MATERIAL", label: t("item_types.MATERIAL") },
                  { value: "EQUIPMENT", label: t("item_types.EQUIPMENT") },
                  { value: "DEVICES", label: t("item_types.DEVICES") },
                  {
                    value: "MISCELLANEOUS",
                    label: t("item_types.MISCELLANEOUS"),
                  },
                ]}
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["type"] ?? record.type
                }
                allowDeselect={false}
                withCheckIcon={false}
                autoFocus
                dropdownOpened={isEditing}
                onBlur={() => {
                  setEditingCell(null);
                }}
                onChange={(val) => {
                  if (val) {
                    handleChange(record.id, "type", val);
                    setEditingCell(null);
                  }
                }}
                onClick={() => setEditingCell(null)}
              />
            ) : (
              <Text
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "type" })
                }
              >
                {t(
                  `item_types.${
                    record.type != ""
                      ? inventoryItemChanged?.[record.id]?.["type"] ??
                        record.type
                      : "MISCELLANEOUS"
                  }`
                )}
              </Text>
            )
          ) : (
            <Select
              data={[
                { value: "TOOL", label: t("item_types.TOOL") },
                { value: "MATERIAL", label: t("item_types.MATERIAL") },
                { value: "EQUIPMENT", label: t("item_types.EQUIPMENT") },
                { value: "DEVICES", label: t("item_types.DEVICES") },
                {
                  value: "MISCELLANEOUS",
                  label: t("item_types.MISCELLANEOUS"),
                },
              ]}
              defaultValue={newItem?.item?.type ?? "MISCELLANEOUS"}
              onChange={(val) => {
                if (val) {
                  handleNewItem(false, "type", val, false);
                  record.type = t(val);
                }
              }}
            />
          );
        },
      },
      //image
      {
        accessor: "image",
        title: t("item_image"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "image";
          return !isNew ? (
            isEditing ? (
              <TextInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["image"] ?? record.image
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(record.id, "image", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Image
                src={
                  inventoryItemChanged?.[record.id]?.["image"] ?? record.image
                }
                style={{ cursor: "pointer" }}
                w="100"
                radius="md"
                fallbackSrc={APP_CONFIG.ProductPlaceholder}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "image" })
                }
              />
            )
          ) : (
            <TextInput
              defaultValue={newItem?.item?.image ?? ""}
              onBlur={(e) => {
                handleNewItem(false, "image", e.target.value, false);
              }}
            />
          );
        },
      },
      //description
      {
        accessor: "description",
        title: t("item_description"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "description";
          return !isNew ? (
            isEditing ? (
              <Textarea
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["description"] ??
                  record.description
                }
                autoFocus
                autosize
                resize="vertical"
                onBlur={(e) => {
                  handleChange(record.id, "description", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "description" })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["description"] ??
                  record.description}
              </Text>
            )
          ) : (
            <Textarea
              defaultValue={newItem?.item?.description ?? ""}
              autosize
              resize="vertical"
              onBlur={(e) => {
                handleNewItem(false, "description", e.target.value, false);
              }}
            />
          );
        },
      },
      //location
      {
        accessor: "location",
        title: t("item_location"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "location";
          return !isNew ? (
            isEditing ? (
              <Textarea
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["location"] ??
                  record.location
                }
                autoFocus
                autosize
                resize="vertical"
                onBlur={(e) => {
                  handleChange(record.id, "location", e.target.value);
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "location" })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["location"] ??
                  record.location}
              </Text>
            )
          ) : (
            <Textarea
              defaultValue={newItem?.item?.location ?? ""}
              autosize
              resize="vertical"
              onBlur={(e) => {
                handleNewItem(false, "location", e.target.value, false);
              }}
            />
          );
        },
      },
      //quanmtity
      {
        accessor: "quantity",
        title: t("item_quantity"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "quantity";
          return !isNew ? (
            isEditing ? (
              <NumberInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["quantity"] ??
                  record.quantity
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(record.id, "quantity", Number(e.target.value));
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({ rowId: record.id, columnKey: "quantity" })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["quantity"] ??
                  record.quantity}
              </Text>
            )
          ) : (
            <NumberInput
              defaultValue={newItem?.item?.quantity ?? ""}
              onBlur={(e) => {
                handleNewItem(false, "quantity", Number(e.target.value), false);
              }}
            />
          );
        },
      },
      //min quantity
      {
        accessor: "minimum_quantity",
        title: t("item_min_quantity"),
        ...props,
        render: (record) => {
          const isNew = record.id === "randomstringforid";
          const isEditing =
            editingCell?.rowId === record.id &&
            editingCell?.columnKey === "minimum_quantity";
          return !isNew ? (
            isEditing ? (
              <NumberInput
                defaultValue={
                  inventoryItemChanged?.[record.id]?.["min_quantity"] ??
                  record.minimum_quantity
                }
                autoFocus
                onBlur={(e) => {
                  handleChange(
                    record.id,
                    "min_quantity",
                    Number(e.target.value)
                  );
                  setEditingCell(null);
                }}
              />
            ) : (
              <Text
                mih={"30px"}
                miw={"100%"}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setEditingCell({
                    rowId: record.id,
                    columnKey: "minimum_quantity",
                  })
                }
                onBlur={() => setEditingCell(null)}
              >
                {inventoryItemChanged?.[record.id]?.["min_quantity"] ??
                  record.minimum_quantity}
              </Text>
            )
          ) : (
            <NumberInput
              defaultValue={newItem?.item?.min_quantity ?? ""}
              onBlur={(e) => {
                handleNewItem(
                  false,
                  "min_quantity",
                  Number(e.target.value),
                  false
                );
              }}
            />
          );
        },
      },
      //is qnt low
      {
        accessor: "isQuantityLow",
        title: t("item_is_quantity_low.title"),
        ...props,
        render: (row) => {
          if (row.id === "randomstringforid") {
            return;
          }
          if (row.isQuantityLow === "true")
            return t("item_is_quantity_low.below_min");
          if (row.isQuantityLow === "false")
            return t("item_is_quantity_low.above_min");
          return t("item_is_quantity_low.never");
        },
      },
      //buttons
      {
        accessor: "actions",
        title: t("table.action"),
        titleStyle: (theme) => ({ color: theme.colors.red[6] }),
        cellsStyle: () => ({
          background: "light-dark(rgba(0, 0, 0, 0.35),rgba(0, 0, 0, 0.35))",
        }),
        render: (record) => {
          return (
            <Stack>
              {record.id == "randomstringforid" ? (
                <Button
                  variant="filled"
                  color="cyan"
                  size="compact-sm"
                  onClick={() => {
                    handleNewItem(false, null, null, true);
                  }}
                  leftSection={<IconBasketPlus />}
                >
                  {t("item_add")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="filled"
                    color="light-dark(rgba(0, 119, 255, 0.4),rgba(255, 255, 255, 0.5))"
                    size="compact-sm"
                    loading={isButtonFetching}
                    disabled={!inventoryItemChanged[record.id]}
                    onClick={() => handleChange(record.id, null, null, true)}
                    leftSection={<IconDatabaseEdit />}
                  >
                    {t("update")}
                  </Button>
                  <Button
                    variant="filled"
                    color="light-dark(rgba(0, 119, 255, 0.4),rgba(255, 255, 255, 0.5))"
                    size="compact-sm"
                    loading={isButtonFetching}
                    onClick={() => loadItems(record.id)}
                    leftSection={<IconRestore />}
                  >
                    {t("reset")}
                  </Button>
                  <Button
                    variant="filled"
                    color="light-dark(rgba(0, 119, 255, 0.4),rgba(255, 255, 255, 0.5))"
                    size="compact-sm"
                    loading={isButtonFetching}
                    onClick={() => deleteItem(record.id, record.name)}
                    leftSection={<IconPencilX />}
                  >
                    {t("delete")}
                  </Button>
                </>
              )}
            </Stack>
          );
        },
      },
    ];
  };

  const key = KEY;
  const columns = buildColumns();
  const {
    effectiveColumns,
    resetColumnsWidth,
    resetColumnsOrder,
    resetColumnsToggle,
  } = useDataTableColumns({
    key,
    columns,
  });
  return (
    <Stack>
      <Center>
        <Text>{t("title")}</Text>
      </Center>
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
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
              const newItems =
                value === "ALL"
                  ? inventoryItems
                  : inventoryItems.filter((item) => item.type === value);
              setSortedItems(newItems);
            }}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
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
        <Grid.Col span={{ base: 12, md: 12, lg: 4 }}>
          <Flex justify="center" align="center" mt={{ base: 0, md: 25 }}>
            <Button
              onClick={() => {
                handleNewItem(true, null, null, false);
                resetColumnsToggle();
              }}
              fullWidth
            >
              Add new item
            </Button>
          </Flex>
        </Grid.Col>
      </Grid>
      <Group grow justify="space-between">
        <Button size="compact-xs" onClick={resetColumnsWidth}>
          {t("table.reset_width")}
        </Button>
        <Button size="compact-xs" onClick={resetColumnsOrder}>
          {t("table.reset_order")}
        </Button>
        <Button size="compact-xs" onClick={resetColumnsToggle}>
          {t("table.reset_toggle")}
        </Button>
      </Group>
      {isFetching ? (
        <Flex h="70%" justify="center" align="center">
          <Loader />
        </Flex>
      ) : (
        <DataTable
          height={TABLE_HEIGHT}
          maxHeight={TABLE_MAX_HEIGHT}
          withTableBorder={TABLE_BORDER}
          withColumnBorders={COLUMN_BORDER}
          verticalAlign="center"
          striped
          highlightOnHover
          storeColumnsKey={key}
          borderRadius="md"
          columns={effectiveColumns}
          loaderType="bars"
          records={records}
          totalRecords={data.length}
          recordsPerPage={PAGE_SIZE}
          page={page}
          onPageChange={(p) => setPage(p)}
          paginationText={({ from, to, totalRecords }) =>
            `${t("table.item")} ${from} - ${to} ${t(
              "table.of"
            )} ${totalRecords}`
          }
          fetching={isFetching}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          {...(PIN_LAST ? { pinLastColumn: true } : {})}
        />
      )}
    </Stack>
  );
}

export default Inventory;
