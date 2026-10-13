import "../../styles/staffDashboard.css";

const STATUSES = [
    { value: "NEW", label: "New" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "RESOLVED", label: "Resolved" },
    { value: "CLOSED", label: "Closed" }
]

export default function StaffDashboard({requests =[], onNavigate}){
    const recentRequests = [...requests].reverse().slice(0,5);

    const countByStatus = (status) => requests.filter((request) => request.status === status).length;

    return(
        <div className="staff-dashboard">
            <div className="staff-dashboard-heading">
                <div>
                    <h2>Staff Dashboard</h2>
                    <p>Overview of service requests and their current statuses.</p>
                </div>

                <button className = "primary-button" onClick={() => onNavigate("staff-queue")}>Open Work Queue</button>
            </div>

            <div className="staff-dashboard-stats">
                <div className="staff-stat-card">
                    <p>Total Requests</p>
                    <h3>{requests.length}</h3>
                </div>

                {STATUSES.map((status) => (
                    <div className="staff-stat-card" key={status.value}>
                        <p>{status.label}</p>
                        <h3>{countByStatus(status.value)}</h3>
                    </div>
                ))}
            </div>

            <section className="staff-recent-requests">
                <div className="staff-section-heading">
                    <h3>Recent Requests</h3>

                    <button className="text-button" onClick={() => onNavigate("staff-queue")}>View All</button>
                </div>

                {recentRequests.length === 0? (<p>No service requests available.</p>) :
                                            (<div className="staff-table-wrapper">
                                                <table className="staff-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Request ID</th>
                                                            <th>Title</th>
                                                            <th>Category</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {recentRequests.map((request) => (
                                                            <tr key={request.request_id}>
                                                                <td>{request.request_id}</td>
                                                                <td>{request.title}</td>
                                                                <td>{request.category_id}</td>
                                                                <td>{request.status}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>)}
            </section>
        </div>
    );
}