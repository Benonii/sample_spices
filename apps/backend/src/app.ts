import { logger } from "hono/logger";
import index from "@/routes/index.routes"

import { cors } from "hono/cors";

import { Hono } from "hono";
import { env } from "@/utils/env";
import { auth } from "./utils/auth";
const app = new Hono();

app.use("*", cors({
  origin: env.CORS_WHITELIST.split(","),
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "PUT", "DELETE", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

app.use("*", logger());

const routes = [
  index,
] as const;

routes.forEach((route) => {
  app.route("/api", route);
});

app.on(["POST", "GET"], "/api/auth/**", (c) =>  auth.handler(c.req.raw));

export type AppType = typeof app;
export default app;
