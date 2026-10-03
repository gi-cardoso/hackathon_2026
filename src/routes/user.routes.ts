import { Router } from "express";
import { UserController } from "../controllers/user.controller";

const userRouter = Router();

userRouter.post("/", UserController.create);
userRouter.get("/", UserController.getAll);
userRouter.get("/:id", UserController.getById);
userRouter.put("/:id", UserController.update);
userRouter.delete("/:id", UserController.delete);

export { userRouter };
