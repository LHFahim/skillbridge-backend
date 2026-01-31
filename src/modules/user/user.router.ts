import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { UserController } from "./user.controller";

const router = express.Router();

router.get(
  "/me",
  authMiddleware(
    UserRolesEnum.ADMIN,
    UserRolesEnum.STUDENT,
    UserRolesEnum.TUTOR,
  ),
  UserController.getMyProfile,
);

router.get(
  "/",
  authMiddleware(UserRolesEnum.ADMIN),
  UserController.getAllUsers,
);

router.patch(
  "/:id/status",
  authMiddleware(UserRolesEnum.ADMIN),
  UserController.updateUserStatus,
);

export const userRouter: Router = router;
