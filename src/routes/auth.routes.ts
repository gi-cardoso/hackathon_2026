import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/internal/login", AuthController.internalLogin);
authRouter.post("/fornecedor/login", AuthController.fornecedorLogin);

export { authRouter };
