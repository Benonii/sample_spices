// Placeholder Better Auth setup. Configure providers as needed.
// biome-ignore assist/source/organizeImports: can't make Biome happy
import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { sendResetPassword, sendVerificationEmail } from "./email";

export const auth = betterAuth({
  appName: "Starter template - Simple",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }) => {
      await sendVerificationEmail(user.name, user.email, url, token)
    },
    sendOnSignUp: true,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({user, url, token}) => {
      await sendResetPassword({ user, url, token })
    },
  },
  trustedOrigins: [ "http://localhost:5173" ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      enabled: true,
    },
  },
  plugins: [
    username(),
  ]
});
