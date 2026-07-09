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
        return sortDir === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortBy === "logins") {
        return sortDir === "asc"
          ? a.loginCount - b.loginCount
          : b.loginCount - a.loginCount;
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

    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ].join("\n");

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Logins</div>
          <div className="text-2xl font-bold text-blue-600">{totalLogins}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Avg Logins</div>
          <div className="text-2xl font-bold text-purple-600">{avgLogins}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Active Today</div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Login Details</h2>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-xs font-medium transition-colors"
              >
                <Download size={14} />
                Export CSV
              </button>
            </div>

            {/* Filters & Search */}
            <div className="space-y-3 pb-4 border-b border-gray-200">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, email, phone, or ID..."
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSortBy("date")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === "date"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Last Login
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === "name"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Name
                </button>
                <button
                  onClick={() => setSortBy("logins")}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    sortBy === "logins"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Login Count
                </button>
                <button
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors ml-auto"
                >
                  {sortDir === "asc" ? "↑ ASC" : "↓ DESC"}
                </button>
              </div>
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              ) : (
                filtered.map((user) => (
                  <button
                    key={user.id}
                    onClick={() =>
                      setSelectedUser(selectedUser === user.id ? null : user.id)
                    }
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedUser === user.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {user.loginCount} logins
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {user.email && <p>{user.email}</p>}
                      {user.phone && <p>{user.phone}</p>}
                    </div>
                    <p className="text-xs text-gray-500">
                      Last login: {formatDate(user.loginAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* User Details */}
        {selectedUserData && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4 h-fit sticky top-6">
            <h3 className="font-semibold text-gray-900 text-lg">User Details</h3>

            {/* Name */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Name</label>
              <p className="font-medium text-gray-900 text-lg">{selectedUserData.name}</p>
            </div>

            {/* User ID */}
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
              <p className="font-mono text-sm text-gray-600 break-all">
                {selectedUserData.id}
              </p>
            </div>

            {/* Email */}
            {selectedUserData.email && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
                <p className="text-gray-900 break-all">{selectedUserData.email}</p>
              </div>
            )}

            {/* Phone */}
            {selectedUserData.phone && (
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Phone</label>
                <p className="text-gray-900 font-mono">{selectedUserData.phone}</p>
              </div>
            )}

            {/* Login Stats */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Total Logins</label>
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedUserData.loginCount}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Status</label>
                  <p className="text-lg font-semibold text-green-600">Active</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Last Login</label>
                <p className="text-gray-900">{formatDate(selectedUserData.loginAt)}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wider">Registered</label>
                <p className="text-gray-900">{formatDate(selectedUserData.registeredAt)}</p>
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={() => deleteUser(selectedUserData.id)}
              className="w-full px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium text-sm transition-colors flex items-center justify-center gap-2"
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
