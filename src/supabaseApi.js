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
      return { error: "User not found" };
    }

    const user = users[0];

    if (user.password_hash !== password) {
      return { error: "Wrong password" };
    }

    return { user };
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return { error: "Something went wrong" };
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
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update user");

    const data = await res.json();
    return data[0]; // Supabase returns updated row(s)
  } catch (err) {
    console.error("Error updating user:", err);
    return null;
  }
}
