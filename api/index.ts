// @ts-nocheck
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

let app;
try {
  const { appRouter } = await import("../server/routers.js");
  const { createContext } = await import("../server/_core/context.js");

  app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, db: !!process.env.DATABASE_URL });
  });
} catch (err) {
  app = express();
  app.use((_req, res) => {
    res.status(500).json({ error: err.message, stack: err.stack });
  });
}

export default app;
