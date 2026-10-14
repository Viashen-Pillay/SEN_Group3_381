import { useEffect, useState } from "react";
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
import { getRequests } from "./services/requestService";

import { registerUser, loginUser } from "./services/authService";
import "./styles/layout.css";

function App() {
  const [role, setRole] = useState("requester");
  const [activePage, setActivePage] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [authPage, setAuthPage] = useState("login");
  const [registrationMessage, setRegistrationMessage] = useState("");

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsError, setRequestsError] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    let active = true;

    async function loadRequests() {
      setRequestsLoading(true);
      setRequestsError("");

      try {
        const data = await getRequests();
        if (active) setRequests(data);
      } catch (err) {
        if (active) setRequestsError(err.message);
      } finally {
        if (active) setRequestsLoading(false);
      }
    }

    loadRequests();

    return () => {
      active = false;
    };
  }, [currentUser]);

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

  const handleLogin = async (credentials) => {
    const user = await loginUser(credentials);

    setCurrentUser(user);

    setRole(user.role.toLowerCase());
    setActivePage("dashboard");
  };

  const handleRegister = async (userData) => {
    await registerUser(userData);
    setRegistrationMessage("Account created successfully. Please sign in.");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRole("requester");
    setActivePage("dashboard");
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
      if (requestsLoading) {
        return <p>Loading service requests...</p>;
      }

      if (requestsError) {
        return <p role="alert">{requestsError}</p>;
      }

      return (
        <StaffQueueTable
          requests={requests}
          onStatusChange={handleStatusChange}
          currentUser={currentUser}
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
          <p
            role="status"
            className="auth-success"
            style={{ textAlign: "center", color: "green", marginTop: "10px" }}
          >
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
    <MainLayout
      role={role}
      user={currentUser}
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MainLayout>
  );
}

export default App;
