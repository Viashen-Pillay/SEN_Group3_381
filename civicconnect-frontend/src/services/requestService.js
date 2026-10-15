const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export async function createRequest(request, requester_id) {
  const response = await fetch(`${API_URL}/requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify({
      requester_id: requester_id,
      category_id: Number(request.category_id),
      title: request.title,
      description: request.description
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to save service request."
    );
  }

  return data.request;
}

async function readApiResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function getRequests() {
  const response = await fetch(`${API_URL}/requests`, {
    credentials: "include"
  });

  const data = await readApiResponse(response);
  return data.requests;
}

export async function getStaffMembers() {
  const response = await fetch(`${API_URL}/users/staff`, {
    credentials: "include"
  });

  const data = await readApiResponse(response);
  return data.staff;
}

export async function assignStaff(requestId, assignedTo, assignedBy) {
  const response = await fetch(
    `${API_URL}/requests/${requestId}/assign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ assignedTo, assignedBy })
    }
  );

  return readApiResponse(response);
}

export async function getAssignmentHistory(requestId) {
  const response = await fetch(
    `${API_URL}/requests/${requestId}/assignments`,
    { credentials: "include" }
  );

  const data = await readApiResponse(response);
  return data.assignments;
}

export async function getComments(requestId) {
  const response = await fetch(
    `${API_URL}/requests/${requestId}/comments`,
    { credentials: "include" }
  );

  const data = await readApiResponse(response);
  return data.comments;
}

export async function addComment(requestId, userId, commentText) {
  const response = await fetch(
    `${API_URL}/requests/${requestId}/comments`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, commentText })
    }
  );

  return readApiResponse(response);
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`, {
    credentials: "include"
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Unable to load categories."
    );
  }

  return data.categories;
}