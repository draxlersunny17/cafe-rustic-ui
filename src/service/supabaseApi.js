import { v4 as uuidv4 } from "uuid";

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

/**
 * Fetches menu items along with their variants from Supabase
 * @returns {Promise<Array>} List of menu items
 */
export async function fetchMenu() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_items?select=*,menu_item_variants(*)`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return [];
  }
}

/**
 * Authenticate user by email + password
 */
export async function fetchUserByEmail(email, password) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?email=eq.${email}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const users = await response.json();

    if (users.length === 0) {
      return { user: null, exists: false, validPassword: false };
    }

    const user = users[0];
    const validPassword = user.password_hash === password;

    return {
      user: validPassword ? user : null,
      exists: true,
      validPassword,
    };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return {
      user: null,
      exists: false,
      validPassword: false,
      error: "Something went wrong",
    };
  }
}

/**
 * Authenticate user by phone number
 */
export async function fetchUserByPhone(phone) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?phone=eq.${phone}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const users = await response.json();

    if (users.length === 0) {
      return { error: "Phone not registered" };
    }

    return { user: users[0] };
  } catch (error) {
    console.error("Error fetching user by phone:", error);
    return { error: "Something went wrong" };
  }
}

/**
 * Fetches all users from Supabase
 * @returns {Promise<Array>} List of users
 */
export async function fetchAllUsers() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Adds a new user to Supabase
 * @param {Object} user { email, phone, password_hash, name, theme }
 * @returns {Promise<Object>} Created user
 */
export async function addUser(user) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // return inserted row
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      return null; // instead of throwing
    }

    const data = await response.json();
    return data; // will be an array with the inserted user
  } catch (error) {
    console.error("Error adding user:", error);
    return null;
  }
}

export const fetchUserProfile = async (userId) => {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch profile");

    const data = await res.json();
    return data[0] || null; // return user object or null
  } catch (err) {
    console.error("Profile fetch error:", err);
    return null;
  }
};

export async function updateUserDetails(userId, updates) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // 👈 this is key
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update user");

    const data = await res.json(); // now will have data
    return data[0];
  } catch (err) {
    console.error("Error updating user:", err);
    return null;
  }
}

export async function addOrder(order) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // return inserted row
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) throw new Error("Failed to insert order");

    const data = await response.json();
    return data[0]; // inserted order
  } catch (error) {
    console.error("Error adding order:", error);
    return null;
  }
}

export async function fetchOrdersByUser(userId) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?user_id=eq.${userId}&select=*`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!response.ok) throw new Error("Failed to fetch orders");
    const data = await response.json();
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

export async function fetchFeedback() {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback?select=*`, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch feedback");
    const data = await response.json();

    // newest first
    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return [];
  }
}

export async function addFeedback(feedback) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/feedback`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation", // return inserted row
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) throw new Error("Failed to insert feedback");

    const data = await response.json();
    return data[0]; // inserted feedback row
  } catch (error) {
    console.error("Error adding feedback:", error);
    return null;
  }
}

export async function askMenuAssistant(messages, menuItems) {
  const res = await fetch("/api/aiMenuAssistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, menuItems }),
  });

  if (!res.ok) throw new Error("AI request failed");
  return res.json(); // { reply }
}

export async function fetchAllOrders() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?select=*&order=date.desc`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!res.ok) throw new Error("Failed to fetch orders");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function deleteUser(userId) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

// supabaseApi.js
export async function addMenuItem(item) {
  try {
    const newItem = { id: uuidv4(), ...item };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(newItem),
    });
    if (!res.ok) throw new Error("Failed to add menu item");
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateMenuItem(id, updates) {
  try {
    // 🔥 Remove menu_item_variants since it's not a real column
    const { menu_item_variants, ...validUpdates } = updates;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(validUpdates),
    });
    if (!res.ok) throw new Error("Failed to update menu item");
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleteMenuItem(id) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_items?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function addVariant(variant) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/menu_item_variants`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(variant),
    });
    if (!res.ok) throw new Error("Failed to add variant");
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function updateVariant(id, updates) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_item_variants?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(updates),
      }
    );
    if (!res.ok) throw new Error("Failed to update variant");
    const data = await res.json();
    return data[0];
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function deleteVariant(id) {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/menu_item_variants?id=eq.${id}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    return res.ok;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export async function fetchSpecialOffers({ userTier, isBirthday }) {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/offers?select=*&order=updated_at.desc,created_at.desc`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch special offers");

    const offers = await response.json();
    const today = new Date().toISOString().slice(0, 10);

    // ✅ filter
    const filtered = offers.filter((offer) => {
      const valid = today >= offer.valid_from && today <= offer.valid_to;
      if (!valid) return false;

      if (offer.type === "birthday" && isBirthday) return true;
      if (offer.type === "tier" && offer.eligibility?.tier === userTier) return true;
      if (offer.type === "general") return true;

      return false;
    });

    return filtered;
  } catch (e) {
    console.error("Error fetching special offers:", e);
    return [];
  }
}

export async function fetchAllOffers() {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/offers?select=*&order=updated_at.desc,created_at.desc`,
      {
        method: "GET",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch offers");

    return await response.json();
  } catch (e) {
    console.error("Error fetching offers:", e);
    return [];
  }
}




export async function addOrUpdateSpecialOffer(offer) {
  try {
    const url = offer.id
      ? `${SUPABASE_URL}/rest/v1/offers?id=eq.${offer.id}`
      : `${SUPABASE_URL}/rest/v1/offers`;

    const res = await fetch(url, {
      method: offer.id ? "PATCH" : "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(offer),
    });

    if (!res.ok) throw new Error("Failed to add/update offer");

    const data = await res.json();
    return offer.id ? data[0] : data[0]; // return inserted/updated row
  } catch (e) {
    console.error("Error adding/updating offer:", e);
    return null;
  }
}

export async function deleteSpecialOffer(id) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/offers?id=eq.${id}`, {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    return res.ok;
  } catch (e) {
    console.error("Error deleting offer:", e);
    return false;
  }
}

