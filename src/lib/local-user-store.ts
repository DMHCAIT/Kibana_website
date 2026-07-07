import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";

export type LocalAuthUser = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  loginAt: string;
  loginCount: number;
  registeredAt: string;
};

const usersFilePath = path.join(process.cwd(), "src", "data", "users.json");

async function readUsers(): Promise<LocalAuthUser[]> {
  try {
    const raw = await fs.readFile(usersFilePath, "utf-8");
    const parsed = JSON.parse(raw) as LocalAuthUser[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

async function writeUsers(users: LocalAuthUser[]): Promise<void> {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
}

export async function getLocalUserByEmail(email: string): Promise<LocalAuthUser | null> {
  const cleanEmail = email.toLowerCase().trim();
  const users = await readUsers();
  return users.find((u) => u.email?.toLowerCase() === cleanEmail) ?? null;
}

export async function getLocalUserById(userId: string): Promise<LocalAuthUser | null> {
  const users = await readUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function createLocalUser(input: {
  email: string;
  name?: string;
  phone?: string;
}): Promise<{ user?: LocalAuthUser; error?: "already_exists" }> {
  const cleanEmail = input.email.toLowerCase().trim();
  const users = await readUsers();
  if (users.some((u) => u.email?.toLowerCase() === cleanEmail)) {
    return { error: "already_exists" };
  }

  const nowIso = new Date().toISOString();
  const user: LocalAuthUser = {
    id: randomUUID(),
    email: cleanEmail,
    name: input.name?.trim() || cleanEmail.split("@")[0] || "User",
    phone: input.phone?.trim() || "",
    loginAt: nowIso,
    loginCount: 1,
    registeredAt: nowIso,
  };

  users.push(user);
  await writeUsers(users);
  return { user };
}

export async function loginLocalUserByEmail(
  email: string,
): Promise<{ user?: LocalAuthUser; error?: "not_found" }> {
  const cleanEmail = email.toLowerCase().trim();
  const users = await readUsers();
  const idx = users.findIndex((u) => u.email?.toLowerCase() === cleanEmail);
  if (idx === -1) return { error: "not_found" };

  const nowIso = new Date().toISOString();
  users[idx] = {
    ...users[idx],
    loginAt: nowIso,
    loginCount: (users[idx].loginCount || 0) + 1,
  };
  await writeUsers(users);
  return { user: users[idx] };
}
