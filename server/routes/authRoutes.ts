import { Router, Request, Response } from "express";
import { createUser, getUserByEmail, getUserById, touchUserActive } from "../db";
import { signToken, hashPassword, comparePassword } from "../auth";
import { requireAuth, AuthRequest } from "../middleware/requireAuth";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body;

  if (!email || !name || !password) {
    res.status(400).json({ error: "Email, name and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const existing = getUserByEmail(email.toLowerCase().trim());
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  try {
    const hash = await hashPassword(password);
    const userId = createUser(email.toLowerCase().trim(), name.trim(), hash);
    const user = getUserById(Number(userId))!;
    const token = signToken({ userId: user.id, email: user.email, name: user.name });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, streak: user.streak, created_at: user.created_at },
    });
  } catch (e: any) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = getUserByEmail(email.toLowerCase().trim());
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await comparePassword(password, user.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  touchUserActive(user.id);
  const token = signToken({ userId: user.id, email: user.email, name: user.name });
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, streak: user.streak, created_at: user.created_at },
  });
});

// GET /api/auth/me  — verify token and return user
router.get("/me", requireAuth, (req: AuthRequest, res: Response): void => {
  const user = getUserById(req.user!.userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json({ id: user.id, email: user.email, name: user.name, streak: user.streak, created_at: user.created_at });
});

export default router;
