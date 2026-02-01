import { NextFunction, Request, Response } from "express";
import { UserRolesEnum } from "../common/enums";
import { auth } from "../lib/auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        emailVerified: boolean;
        name: string;
        email: string;
      };
    }
  }
}

export const authMiddleware = (...roles: UserRolesEnum[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });
      if (!session) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      // if (session.user.emailVerified === false) {
      //   return res
      //     .status(403)
      //     .json({ success: false, message: "Email not verified" });
      // }

      req.user = {
        id: session.user.id,
        email: session.user.email!,
        role: session.user.role!,
        emailVerified: session.user.emailVerified,
        name: session.user.name,
      };

      if (roles.length && !roles.includes(req.user.role as UserRolesEnum)) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      next();
    } catch (error) {}
  };
};
