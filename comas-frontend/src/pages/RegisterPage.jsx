import {
  Alert,
  Box,
  Button,
  Center,
  CloseButton,
  Container,
  Flex,
  Group,
  Image,
  Paper,
  PasswordInput,
  Popover,
  Progress,
  SegmentedControl,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { APP_CONFIG } from "../config/config";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import {
  IconCalendar,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import axios from "../api/axios";
import { DatePickerInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "../components/LanguageSelector";
import ThemeToggle from "../components/ThemeToggle";
import { useLazyLoad } from "../hooks/useLazyLoad";

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

const validateFields = ({
  t,
  alertType,
  userAccount,
  company,
  employee,
  setAlert,
}) => {
  let message = "";
  let isShown = false;

  const addError = (condition, msgKey) => {
    if (condition) {
      message += t(msgKey) + " ";
      isShown = true;
    }
  };

  if (alertType === "User") {
    addError(
      !userAccount.password || !userAccount.confirmPassword,
      "alert.password_empty"
    );
    addError(
      userAccount.password &&
        userAccount.confirmPassword &&
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$&+,:;=?@#|'<>.^*()%!-]).{6,}$/.test(
          userAccount.password
        ),
      "alert.password_weak"
    );
    addError(
      userAccount.password &&
        userAccount.confirmPassword &&
        userAccount.password !== userAccount.confirmPassword,
      "alert.password_not_same"
    );
    addError(!userAccount.username, "alert.username_empty");
    addError(
      userAccount.username && userAccount.username.trim().length < 5,
      "alert.username_incorrect"
    );
    addError(!userAccount.email, "alert.email_empty");
    addError(
      userAccount.email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          userAccount.email
        ),
      "alert.email_incorrect"
    );
  }

  if (alertType === "Company") {
    addError(!company.name, "alert.name");
    addError(!company.email, "alert.email_empty");
    addError(
      company.email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(company.email),
      "alert.email_incorrect"
    );
    addError(!company.contactPerson, "alert.company_contact_person");
    addError(!company.phone, "alert.phone_empty");
    addError(
      company.phone &&
        !/^\+?\d{1,4}?[\s.-]?(\(?\d{1,4}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/.test(
          company.phone
        ),
      "alert.phone_incorrect"
    );
  }

  if (alertType === "Employee") {
    addError(!employee.firstName || !employee.lastName, "alert.name");
    addError(!employee.email, "alert.email_empty");
    addError(
      employee.email &&
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
          employee.email
        ),
      "alert.email_incorrect"
    );
    addError(!employee.phone, "alert.phone_empty");
    addError(
      employee.phone &&
        !/^\+?\d{1,4}?[\s.-]?(\(?\d{1,4}\)?[\s.-]?)?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}$/.test(
          employee.phone
        ),
      "alert.phone_incorrect"
    );
  }

  setAlert({ isShown, content: message, title: "Alert" });
  return isShown;
};

export default function RegisterPage() {
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

  const { t } = useTranslation("register");
  const navigate = useNavigate();
  const [isClient, setIsClient] = useState("true");
  const [isFetching, setFetching] = useState(false);
  const [userAccount, setUserAccount] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    avatar: "",
  });
  const [employee, setEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    hireDate: "",
    backendEmployee: null,
  });
  const [company, setCompany] = useState({
    name: "",
    email: "",
    address: "",
    contactPerson: "",
    phone: "",
    nextStep: false,
  });
  const [alert, setAlert] = useState({
    isShown: false,
    title: "",
    content: "",
  });
  const [successReg, setSuccessReg] = useState(false);

  const requirements = getRequirements(t);
  const checks = requirements.map((req, i) => (
    <PasswordRequirement
      key={i}
      label={req.label}
      meets={req.re.test(userAccount.password)}
    />
  ));
  const strength = getStrength(userAccount.password, requirements);
  const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

  //API POSTS
  const [regKey, setRegKey] = useState({ key: "", isNeeded: true });
  useEffect(() => {
    async function isRegKeyRequired() {
      try {
        setFetching(true);
        const response = await axios.post("/api/v1/auth/register/employee");
        if (response.status === 200) {
          if (response.data.employee_required === "false") {
            setRegKey((prev) => ({ ...prev, isNeeded: false }));
          }
        } //setEmployee((prev) => ({ ...prev, backendEmployee: true }));
      } catch (e) {
        console.log(e);
      } finally {
        setFetching(false);
      }
    }

    isRegKeyRequired();
  }, []);
  const checkRegKey = async () => {
    if (regKey.key == "") {
      setAlert({
        title: t("regKey.error_title"),
        content: t("regKey.error_message_empty"),
        isShown: true,
      });
      return;
    }
    if (
      !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
        regKey.key
      )
    ) {
      setAlert({
        title: t("regKey.error_title"),
        content: t("regKey.error_message_no_uuid"),
        isShown: true,
      });
      return;
    }
    try {
      setFetching(true);
      const response = await axios.post("/api/v1/auth/register/employee_key", {
        employee_registration_key: regKey.key,
      });
      if (response.status === 200) {
        setEmployee((prev) => ({ ...prev, backendEmployee: response.data }));
        setRegKey((prev) => ({ ...prev, isNeeded: null }));
      } else if (response.status === 409) {
        setAlert({
          title: t("regKey.error_title"),
          content: t("regKey.error_server_user_exist"),
          isShown: true,
        });
      } else {
        setEmployee((prev) => ({ ...prev, backendEmployee: false }));
        setAlert({
          title: t("regKey.error_title"),
          content: t("regKey.error_server_response"),
          isShown: true,
        });
      }
    } catch (e) {
      setAlert({
        title: t("regKey.error_title"),
        content: `${t("regKey.error_server_error")} ${e.message}`,
        isShown: true,
      });
    } finally {
      setFetching(false);
    }
  };
  const registerUser = async () => {
    try {
      setFetching(true);
      const response = await axios.post(
        `/api/v1/auth/register${isClient ? `?isClient=` + isClient : ""}`,
        isClient
          ? {
              username: userAccount?.username,
              password: userAccount?.password,
              confirm_password: userAccount?.confirmPassword,
              avatar: userAccount?.avatar || "",
              email: userAccount?.email,
              company_name: company?.name,
              company_address: company?.address,
              company_contact_person: company?.contactPerson,
              company_phone: company?.phone,
              company_email: company?.email,
            }
          : !regKey.key
          ? {
              username: userAccount?.username,
              password: userAccount?.password,
              confirm_password: userAccount?.confirmPassword,
              avatar: userAccount?.avatar,
              email: userAccount?.email,
              employee_email: employee?.email,
              employee_phone: employee?.phone,
              employee_firstName: employee?.firstName,
              employee_lastName: employee?.lastName,
              employee_hireDate: employee?.hireDate,
            }
          : {
              registration_key: regKey.key,
              username: userAccount?.username,
              password: userAccount?.password,
              confirm_password: userAccount?.confirmPassword,
              avatar: userAccount?.avatar,
              email: userAccount?.email,
            }
      );
      if (response.status === 200) {
        setSuccessReg(true);
        setEmployee(response.data);
      } else {
        setAlert({
          isShown: true,
          title: "Server Alert",
          content: response?.error || response?.data,
        });
      }
    } catch (e) {
      if (e?.status === 409)
        setAlert({
          isShown: true,
          title: "Server Alert",
          content: t("regKey.error_server_username_email_taken"),
        });
      else
        setAlert({
          isShown: true,
          title: "Exception Alert",
          content: e?.response?.data?.message || e?.message || "Unknown error",
        });
    } finally {
      setFetching(false);
    }
  };
  const [passwordPopOver, setPasswordPopOver] = useState(false);
  const UserFields = (
    <>
      <TextInput
        label={t("user_fields.username_title")}
        placeholder={t("user_fields.username_placeholder")}
        onChange={(e) =>
          setUserAccount((prev) => ({
            ...prev,
            username: e.target.value,
          }))
        }
        value={userAccount.username}
        required
      />
      <TextInput
        label={t("user_fields.email_title")}
        placeholder={t("user_fields.email_placeholder")}
        onChange={(e) =>
          setUserAccount((prev) => ({
            ...prev,
            email: e.target.value,
          }))
        }
        value={userAccount.email}
        required
      />
      <TextInput
        label={t("user_fields.avatar_title")}
        placeholder={t("user_fields.avatar_placeholder")}
        onChange={(e) =>
          setUserAccount((prev) => ({
            ...prev,
            avatar: e.target.value,
          }))
        }
        value={userAccount.avatar}
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
              value={userAccount?.password}
              onChange={(e) =>
                setUserAccount((prev) => ({
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
            meets={userAccount?.password.length > 5}
          />
          {checks}
        </Popover.Dropdown>
      </Popover>
      <PasswordInput
        label={t("user_fields.password.confirm_title")}
        placeholder={t("user_fields.password.confirm_placeholder")}
        required
        onChange={(e) =>
          setUserAccount((prev) => ({
            ...prev,
            confirmPassword: e.target.value,
          }))
        }
        value={userAccount.confirmPassword}
      />
      <Button
        fullWidth
        mt="lg"
        onClick={() => {
          const hasError = validateFields({
            t,
            alertType: "User",
            userAccount,
            employee,
            company,
            setAlert,
          });

          if (hasError) return;

          if (employee.backendEmployee?.firstName && regKey.isNeeded == null) {
            //for regKey enabled
            registerUser();
          } else if (
            employee.backendEmployee == null &&
            employee.backendEmployee != "NextStep"
          ) {
            setEmployee((prev) => ({ ...prev, backendEmployee: "NextStep" }));
          } else if (isClient && !company.nextStep)
            setCompany((prev) => ({ ...prev, nextStep: true }));
        }}
      >
        {employee?.backendEmployee != null && !isClient
          ? t("button.register")
          : t("button.continue")}
      </Button>
    </>
  );
  const EmployeeFields = (
    <>
      <TextInput
        label={t("employee.firstName")}
        placeholder={t("employee.firstName_placeholder")}
        onChange={(e) =>
          setEmployee((prev) => ({
            ...prev,
            firstName: e.target.value,
          }))
        }
        value={employee.firstName}
        required
      />
      <TextInput
        label={t("employee.lastName")}
        placeholder={t("employee.lastName_placeholder")}
        onChange={(e) =>
          setEmployee((prev) => ({
            ...prev,
            lastName: e.target.value,
          }))
        }
        value={employee.lastName}
        required
      />
      <TextInput
        label={t("employee.email")}
        placeholder={t("employee.email_placeholder")}
        onChange={(e) =>
          setEmployee((prev) => ({
            ...prev,
            email: e.target.value,
          }))
        }
        value={employee.email}
      />
      <TextInput
        label={t("employee.phone")}
        placeholder={t("employee.phone_placeholder")}
        onChange={(e) =>
          setEmployee((prev) => ({
            ...prev,
            phone: e.target.value,
          }))
        }
        value={employee.phone}
      />
      <DatePickerInput
        leftSection={<IconCalendar size={18} stroke={1.5} />}
        leftSectionPointerEvents="none"
        clearable
        value={employee.hireDate ? dayjs(employee.hireDate).toDate() : null}
        onChange={(date) =>
          setEmployee((prev) => ({
            ...prev,
            hireDate: date ? dayjs(date).format("YYYY-MM-DD") : null,
          }))
        }
        label={t("employee.hireDate")}
        placeholder={t("employee.hireDate_placeholder")}
      />
      <Flex gap="md">
        <Button
          fullWidth
          mt="lg"
          onClick={() =>
            setEmployee((prev) => ({ ...prev, backendEmployee: null }))
          }
        >
          {t("button.back")}
        </Button>
        <Button
          loading={isFetching}
          fullWidth
          mt="lg"
          onClick={() => {
            const hasError = validateFields({
              t,
              alertType: "Employee",
              employee,
              setAlert,
            });

            if (hasError) return;

            registerUser();
          }}
        >
          {t("button.register")}
        </Button>
      </Flex>
    </>
  );
  const CompanyFields = (
    <>
      <TextInput
        label={t("company.name")}
        placeholder={t("company.name_placeholder")}
        onChange={(e) =>
          setCompany((prev) => ({ ...prev, name: e.target.value }))
        }
        value={company.name}
        required
      />
      <TextInput
        label={t("company.email")}
        placeholder={t("company.email_placeholder")}
        onChange={(e) =>
          setCompany((prev) => ({ ...prev, email: e.target.value }))
        }
        value={company.email}
        required
      />
      <TextInput
        label={t("company.address")}
        placeholder={t("company.address_placeholder")}
        onChange={(e) =>
          setCompany((prev) => ({
            ...prev,
            address: e.target.value,
          }))
        }
        value={company.address}
        required
      />
      <TextInput
        label={t("company.contact_person")}
        placeholder={t("company.contact_person_placeholder")}
        onChange={(e) =>
          setCompany((prev) => ({ ...prev, contactPerson: e.target.value }))
        }
        value={company.contactPerson}
        required
      />
      <TextInput
        label={t("company.phone")}
        placeholder={t("company.phone_placeholder")}
        onChange={(e) =>
          setCompany((prev) => ({ ...prev, phone: e.target.value }))
        }
        value={company.phone}
        required
      />
      <Flex gap="md">
        <Button
          fullWidth
          mt="lg"
          onClick={() => setCompany((prev) => ({ ...prev, nextStep: false }))}
        >
          {t("button.back")}
        </Button>
        <Button
          loading={isFetching}
          fullWidth
          mt="lg"
          onClick={() => {
            const hasError = validateFields({
              t,
              alertType: "Company",
              company,
              setAlert,
            });

            if (hasError) return;

            registerUser();
          }}
        >
          {t("button.register")}
        </Button>
      </Flex>
    </>
  );

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
          >
            {successReg
              ? t("success.title")
              : employee?.backendEmployee != null &&
                employee?.backendEmployee?.firstName != undefined &&
                !isClient
              ? `${t("employee_register.byRegKey_title")} ${
                  employee?.backendEmployee?.firstName
                } ${employee?.backendEmployee?.lastName}`
              : isClient
              ? t("title.client")
              : t("title.employee")}
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
            {successReg ? (
              <>
                <Group>
                  <IconCircleCheck color="teal" />
                  <Text>{t("success.message")}</Text>
                </Group>
                <Center>
                  <Button fullWidth mt="lg" onClick={() => navigate("/login")}>
                    {t("success.login_button")}
                  </Button>
                </Center>
              </>
            ) : (
              <>
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

                {!isClient ? ( //Employee stuff (if client is false will get to employee stuff)
                  regKey.isNeeded ? ( //API call to set if euuid is needed.
                    <>
                      <TextInput
                        label={t("employee_key.label")}
                        placeholder={t("employee_key.placeholder")}
                        onChange={(e) =>
                          setRegKey((prev) => ({
                            ...prev,
                            key: e.target.value,
                          }))
                        }
                        value={regKey.key}
                        required
                      />
                      <Button
                        loading={isFetching}
                        fullWidth
                        mt="sm"
                        onClick={() => checkRegKey()}
                      >
                        {t("employee_key.button")}
                      </Button>
                    </> //backend emp: null  regKey.isNeeded: false
                  ) : (employee.backendEmployee == null ||
                      regKey.isNeeded != false) &&
                    employee.backendEmployee != "NextStep" ? (
                    UserFields
                  ) : (
                    EmployeeFields
                  )
                ) : company.nextStep ? (
                  CompanyFields
                ) : (
                  UserFields
                )}
              </>
            )}
          </Paper>
        </Container>
      </Flex>
    </Box>
  );
}
