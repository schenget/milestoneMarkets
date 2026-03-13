import { Router } from "express";
import { clearVisualizationData, seedVisualizationData } from "../../shared/store.js";

export const devRouter = Router();

devRouter.use((_req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }
  next();
});

devRouter.post("/seed-visualization", (_req, res) => {
  const summary = seedVisualizationData();
  res.status(201).json({
    message: "Visualization test data seeded",
    summary,
    note: "Development-only endpoint. Not available in production."
  });
});

devRouter.delete("/seed-visualization", (_req, res) => {
  clearVisualizationData();
  res.json({
    message: "Visualization test data cleared",
    note: "Development-only endpoint. Not available in production."
  });
});

devRouter.delete("/seed-visualization", (_req, res) => {
  clearVisualizationData();
  res.json({
    message: "Visualization test data cleared",
    note: "Development-only endpoint. Not available in production."
  });
});
