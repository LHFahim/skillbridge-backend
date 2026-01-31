import express, { Router } from "express";
import { UserRolesEnum } from "../../common/enums";
import { authMiddleware } from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router = express.Router();

router.post(
  "/",
  authMiddleware(UserRolesEnum.STUDENT),
  reviewController.createReview,
);

router.get("/tutor-reviews", reviewController.getTutorReviews);

router.get("/tutor-rating-summary", reviewController.getTutorRatingSummary);

export const reviewRouter: Router = router;
