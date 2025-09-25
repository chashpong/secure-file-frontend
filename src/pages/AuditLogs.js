// src/pages/AuditLogs.js
import React, { useEffect, useState } from "react";

function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/logs");
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error("❌ Failed to fetch logs:", err);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="container">
      <h2>Blockchain Audit Logs</h2>
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
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{log.user}</td>
                <td>{log.filename}</td>
                <td>{log.action}</td>
                <td>{log.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;
