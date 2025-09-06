import React, { useEffect, useState } from "react";
import {
  fetchAllOffers,
  addOrUpdateSpecialOffer,
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

  useEffect(() => {
    loadOffers();
  }, []);

  async function loadOffers() {
    setLoading(true);
    const fetched = await fetchAllOffers();
    setOffers(fetched);
    setLoading(false);
  }

  function handleEdit(offer) {
    setEditing(offer.id);
    setForm({ ...offer, eligibility: offer.eligibility || {} });
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
      setEditing(null);
      setForm({
        title: "",
        description: "",
        image: "",
        type: "general",
        validFrom: "",
        validTo: "",
        eligibility: {},
      });
      loadOffers();
    } else {
      setMessage("Error saving offer.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Special Offers Management</h1>
      {loading ? (
        <div>Loading offers...</div>
      ) : (
        <div className="space-y-4 mb-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{offer.title}</div>
                <div className="text-sm text-gray-500">{offer.description}</div>
                <div className="text-xs mt-1">
                  Type: {offer.type} | Valid: {offer.valid_from} to{" "}
                  {offer.valid_to}
                </div>{" "}
              </div>
              <button
                className="text-blue-600 underline"
                onClick={() => handleEdit(offer)}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 border rounded p-4 bg-gray-50"
      >
        <h2 className="font-semibold">
          {editing ? "Edit Offer" : "Add New Offer"}
        </h2>
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
            className="p-2 border rounded"
            required
          />
          <input
            name="valid_to"
            type="date"
            value={form.valid_to}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editing ? "Update Offer" : "Add Offer"}
        </button>
        {message && <div className="text-green-600 mt-2">{message}</div>}
      </form>
    </div>
  );
}
