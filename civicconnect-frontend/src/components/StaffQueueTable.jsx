import { useState } from "react";
import {CategoryFilterStrategy,StatusFilterStrategy,KeywordSearchStrategy} from "../strategies/filterStrategies";
import {REQUEST_STATUSES,ALLOWED_TRANSITIONS} from "../constants/requestStatuses";
import StaffAssignment from "./StaffAssignment";
import StaffComments from "./StaffComments";
import "../styles/staffQueue.css";

export function StaffQueueTable({requests = [],onStatusChange, currentUser}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [message, setMessage] = useState("");

  const selectedRequest = requests.find(
    (request) => request.request_id === selectedRequestId
  );

  let filtered = CategoryFilterStrategy.filter(requests, selectedCategory);
  filtered = StatusFilterStrategy.filter(filtered, selectedStatus);
  filtered = KeywordSearchStrategy.filter(filtered, searchKeyword);

  const categories = [...new Set(requests.map((request) => request.category_id))];

  const openDetails = (request) => {
    setSelectedRequestId(request.request_id);
    setNewStatus("");
    setMessage("");
  };

  const handleStatusUpdate = () => {
    if (!selectedRequest || !newStatus) return;

    const allowed = ALLOWED_TRANSITIONS[selectedRequest.status] || [];

    if (!allowed.includes(newStatus)) {
      setMessage("This status transition is not permitted.");
      return;
    }

    onStatusChange(selectedRequest.request_id, newStatus);
    setNewStatus("");
    setMessage("Status updated in demo mode.");
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
          {categories.map((categoryId) => (
            <option key={categoryId} value={String(categoryId)}>
              Category {categoryId}
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
                <td>{request.category_id}</td>
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
            <button onClick={() => setSelectedRequestId(null)}>
              Close Details
            </button>
          </div>

          <p><strong>Title:</strong> {selectedRequest.title}</p>
          <p><strong>Category:</strong> {selectedRequest.category_id}</p>
          <p><strong>Status:</strong> {selectedRequest.status}</p>
          <p><strong>Description:</strong></p>
          <p>{selectedRequest.description}</p>

          <StaffAssignment key={'assignment-${selectedRequest.request_id}'} 
          requestId={selectedRequest.request_id} currentUser={currentUser}/>

          <StaffComments key={'comments-${selectedRequest.request_id}'}
           requestId={selectedRequest.request_id} currentUser={currentUser}/>
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

              {(ALLOWED_TRANSITIONS[selectedRequest.status] || [])
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>

            <button
              className="primary-button"
              disabled={!newStatus}
              onClick={handleStatusUpdate}
            >
              Save Status
            </button>
          </div>

          {message && <p role="status">{message}</p>}
        </section>
      )}
    </div>
  );
}