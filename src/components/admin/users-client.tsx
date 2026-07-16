"use client";

import { useState } from "react";
import { Users, Search, Trash2, Download } from "lucide-react";
import type { User } from "@/types/user";

interface Props {
  initialUsers: User[];
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate2(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function UsersClient({ initialUsers }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "logins" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = users
    .filter((u) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone?.includes(q) ||
          u.id.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortBy === "logins") {
        return sortDir === "asc" ? a.loginCount - b.loginCount : b.loginCount - a.loginCount;
      } else {
        const aDate = new Date(a.loginAt).getTime();
        const bDate = new Date(b.loginAt).getTime();
        return sortDir === "asc" ? aDate - bDate : bDate - aDate;
      }
    });

  const selectedUserData = users.find((u) => u.id === selectedUser);

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setSelectedUser(null);
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  }

  function exportToCSV() {
    const headers = ["ID", "Name", "Email", "Phone", "Login Count", "Last Login", "Registered"];
    const rows = filtered.map((u) => [
      u.id,
      u.name,
      u.email || "-",
      u.phone || "-",
      u.loginCount,
      formatDate(u.loginAt),
      formatDate2(u.registeredAt),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join(
      "\n",
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-export-${new Date().getTime()}.csv`;
    a.click();
  }

  const totalLogins = filtered.reduce((sum, u) => sum + u.loginCount, 0);
  const avgLogins = filtered.length > 0 ? Math.round(totalLogins / filtered.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Total Logins</div>
          <div className="text-2xl font-bold text-blue-600">{totalLogins}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Avg Logins</div>
          <div className="text-2xl font-bold text-purple-600">{avgLogins}</div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="mb-1 text-xs uppercase tracking-wider text-gray-500">Active Today</div>
          <div className="text-2xl font-bold text-green-600">
            {
              filtered.filter((u) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return new Date(u.loginAt) >= today;
              }).length
            }
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Login Details</h2>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            {/* Filters & Search */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, phone, or ID..."
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSortBy("date")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === "date"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Last Login
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === "name"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("logins")}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    sortBy === "logins"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Login Count
                </button>
                <button
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className="ml-auto rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  {sortDir === "asc" ? "↑ ASC" : "↓ DESC"}
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                    className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                      selectedUser === user.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                        {user.loginCount} logins
                      </span>
                    </div>
                    <div className="mb-1 text-sm text-gray-600">
                      {user.email && <p>{user.email}</p>}
                      {user.phone && <p>{user.phone}</p>}
                    </div>
                    <p className="text-xs text-gray-500">Last login: {formatDate(user.loginAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        {selectedUserData && (
          <div className="sticky top-6 h-fit space-y-4 rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">User Details</h3>

            {/* Name */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">Name</label>
              <p className="text-lg font-medium text-gray-900">{selectedUserData.name}</p>
            </div>

            {/* User ID */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500">User ID</label>
              <p className="break-all font-mono text-sm text-gray-600">{selectedUserData.id}</p>
            </div>

            {/* Email */}
            {selectedUserData.email && (
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Email</label>
                <p className="break-all text-gray-900">{selectedUserData.email}</p>
              </div>
            )}

            {/* Phone */}
            {selectedUserData.phone && (
              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Phone</label>
                <p className="font-mono text-gray-900">{selectedUserData.phone}</p>
              </div>
            )}

            {/* Login Stats */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500">
                    Total Logins
                  </label>
                  <p className="text-2xl font-bold text-gray-900">{selectedUserData.loginCount}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-gray-500">Status</label>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Last Login</label>
                <p className="text-gray-900">{formatDate(selectedUserData.loginAt)}</p>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-gray-500">Registered</label>
                <p className="text-gray-900">{formatDate(selectedUserData.registeredAt)}</p>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteUser(selectedUserData.id)}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
            >
              <Trash2 size={16} />
              Delete User
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
