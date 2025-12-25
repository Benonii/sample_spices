import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.string().optional(),
  DATABASE_URL: z.string(),
  CORS_WHITELIST: z.string().default("*"),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
});

type Env = z.infer<typeof EnvSchema>;
export const env: Env = EnvSchema.parse({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL || "",
  CORS_WHITELIST: process.env.CORS_WHITELIST ?? "*",
  SUPABASE_URL: process.env.SUPABASE_URL ?? "",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
});
