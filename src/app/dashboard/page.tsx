"use client";
import React, { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function UserDashboard() {
  const [user, setUser]       = useState<any>(null);
  const [logins, setLogins]   = useState<any[]>([]);
  const [password, setPassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");

  useEffect(() => {
    loadMe();
    loadLogins();
  }, []);

  async function loadMe() {
    const res = await fetch(`${API}/api/me`, { credentials: "include" });
    if (res.ok) setUser(await res.json());
    else window.location.href = "http://localhost:3000/login";
  }

  async function loadLogins() {
    const res = await fetch(`${API}/api/my-logins`, { credentials: "include" });
    if (res.ok) setLogins(await res.json());
  }

  async function requestDelete(login_id: number) {
    if (!confirm("Request admin to delete this login record?")) return;
    const res = await fetch(`${API}/api/request-delete-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ login_id }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  }

  async function deleteAccount() {
    if (!password) { setDeleteMsg("Please enter your password"); return; }
    if (!confirm("Are you absolutely sure? This cannot be undone!")) return;
    const res = await fetch(`${API}/api/delete-my-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Account deleted.");
      window.location.href = "http://localhost:3000/login";
    } else {
      setDeleteMsg(data.error);
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Header */}
      <header className="bg-inverse-surface text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="font-headline font-bold text-2xl">IdentityPro</h1>
          <p className="text-inverse-on-surface text-sm">User Dashboard</p>
        </div>
        <a href="http://localhost:5000/logout" className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold">
          <span className="material-symbols-outlined text-sm">logout</span>
          Logout
        </a>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Profile Card */}
        {user && (
          <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10 mb-8 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-black font-headline">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-headline font-bold text-2xl text-on-surface">{user.name}</h2>
              <p className="text-on-surface-variant">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">{user.role_name}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">{user.account_status}</span>
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface-variant">Since {user.created_at?.split(" ")[0]}</span>
              </div>
            </div>
          </div>
        )}

        {/* Login History */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-outline-variant/10">
            <h3 className="font-headline font-bold text-lg">Login History</h3>
            <p className="text-on-surface-variant text-sm">All your login activity</p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low">
              <tr>
                {["Time","IP Address","Device","Status","Suspicious","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-widest text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logins.map((l) => (
                <tr key={l.login_id} className="border-t border-outline-variant/10 hover:bg-surface-container-low transition-colors">
                  <td className="px-4 py-3 text-xs text-on-surface-variant">{l.login_time}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.ip_address}</td>
                  <td className="px-4 py-3 text-xs text-on-surface-variant max-w-[200px] truncate">{l.device_info}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${l.login_status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {l.login_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {l.suspicious_flag
                      ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">⚠️ Yes</span>
                      : <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">No</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => requestDelete(l.login_id)} className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold hover:bg-amber-200 transition-colors">
                      Request Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Danger Zone */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border-2 border-red-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-100 bg-red-50">
            <h3 className="font-headline font-bold text-lg text-red-700">Danger Zone</h3>
            <p className="text-red-500 text-sm">Permanently delete your account. This cannot be undone.</p>
          </div>
          <div className="px-6 py-6 flex items-center gap-4">
            <input
              type="password"
              placeholder="Confirm your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/20 text-sm focus:outline-none focus:border-red-400 transition-colors"
            />
            <button onClick={deleteAccount} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
              Delete My Account
            </button>
            {deleteMsg && <p className="text-red-500 text-sm">{deleteMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}