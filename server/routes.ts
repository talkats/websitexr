import type { Express } from "express";
import { db } from "../db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_, res) => {
    res.json({ status: "healthy" });
  });

  // Get all users
  app.get("/api/users", async (_, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if username already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (existing.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const [newUser] = await db
        .insert(users)
        .values({ username, password })
        .returning();

      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Delete user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deletedUser = await db
        .delete(users)
        .where(eq(users.id, userId))
        .returning();

      if (!deletedUser.length) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(deletedUser[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
}
