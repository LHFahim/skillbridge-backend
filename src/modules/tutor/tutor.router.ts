import express, { Router } from "express";
import { tutorController } from "./tutor.controller";

const router = express.Router();
router.get(
  "/",

  tutorController.getAllTutors,
);

router.get("/:id", tutorController.getSingleTutor);

export const tutorRouter: Router = router;
