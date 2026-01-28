import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { tutorController } from "./tutor.controller";

const router = express.Router();
router.get(
  "/",

  tutorController.getAllTutors,
);

router.get("/:id", tutorController.getSingleTutor);

router.post(
  "/",
  authMiddleware(UserRolesEnum.TUTOR),
  tutorController.createTutorProfile,
);

export const tutorRouter: Router = router;
