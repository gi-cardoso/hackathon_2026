import { Router } from "express";
import { ChapaController } from "../controllers/chapa.controller";

const chapaRouter = Router();

chapaRouter.get("/", ChapaController.getAll);

export { chapaRouter };
