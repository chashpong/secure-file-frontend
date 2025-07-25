import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
  const hiddenRoutes = ["/", "/login", "/register", "/forgot-password"];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <nav>
      <button onClick={() => (window.location.href = "/upload")}>UploadFile</button>
      <button onClick={() => (window.location.href = "/download")}>DownloadFile</button>
      <button onClick={() => (window.location.href = "/audit-logs")}>AuditLogs</button>
      <button onClick={() => (window.location.href = "/folder")}>Folder</button>
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