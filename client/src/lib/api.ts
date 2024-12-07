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
