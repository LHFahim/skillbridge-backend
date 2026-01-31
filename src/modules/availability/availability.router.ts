import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { availabilitySlotController } from "./availability.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware(UserRolesEnum.TUTOR),
  availabilitySlotController.createAvailabilitySlots,
);

router.get("/", availabilitySlotController.getAllAvailabilitySlots);
router.get("/:id", availabilitySlotController.getSingleAvailabilitySlot);

router.patch(
  "/:id",
  authMiddleware(UserRolesEnum.TUTOR),
  availabilitySlotController.updateAvailabilitySlot,
);

router.delete(
  "/:id",
  authMiddleware(UserRolesEnum.TUTOR),
  availabilitySlotController.deleteAvailabilitySlot,
);

export const availabilitySlotRouter: Router = router;
