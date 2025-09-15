import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider } from "@mantine/core";

import App from "./App.jsx";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "@mantine/notifications/styles.css";

import "./utils/i18nex.js";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <MantineProvider withGlobalStyles withNormalizeCSS theme={{}}>
    <Notifications position="bottom-right" />
    <ModalsProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ModalsProvider>
  </MantineProvider>
  // </StrictMode>
);
