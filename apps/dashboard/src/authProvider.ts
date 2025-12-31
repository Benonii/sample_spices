import type { AuthProvider } from "@refinedev/core";
import { authClient } from "./utils/authClient";

export const TOKEN_KEY = "refine-auth";

export const authProvider: AuthProvider = {
    login: async ({ email, password }) => {
        try {
            const { error } = await authClient.signIn.email({
              email,
              password,
            },
            {
                async onSuccess(context) {
                    if (context.data.twoFactorRedirect) {
                        await authClient.twoFactor.sendOtp()
                    }
                },
            });

            if (error) {
                return {
                    success: false,
                    error: {
                        name: "LoginError",
                        message: error?.message,
                    },
                };
            }      

            const session = await authClient.getSession();
            console.log("=========SESSION=========\n", session)
            return {
              success: true,
              redirectTo: session.data?.user.twoFactorEnabled ? "/otp" : "/",
            }
        } catch (error: any) {
            return {
                success: false,
                error: {
                    name: "LoginError",
                    message: error?.message,
                },
            };
        }
    },
    register: async ({ name, username, email, password }) => {
        try {
            const { error } = await authClient.signUp.email({
                email,
                password,
                name: name,
                username,
                image: "https://ui-avatars.com/api/?name=" + email,
            });

            if (error) {
                return {
                    success: false,
                    error: {
                      name: "RegisterError",
                      message: error?.message,
                    },
                };
            }

            return {
                success: true,
                redirectTo: "/login",
            }
        } catch (error: any) {
            return {
                success: false,
                error: {
                    name: "RegisterError",
                    message: error?.message,
                },
            };
        }
    },
    logout: async () => {
        await authClient.signOut();
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const { 
            data: session,
        } = await authClient.getSession() 

        if (session) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getIdentity: async () => {
        const { 
          data: session,
        } = await authClient.getSession() 

        if (session) {
          return {
            id: session.user.id,
            name: session.user.name,
            avatar: session.user.image,
          };
        }
        return null;
    },
    onError: async (error) => {
        console.log("===============AUTH ERROR!!!=====================");
        console.error(error);
        return { error };
    },
};
