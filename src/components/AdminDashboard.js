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
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
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
} from "lucide-react";
import {
  fetchAllUsers,
  fetchUserProfile,
  updateUserDetails,
  deleteUser,
  fetchAllOrders,
  fetchOrdersByUser,
} from "../supabaseApi";
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
  const location = useLocation();
  const nav = [
    { to: "/dashboard/overview", label: "Overview" },
    { to: "/dashboard/users", label: "Users" },
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
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-gray-900/90 backdrop-blur text-white shadow">
          <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold tracking-wide flex gap-4">
              <img
                src="/images/cafelogo.png"
                alt="Logo"
                className="w-8 h-8 object-cover"
              />
              Café Rustic — Admin
            </div>
            <nav className="flex items-center gap-4">
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
          </div>
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
                <Tooltip />
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
                <Tooltip />
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

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.name || user.email}?`)) return;
    setBusy(true);
    const ok = await deleteUser(user.id);
    if (ok) setUsers((list) => list.filter((u) => u.id !== user.id));
    setBusy(false);
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
                            onClick={() => handleDelete(u)}
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

// -------- App Entrypoint (router inside) --------
export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Shell>
        <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UsersPage />} />
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </Shell>
    </AdminGuard>
  );
}
