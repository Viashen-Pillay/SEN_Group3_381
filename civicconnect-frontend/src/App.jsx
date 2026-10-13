import { useState } from "react";
import { CreateRequestForm } from "./components/CreateRequestForm";
import { StaffQueueTable } from "./components/StaffQueueTable";
import MainLayout from "./components/layout/MainLayout";
import RequesterDashboard from "./pages/requester/RequesterDashboard";
import RequestHistory from "./pages/requester/RequestHistory";
import StaffDashboard from "./pages/staff/staffDashboard";
import ManagementDashboard from "./pages/management/ManagementDashboard";
import ManagementReports from "./pages/management/ManagementReports";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import { registerUser } from "./services/authService";
import "./styles/layout.css";

function App() {
  const [role, setRole] = useState("requester");
  const [activePage, setActivePage] = useState("dashboard");

  const [requests, setRequests] = useState([
    {
      request_id: 101,
      category_id: 1,
      title: "Water leak",
      description: "Water leak in hallway",
      status: "NEW",
    },
    {
      request_id: 102,
      category_id: 2,
      title: "Wi-Fi connection issue",
      description: "Wi-Fi connection down in lab",
      status: "IN_PROGRESS",
    },
  ]);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setActivePage("dashboard");
  };

  const handleRequestCreated = (newRequest) => {
    setRequests((prev) => [...prev, newRequest]);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequests((previous) =>
      previous.map((request) =>
        request.request_id === requestId
          ? { ...request, status: newStatus }
          : request,
      ),
    );
  };

  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = async ({ email }) => {
    // Development-only mock login.
    // Replace with loginUser() after backend sessions are implemented.
    setCurrentUser({
      user_id: "demo-user",
      name: email,
      role: "Requester",
    });

    setRole("requester");
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole("requester");
    setActivePage("dashboard");
  };

  const [authPage, setAuthPage] = useState("login");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const handleRegister = async (userData) => {
    await registerUser(userData);

    setRegistrationMessage("Account created successfully. Please sign in.");
  };

  const renderPage = () => {
    if (activePage === "dashboard" && role === "management") {
      return (
        <ManagementDashboard requests={requests} onNavigate={setActivePage} />
      );
    }

    if (activePage === "dashboard" && role === "staff") {
      return <StaffDashboard requests={requests} onNavigate={setActivePage} />;
    }
    if (activePage === "dashboard" && role === "requester") {
      return (
        <RequesterDashboard requests={requests} onNavigate={setActivePage} />
      );
    }
    if (activePage === "new-request" && role === "requester") {
      return <CreateRequestForm onRequestCreated={handleRequestCreated} />;
    }

    if (activePage === "staff-queue" && role === "staff") {
      return (
        <StaffQueueTable
          requests={requests}
          onStatusChange={handleStatusChange}
        />
      );
    }

    if (activePage === "my-requests" && role === "requester") {
      return <RequestHistory requests={requests} />;
    }

    if (activePage === "reports" && role === "management") {
      return <ManagementReports requests={requests} />;
    }

    return (
      <div className="page-card">
        <h2>Dashboard</h2>
        <p>Welcome to the {role} dashboard.</p>
        <p>This dashboard will be implemented in its own feature branch.</p>
      </div>
    );
  };

  if (!currentUser) {
    if (authPage === "register") {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onNavigateToLogin={() => setAuthPage("login")}
        />
      );
    }

    return (
      <>
        {registrationMessage && (
          <p role="status" className="auth-success">
            {registrationMessage}
          </p>
        )}

        <LoginPage
          onLogin={handleLogin}
          onNavigateToRegister={() => {
            setRegistrationMessage("");
            setAuthPage("register");
          }}
        />
      </>
    );
  }
  return (
    <MainLayout role={role} activePage={activePage} onNavigate={setActivePage}>
      <div className="role-switcher">
        <button onClick={() => handleRoleChange("requester")}>Requester</button>

        <button onClick={() => handleRoleChange("staff")}>Staff</button>

        <button onClick={() => handleRoleChange("management")}>
          Management
        </button>
      </div>

      {renderPage()}
    </MainLayout>
  );
}

export default App;
