import { Route, Routes } from "react-router-dom";

import RequireAuth from "./components/RequireAuth";
//import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import LoginPage from "./pages/LoginPage";
import PersistLogin from "./components/PersistLogin";
import Unauthorized from "./components/Unauthorized";
import Dashboard from "./pages/Dashboard";
import Missing from "./components/Missing";
import LayoutAppShell from "./components/LayoutAppShell";
import TimeSheet from "./pages/TimeSheetPage";
import User from "./pages/User";
import AccountPage from "./pages/AccountPage";
import MessagesPage from "./pages/MessagesPage";
import Notification from "./components/Notification";
import Inventory from "./components/Inventory";
import RegisterPage from "./pages/RegisterPage";
import InventoryPage from "./pages/InventoryPage";
import ProjectPage from "./pages/ProjectPage";
import ProjectAdminPage from "./pages/ProjectAdminPage";
import {
  employeeDeletePermissionsList,
  employeeEditPermissionsList,
  employeeViewPermissionsList,
  inventoryPermissionsList,
  projectsPermissionsList,
  tasksPermissionsList,
  timeSheetsPermissionsList,
  userDeletePermissionList,
  userEditPermissionsList,
  userViewPermissionsList,
} from "./config/permissions";
import ClientPage from "./pages/ClientPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import EmployeeAdminPage from "./pages/EmployeeAdminPage";
const App = () => {
  return (
    <main
      id="app"
      style={{ height: "100dvh", width: "100dvw", overflowX: "hidden" }}
    >
      <Routes>
        <Route path="" /*element={<Layout />}*/>
          <Route path="/" element={<Landing />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="unauthorized" element={<Unauthorized />} />

          <Route element={<PersistLogin />}>
            <Route
              element={
                <RequireAuth
                  allowedRoles={[
                    "ROLE_SysOP",
                    "ROLE_ADMIN",
                    "ROLE_EMPLOYEE",
                    "ROLE_WORKER",
                    "ROLE_CLIENT",
                  ]}
                  allowedPermissions={["user:view"]}
                />
              }
            >
              <Route path="/" element={<LayoutAppShell />}>
                <Route
                  path="admin/"
                  element={
                    <RequireAuth
                      allowedPermissions={[
                        ...userViewPermissionsList,
                        ...userEditPermissionsList,
                        ...userDeletePermissionList,
                        ...employeeEditPermissionsList,
                        ...employeeDeletePermissionsList,
                        ...employeeViewPermissionsList,
                        ...timeSheetsPermissionsList,
                        ...inventoryPermissionsList,
                        ...projectsPermissionsList,
                        ...tasksPermissionsList,
                      ]}
                    />
                  }
                >
                  <Route
                    element={
                      <RequireAuth
                        allowedPermissions={[...inventoryPermissionsList]}
                      />
                    }
                  >
                    <Route
                      path="inventory"
                      element={
                        <Inventory
                          TABLE_MAX_HEIGHT={"70dvh"}
                          PIN_LAST={true}
                          PAGE_SIZE={10}
                          KEY="Dispare_din_dashboard"
                        />
                      }
                    />
                  </Route>
                  <Route
                    element={
                      <RequireAuth
                        allowedPermissions={[...projectsPermissionsList]}
                      />
                    }
                  >
                    <Route
                      path="project"
                      element={
                        <ProjectAdminPage
                          TABLE_MAX_HEIGHT={"70dvh"}
                          PIN_LAST={true}
                          PAGE_SIZE={10}
                          KEY="ProjectAdminPageDispare_din_dashboard"
                        />
                      }
                    />
                  </Route>
                  <Route
                    element={
                      <RequireAuth
                        allowedPermissions={[
                          ...userEditPermissionsList,
                          ...userDeletePermissionList,
                          ...userViewPermissionsList,
                        ]}
                      />
                    }
                  >
                    <Route path="users" element={<User />} />
                  </Route>
                  <Route
                    element={
                      <RequireAuth
                        allowedPermissions={[
                          ...employeeViewPermissionsList,
                          ...employeeEditPermissionsList,
                          ...employeeDeletePermissionsList,
                        ]}
                      />
                    }
                  >
                    <Route path="employee" element={<EmployeeAdminPage />} />
                  </Route>
                </Route>
                <Route
                  element={
                    <RequireAuth
                      allowedRoles={[
                        "ROLE_SysOP",
                        "ROLE_ADMIN",
                        "ROLE_EMPLOYEE",
                        "ROLE_WORKER",
                      ]}
                    />
                  }
                >
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="timesheet" element={<TimeSheet />} />
                  <Route path="inventory" element={<InventoryPage />} />
                </Route>
                <Route path="messages" element={<MessagesPage />} />
                <Route path="project" element={<ProjectPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="notifications" element={<Notification />} />
                <Route element={<RequireAuth allowedRoles={["ROLE_CLIENT"]} />}>
                  <Route path="/client" element={<ClientPage />} />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Missing />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
