import React, { useEffect, useMemo, useState } from "react";
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import {
  ChevronDown,
  ChevronRight,
  Users,
  ShoppingBag,
  PieChart as PieChartIcon,
  ShieldAlert,
  Repeat,
  HandCoins,
  PiggyBank,
  Trash,
  Pencil,
  Menu, X 
} from "lucide-react";
import {
  fetchAllUsers,
  fetchUserProfile,
  updateUserDetails,
  deleteUser,
  fetchAllOrders,
  fetchOrdersByUser,
  fetchMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../service/supabaseApi";
import { Tooltip as MuiTooltip } from "@mui/material";
import { Navigate } from "react-router-dom";

// -------- Access Guard --------
function AdminGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setAllowed(false);
          setLoading(false);
          return;
        }
        const profile = await fetchUserProfile(userId);
        setAllowed(profile?.role === "admin");
      } catch {
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="mx-auto mb-4 h-10 w-10" />
            <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              This area is restricted to admins only.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return children;
}

// -------- Layout --------
function Shell({ children }) {
    const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const nav = [
    { to: "/dashboard/overview", label: "Overview" },
    { to: "/dashboard/users", label: "Users" },
    { to: "/dashboard/menu", label: "Menu" },
  ];

  return (
    <div className="min-h-screen relative text-gray-900 overflow-hidden">
      {/* Background base */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Animated glowing blobs */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-400 opacity-30 blur-3xl animate-blob" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-400 opacity-30 blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute top-1/3 left-1/2 w-[400px] h-[400px] rounded-full bg-pink-400 opacity-20 blur-3xl animate-blob animation-delay-4000" />

      {/* Content wrapper so children sit above background */}
      <div className="relative z-10">
      {/* 🔥 Top Navbar */}
      <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur text-white shadow">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="text-2xl font-bold tracking-wide flex gap-4">
            <img
              src="/images/cafelogo.png"
              alt="Logo"
              className="w-8 h-8 object-cover"
            />
            Café Rustic — Admin
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-4">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  location.pathname === n.to
                    ? "bg-emerald-500 text-white shadow"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-700 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-700">
            <nav className="flex flex-col p-4 space-y-2">
              {nav.map((n) => (
               <Link
               key={n.to}
               to={n.to}
               className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                 location.pathname === n.to
                   ? "bg-emerald-600/20 text-emerald-400 border-l-4 border-emerald-500" 
                   : "text-gray-300 hover:bg-gray-700 hover:text-white"
               }`}
               onClick={() => setMenuOpen(false)}
             >
               {n.label}
             </Link>
             
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className="mx-auto max-w-7xl p-6 lg:p-10">{children}</main>
    </div>
    </div>
  );
}

// -------- Dashboard (Overview) --------
function Overview() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const [u, o] = await Promise.all([fetchAllUsers(), fetchAllOrders()]);
      setUsers(u || []);
      setOrders(o || []);
    })();
  }, []);

  const kpis = useMemo(() => {
    const numUsers = users.length;
    const numOrders = orders.length;
    const revenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const aov = numOrders ? revenue / numOrders : 0;

    // repeat customers
    const ordersByUser = orders.reduce((map, o) => {
      map[o.user_id] = (map[o.user_id] || 0) + 1;
      return map;
    }, {});
    const repeatCustomers = Object.values(ordersByUser).filter(
      (c) => c > 1
    ).length;

    // top payment method
    const byPay = orders.reduce((m, o) => {
      const k = o.payment_method || "Unknown";
      m[k] = (m[k] || 0) + 1;
      return m;
    }, {});
    const topPayment =
      Object.entries(byPay).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

    return { numUsers, numOrders, revenue, aov, repeatCustomers, topPayment };
  }, [users, orders]);

  // Orders over time (last 30 days)
  const ordersOverTime = useMemo(() => {
    const map = new Map();
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map.set(key, 0);
    }
    orders.forEach((o) => {
      const key = new Date(o.date).toISOString().slice(0, 10);
      if (map.has(key)) map.set(key, map.get(key) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }, [orders]);

  // Top items (by qty)
  const topItems = useMemo(() => {
    const itemMap = new Map();
    orders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const name = it.name || String(it.id);
        const qty = Number(it.qty) || 1;
        itemMap.set(name, (itemMap.get(name) || 0) + qty);
      });
    });
    const arr = Array.from(itemMap.entries()).map(([name, qty]) => ({
      name,
      qty,
    }));
    return arr.sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [orders]);

  // Top customers by spend & by orders
  const leaderboards = useMemo(() => {
    const spend = new Map();
    const count = new Map();
    orders.forEach((o) => {
      spend.set(
        o.user_id,
        (spend.get(o.user_id) || 0) + (Number(o.total) || 0)
      );
      count.set(o.user_id, (count.get(o.user_id) || 0) + 1);
    });
    const bySpend = Array.from(spend.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const byOrders = Array.from(count.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const userIndex = new Map(users.map((u) => [u.id, u]));
    const enrich = (arr) =>
      arr.map(([uid, v]) => ({
        id: uid,
        name: userIndex.get(uid)?.name || userIndex.get(uid)?.email || uid,
        value: v,
      }));
    return { bySpend: enrich(bySpend), byOrders: enrich(byOrders) };
  }, [orders, users]);

  const INR = (n) => `₹${n.toFixed(0)}`;

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          icon={<Users className="h-6 w-6" />}
          title="Users"
          value={kpis.numUsers}
          color="blue"
          onClick={() => navigate("/dashboard/users")}
        />
        <KPICard
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Orders"
          value={kpis.numOrders}
          color="purple"
        />
        <KPICard
          icon={<PiggyBank className="h-6 w-6" />}
          title="Revenue"
          value={INR(kpis.revenue)}
          color="green"
        />
        <KPICard
          icon={<PieChartIcon className="h-6 w-6" />}
          title="AOV"
          value={INR(kpis.aov || 0)}
          color="orange"
        />
        <KPICard
          icon={<Repeat className="h-6 w-6" />}
          title="Repeat Customers"
          value={kpis.repeatCustomers}
          color="pink"
        />
        <KPICard
          icon={<HandCoins className="h-6 w-6" />}
          title="Top Payment"
          value={kpis.topPayment.toUpperCase()}
          color="indigo"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-[320px] bg-white/70 backdrop-blur-md border border-gray-200 shadow rounded-2xl hover:shadow-lg transition">
          <CardContent className="p-4 h-full">
            <div className="font-semibold mb-3 text-gray-700">
              Orders (Last 30 Days)
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={ordersOverTime}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <ChartTooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="h-[320px] bg-white/70 backdrop-blur-md border border-gray-200 shadow rounded-2xl hover:shadow-lg transition">
          <CardContent className="p-4 h-full">
            <div className="font-semibold mb-3 text-gray-700">Top 5 Items</div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topItems}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <ChartTooltip />
                <Bar dataKey="qty" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-md border border-gray-200 shadow rounded-2xl">
          <CardContent className="p-6">
            <div className="font-semibold mb-4 text-gray-700">
              Top Customers — By Spend
            </div>
            <ol className="space-y-2">
              {leaderboards.bySpend.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/60 transition"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {i + 1}. {r.name}
                  </span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {INR(r.value)}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card className="bg-white/70 backdrop-blur-md border border-gray-200 shadow rounded-2xl">
          <CardContent className="p-6">
            <div className="font-semibold mb-4 text-gray-700">
              Top Customers — By Orders
            </div>
            <ol className="space-y-2">
              {leaderboards.byOrders.map((r, i) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100/60 transition"
                >
                  <span className="text-sm font-medium text-gray-800">
                    {i + 1}. {r.name}
                  </span>
                  <span className="text-sm font-semibold text-indigo-600">
                    {r.value} orders
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// -------- KPI Card --------
function KPICard({ title, value, icon, color = "emerald", onClick }) {
  const gradientClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700",
    green: "bg-gradient-to-br from-green-50 to-green-100 text-green-700",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700",
    pink: "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700",
  };

  return (
    <motion.button
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      onClick={onClick}
      className="text-left w-full"
    >
      <Card
        className={`h-full rounded-2xl shadow-md hover:shadow-lg transition ${gradientClasses[color]}`}
      >
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <div className="text-sm opacity-80">{title}</div>
            <div className="text-3xl font-bold mt-1">{value}</div>
          </div>
          {icon && (
            <div className="p-3 rounded-full bg-white/70 shadow">{icon}</div>
          )}
        </CardContent>
      </Card>
    </motion.button>
  );
}

// -------- Users Page --------
function UsersPage() {
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [ordersByUser, setOrdersByUser] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => setUsers(await fetchAllUsers()))();
  }, []);

  const toggleExpand = async (userId) => {
    setExpanded((e) => ({ ...e, [userId]: !e[userId] }));
    if (!ordersByUser[userId]) {
      const orders = await fetchOrdersByUser(userId);
      setOrdersByUser((m) => ({ ...m, [userId]: orders }));
    }
  };

  const [confirmUserDelete, setConfirmUserDelete] = useState({
    open: false,
    user: null,
  });

  const handleDeleteUserClick = (user) => {
    setConfirmUserDelete({ open: true, user });
  };

  const confirmDeleteUser = async () => {
    const { user } = confirmUserDelete;
    setBusy(true);

    const ok = await deleteUser(user.id);
    if (ok) setUsers((list) => list.filter((u) => u.id !== user.id));

    setBusy(false);
    setConfirmUserDelete({ open: false, user: null });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      dob: user.dob || "",
      role: user.role || "customer",
      loyalty_points: user.loyalty_points ?? 0,
    });
  };

  const handleSave = async (id) => {
    setBusy(true);
    const updated = await updateUserDetails(id, formData);
    if (updated) {
      setUsers((list) => list.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">👤 Users</h2>
        {busy && <span className="text-sm text-gray-500">Working…</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border shadow bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">DOB</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Loyalty</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <React.Fragment key={u.id}>
                <tr
                  className={`${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } border-b hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleExpand(u.id)}
                      className="inline-flex items-center gap-1 font-medium text-gray-800"
                    >
                      {expanded[u.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      {editingId === u.id ? (
                        <input
                          className="px-2 py-1 rounded border text-sm"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      ) : (
                        u.name || "—"
                      )}
                    </button>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        className="px-2 py-1 rounded border text-sm w-full"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, email: e.target.value }))
                        }
                      />
                    ) : (
                      u.email
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        className="px-2 py-1 rounded border text-sm"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, phone: e.target.value }))
                        }
                      />
                    ) : (
                      u.phone || "—"
                    )}
                  </td>

                  {/* DOB */}
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        type="date"
                        className="px-2 py-1 rounded border text-sm"
                        value={formData.dob}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, dob: e.target.value }))
                        }
                      />
                    ) : u.dob ? (
                      new Date(u.dob).toLocaleDateString()
                    ) : (
                      "—"
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <select
                        className="px-2 py-1 rounded border text-sm"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, role: e.target.value }))
                        }
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                        {u.role
                          ? u.role.charAt(0).toUpperCase() +
                            u.role.slice(1).toLowerCase()
                          : "Customer"}
                      </span>
                    )}
                  </td>

                  {/* Loyalty */}
                  <td className="px-4 py-3">
                    {editingId === u.id ? (
                      <input
                        type="number"
                        className="px-2 py-1 rounded border text-sm w-20"
                        value={formData.loyalty_points}
                        onChange={(e) =>
                          setFormData((f) => ({
                            ...f,
                            loyalty_points: Number(e.target.value),
                          }))
                        }
                      />
                    ) : (
                      u.loyalty_points ?? 0
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {editingId === u.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(u.id)}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setEditingId(null)}
                            className="bg-gray-400 hover:bg-gray-500 text-white"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEdit(u)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUserClick(u)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Nested Orders */}
                {expanded[u.id] && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <NestedOrdersTable orders={ordersByUser[u.id] || []} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {confirmUserDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-2xl shadow-xl max-w-sm w-full bg-white text-gray-900 text-center">
            <h3 className="text-lg font-bold mb-4">Delete User?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-red-600">
                {confirmUserDelete.user?.name || confirmUserDelete.user?.email}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setConfirmUserDelete({ open: false, user: null })
                }
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -------- Nested Orders --------
function NestedOrdersTable({ orders }) {
  const INR = (n) => `₹${Number(n || 0).toFixed(0)}`;
  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <table className="min-w-full text-xs">
        <thead className="bg-emerald-50 text-emerald-800">
          <tr>
            <th className="px-3 py-2 text-left">Order #</th>
            <th className="px-3 py-2 text-left">Date</th>
            <th className="px-3 py-2 text-left">Items</th>
            <th className="px-3 py-2 text-left">Subtotal</th>
            <th className="px-3 py-2 text-left">Discount</th>
            <th className="px-3 py-2 text-left">Total</th>
            <th className="px-3 py-2 text-left">Payment</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o, idx) => (
            <tr
              key={o.id}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-emerald-50/30"
              } border-b`}
            >
              <td className="px-3 py-2">{o.order_number}</td>
              <td className="px-3 py-2">
                {o.date ? new Date(o.date).toLocaleString() : "—"}
              </td>
              <td className="px-3 py-2">
                <ul className="list-disc pl-4">
                  {(o.items || []).map((it, idx) => (
                    <li key={idx}>
                      {it.name} × {it.qty}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="px-3 py-2">{INR(o.subtotal)}</td>
              <td className="px-3 py-2">{INR(o.discount)}</td>
              <td className="px-3 py-2 font-medium text-emerald-700">
                {INR(o.total)}
              </td>
              <td className="px-3 py-2">{o.payment_method || "—"}</td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// Add this helper at the top
const ImagePreview = ({ src }) => {
  if (!src) return <span className="text-gray-400">—</span>;
  return (
    <MuiTooltip
      title={
        <img src={src} alt="preview" className="max-h-64 max-w-64 rounded-lg" />
      }
      arrow
    >
      <img
        src={src}
        alt="thumb"
        className="w-12 h-12 object-cover rounded-md border cursor-pointer hover:opacity-80 transition"
      />
    </MuiTooltip>
  );
};

// --------- Menu and variants ---------
function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({});
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [variantForm, setVariantForm] = useState({});
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    category: "",
    description: "",
    short_desc: "",
    calories: 0,
    ingredients: "",
    prep: "",
    origin: "",
    img: "",
  });
  const [busy, setBusy] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    (async () => {
      const items = await fetchMenu();
      setMenu(items);
    })();
  }, []);

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setItemForm({ ...item });
  };

  const saveItem = async (id) => {
    setBusy(true);
    const updated = await updateMenuItem(id, itemForm);
    if (updated) {
      setMenu((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...updated } : i))
      );
      setEditingItemId(null);
    }
    setBusy(false);
  };

  const addItem = async () => {
    if (!newItem.name.trim()) {
        return;
      }
    setBusy(true);
    const added = await addMenuItem(newItem);
    if (added) {
      setMenu((prev) => [...prev, { ...added, menu_item_variants: [] }]);
      setNewItem({
        name: "",
        price: 0,
        category: "",
        description: "",
        short_desc: "",
        calories: 0,
        ingredients: "",
        prep: "",
        origin: "",
        img: "",
      });
    }
    setBusy(false);
  };

  const [confirmItemDelete, setConfirmItemDelete] = useState({
    open: false,
    itemId: null,
  });

  const handleDeleteItemClick = (itemId) => {
    setConfirmItemDelete({ open: true, itemId });
  };

  const confirmDeleteItem = async () => {
    const { itemId } = confirmItemDelete;
    setBusy(true);

    if (await deleteMenuItem(itemId)) {
      setMenu((prev) => prev.filter((i) => i.id !== itemId));
    }

    setBusy(false);
    setConfirmItemDelete({ open: false, itemId: null });
  };

  const startEditVariant = (itemId, v) => {
    setEditingVariantId(v.id);
    setVariantForm({ ...v, menu_item_id: itemId });
  };

  const saveVariant = async (itemId, variantId) => {
    // 🔥 Prevent save if name is empty
    if (!variantForm.name.trim()) {
      return;
    }
  
    setBusy(true);
    const isNew = variantId.toString().startsWith("temp-");
  
    let updated;
    if (isNew) {
      updated = await addVariant({
        menu_item_id: itemId,
        name: variantForm.name.trim(),
        price: variantForm.price,
      });
    } else {
      updated = await updateVariant(variantId, {
        name: variantForm.name.trim(),
        price: variantForm.price,
      });
    }
  
    if (updated) {
      setMenu((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                menu_item_variants: i.menu_item_variants.map((v) =>
                  v.id === variantId ? { ...v, ...updated } : v
                ),
              }
            : i
        )
      );
      setEditingVariantId(null);
    }
    setBusy(false);
  };
  

  const cancelEditVariant = (itemId, variantId) => {
    const isNew = variantId.toString().startsWith("temp-");

    if (isNew) {
      // Remove this temp variant entirely
      setMenu((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                menu_item_variants: i.menu_item_variants.filter(
                  (v) => v.id !== variantId
                ),
              }
            : i
        )
      );
    }

    setEditingVariantId(null);
  };

  const addVariantToItem = (itemId) => {
    // Just show an empty editable row without API call yet
    const tempId = `temp-${Date.now()}`; // Unique temp ID for UI
    setMenu((prev) =>
      prev.map((i) =>
        i.id === itemId
          ? {
              ...i,
              menu_item_variants: [
                ...i.menu_item_variants,
                { id: tempId, name: "", price: 0, isNew: true },
              ],
            }
          : i
      )
    );

    setEditingVariantId(tempId);
    setVariantForm({ name: "", price: 0 });
  };

  // 🟢 State for modal
  const [confirmVariantDelete, setConfirmVariantDelete] = useState({
    open: false,
    itemId: null,
    variantId: null,
  });

  // 🟢 Function to trigger modal
  const handleDeleteVariantClick = (itemId, variantId) => {
    setConfirmVariantDelete({ open: true, itemId, variantId });
  };

  // 🟢 Function to actually delete after confirm
  const confirmDeleteVariant = async () => {
    const { itemId, variantId } = confirmVariantDelete;
    setBusy(true);

    if (await deleteVariant(variantId)) {
      setMenu((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? {
                ...i,
                menu_item_variants: i.menu_item_variants.filter(
                  (v) => v.id !== variantId
                ),
              }
            : i
        )
      );
    }

    setBusy(false);
    setConfirmVariantDelete({ open: false, itemId: null, variantId: null });
  };

  const totalPages = Math.ceil(menu.length / rowsPerPage);
  const paginatedData = menu.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const TruncatedText = ({ text, max = 40 }) => (
    <MuiTooltip title={text || ""} arrow>
      <span className="block max-w-[180px] truncate">{text || "—"}</span>
    </MuiTooltip>
  );

  const toTitleCase = (str) =>
    str
      .replace(/_/g, " ") // replace underscores with spaces
      .replace(
        /\w\S*/g,
        (
          txt // capitalize each word
        ) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
      );

  const [addMenuOpen, setAddMenuOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            📋 Menu Management
          </h2>
          {busy && <span className="text-sm text-gray-500">Working…</span>}
        </div>
        <Button
          onClick={() => setAddMenuOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          + Add Menu Item
        </Button>
      </div>

      {/* Add New Item */}
      {addMenuOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-2xl shadow-xl max-w-2xl w-full bg-white text-gray-900 transition-transform transform">
            <h3 className="text-lg font-bold mb-4 text-center">
              Add New Menu Item
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {Object.keys(newItem).map((field) => (
                <input
                  key={field}
                  placeholder={toTitleCase(field)}
                  className="border px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-300"
                  type={
                    ["price", "calories"].includes(field) ? "number" : "text"
                  }
                  min={["price", "calories"].includes(field) ? 0 : undefined} // 🔥 Prevent negatives
                  value={
                    ["price", "calories"].includes(field) &&
                    newItem[field] === 0
                      ? "" // 🔥 Blank if 0
                      : newItem[field]
                  }
                  onChange={(e) => {
                    let value = e.target.value;
                    if (["price", "calories"].includes(field)) {
                      value = value === "" ? 0 : Math.max(0, +value); // 🔥 Ensure >= 0
                    }
                    setNewItem((n) => ({ ...n, [field]: value }));
                  }}
                />
              ))}
            </div>

            {/* Modal Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddMenuOpen(false)}
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addItem();
                  setAddMenuOpen(false);
                }}
                className="px-4 py-2 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white"
              >
                Save Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Menu Item */}
      {confirmItemDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-2xl shadow-xl max-w-sm w-full bg-white text-gray-900 text-center">
            <h3 className="text-lg font-bold mb-4">Delete Menu Item?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this menu item? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setConfirmItemDelete({ open: false, itemId: null })
                }
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteItem}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Menu Item Variant */}
      {confirmVariantDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-2xl shadow-xl max-w-sm w-full bg-white text-gray-900 text-center">
            <h3 className="text-lg font-bold mb-4">Delete Variant?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this variant? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setConfirmVariantDelete({
                    open: false,
                    itemId: null,
                    variantId: null,
                  })
                }
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteVariant}
                className="px-4 py-2 rounded-lg font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 py-3">
  {/* Rows per page selector */}
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <span>Show:</span>
    <select
      value={rowsPerPage}
      onChange={(e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
      }}
      className="border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-gray-400"
    >
      {[5, 10, 50, 100].map((size) => (
        <option key={size} value={size}>
          {size}
        </option>
      ))}
    </select>
    <span className="hidden sm:inline">rows per page</span>
  </div>

  {/* Pagination controls */}
  <div className="flex items-center justify-between md:justify-end gap-2 text-sm flex-wrap">
    <span className="text-gray-600 hidden sm:inline">
      Page {page} of {totalPages}
    </span>

    <div className="flex items-center gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
        className="hover:bg-gray-100"
      >
        Prev
      </Button>

      {/* Show fewer buttons on mobile */}
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(
          Math.max(0, page - (window.innerWidth < 640 ? 1 : 3)),
          Math.min(totalPages, page + (window.innerWidth < 640 ? 1 : 2))
        )
        .map((p) => (
          <Button
            key={p}
            size="sm"
            className={`rounded font-medium transition ${
              page === p
                ? "bg-gray-700 text-white shadow-md"
                : "bg-gray-200 text-black border border-gray-300 hover:bg-gray-300"
            }`}
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}

      <Button
        size="sm"
        variant="outline"
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="hover:bg-gray-100"
      >
        Next
      </Button>
    </div>
  </div>
</div>


      {/* Menu Table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-lg">
        <table className="min-w-full border-collapse text-xs md:text-sm">
          <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 sticky top-0 z-20">
            <tr>
              {[
                "Name",
                "Price",
                "Category",
                "Description",
                "Short Desc",
                "Calories",
                "Ingredients",
                "Prep",
                "Origin",
                "Image",
                "Variants",
                "Actions",
              ].map((col) => (
                <th
                  key={col}
                  className={`px-4 py-3 text-left font-semibold border-b border-gray-300 ${
                    col === "Actions" ? "sticky right-0 bg-gray-200 z-30" : ""
                  }`}
                  style={col === "Actions" ? { minWidth: "120px" } : {}}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, idx) => (
              <tr
                key={item.id}
                className={`${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                {/* Editable fields */}
                {Object.keys(newItem).map((field) => (
  <td
    key={field}
    className="px-4 py-3 align-middle border-b border-gray-200"
  >
    {field === "img" && !editingItemId && item[field] ? (
      <ImagePreview src={item[field]} />
    ) : editingItemId === item.id ? (
      <input
        className={`border px-2 py-1 rounded text-xs focus:ring-2 focus:ring-blue-300 focus:outline-none
          ${
            ["price", "calories"].includes(field)
              ? "w-20 text-left" // 🔥 Wider input for numbers
              : "w-full"
          }`}
        type={["price", "calories"].includes(field) ? "number" : "text"}
        min={["price", "calories"].includes(field) ? 0 : undefined}
        value={["price", "calories"].includes(field) && itemForm[field] === 0
          ? ""
          : itemForm[field] ?? ""}
        onChange={(e) =>
          setItemForm((f) => ({
            ...f,
            [field]:
              ["price", "calories"].includes(field)
                ? e.target.value === ""
                  ? 0
                  : Math.max(0, +e.target.value)
                : e.target.value,
          }))
        }
      />
    ) : (
      <TruncatedText text={item[field]} />
    )}
  </td>
))}

                {/* Variants */}
                <td className="px-4 py-3 border-b border-gray-200 align-middle">
                  <ul className="space-y-2">
                    {item.menu_item_variants.map((v) => (
                      <li
                        key={v.id}
                        className="flex justify-between items-center gap-2 bg-gray-50 px-2 py-1 rounded-md border border-gray-200"
                      >
                        {editingVariantId === v.id ? (
                          <div className="flex flex-wrap items-center gap-3 w-full p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                            {/* Variant Name Input */}
                            <input
                              className="border px-3 py-2 rounded-md text-sm flex-1 min-w-[180px] 
                                     focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              placeholder="Variant Name"
                              value={variantForm.name}
                              onChange={(e) =>
                                setVariantForm((f) => ({
                                  ...f,
                                  name: e.target.value,
                                }))
                              }
                            />

                            {/* Price Input */}
                            <input
                              type="number"
                              className="border px-3 py-2 rounded-md text-sm w-28 
             focus:ring-2 focus:ring-blue-400 focus:outline-none"
                              placeholder="Price"
                              min="0"
                              value={
                                variantForm.price === 0 ? "" : variantForm.price
                              } // 🔥 Show blank if 0
                              onChange={(e) =>
                                setVariantForm((f) => ({
                                  ...f,
                                  price:
                                    e.target.value === "" ? 0 : +e.target.value, // Convert back to 0 if cleared
                                }))
                              }
                            />

                            {/* Save Button */}
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white rounded-md px-3 py-2 shadow-sm transition"
                              onClick={() => saveVariant(item.id, v.id)}
                            >
                              Save
                            </Button>

                            {/* Cancel Button */}
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md px-3 py-2 shadow-sm transition"
                              onClick={() => cancelEditVariant(item.id, v.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="flex-1 truncate text-gray-800 text-sm">
                              {v.name} - ₹{v.price}
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full p-1"
                                title="Edit"
                                onClick={() => startEditVariant(item.id, v)}
                              >
                                <Pencil size={16} />
                              </Button>
                              <Button
                                size="icon"
                                className="bg-red-100 hover:bg-red-200 text-red-700 rounded-full p-1"
                                title="Delete"
                                onClick={() =>
                                  handleDeleteVariantClick(item.id, v.id)
                                }
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    disabled={
                      item.menu_item_variants.some(
                        (v) => v.id === editingVariantId
                      ) // 🔥 Disable only for this menu item
                    }
                    className={`mt-2 w-full font-medium rounded-lg shadow-sm transition-transform transform 
    ${
      item.menu_item_variants.some((v) => v.id === editingVariantId)
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:scale-105"
    }`}
                    onClick={() => addVariantToItem(item.id)}
                  >
                    <span className="flex items-center justify-center gap-1">
                      <span className="text-lg">➕</span> Add Variant
                    </span>
                  </Button>
                </td>

                {/* Actions */}
                <td className="px-4 py-3 align-middle sticky right-0 bg-white z-10 border-b border-gray-200">
                  <div className="flex gap-2 justify-center">
                    {editingItemId === item.id ? (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => saveItem(item.id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gray-400 hover:bg-gray-500 text-white"
                          onClick={() => setEditingItemId(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => startEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteItemClick(item.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {menu.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center py-4 text-gray-500">
                  No menu items yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -------- App Entrypoint (router inside) --------
export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Shell>
        <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </Shell>
    </AdminGuard>
  );
}
