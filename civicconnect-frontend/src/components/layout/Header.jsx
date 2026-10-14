export default function Header({ role, user, onLogout }) {
  const displayName =
    user?.name ||
    [user?.first_name, user?.last_name]
      .filter(Boolean)
      .join(" ") ||
    "User";

  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="brand-icon">CC</span>
        <h1>CivicConnect</h1>
      </div>

      <div className="header-actions">
        <span className="role-label">{role}</span>
        <span>{displayName}</span>
        <div className="user-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <button type="button" onClick={onLogout}>
          Log Out
        </button>
      </div>
    </header>
  );
}