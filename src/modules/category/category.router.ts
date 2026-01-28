import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware(UserRolesEnum.ADMIN),
  categoryController.createCategory,
);

router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getSingleCategory);

router.patch(
  "/:id",
  authMiddleware(UserRolesEnum.ADMIN),
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  authMiddleware(UserRolesEnum.ADMIN),
  categoryController.deleteCategory,
);

export const categoryRouter: Router = router;
