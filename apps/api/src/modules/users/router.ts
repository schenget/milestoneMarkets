import { Router } from "express";
import { z } from "zod";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

const profileUpdateSchema = z.object({
  name: z.string().optional(),
  language: z.string().min(2).optional(),
  experienceLevel: z.enum(["beginner", "intermediate"]).optional()
});

export const usersRouter = Router();

usersRouter.get("/", authGuard, roleGuard("admin", "operator"), (_req, res) => {
  res.json(memoryStore.users.map(({ passwordHash, passwordSalt, ...u }) => u));
});

usersRouter.get("/me", authGuard, (req, res) => {
  const reqUser = (req as any).user;
  const user = memoryStore.users.find((u) => u.id === reqUser.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { passwordHash, passwordSalt, ...safe } = user;
  return res.json(safe);
});

usersRouter.put("/me", authGuard, (req, res) => {
  const reqUser = (req as any).user;
  const body = profileUpdateSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const idx = memoryStore.users.findIndex((u) => u.id === reqUser.sub);
  if (idx < 0) return res.status(404).json({ message: "User not found" });

  memoryStore.users[idx] = { ...memoryStore.users[idx], ...body.data };
  const { passwordHash, passwordSalt, ...safe } = memoryStore.users[idx];
  return res.json(safe);
});
