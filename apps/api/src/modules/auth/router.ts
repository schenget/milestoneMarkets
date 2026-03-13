import { Router } from "express";
import { z } from "zod";
import { pbkdf2Sync, randomBytes } from "crypto";
import { memoryStore } from "../../shared/store.js";
import { issueToken } from "../../shared/auth.js";
import type { Role } from "@milestone/core-types";

const requestOtpSchema = z.object({ phone: z.string().min(6), country: z.string().min(2) });
const verifyOtpSchema = z.object({ phone: z.string(), otp: z.string().length(6) });

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().min(2),
  language: z.string().min(2).default("en"),
  name: z.string().optional(),
  experienceLevel: z.enum(["beginner", "intermediate"]).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 100_000, 32, "sha256").toString("hex");
}

export const authRouter = Router();

authRouter.post("/register", (req, res) => {
  const body = registerSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const existing = memoryStore.users.find((u) => u.email === body.data.email);
  if (existing) return res.status(409).json({ message: "Email already registered" });

  const salt = randomBytes(16).toString("hex");
  const hash = hashPassword(body.data.password, salt);

  const user = {
    id: `u-${Date.now()}`,
    email: body.data.email,
    name: body.data.name ?? null,
    phone: null,
    role: "subscriber" as Role,
    country: body.data.country,
    language: body.data.language,
    experienceLevel: body.data.experienceLevel ?? "beginner",
    accountType: "free" as const,
    passwordHash: hash,
    passwordSalt: salt
  };

  memoryStore.users.push(user);
  memoryStore.portfolios.push({ userId: user.id, simulatedBalance: 10000, holdings: [] });

  const token = issueToken({ sub: user.id, role: user.role, country: user.country });
  return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, accountType: user.accountType } });
});

authRouter.post("/login", (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const user = memoryStore.users.find((u) => u.email === body.data.email);
  if (!user || !user.passwordSalt) return res.status(401).json({ message: "Invalid credentials" });

  const hash = hashPassword(body.data.password, user.passwordSalt);
  if (hash !== user.passwordHash) return res.status(401).json({ message: "Invalid credentials" });

  const token = issueToken({ sub: user.id, role: user.role, country: user.country });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, accountType: user.accountType } });
});

authRouter.post("/request-otp", (req, res) => {
  const body = requestOtpSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  memoryStore.otp.set(body.data.phone, otp);

  return res.json({ message: "OTP generated", otpPreview: otp });
});

authRouter.post("/verify-otp", (req, res) => {
  const body = verifyOtpSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const savedOtp = memoryStore.otp.get(body.data.phone);
  if (!savedOtp || savedOtp !== body.data.otp) {
    return res.status(401).json({ message: "OTP invalid" });
  }

  let user = memoryStore.users.find((u) => u.phone === body.data.phone);
  if (!user) {
    user = { id: `u-${memoryStore.users.length + 1}`, name: "Subscriber", phone: body.data.phone, role: "subscriber" as Role, country: "GH", accountType: "free" };
    memoryStore.users.push(user);
    memoryStore.portfolios.push({ userId: user.id, simulatedBalance: 10000, holdings: [] });
  }

  const token = issueToken({ sub: user.id, role: user.role, country: user.country });
  return res.json({ token, user });
});
