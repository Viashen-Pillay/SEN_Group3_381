import "../../styles/managementDashboard.css";

export default function ManagementReports({requests = []}){
    const statusCounts = ["NEW", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => ({
        status, count: requests.filter((request) => request.status === status).length
    }));

    return(
        <div className="management-dashboard">
            <div className="management-heading">
                <div>
                    <h2>Management Reports</h2>
                    <p>Summary of service requests by status.</p>
                </div>
            </div>

            <section className="management-panel">
                <h3>Request Status Summary</h3>

                <table className = "management-table">
                    <thead>
                        <tr>
                            <th>Status</th>
                            <th>Number of Requests</th>
                        </tr>
                    </thead>

                    <tbody>
                        {statusCounts.map(({status, count}) => (
                            <tr key={status}>
                                <td>{status}</td>
                                <td>{count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}