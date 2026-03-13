import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "dev-secret";

function isDevBypassEnabled() {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.DEV_BYPASS_AUTH !== "false";
}

export interface JwtPayload {
  sub: string;
  role: string;
  country: string;
}

export const issueToken = (payload: JwtPayload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "8h" });

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token && isDevBypassEnabled()) {
    const bypassSub = String(req.headers["x-dev-bypass-user"] ?? "u-admin");
    const bypassRole = String(req.headers["x-dev-bypass-role"] ?? "admin");
    const bypassCountry = String(req.headers["x-dev-bypass-country"] ?? "GH");
    (req as Request & { user?: JwtPayload }).user = {
      sub: bypassSub,
      role: bypassRole,
      country: bypassCountry
    };
    return next();
  }

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as Request & { user?: JwtPayload }).user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const roleGuard = (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const user = (req as Request & { user?: JwtPayload }).user;
  if (!user || !roles.includes(user.role)) return res.status(403).json({ message: "Forbidden" });
  next();
};
