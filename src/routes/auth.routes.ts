import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/internal/login", AuthController.internalLogin);

export { authRouter };
