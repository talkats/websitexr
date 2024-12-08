import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, projects, projectAssignments, User, Project } from "@db/schema";
import { eq, and } from "drizzle-orm";

// Extend Express Request type to include user
declare module 'express' {
  interface Request {
    user?: User;
  }
}

// Middleware to check if user is admin
const isAdmin = (req: Request) => {
  return req.user?.role === 'admin';
};

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

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

  // Project Management Routes
  
  // Get all projects (with role-based filtering)
  app.get("/api/projects", async (req, res) => {
    try {
      const query = isAdmin(req)
        ? db.select().from(projects)
        : db
            .select({
              id: projects.id,
              name: projects.name,
              created_at: projects.created_at,
              thumbnail_url: projects.thumbnail_url,
            })
            .from(projects)
            .innerJoin(
              projectAssignments,
              eq(projects.id, projectAssignments.project_id)
            )
            .where(eq(projectAssignments.user_id, req.user?.id));

      const allProjects = await query;
      res.json(allProjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: "Only admins can create projects" });
      }

      const { name, thumbnail_url } = req.body;
      const [newProject] = await db
        .insert(projects)
        .values({ name, thumbnail_url })
        .returning();

      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  // Update project
  app.put("/api/projects/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: "Only admins can update projects" });
      }

      const projectId = parseInt(req.params.id);
      const { name, thumbnail_url } = req.body;
      
      const [updatedProject] = await db
        .update(projects)
        .set({ name, thumbnail_url })
        .where(eq(projects.id, projectId))
        .returning();

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(updatedProject);
    } catch (error) {
      res.status(500).json({ error: "Failed to update project" });
    }
  });

  // Delete project
  app.delete("/api/projects/:id", async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: "Only admins can delete projects" });
      }

      const projectId = parseInt(req.params.id);
      const [deletedProject] = await db
        .delete(projects)
        .where(eq(projects.id, projectId))
        .returning();

      if (!deletedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      res.json(deletedProject);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Assign users to project
  app.post("/api/projects/:id/assign", async (req, res) => {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ error: "Only admins can assign users to projects" });
      }

      const projectId = parseInt(req.params.id);
      const { userIds } = req.body;

      // Remove existing assignments
      await db
        .delete(projectAssignments)
        .where(eq(projectAssignments.project_id, projectId));

      // Add new assignments
      const assignments = await Promise.all(
        userIds.map(async (userId: number) => {
          const [assignment] = await db
            .insert(projectAssignments)
            .values({ project_id: projectId, user_id: userId })
            .returning();
          return assignment;
        })
      );

      res.json(assignments);
    } catch (error) {
      res.status(500).json({ error: "Failed to assign users to project" });
    }
  });
}
