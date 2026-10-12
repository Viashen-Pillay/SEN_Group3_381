const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function createRequest(request, requester_id) {
  const response = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      requesterId: requester_id,
      categoryId: request.category_id,
      title: request.title,
      description: request.description
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to create request.");
  }

  return data.request;
}