import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import UploadFile from "./pages/UploadFile";
import DownloadFile from "./pages/DownloadFile";
import AuditLogs from "./pages/AuditLogs";
import Folder from "./pages/Folder";
import FolderDetail from "./pages/FolderDetail";
import "./App.css";

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const hiddenRoutes = ["/", "/login", "/register", "/forgot-password"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const email = localStorage.getItem("email") || "";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    localStorage.removeItem("email");
    navigate("/login");
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      {/* เมนูซ้าย */}
      <div>
        <button onClick={() => navigate("/upload")}>UploadFile</button>
        <button onClick={() => navigate("/download")}>DownloadFile</button>
        <button onClick={() => navigate("/audit-logs")}>AuditLogs</button>
        <button onClick={() => navigate("/folder")}>Folder</button>
      </div>

      {/* โปรไฟล์ขวา */}
      <div>
        {email && (
          <>
            <span style={{ marginRight: "10px" }}>👤 {email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/upload" element={<UploadFile />} />
        <Route path="/download" element={<DownloadFile />} />
        <Route path="/audit-logs" element={<AuditLogs />} />
        <Route path="/folder" element={<Folder />} />
        <Route path="/folder/:name" element={<FolderDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
