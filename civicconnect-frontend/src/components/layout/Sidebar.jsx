const navigation = {
    requester: [
        {id: "dashboard", label: "Dashboard"},
        {id: "new-request", label: "New Request"},
        {id: "my-requests", label: "My Requests"}
    ],
    staff: [
        {id: "dashboard", label: "Dashboard"},
        {id: "staff-queue", label: "Work Queue"}
    ],
    management: [
        {id: "dashboard", label: "Dashboard"},
        {id: "reports", label:"Reports"}
    ]
};

export default function Sidebar({role, activePage, onNavigate}){
    const items = navigation[role] || [];

    return(
        <aside className = "app-sidebar">
            <p className = "sidebar-heading">NAVIGATION</p>

            <nav aria-label="Main navigation">
                {items.map((item) => (
                    <button key={item.id} type = "button" 
                    className={activePage=== item.id ? "nav-item active": "nav-item"}
                    onClick={() => onNavigate(item.id)}>{item.label}</button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <p>CivicConnect</p>
                <small>Service Request Management</small>
            </div>
        </aside>
    );
}