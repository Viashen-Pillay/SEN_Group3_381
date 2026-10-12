import { useState } from 'react';
import { CreateRequestForm } from './components/CreateRequestForm';
import { StaffQueueTable } from './components/StaffQueueTable';
import MainLayout from './components/layout/MainLayout';
import "./styles/layout.css"

function App() {
  const [role, setRole] = useState("requester");
  const [activePage, setActivePage] = useState("dashboard");

  const [requests, setRequests] = useState([
    {id: 101,categoryId: "1",description: "Water leak in hallway",status: "Pending"},
    {id: 102,categoryId: "2",description: "Wi-Fi connection down in lab",status: "In Progress"}
  ]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setActivePage("dashboard");
  };

  const handleRequestCreated = (newRequest) => {
    setRequests((prev) => [...prev, newRequest]);
  };

  const renderPage = () => {
    if (activePage === "new-request" && role === "requester") {
      return (
        <CreateRequestForm
          onRequestCreated={handleRequestCreated}
        />
      );
    }

    if (
      activePage === "staff-queue" &&
      role === "staff"
    ) {
      return <StaffQueueTable requests={requests} />;
    }

    if (activePage === "my-requests" && role === "requester") {
      return (
        <div className="page-card">
          <h2>My Requests</h2>
          <p>Request history will be implemented in its feature branch.</p>
        </div>
      );
    }

    if (activePage === "reports" && role === "management") {
      return (
        <div className="page-card">
          <h2>Reports</h2>
          <p>Management reporting will be implemented later.</p>
        </div>
      );
    }

    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>Welcome to the {role} dashboard.</p>
        <p>This dashboard will be implemented in its own feature branch.</p>
      </div>
    );
  };

  return (
    <MainLayout
      role={role}
      activePage={activePage}
      onNavigate={setActivePage}
    >
      <div className="role-switcher">
        <button onClick={() => handleRoleChange("requester")}>
          Requester
        </button>

        <button onClick={() => handleRoleChange("staff")}>
          Staff
        </button>

        <button onClick={() => handleRoleChange("management")}>
          Management
        </button>
      </div>

      {renderPage()}
    </MainLayout>
  );
}

export default App;