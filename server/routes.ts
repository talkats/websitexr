import type { Express, Request, Response, NextFunction } from "express";
import { db } from "../db";
import { users, projects, projectAssignments, User, Project } from "@db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

// Extend Express Request type to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: User;
  }
}

// Middleware to check if user is admin
const isAdmin = async (req: Request) => {
  try {
    // For development, consider authenticated users as admin
    // In production, you would want to verify the role against the database
    const isAuthenticated = req.cookies?.['authenticated'] === 'true';
    console.log('Admin check:', { 
      cookies: req.cookies,
      isAuthenticated 
    });
    return isAuthenticated;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
};

// Middleware to ensure user is authenticated
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.cookies['authenticated'] !== 'true') {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

export function registerRoutes(app: Express) {
  // Health check endpoint
  app.get("/api/health", (_, res) => {
    res.json({ status: "healthy" });
  });

  // Login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Find user by username and include hashed_password
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
          role: users.role,
          hashed_password: users.hashed_password
        })
        .from(users)
        .where(eq(users.username, username));
      
      if (!user) {
        console.log('User not found:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Log the retrieved user data (excluding password)
      console.log('Found user:', {
        id: user.id,
        username: user.username,
        role: user.role,
        hasHashedPassword: !!user.hashed_password
      });

      // Compare password hash
      const isValidPassword = await bcrypt.compare(password, user.hashed_password);
      console.log('Password validation:', { 
        username,
        isValidPassword
      });
      
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Set authentication cookie
      res.cookie('authenticated', 'true', {
        httpOnly: false, // Allow JavaScript access
        secure: false, // Allow non-HTTPS in development
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return user info (excluding sensitive data)
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: "Internal server error" });
    }
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
      const { username, password, email } = req.body;
      
      // Check if username already exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      
      if (existing.length > 0) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const saltRounds = 10;
      const hashed_password = await bcrypt.hash(password, saltRounds);

      // Insert new user with hashed password
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email: email || `${username}@example.com`,
          hashed_password,
          role: username === 'admin' ? 'admin' : 'user'
        })
        .returning();

      // Return user without hashed_password
      const { hashed_password: _, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Create user error:', error);
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
      let query;
      if (isAdmin(req)) {
        query = db.select().from(projects);
      } else if (req.user?.id) {
        query = db
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
          .where(eq(projectAssignments.user_id, req.user.id));
      } else {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const allProjects = await query;
      res.json(allProjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  // Create new project
  app.post("/api/projects", async (req, res) => {
    try {
      // Check authentication
      if (req.cookies?.['authenticated'] !== 'true') {
        console.log('Project creation: Authentication failed', { cookies: req.cookies });
        return res.status(403).json({ error: "Only admins can create projects" });
      }

      const { name, thumbnail_url } = req.body;
      console.log('Creating project:', { name, thumbnail_url });

      // Validate name
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Project name is required" });
      }

      // Create project with optional thumbnail
      const [newProject] = await db
        .insert(projects)
        .values({ 
          name: name.trim(),
          thumbnail_url: thumbnail_url || null 
        })
        .returning();

      console.log('Project created successfully:', newProject);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Project creation error:', error);
      if (error instanceof Error) {
        res.status(500).json({ error: `Failed to create project: ${error.message}` });
      } else {
        res.status(500).json({ error: "Failed to create project" });
      }
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
