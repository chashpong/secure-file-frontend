// src/pages/AuditLogs.js
import React, { useEffect, useState } from "react";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/logs", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ ส่ง token ไป
          },
        });

        const data = await res.json();
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch logs:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container">
      <h2>Blockchain Audit Logs</h2>
      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Filename</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.user}</td>
                    <td>{log.filename}</td>
                    <td>{log.action}</td>
                    <td>{log.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    ⚠️ ไม่มีประวัติการใช้งาน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuditLogs;
