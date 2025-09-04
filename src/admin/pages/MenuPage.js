import React, { useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { Trash, Pencil } from "lucide-react";
import {
  fetchMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addVariant,
  updateVariant,
  deleteVariant,
} from "../../service/supabaseApi";
import MuiTooltip from "@mui/material/Tooltip";
import ImagePreview from "../components/ImagePreview";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState({});
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [variantForm, setVariantForm] = useState({});
  const [search, setSearch] = useState("");
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
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMenu.length / rowsPerPage);

  const paginatedData = filteredMenu.slice(
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
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 w-1/2">
          {/* Rows per page */}
          <div className="flex items-center gap-2">
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

          {/* Search box */}
          <input
            type="text"
            placeholder="🔍 Search items..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page when searching
            }}
            className="border px-3 py-1 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 flex-1 min-w-[180px]"
          />
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
                  variant="ghost"
                  className={`rounded font-semibold transition-all ${
                    page === p
                      ? "bg-gray-800 !text-white shadow-md border border-gray-800"
                      : "bg-gray-200 !text-black border border-gray-300 hover:bg-gray-300"
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
                        type={
                          ["price", "calories"].includes(field)
                            ? "number"
                            : "text"
                        }
                        min={
                          ["price", "calories"].includes(field) ? 0 : undefined
                        }
                        value={
                          ["price", "calories"].includes(field) &&
                          itemForm[field] === 0
                            ? ""
                            : itemForm[field] ?? ""
                        }
                        onChange={(e) =>
                          setItemForm((f) => ({
                            ...f,
                            [field]: ["price", "calories"].includes(field)
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
                                className="bg-blue-200 hover:bg-blue-200 text-blue-700 rounded-full p-1"
                                title="Edit"
                                onClick={() => startEditVariant(item.id, v)}
                              >
                                <Pencil size={16} className="text-blue-700" />
                              </Button>
                              <Button
                                size="icon"
                                className="bg-red-200 hover:bg-red-200 text-red-700 rounded-full p-1"
                                title="Delete"
                                onClick={() =>
                                  handleDeleteVariantClick(item.id, v.id)
                                }
                              >
                                <Trash size={16} className="text-red-700" />
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
            {filteredMenu.length === 0 && (
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
