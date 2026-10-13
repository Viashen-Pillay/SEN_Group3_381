import { useState } from 'react';
import { CreateRequestForm } from './components/CreateRequestForm';
import { StaffQueueTable } from './components/StaffQueueTable';
import MainLayout from './components/layout/MainLayout';
import RequesterDashboard from './pages/requester/RequesterDashboard';
import RequestHistory from './pages/requester/RequestHistory';
import StaffDashboard from './pages/staff/staffDashboard';
import "./styles/layout.css"

function App() {
  const [role, setRole] = useState("requester");
  const [activePage, setActivePage] = useState("dashboard");

  const [requests, setRequests] = useState([
    {request_id: 101,category_id: 1, title: "Water leak",description: "Water leak in hallway",status: "NEW"},
    {request_id: 102,category_id: 2, title: "Wi-Fi connection issue",description: "Wi-Fi connection down in lab",status: "IN_PROGRESS"}
  ]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setActivePage("dashboard");
  };

  const handleRequestCreated = (newRequest) => {
    setRequests((prev) => [...prev, newRequest]);
  };

  const renderPage = () => {

    if(activePage === "dashboard" && role ==="staff"){
      return(
        <StaffDashboard requests={requests} onNavigate={setActivePage}/>
      )
    }
    if(activePage === "dashboard" && role === "requester"){
      return(
        <RequesterDashboard requests={requests} onNavigate={setActivePage}/>
      );
    }
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
      return (<RequestHistory requests={requests}/>);
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