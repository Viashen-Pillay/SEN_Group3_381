import "./../../styles/requesterDashboard.css";

export default function RequesterDashboard({requests, onNavigate}){
    const total = requests.length;

    const pending = requests.filter((request) => request.status === "NEW").length;

    const inProgress = requests.filter((request) => request.status === "IN_PROGRESS").length;

    const resolved = requests.filter((request) => request.status === "RESOLVED").length;

    const closed = requests.filter((request) => request.status === "CLOSED").length;

    const recentRequests = [...requests].sort((a,b) => b.request_id - a.request_id).slice(0,5);

    return(
        <div className = "requester-dashboard">
            <div className = "dashboard-heading">
                <div>
                    <h2>Dashboard</h2>
                    <p>View and manage your service requests.</p>
                </div>

                <button onClick={()=> onNavigate("new-request")} className = "primary-button">New Request</button>
            </div>

            <div className = "dashboard-stats">
                <div className = "stat-card">
                    <p>Total Requests:</p>
                    <h3>{total}</h3>
                </div>

                <div className = "stat-card">
                    <p>New:</p>
                    <h3>{pending}</h3>
                </div>

                <div className = "stat-card">
                    <p>In Progress:</p>
                    <h3>{inProgress}</h3>
                </div>

                <div className = "stat-card">
                    <p>Resolved:</p>
                    <h3>{resolved}</h3>
                </div>

                <div className = "stat-card">
                    <p>Closed:</p>
                    <h3>{closed}</h3>
                </div>
            </div>

            <div className="recent-requests">
                <div className="section-heading">
                    <h3>Recent Requests</h3>

                    <button onClick={() => onNavigate("my-requests")} className="text-button">View All</button>
                </div>

                {recentRequests.length === 0 ? (<p>You do not have any requests yet.</p>) : 
                                                (<div className = "request-list">
                                                    {recentRequests.map((request) => (
                                                        <div className = "request-row" key={request.request_id}>
                                                            <div>
                                                                <strong>{request.title}</strong>
                                                                <p>{request.description}</p>
                                                            </div>

                                                            <span className="request-status">
                                                                {request.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>)}
            </div>
        </div>
    );
}