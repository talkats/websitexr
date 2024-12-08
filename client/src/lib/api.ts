import type { InsertUser, User } from "@db/schema";

const API_BASE = "/api";

export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE}/users`);
  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }
  return response.json();
}

export async function createUser(user: InsertUser): Promise<User> {
  const response = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  
  if (!response.ok) {
    throw new Error("Failed to create user");
  }
  
  return response.json();
}

export async function deleteUser(id: number): Promise<User> {
  const response = await fetch(`${API_BASE}/users/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete user");
  }
  
  return response.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Health check failed");
  }
  return response.json();
}

// Project Management API Functions
export async function getProjects() {
  const response = await fetch(`${API_BASE}/projects`);
  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }
  return response.json();
}

export async function createProject(project: { name: string; thumbnail_url?: string }) {
  const response = await fetch(`${API_BASE}/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error("Failed to create project");
  }
  return response.json();
}

export async function updateProject(id: number, project: { name: string; thumbnail_url?: string }) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });
  if (!response.ok) {
    throw new Error("Failed to update project");
  }
  return response.json();
}

export async function deleteProject(id: number) {
  const response = await fetch(`${API_BASE}/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete project");
  }
  return response.json();
}

export async function assignUsersToProject(projectId: number, userIds: number[]) {
  const response = await fetch(`${API_BASE}/projects/${projectId}/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIds }),
  });
  if (!response.ok) {
    throw new Error("Failed to assign users to project");
  }
  return response.json();
}
