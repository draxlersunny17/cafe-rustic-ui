import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Line,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  ShoppingBag,
  PiggyBank,
  PieChart as PieChartIcon,
  Repeat,
  HandCoins,
} from "lucide-react";
import { Card, CardContent } from "../../ui/card";
import KPICard from "../components/KPICard";
import { fetchAllOrders, fetchAllUsers } from "../../service/supabaseApi";

export default function Overview() {
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
          onClick={() => navigate("admin/dashboard/users")}
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
