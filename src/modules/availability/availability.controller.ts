import { Request, Response } from "express";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { availabilitySlotService } from "./availability.service";

const getAllAvailabilitySlots = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const tutorProfileId =
      typeof req.query.tutorProfileId === "string" &&
      req.query.tutorProfileId.trim() !== ""
        ? req.query.tutorProfileId.trim()
        : undefined;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const from =
      typeof req.query.from === "string" && req.query.from.trim() !== ""
        ? new Date(req.query.from)
        : undefined;

    const to =
      typeof req.query.to === "string" && req.query.to.trim() !== ""
        ? new Date(req.query.to)
        : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await availabilitySlotService.getAllAvailabilitySlots({
      search,
      tutorId: tutorProfileId,
      status,
      from,
      to,
      page,
      limit,
      skip,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (e) {
    return res.status(400).json({
      error: "Fetching availability slots failed",
      details: e,
    });
  }
};

const getSingleAvailabilitySlot = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  if (!id) throw new Error("Slot ID is required");

  const result = await availabilitySlotService.getSingleAvailabilitySlot(
    userId,
    id,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

const createAvailabilitySlots = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { slot } = req.body;

  const result = await availabilitySlotService.createAvailabilitySlot(
    userId,
    slot,
  );

  res.status(201).json({
    success: true,
    message: "Availability slots created",
    data: result,
  });
};

const updateAvailabilitySlot = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  if (!id) throw new Error("Slot ID is required");

  const payload = {
    ...(req.body.startTime ? { startTime: new Date(req.body.startTime) } : {}),
    ...(req.body.endTime ? { endTime: new Date(req.body.endTime) } : {}),
    ...(req.body.status ? { status: req.body.status } : {}),
  };

  const result = await availabilitySlotService.updateAvailabilitySlot(
    userId,
    id,
    payload,
  );

  res.status(200).json({
    success: true,
    message: "Availability slot updated",
    data: result,
  });
};

const deleteAvailabilitySlot = async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { id } = req.params;

  if (!id) throw new Error("Slot ID is required");

  const result = await availabilitySlotService.deleteAvailabilitySlot(
    userId,
    id,
  );

  res.status(200).json({
    success: true,
    message: "Availability slot deleted",
    data: result,
  });
};

export const availabilitySlotController = {
  getAllAvailabilitySlots,
  getSingleAvailabilitySlot,
  createAvailabilitySlots,
  updateAvailabilitySlot,
  deleteAvailabilitySlot,
};
