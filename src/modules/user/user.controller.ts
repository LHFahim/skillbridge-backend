import { Request, Response } from "express";
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

export const UserController = {
  getMyProfile,
};
