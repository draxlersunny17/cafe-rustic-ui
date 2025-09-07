import React, { useEffect, useState } from "react";
import {
  fetchAllOffers,
  addOrUpdateSpecialOffer,
  deleteSpecialOffer,
} from "../../service/supabaseApi";

export default function SpecialOffersAdminPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    image: "",
    type: "general",
    valid_from: "",
    valid_to: "",
    eligibility: {},
  });
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({
    open: false,
    offerId: null,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    const fetched = await fetchAllOffers();
    setOffers(fetched);
    setLoading(false);
  }

  function openForm(offer = null) {
    if (offer) {
      setEditing(offer.id);
      setForm({ ...offer, eligibility: offer.eligibility || {} });
    } else {
      setEditing(null);
      setForm({
        title: "",
        description: "",
        image: "",
        type: "general",
        valid_from: "",
        valid_to: "",
        eligibility: {},
      });
    }
    setShowModal(true);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleEligibilityChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      eligibility: { ...f.eligibility, [name]: value },
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const result = await addOrUpdateSpecialOffer(form);
    if (result) {
      setMessage("Offer saved!");
      setShowModal(false);
      loadOffers();
    } else {
      setMessage("Error saving offer.");
    }
  }

  function handleDeleteClick(id) {
    setConfirmDelete({ open: true, offerId: id });
  }

  async function confirmDeleteOffer() {
    if (!confirmDelete.offerId) return;
    const success = await deleteSpecialOffer(confirmDelete.offerId);
    if (success) {
      setMessage("Offer deleted.");
      loadOffers();
    } else {
      setMessage("Error deleting offer.");
    }
    setConfirmDelete({ open: false, offerId: null });
  }

  const toTitleCase = (str) =>
    str
      .replace(/_/g, " ") // replace underscores with spaces
      .replace(
        /\w\S*/g,
        (
          txt // capitalize each word
        ) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()
      );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Special Offers Management</h1>
        <button
          onClick={() => openForm()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          + Add Offer
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading offers...</div>
      ) : offers.length === 0 ? (
        <div className="text-center text-gray-500">No offers yet.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-xl shadow p-4 border flex flex-col justify-between"
            >
              <div>
                <img
                  src={offer.image || "/images/placeholder.png"}
                  alt={offer.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-semibold text-lg">{offer.title}</h3>
                <p className="text-gray-600 text-sm mb-2">
                  {offer.description}
                </p>
                <p className="text-xs text-gray-500">
                  Type: {toTitleCase(offer.type)} <br />
                  Valid: {offer.valid_from} → {offer.valid_to}
                </p>
                {offer.updated_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(offer.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => openForm(offer)}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteClick(offer.id)}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-black"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">
              {editing ? "Edit Offer" : "Add Offer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Image URL or /images/xyz.png"
                className="w-full p-2 border rounded"
              />
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="general">General</option>
                <option value="birthday">Birthday</option>
                <option value="tier">Tier</option>
              </select>
              {form.type === "tier" && (
                <input
                  name="tier"
                  value={form.eligibility.tier || ""}
                  onChange={handleEligibilityChange}
                  placeholder="Tier name (e.g. Gold)"
                  className="w-full p-2 border rounded"
                />
              )}
              {form.type === "birthday" && (
                <input
                  name="birthday"
                  value="true"
                  disabled
                  className="w-full p-2 border rounded bg-gray-100"
                />
              )}
              <div className="flex space-x-2">
                <input
                  name="valid_from"
                  type="date"
                  value={form.valid_from}
                  onChange={handleChange}
                  className="p-2 border rounded w-1/2"
                  required
                />
                <input
                  name="valid_to"
                  type="date"
                  value={form.valid_to}
                  onChange={handleChange}
                  className="p-2 border rounded w-1/2"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                {editing ? "Update Offer" : "Add Offer"}
              </button>
              {message && (
                <div className="text-green-600 text-sm mt-2">{message}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {confirmDelete.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="p-6 rounded-2xl shadow-xl max-w-sm w-full bg-white text-gray-900 text-center">
            <h3 className="text-lg font-bold mb-4">Delete Offer?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this offer? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmDelete({ open: false, offerId: null })}
                className="px-4 py-2 rounded-lg font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteOffer}
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
