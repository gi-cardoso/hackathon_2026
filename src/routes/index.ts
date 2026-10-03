import { Router } from "express";
import { userRouter } from "./user.routes";

const router = Router();

// Health check route
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// User routes
router.use("/users", userRouter);

export { router };
