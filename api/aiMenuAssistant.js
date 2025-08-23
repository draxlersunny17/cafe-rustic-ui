import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { messages, menuItems } = req.body || {};

    if (!Array.isArray(messages) || !Array.isArray(menuItems)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const system = {
      role: "system",
      content: `You are Café Rustic's assistant. 
    Menu (with prices):\n${menuItems.map(i => `${i.name} - ₹${i.price}`).join("\n")}
    
    Rules:
    1. If the context step is "variant", politely ask the user to choose one of the available options for that item.
    - Example: If Burger has Chicken and Veg, reply like "Would you like Chicken or Veg Burger?".
    - Use natural, conversational wording instead of listing flatly.
    2. If an item has multiple variants, suggest them if the user seems unsure, but otherwise let the app handle exact variant confirmation.
    3. Tax rules: SGST 2.5%, CGST 2.5%.
    4. Apply discount if present in pendingOrder.
    5. Tip: either percentage (5%, 10%) or fixed ₹.
    6. When the user says "checkout", compute the full bill with tax, tip, discount, and split calculation, and return totals.
    7. Always respond with structured bill details (items, subtotal, taxes, discount, tip, grand total, per person if split).
    8. Keep conversation natural, short, and friendly, like a digital barista.`
    };
    
    

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [system, ...messages],
      max_tokens: 300,
    });

    return res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (err) {
    console.error("AI error:", err.message);
    return res.status(500).json({ error: "Server error: " + err.message });
  }
}
