import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "@/config";
import { toast } from "react-toastify";
import { Users, Search, ChevronLeft, ChevronRight, Phone, Mail, ShieldCheck } from "lucide-react";

const USERS_PER_PAGE = 8;

const UsersPage = ({ token }) => {
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewUser,    setViewUser]    = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(backendUrl + "/api/user/list", { headers: { token } });
      if (res.data.success) setUsers(res.data.users);
      else toast.error("Failed to fetch users");
    } catch { toast.error("Error loading users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const s = search.toLowerCase();
    return users.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
  }, [users, search]);

  useEffect(() => { setCurrentPage(1); }, [search]);

  const totalPages    = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  const getInitials = name => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const avatarColor = name => {
    const colors = ["bg-amber-500","bg-blue-500","bg-green-500","bg-purple-500","bg-rose-500","bg-orange-500","bg-teal-500"];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-600" /> Users
          </h1>
          <p className="text-sm text-stone-400">{filteredUsers.length} registered customer{filteredUsers.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 w-full sm:w-64 transition-all" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-stone-50">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-stone-100" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-32 rounded bg-stone-100" />
                  <div className="h-3 w-48 rounded bg-stone-100" />
                </div>
                <div className="h-6 w-16 rounded-full bg-stone-100" />
              </div>
            ))}
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-2xl">👤</div>
            <p className="font-semibold text-stone-700">No users found</p>
            <p className="text-sm text-stone-400 mt-1">Users who sign up will appear here</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50/50">
                    {["User","Email","Contact","Joined","Status",""].map((h,i) => (
                      <th key={i} className="text-left px-5 py-3 text-xs font-semibold text-stone-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {paginatedUsers.map(user => (
                    <tr key={user._id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(user.name)}`}>
                            {getInitials(user.name)}
                          </div>
                          <p className="font-semibold text-stone-800">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-stone-500">{user.email}</td>
                      <td className="px-5 py-4 text-stone-500">{user.mobileNo ? `+91 ${user.mobileNo}` : "—"}</td>
                      <td className="px-5 py-4 text-stone-400 text-xs">{new Date(user.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit
                          ${user.isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                          {user.isVerified ? <><ShieldCheck className="w-3 h-3" /> Verified</> : "Unverified"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => setViewUser(user)}
                          className="text-xs font-semibold text-amber-700 hover:underline">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-stone-100">
              {paginatedUsers.map(user => (
                <div key={user._id} className="flex items-center gap-3 px-5 py-4" onClick={() => setViewUser(user)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${avatarColor(user.name)}`}>
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-800 text-sm truncate">{user.name}</p>
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0
                    ${user.isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                    {user.isVerified ? "✓" : "!"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${currentPage === i + 1 ? "bg-amber-600 text-white" : "border border-stone-200 text-stone-600 hover:border-amber-400 hover:text-amber-700"}`}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:border-amber-400 hover:text-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewUser(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-stone-800 text-lg">User Profile</h3>
              <button onClick={() => setViewUser(null)} className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-all text-lg font-bold">×</button>
            </div>
            <div className="flex flex-col items-center text-center mb-5">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold mb-3 ${avatarColor(viewUser.name)}`}>
                {getInitials(viewUser.name)}
              </div>
              <p className="font-bold text-stone-800 text-lg">{viewUser.name}</p>
              <span className={`mt-2 text-xs font-semibold px-3 py-1 rounded-full ${viewUser.isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                {viewUser.isVerified ? "✓ Verified Account" : "⚠ Unverified"}
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Mail className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Email</p>
                  <p className="text-sm text-stone-800 font-medium">{viewUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Phone className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Contact</p>
                  <p className="text-sm text-stone-800 font-medium">{viewUser.mobileNo ? `+91 ${viewUser.mobileNo}` : "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Member Since</p>
                  <p className="text-sm text-stone-800 font-medium">{new Date(viewUser.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;