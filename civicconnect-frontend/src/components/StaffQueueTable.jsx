import { useState } from "react";
import {
  CategoryFilterStrategy,
  StatusFilterStrategy,
  KeywordSearchStrategy,
} from "../strategies/filterStrategies";
import {
  REQUEST_STATUSES,
  ALLOWED_TRANSITIONS,
} from "../constants/requestStatuses";
import StaffAssignment from "./StaffAssignment";
import StaffComments from "./StaffComments";
import { updateRequestStatus } from "../services/requestService";
import "../styles/staffQueue.css";

export function StaffQueueTable({
  requests = [],
  onStatusChange,
  currentUser,
  categories = [],
}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const selectedRequest = requests.find(
    (request) => request.request_id === selectedRequestId,
  );

  const getCategoryName = (categoryId) => {
    const category = categories.find(
      (item) => Number(item.category_id) === Number(categoryId),
    );

    return category?.category_name ?? "Unknown category";
  };

  let filtered = CategoryFilterStrategy.filter(requests, selectedCategory);
  filtered = StatusFilterStrategy.filter(filtered, selectedStatus);
  filtered = KeywordSearchStrategy.filter(filtered, searchKeyword);

  const availableCategoryIds = new Set(
    requests.map((request) => Number(request.category_id)),
  );

  const filterCategories = categories.filter((category) =>
    availableCategoryIds.has(Number(category.category_id)),
  );

  const openDetails = (request) => {
    setSelectedRequestId(request.request_id);
    setNewStatus("");
    setMessage("");
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus || isSavingStatus) {
      return;
    }

    const allowed = ALLOWED_TRANSITIONS[selectedRequest.status] || [];

    if (!allowed.includes(newStatus)) {
      setMessage("This status transition is not permitted.");
      return;
    }

    const staffId = currentUser?.user_id;

    if (!staffId) {
      setMessage("Unable to identify the logged-in staff member.");
      return;
    }

    setIsSavingStatus(true);
    setMessage("");

    try {
      await updateRequestStatus(selectedRequest.request_id, newStatus, staffId);

      // Refresh the list after the database confirms the update.
      await onStatusChange(selectedRequest.request_id, newStatus);

      setNewStatus("");
      setMessage("Status updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update request status.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  return (
    <div className="staff-queue">
      <div className="staff-queue-heading">
        <h2>Staff Work Queue</h2>
        <p>Review and manage incoming service requests.</p>
      </div>

      <div className="staff-queue-filters">
        <input
          type="search"
          placeholder="Search requests..."
          aria-label="Search requests"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />

        <select
          aria-label="Filter by category"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {filterCategories.map((category) => (
            <option
              key={category.category_id}
              value={String(category.category_id)}
            >
              {category.category_name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="staff-queue-table-wrapper">
        <table className="staff-queue-table">
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
            {filtered.map((request) => (
              <tr key={request.request_id}>
                <td>#{request.request_id}</td>
                <td>{request.title}</td>
                <td>{getCategoryName(request.category_id)}</td>
                <td>{request.status}</td>
                <td>
                  <button
                    className="staff-view-button"
                    onClick={() => openDetails(request)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="staff-queue-empty">No requests found.</p>
        )}
      </div>

      {selectedRequest && (
        <section className="staff-request-details">
          <div className="staff-details-heading">
            <h3>Request #{selectedRequest.request_id}</h3>
            <button className="close-details" onClick={() => setSelectedRequestId(null)}>
              Close Details
            </button>
          </div>

          <p>
            <strong>Title:</strong> {selectedRequest.title}
          </p>
          <p>
            <strong>Category:</strong>{" "}
            {getCategoryName(selectedRequest.category_id)}
          </p>
          <p>
            <strong>Status:</strong> {selectedRequest.status}
          </p>
          <p>
            <strong>Description:</strong>
          </p>
          <p>{selectedRequest.description}</p>

          <StaffAssignment
            key={"assignment-${selectedRequest.request_id}"}
            requestId={selectedRequest.request_id}
            currentUser={currentUser}
          />

          <StaffComments
            key={"comments-${selectedRequest.request_id}"}
            requestId={selectedRequest.request_id}
            currentUser={currentUser}
          />
          <div className="staff-status-editor">
            <label htmlFor="new-status">Update Status</label>

            <select
              id="new-status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={
                ALLOWED_TRANSITIONS[selectedRequest.status]?.length === 0
              }
            >
              <option value="">Select new status</option>

              {(ALLOWED_TRANSITIONS[selectedRequest.status] || []).map(
                (status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ),
              )}
            </select>

            <button
              className="primary-button"
              disabled={!newStatus || isSavingStatus}
              onClick={handleStatusUpdate}
            >
              {isSavingStatus ? "Saving..." : "Save Status"}
            </button>
          </div>

          {message && <p role="status">{message}</p>}
        </section>
      )}
    </div>
  );
}
