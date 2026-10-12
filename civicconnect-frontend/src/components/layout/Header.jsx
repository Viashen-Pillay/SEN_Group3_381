export default function Header({role}){
    return(
        <header className = "app-header">
            <div className = "app-brand">
                <span className="brand-icon">CC</span>
                <h1>CivicConnect</h1>
            </div>

            <div className = "header-actions">
                <span className = "role-label">{role}</span>
                <div className="user-avatar">U</div>
            </div>
        </header>
    );
}
