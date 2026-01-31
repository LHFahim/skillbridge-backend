import { Request, Response } from "express";
import { UserStatusEnum } from "../../../prisma/generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelpers";
import { UserService } from "./user.service";

const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await UserService.getMyProfile(userId as string);
    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({
      error: "Profile fetch failed",
      details: e,
    });
  }
};

const getAllUsers = async (req: Request, res: Response) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const role =
      typeof req.query.role === "string" ? req.query.role : undefined;

    const status =
      typeof req.query.status === "string" ? req.query.status : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(
      req.query,
    );

    const result = await UserService.getAllUsers({
      search,
      role,
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
      error: "Fetching users failed",
      details: e,
    });
  }
};

const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const status =
      typeof req.body.status === "string" && req.body.status.trim() !== ""
        ? req.body.status.trim()
        : undefined;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    if (status !== UserStatusEnum.ACTIVE && status !== UserStatusEnum.BANNED) {
      return res
        .status(400)
        .json({ error: "Status must be either ACTIVE or BANNED" });
    }

    const result = await UserService.updateUserStatus(userId, status);

    return res.status(200).json({
      success: true,
      message: `User ${status === UserStatusEnum.BANNED ? "blocked" : "activated"} successfully`,
      data: result,
    });
  } catch (e) {
    return res.status(400).json({
      error: "Updating user status failed",
      details: e,
    });
  }
};

export const UserController = {
  getMyProfile,
  getAllUsers,
  updateUserStatus,
};
