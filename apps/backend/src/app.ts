import { logger } from "hono/logger";
import index from "@/routes/index.routes"

import { cors } from "hono/cors";

import { Hono } from "hono";
import { env } from "@/utils/env";
import { auth } from "./utils/auth";
import productRouter from "./product";
import adminRouter from "./admin";
import uploadRouter from "./admin/upload";
import addressRouter from "./address";
import orderRouter from "./order";
import cartRouter from "./cart";
import reviewRouter from "./review";

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

app.route("/api/product", productRouter);
app.route("/api/admin", adminRouter);
app.route("/api/upload", uploadRouter);
app.route("/api/address", addressRouter);
app.route("/api/order", orderRouter);
app.route("/api/cart", cartRouter);
app.route("/api/review", reviewRouter);

export default app;