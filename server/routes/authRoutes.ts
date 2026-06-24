import { Router, Request, Response } from "express";
import {
  createUser,
  getUserByEmail,
  getUserById,
  touchUserActive,
  updateUserProfile,
  updateUserPassword,
  getUserWellnessStats
} from "../db";
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

// GET /api/auth/profile-stats — get actual user statistics for profile
router.get("/profile-stats", requireAuth, (req: AuthRequest, res: Response): void => {
  try {
    const stats = getUserWellnessStats(req.user!.userId);
    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch profile stats:", error);
    res.status(500).json({ error: "Failed to fetch profile stats" });
  }
});

// POST /api/auth/update-profile — update user profile (name, email, password)
router.post("/update-profile", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, email, password } = req.body;
  const userId = req.user!.userId;

  if (!name || !email) {
    res.status(400).json({ error: "Name and email are required" });
    return;
  }

  const emailClean = email.toLowerCase().trim();
  const nameClean = name.trim();

  // Check if email is already taken by another user
  const existing = getUserByEmail(emailClean);
  if (existing && existing.id !== userId) {
    res.status(409).json({ error: "Email is already in use by another account" });
    return;
  }

  try {
    // Update name and email in DB
    updateUserProfile(userId, nameClean, emailClean);

    // Update password if provided
    if (password && password.trim().length > 0) {
      if (password.length < 6) {
        res.status(400).json({ error: "Password must be at least 6 characters" });
        return;
      }
      const hash = await hashPassword(password);
      updateUserPassword(userId, hash);
    }

    const updatedUser = getUserById(userId)!;
    
    // Sign a new token with updated name/email
    const token = signToken({ userId: updatedUser.id, email: updatedUser.email, name: updatedUser.name });

    res.json({
      success: true,
      token,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        streak: updatedUser.streak,
        created_at: updatedUser.created_at
      }
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
