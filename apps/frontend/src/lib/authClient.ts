import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const baseApiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? (import.meta.env.DEV ? "http://localhost:5000/api" : undefined);
if (!baseApiUrl) {
  throw new Error("VITE_API_URL is not defined. Set it in your env (prod) or provide dev fallback.");
}

// Prefer the correctly spelled export `authClient`
export const authClient = createAuthClient({
    baseURL: `${baseApiUrl}/auth`,
    plugins: [ usernameClient() ],
});