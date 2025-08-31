// api/aiMenuAssistant.js

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { messages, menuItems, context, pendingOrder, cart, orderHistory } =
      req.body || {};

    if (!Array.isArray(messages) || !Array.isArray(menuItems)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // ===== Build History Summary (frequency-based) =====
    let historySummary = "No past order history.";
    if (orderHistory && orderHistory.length > 0) {
      const freqMap = {};

      // Count item frequencies across all orders
      orderHistory.forEach((order) => {
        order.items.forEach((i) => {
          freqMap[i.name] = (freqMap[i.name] || 0) + i.qty;
        });
      });

      // Sort by frequency (highest first)
      const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);

      // Build summary string
      historySummary = `User favorites (most ordered items):\n${sorted
        .map(([name, count]) => `${name} ×${count}`)
        .join("\n")}`;
    }

    // ===== System Prompt =====
    const systemPrompt = `You are Café Rustic's assistant. 
Menu (with prices):\n${menuItems
      .map((i) => `${i.name} - ₹${i.price}`)
      .join("\n")}

${historySummary}

Rules:
1. If the context is "recommendations":
   - Analyze the user's **most frequently ordered items** (from favorites summary).
   - Mention those favorites explicitly in your reply (e.g., "I see you love Cappuccino...").
   - Suggest 2–3 items they might enjoy next, based on these recurring favorites.
   - Keep tone short, friendly, and conversational, like a barista.
   - You may upsell (e.g., "Since you like Cappuccino, try Iced Cappuccino") or suggest variety (different flavors/categories).
   - Do NOT output any ###ACTION### block here — just natural text.
2. If the context step is "variant", DO NOT add the item to the cart yet. 
   - Only list the available variants with their prices and ask the user to choose. 
   - Do NOT output any ###ACTION### block in this step. 
   - Example: "Okay, one Wrap coming right up! Would you like Veg (₹280) or Chicken (₹300)?"
3. If an item has multiple variants, suggest them if the user seems unsure, but otherwise let the app handle variant confirmation.
4. Tax rules: SGST 2.5%, CGST 2.5%.
5. Apply discount if present in pendingOrder.
6. Tip: either percentage (5%, 10%) or fixed ₹.
7. When the user says "checkout", compute the full bill with tax, tip, discount, and split, and return totals.
8. When confirming actions (like adding items to cart), respond in TWO parts:
   - First, a friendly confirmation.
   - Then append a machine-readable block starting with '###ACTION###' containing JSON.
   Example:
   "Great choice! I've added 2 × Cappuccino for ₹120 each.
   ###ACTION###
   { "type": "addToCart", "itemName": "Cappuccino", "qty": 2 }"
9. Only output one JSON action per message.
10. Never output ###ACTION### when asking about variants or giving recommendations.
11. Always respond with structured bill details (items, subtotal, taxes, discount, tip, grand total, per person if split).
12. Keep conversation natural, short, and friendly, like a digital barista.`;

    // ===== Try OpenAI First =====
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        max_tokens: 400,
      });

      return res.status(200).json({
        reply: completion.choices[0].message.content,
        source: "openai",
      });
    } catch (err) {
      console.error("OpenAI error:", err.message);

      // ===== If OpenAI Rate-Limit (429) → Use Gemini =====
      if (err.status === 429) {
        try {
          // Convert messages into plain chat format
          const chatHistory = messages
            .map(
              (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
            )
            .join("\n");

          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const result = await model.generateContent([
            systemPrompt,
            chatHistory,
          ]);
          const reply = result.response.text();

          return res.status(200).json({ reply, source: "gemini" });
        } catch (geminiErr) {
          console.error("Gemini error:", geminiErr.message);
          return res
            .status(500)
            .json({ error: "Both OpenAI and Gemini failed." });
        }
      }

      // Other OpenAI errors
      return res.status(500).json({ error: "Server error: " + err.message });
    }
  } catch (err) {
    console.error("Unexpected AI error:", err.message);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
