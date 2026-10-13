import "../../styles/managementDashboard.css";

const STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function ManagementDashboard({ requests = [], onNavigate }) {
  const total = requests.length;

  const statusCounts = STATUSES.map((status) => ({
    status,
    count: requests.filter((request) => request.status === status).length,
  }));

  const categoryCounts = Object.entries(
    requests.reduce((counts, request) => {
      const id = request.category_id;
      counts[id] = (counts[id] || 0) + 1;
      return counts;
    }, {}),
  );

  return (
    <div className="management-dashboard">
      <div className="management-heading">
        <div>
          <h2>Management Dashboard</h2>
          <p>Monitor service request activity and progress.</p>
        </div>

        <button
          className="primary-button"
          onClick={() => onNavigate("reports")}
        >
          View Reports
        </button>
      </div>

      <div className="management-stats">
        <div className="management-stat-card">
          <p>Total Requests</p>
          <h3>{total}</h3>
        </div>

        {statusCounts.map(({ status, count }) => (
          <div className="management-stat-card" key={status}>
            <p>{status}</p>
            <h3>{count}</h3>
          </div>
        ))}
      </div>

      <section className="management-panel">
        <h3>Requests by Status</h3>

        {statusCounts.map(({ status, count }) => (
          <div className="management-chart-row" key={status}>
            <span>{status}</span>

            <div
              className="management-chart-track"
              role="progressbar"
              aria-label={`${status} requests`}
              aria-valuenow={count}
              aria-valuemin={0}
              aria-valuemax={total || 1}
            >
              <div
                className="management-chart-fill"
                style={{
                  width: `${total ? (count / total) * 100 : 0}%`,
                }}
              />
            </div>

            <strong>{count}</strong>
          </div>
        ))}
      </section>

      <section className="management-panel">
        <h3>Requests by Category</h3>

        {categoryCounts.length === 0 ? (
          <p>No request data available.</p>
        ) : (
          <table className="management-table">
            <thead>
              <tr>
                <th>Category ID</th>
                <th>Number of Requests</th>
              </tr>
            </thead>

            <tbody>
              {categoryCounts.map(([categoryId, count]) => (
                <tr key={categoryId}>
                  <td>Category {categoryId}</td>
                  <td>{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
