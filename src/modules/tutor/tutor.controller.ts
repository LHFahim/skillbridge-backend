import { Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { tutorService } from "./tutor.service";

const getAllTutors = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const categoryIds =
      typeof req.query.categoryIds === "string" &&
      req.query.categoryIds.trim().length > 0
        ? req.query.categoryIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

    const minRate =
      typeof req.query.minRate === "string" && req.query.minRate.trim() !== ""
        ? Number(req.query.minRate)
        : undefined;

    const maxRate =
      typeof req.query.maxRate === "string" && req.query.maxRate.trim() !== ""
        ? Number(req.query.maxRate)
        : undefined;

    const currency =
      typeof req.query.currency === "string" ? req.query.currency : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await tutorService.getAllTutors({
      search,
      categoryIds,
      minRate: Number(minRate),
      maxRate: Number(maxRate),

      currency,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching tutors failed",
      details: e,
    });
  }
};

const getSingleTutor = async (req: Request, res: Response) => {
  try {
    const id = req.params.id!;

    const tutor = await tutorService.getSingleTutor(id);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    return res.status(200).json(tutor);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching tutor failed",
      details: e,
    });
  }
};

const getTutorByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId!;

    const tutor = await tutorService.getTutorByUserId(userId);

    if (!tutor) {
      return res.status(404).json({
        message: "Tutor not found",
      });
    }

    return res.status(200).json(tutor);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching tutor failed",
      details: e,
    });
  }
};

export const createTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const tutorProfile = await tutorService.createTutorProfile(
      userId,
      req.body,
    );

    return res.status(201).json(tutorProfile);
  } catch (e) {
    return res.status(400).json({
      error: "Tutor profile creation failed",
      details: e,
    });
  }
};

const updateTutorProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await tutorService.updateTutorProfile(userId, req.body);

    return res.status(200).json(result);
  } catch (e: any) {
    return res.status(400).json({
      error: "Tutor profile update failed",

      details: e?.message ?? e,
    });
  }
};

export const tutorController = {
  getAllTutors,
  getSingleTutor,
  getTutorByUserId,
  createTutorProfile,
  updateTutorProfile,
};
