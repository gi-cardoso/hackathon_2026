import { Router } from "express";
import { FornecedorController } from "../controllers/fornecedor.controller";

const fornecedorRouter = Router();

fornecedorRouter.post("/", FornecedorController.create);

export { fornecedorRouter };