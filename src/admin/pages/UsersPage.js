import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "../../ui/button";
import {
  fetchAllUsers,
  fetchOrdersByUser,
  deleteUser,
  updateUserDetails,
} from "../../service/supabaseApi";
import NestedOrdersTable from "../components/NestedOrdersTable";

export default function UsersPage() {
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
