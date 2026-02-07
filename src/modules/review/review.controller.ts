import { Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { reviewService } from "./review.service";

const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id as string;

    const bookingId =
      typeof req.body.bookingId === "string" && req.body.bookingId.trim() !== ""
        ? req.body.bookingId.trim()
        : undefined;

    const rating =
      typeof req.body.rating === "number" ? req.body.rating : undefined;

    const comment =
      typeof req.body.comment === "string" && req.body.comment.trim() !== ""
        ? req.body.comment.trim()
        : undefined;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    if (!rating) {
      return res.status(400).json({ error: "rating is required" });
    }

    const review = await reviewService.createReview({
      studentId,
      bookingId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Creating review failed",
      details: e,
    });
  }
};

const getTutorReviews = async (req: Request, res: Response) => {
  try {
    const tutorProfileId =
      typeof req.query.tutorProfileId === "string" &&
      req.query.tutorProfileId.trim() !== ""
        ? req.query.tutorProfileId.trim()
        : undefined;

    if (!tutorProfileId) {
      return res.status(400).json({ error: "tutorProfileId is required" });
    }

    const minRating =
      typeof req.query.minRating === "string"
        ? parseInt(req.query.minRating, 10)
        : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await reviewService.getTutorReviews({
      tutorProfileId,
      minRating,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching reviews failed",
      details: e,
    });
  }
};

const getTutorRatingSummary = async (req: Request, res: Response) => {
  try {
    const tutorProfileId =
      typeof req.query.tutorProfileId === "string" &&
      req.query.tutorProfileId.trim() !== ""
        ? req.query.tutorProfileId.trim()
        : undefined;

    if (!tutorProfileId) {
      return res.status(400).json({ error: "tutorProfileId is required" });
    }

    const result = await reviewService.getTutorRatingSummary(tutorProfileId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Fetching rating summary failed",
      details: e,
    });
  }
};

export const reviewController = {
  createReview,
  getTutorReviews,
  getTutorRatingSummary,
};
