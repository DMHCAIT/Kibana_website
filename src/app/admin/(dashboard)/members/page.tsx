import { getUsers } from "@/lib/server-data";
import { UsersClient } from "@/components/admin/users-client";
import type { User } from "@/types/user";

export const dynamic = "force-dynamic";

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([p, new Promise<T>((res) => setTimeout(() => res(fallback), ms))]);
}

export default async function AdminMembersPage() {
  const adminUsers = await withTimeout(getUsers(), 2500, []);
  
  // Transform AdminUser to User type
  const users: User[] = adminUsers.map(u => ({
    ...u,
    registeredAt: u.registeredAt || new Date().toISOString(),
  }));
  
  const sorted = [...users].sort(
    (a, b) => new Date(b.loginAt).getTime() - new Date(a.loginAt).getTime()
  );
  return <UsersClient initialUsers={sorted} />;
}

