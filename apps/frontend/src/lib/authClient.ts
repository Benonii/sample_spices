import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

// Prefer the correctly spelled export `authClient`
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL + "/auth",
  plugins: [usernameClient()],
});
