import { useState } from "react";
import "../../styles/requestHistory.css";

const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function RequestHistory({ requests = [], categories = [] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => Number(item.category_id) === Number(categoryId),
    );

    return category?.category_name ?? "Unknown category";
  };

  const filteredRequests = requests.filter((request) => {
    const keyword = search.toLowerCase();

    const matchesSearch =
      (request.title ?? "").toLowerCase().includes(keyword) ||
      (request.description ?? "").toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "ALL" || request.status === statusFilter;

    const mathcesCategory =
      categoryFilter === "ALL" ||
      String(request.category_id) === categoryFilter;

    return matchesSearch && matchesStatus && mathcesCategory;
  });

  const availableCategoryIds = new Set(
    requests.map((request) => Number(request.category_id)),
  );

  const filterCategories = categories.filter((category) =>
    availableCategoryIds.has(Number(category.category_id)),
  );

  return (
    <div className="request-history">
      <div className="history-heading">
        <h2>My Requests</h2>
        <p>View your submitted service requests.</p>
      </div>

      <div className="history-filters">
        <input
          type="search"
          placeholder="Search requests..."
          aria-label="Search requests"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          aria-label="Filter by status"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={categoryFilter}
          aria-label="Filter by category"
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {filterCategories.map((category) => (
            <option key={category.category_id} value={String(category.category_id)}>
              {category.category_name}
            </option>
          ))}
        </select>
      </div>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map((request) => (
              <tr key={request.request_id}>
                <td>{request.request_id}</td>
                <td>{request.title}</td>
                <td>{getCategoryName(request.category_id)}</td>
                <td>{request.status}</td>
                <td>
                  <button
                    className="view-button"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRequests.length === 0 && (
          <p className="history-empty">No matching requests found.</p>
        )}
      </div>

      {selectedRequest && (
        <section className="request-details">
          <div className="details-heading">
            <h3>Request {selectedRequest.request_id}</h3>
            <button onClick={() => setSelectedRequest(null)}>Close</button>
          </div>

          <p>
            <strong>Title:</strong> {selectedRequest.title}
          </p>
          <p>
            <strong>Category:</strong> {" "}{getCategoryName(selectedRequest.category_id)}
          </p>
          <p>
            <strong>Status:</strong> {selectedRequest.status}
          </p>
          <p>
            <strong>Description:</strong>
          </p>
          <p>{selectedRequest.description}</p>
        </section>
      )}
    </div>
  );
}
