import React, { useState } from "react";

export default function Contact({ theme }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    guests: 2,
    notes: "",
  });

  // Theme style mapping
  const styles = {
    section:
      theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-800",
    subtitle: theme === "dark" ? "text-gray-400" : "text-gray-600",
    card:
      theme === "dark"
        ? "bg-gray-800 border-gray-700"
        : "bg-gray-50 border-gray-200",
    input:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
        : "bg-white border-gray-300 text-gray-800",
    dateTime:
      theme === "dark"
        ? "bg-gray-700 border-gray-600 text-white"
        : "bg-white border-gray-300 text-gray-800",
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    alert(
      `Thanks ${form.name}! Your table for ${form.guests} is requested on ${form.date} at ${form.time}.`
    );
    setForm({ name: "", phone: "", date: "", time: "", guests: 2, notes: "" });
  };

  return (
    <section id="contact" className={`py-12 ${styles.section}`}>
      <div className="max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold">Contact & Bookings</h2>
        <p className={`${styles.subtitle} mt-2`}>
          Reserve your table or reach out to us.
        </p>

        <div className="mt-6 grid md:grid-cols-2 gap-6">
          {/* Booking Form */}
          <form
            onSubmit={submit}
            className={`space-y-4 border p-6 rounded-xl shadow-md transition-colors duration-300 ${styles.card}`}
          >
            <input
              className={`w-full px-4 py-3 rounded-lg border ${styles.input}`}
              placeholder="Name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <input
              className={`w-full px-4 py-3 rounded-lg border ${styles.input}`}
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
            <input
              type="date"
              className={`w-full px-4 py-3 rounded-lg border ${styles.dateTime}`}
              value={form.date}
              onChange={(e) => set("date", e.target.value)}
              required
            />
            <input
              type="time"
              className={`w-full px-4 py-3 rounded-lg border ${styles.dateTime}`}
              value={form.time}
              onChange={(e) => set("time", e.target.value)}
              required
            />
            <input
              type="number"
              min="1"
              className={`w-full px-4 py-3 rounded-lg border ${styles.dateTime}`}
              value={form.guests}
              onChange={(e) => set("guests", e.target.value)}
              required
            />
            <input
              className={`w-full px-4 py-3 rounded-lg border ${styles.input}`}
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
            <button
              type="submit"
              className="w-full px-6 py-3 rounded-lg bg-amber-400 font-semibold hover:bg-amber-500 text-white"
            >
              Request Booking
            </button>
          </form>

          {/* Map */}
          <div className="rounded-xl overflow-hidden shadow-lg">
            <iframe
              title="map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.019944013676!2d144.95373531531602!3d-37.81627917975108!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad65d43f1f1f1f1%3A0x1!2sCoffee!5e0!3m2!1sen!2sin!4v1610000000000"
              className="w-full h-full min-h-[360px] border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
