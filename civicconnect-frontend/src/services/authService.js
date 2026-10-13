const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api/v1";

export async function loginUser(credentials) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(credentials)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed.");
  }

  return data.user;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed.");
  }

  return data.user;
}