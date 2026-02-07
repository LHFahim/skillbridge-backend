import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware(UserRolesEnum.STUDENT),
  bookingController.createBooking,
);

router.get(
  "/my-bookings",
  authMiddleware(UserRolesEnum.STUDENT),
  bookingController.getMyBookings,
);

router.get(
  "/my-bookings/:id",
  authMiddleware(UserRolesEnum.STUDENT),
  bookingController.getMySingleBooking,
);

router.patch(
  "/my-bookings/:id/cancel",
  authMiddleware(UserRolesEnum.STUDENT),
  bookingController.cancelMyBooking,
);

router.get(
  "/tutor-bookings",
  authMiddleware(UserRolesEnum.TUTOR),
  bookingController.getTutorBookings,
);

router.get(
  "/admin-bookings",
  authMiddleware(UserRolesEnum.ADMIN),
  bookingController.getAllBookingsForAdmin,
);

router.patch(
  "/tutor-bookings/:id/complete",
  authMiddleware(UserRolesEnum.TUTOR),
  bookingController.completeBooking,
);

export const bookingRouter: Router = router;
