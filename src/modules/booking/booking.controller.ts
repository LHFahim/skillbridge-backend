import { Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { bookingService } from "./booking.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id as string;

    const slotId =
      typeof req.body.slotId === "string" && req.body.slotId.trim() !== ""
        ? req.body.slotId.trim()
        : undefined;

    if (!slotId) {
      return res.status(400).json({ error: "slotId is required" });
    }

    const booking = await bookingService.createBooking({
      studentId,
      slotId,
    });

    return res.status(201).json({
      success: true,
      data: booking,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Creating booking failed",
      details: e,
    });
  }
};

const getMyBookings = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id as string;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await bookingService.getMyBookings({
      studentId,
      status,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching bookings failed",
      details: e,
    });
  }
};

const getMySingleBooking = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id as string;
    const bookingId = req.params.id;

    if (!bookingId) throw new Error("Booking ID is required");

    const booking = await bookingService.getMySingleBooking({
      studentId,
      bookingId,
    });

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Fetching booking failed",
      details: e,
    });
  }
};

const cancelMyBooking = async (req: Request, res: Response) => {
  try {
    const studentId = req.user?.id as string;
    const bookingId = req.params.id;

    if (!bookingId) throw new Error("Booking ID is required");

    const reason =
      typeof req.body.reason === "string" ? req.body.reason : undefined;

    const booking = await bookingService.cancelBookingByStudent({
      studentId,
      bookingId,
      reason,
    });

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Cancelling booking failed",
      details: e,
    });
  }
};

const getTutorBookings = async (req: Request, res: Response) => {
  try {
    const tutorUserId = req.user?.id as string;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await bookingService.getTutorBookings({
      tutorUserId,
      status,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching tutor bookings failed",
      details: e,
    });
  }
};

const completeBooking = async (req: Request, res: Response) => {
  try {
    const tutorUserId = req.user?.id as string;
    const bookingId = req.params.id;

    if (!bookingId) throw new Error("Booking ID is required");

    const booking = await bookingService.completeBookingByTutor({
      tutorUserId,
      bookingId,
    });

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Completing booking failed",
      details: e,
    });
  }
};

export const bookingController = {
  createBooking,
  getMyBookings,
  getMySingleBooking,
  cancelMyBooking,
  getTutorBookings,
  completeBooking,
};
