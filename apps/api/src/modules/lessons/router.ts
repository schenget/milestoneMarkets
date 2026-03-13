import { Router } from "express";
import { z } from "zod";
import { authGuard, roleGuard } from "../../shared/auth.js";
import { memoryStore } from "../../shared/store.js";

const lessonSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(2),
  category: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  readingTimeMin: z.number().int().positive(),
  language: z.string().min(2).default("en"),
  content: z.string().min(10),
  free: z.boolean().default(true)
});

export const lessonsRouter = Router();

// Progress route must come before /:slug to avoid slug match
lessonsRouter.get("/progress/me", authGuard, (req, res) => {
  const reqUser = (req as any).user;
  const completed = memoryStore.lessonProgress.filter((p) => p.userId === reqUser.sub);
  const total = memoryStore.lessons.length;
  const pct = total ? Math.round((completed.length / total) * 100) : 0;
  return res.json({
    completedLessons: completed.map((p) => p.lessonSlug),
    completedCount: completed.length,
    totalLessons: total,
    progressPct: pct
  });
});

lessonsRouter.get("/", (req, res) => {
  const { category, difficulty, language } = req.query;
  let lessons = memoryStore.lessons.map(({ content, ...rest }) => rest);
  if (category) lessons = lessons.filter((l) => l.category === category);
  if (difficulty) lessons = lessons.filter((l) => l.difficulty === difficulty);
  if (language) lessons = lessons.filter((l) => l.language === language);
  res.json(lessons);
});

lessonsRouter.get("/:slug", (req, res) => {
  const lesson = memoryStore.lessons.find((l) => l.slug === req.params.slug);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });
  return res.json(lesson);
});

lessonsRouter.post("/", authGuard, roleGuard("admin", "analyst"), (req, res) => {
  const body = lessonSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  const existing = memoryStore.lessons.find((l) => l.slug === body.data.slug);
  if (existing) return res.status(409).json({ message: "Slug already exists" });

  const lesson = { ...body.data, createdAt: new Date().toISOString() };
  memoryStore.lessons.push(lesson);
  return res.status(201).json(lesson);
});

lessonsRouter.put("/:slug", authGuard, roleGuard("admin", "analyst"), (req, res) => {
  const idx = memoryStore.lessons.findIndex((l) => l.slug === req.params.slug);
  if (idx < 0) return res.status(404).json({ message: "Lesson not found" });

  const body = lessonSchema.partial().safeParse(req.body);
  if (!body.success) return res.status(400).json(body.error.flatten());

  memoryStore.lessons[idx] = { ...memoryStore.lessons[idx], ...body.data };
  return res.json(memoryStore.lessons[idx]);
});

lessonsRouter.delete("/:slug", authGuard, roleGuard("admin"), (req, res) => {
  const idx = memoryStore.lessons.findIndex((l) => l.slug === req.params.slug);
  if (idx < 0) return res.status(404).json({ message: "Lesson not found" });
  memoryStore.lessons.splice(idx, 1);
  return res.status(204).send();
});

lessonsRouter.post("/:slug/complete", authGuard, (req, res) => {
  const reqUser = (req as any).user;
  const lesson = memoryStore.lessons.find((l) => l.slug === req.params.slug);
  if (!lesson) return res.status(404).json({ message: "Lesson not found" });

  const existing = memoryStore.lessonProgress.find(
    (p) => p.userId === reqUser.sub && p.lessonSlug === req.params.slug
  );
  if (!existing) {
    memoryStore.lessonProgress.push({
      userId: reqUser.sub,
      lessonSlug: req.params.slug,
      completedAt: new Date().toISOString()
    });
  }
  return res.json({ completed: true, lessonSlug: req.params.slug });
});
