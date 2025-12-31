import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { dataProvider } from "./dataProvider";
import { App as AntdApp } from "antd";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import { authProvider } from "./authProvider";
import { Header } from "./components/header";
import { ColorModeContextProvider } from "./contexts/color-mode";
import { ForgotPassword } from "./pages/forgotPassword";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Settings } from "./pages/settings";
import { Otp } from "./pages/otp";
import { ProductList, ProductCreate, ProductEdit, ProductShow } from "./pages/products";
import { CategoryList, CategoryCreate, CategoryEdit } from "./pages/categories";
import { authClient } from "./utils/authClient";
import { apiUrl } from "./utils/consts";

function App() {
    const session = authClient.useSession();
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <AntdApp>
              <Refine
                dataProvider={dataProvider("http://localhost:5000/api/admin")}
                notificationProvider={useNotificationProvider}
                routerProvider={routerBindings}
                authProvider={authProvider}
                resources={[
                  {
                    name: "settings",
                    list: "/settings",
                  },
                  {
                    name: "product",
                    list: "/products",
                    create: "/products/create",
                    edit: "/products/:id/edit",
                    show: "/products/:id",
                  },
                  {
                    name: "category",
                    list: "/categories",
                    create: "/categories/create",
                    edit: "/categories/:id/edit",
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "zMCuWC-eWhOTf-5hd6Ja",
                }}
              >
                <Routes>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-inner"
                        fallback={<CatchAllNavigate to="/login" />}
                      >
                        <ThemedLayoutV2
                          Header={Header}
                          Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route
                      index
                      element={<NavigateToResource resource={"/settings"} />}
                    />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/otp" element={<Otp />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/create" element={<ProductCreate />} />
                    <Route path="/products/:id/edit" element={<ProductEdit />} />
                    <Route path="/products/:id" element={<ProductShow />} />
                    <Route path="/categories" element={<CategoryList />} />
                    <Route path="/categories/create" element={<CategoryCreate />} />
                    <Route path="/categories/:id/edit" element={<CategoryEdit />} />
                    <Route path="*" element={<ErrorComponent />} />
                  </Route>
                  <Route
                    element={
                      <Authenticated
                        key="authenticated-outer"
                        fallback={<Outlet />}
                      >
                        <NavigateToResource />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                    <Route
                      path="/forgot-password"
                      element={<ForgotPassword />}
                    />
                  </Route>
                </Routes>

                <RefineKbar />
                <UnsavedChangesNotifier />
                <DocumentTitleHandler />
              </Refine>
          </AntdApp>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
