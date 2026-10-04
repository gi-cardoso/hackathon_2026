import { Router } from "express";
import { FornecedorController } from "../controllers/fornecedor.controller";
import { AuthMiddleware } from "../middlewares/auth.middleware";

const fornecedorRouter = Router();

fornecedorRouter.get(
	"/",
	AuthMiddleware.verifyToken,
	AuthMiddleware.hasRole(["COMPRAS", "ADMIN"]),
	FornecedorController.getAll,
);

fornecedorRouter.post("/", FornecedorController.create);

export { fornecedorRouter };