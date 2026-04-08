import type { Express } from "express";
import cohortProjectsRouter from "./cohortProjects.js";
import cohortAdminRouter from "./cohortAdmin.js";
import projectUserRouter from "./projectUser.js";

export function registerRoutes(app: Express) {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Cohort Projects — public
  app.use("/api/cohort-projects", cohortProjectsRouter);

  // Cohort Admin — protected
  app.use("/api/cohort-admin", cohortAdminRouter);

  // Project User — per-user editing
  app.use("/api/project-user", projectUserRouter);
}
