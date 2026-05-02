"use client";
import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function AdminDashboard() {
  const [stats, setStats]         = useState<any>(null);
  const [users, setUsers]         = useState<any[]>([]);
  const [history, setHistory]     = useState<any[]>([]);
  const [suspicious, setSuspicious] = useState<any[]>([]);
  const [requests, setRequests]   = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    loadStats();
    loadUsers();
    loadHistory();
    loadSuspicious();
    loadRequests();
  }

  async function loadStats() {
    const res = await fetch(`${API}/api/admin/stats`, { credentials: "include" });
    if (res.ok) setStats(await res.json());
  }

  async function loadUsers() {
    const res = await fetch(`${API}/api/admin/users`, { credentials: "include" });
    if (res.ok) setUsers(await res.json());
  }

  async function loadHistory() {
    const res = await fetch(`${API}/api/admin/login-history`, { credentials: "include" });
    if (res.ok) setHistory(await res.json());
  }

  async function loadSuspicious() {
    const res = await fetch(`${API}/api/admin/suspicious`, { credentials: "include" });
    if (res.ok) setSuspicious(await res.json());
  }

  async function loadRequests() {
    const res = await fetch(`${API}/api/admin/deletion-requests`, { credentials: "include" });
    if (res.ok) setRequests(await res.json());
  }

  async function killCooldown(user_id: number) {
    if (!confirm("Clear cooldown for this user?")) return;
    const res = await fetch(`${API}/api/admin/kill-cooldown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadUsers(); loadStats();
  }

  async function deleteUser(user_id: number, name: string) {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API}/api/admin/delete-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadUsers(); loadStats();
  }

  async function changeRole(user_id: number, role_id: number) {
    const label = role_id === 1 ? "Admin" : "User";
    if (!confirm(`Change this user's role to ${label}?`)) return;
    const res = await fetch(`${API}/api/admin/change-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id, role_id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadUsers();
  }

  async function deleteLogin(login_id: number) {
    if (!confirm("Delete this login record?")) return;
    const res = await fetch(`${API}/api/admin/delete-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login_id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadHistory();
  }

  async function approveRequest(request_id: number, action: string) {
    const res = await fetch(`${API}/api/admin/approve-delete-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ request_id, action }),
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadRequests(); loadHistory();
  }

  const tabs = [
    { id: "users",      label: "Users",           icon: "group" },
    { id: "history",    label: "Login History",   icon: "history" },
    { id: "suspicious", label: "Suspicious",      icon: "warning" },
    { id: "requests",   label: "Deletion Requests", icon: "delete_sweep" },
  ];

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Header */}
      <header className="bg-inverse-surface text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="font-headline font-bold text-2xl">IdentityPro Admin</h1>
          <p className="text-inverse-on-surface text-sm">Monitoring & Management Console</p>
        </div>
        
          <a href="http://localhost:5000/logout" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold">
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </a>
      </header>

      {/* Stats */}
      {stats && (
        <div className="px-8 py-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Users",      value: stats.total_users,       icon: "group",   color: "text-primary" },
            { label: "Logins Today",     value: stats.logins_today,      icon: "login",   color: "text-secondary" },
            { label: "Suspicious Today", value: stats.suspicious_today,  icon: "warning", color: "text-amber-500" },
            { label: "Failed Today",     value: stats.failed_today,      icon: "block",   color: "text-red-500" },
            { label: "In Cooldown",      value: stats.users_in_cooldown, icon: "timer",   color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/10">
              <span className={`material-symbols-outlined ${s.color} text-2xl`}>{s.icon}</span>
              <p className={`text-3xl font-black font-headline mt-2 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="px-8">
        <div className="flex gap-1 bg-surface-container-low p-1 rounded-xl w-fit mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
              {tab.id === "requests" && requests.length > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {requests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Name","Email","Role","Status","Logins","Failed","Suspicious","Cooldown","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const inCooldown = u.cooldown_until && new Date(u.cooldown_until) > new Date();
                  return (
                    <tr key={u.user_id} className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-semibold">{u.name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role_name === "Admin" ? "bg-primary/10 text-primary" : "bg-surface-container text-on-surface-variant"}`}>
                          {u.role_name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{u.account_status}</span>
                      </td>
                      <td className="px-4 py-3">{u.total_logins}</td>
                      <td className="px-4 py-3 text-red-500 font-semibold">{u.failed_logins}</td>
                      <td className="px-4 py-3">
                        {u.suspicious_logins > 0
                          ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⚠️ {u.suspicious_logins}</span>
                          : <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Clean</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs text-on-surface-variant">{inCooldown ? u.cooldown_until : "None"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {inCooldown && (
                            <button onClick={() => killCooldown(u.user_id)} className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors">
                              Clear Cooldown
                            </button>
                          )}
                          <button onClick={() => changeRole(u.user_id, u.role_name === "Admin" ? 2 : 1)} className="px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                            {u.role_name === "Admin" ? "Make User" : "Make Admin"}
                          </button>
                          <button onClick={() => deleteUser(u.user_id, u.name)} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Login History Tab */}
        {activeTab === "history" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  {["User","Email","Time","IP","Device","Status","Suspicious","Action"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.login_id} className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-semibold">{h.user_name}</td>
                    <td className="px-4 py-3 text-on-surface-variant">{h.email}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant">{h.login_time}</td>
                    <td className="px-4 py-3 font-mono text-xs">{h.ip_address}</td>
                    <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[150px] truncate">{h.device_info}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${h.login_status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {h.login_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {h.suspicious_flag
                        ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⚠️ Yes</span>
                        : <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">No</span>
                      }
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteLogin(h.login_id)} className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Suspicious Tab */}
        {activeTab === "suspicious" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
            {suspicious.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">verified_user</span>
                No suspicious logins detected
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    {["User","Email","Time","IP","Device","Total Suspicious"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {suspicious.map((s) => (
                    <tr key={s.login_id} className="border-t border-outline-variant/10 hover:bg-amber-50 transition-colors">
                      <td className="px-4 py-3 font-semibold">{s.user_name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{s.email}</td>
                      <td className="px-4 py-3 text-xs">{s.login_time}</td>
                      <td className="px-4 py-3 font-mono text-xs">{s.ip_address}</td>
                      <td className="px-4 py-3 text-xs max-w-[150px] truncate">{s.device_info}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                          ⚠️ {s.total_suspicious_for_user}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Deletion Requests Tab */}
        {activeTab === "requests" && (
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
            {requests.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block">inbox</span>
                No pending deletion requests
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    {["User","Email","Login Time","IP","Device","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.request_id} className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-semibold">{r.user_name}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{r.email}</td>
                      <td className="px-4 py-3 text-xs">{r.login_time}</td>
                      <td className="px-4 py-3 font-mono text-xs">{r.ip_address}</td>
                      <td className="px-4 py-3 text-xs max-w-[150px] truncate">{r.device_info}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => approveRequest(r.request_id, "approve")} className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-semibold hover:bg-green-200 transition-colors">
                            Approve
                          </button>
                          <button onClick={() => approveRequest(r.request_id, "reject")} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-semibold hover:bg-red-200 transition-colors">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}