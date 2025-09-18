// src/pages/Folder.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Folder() {
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");
  const currentUserId = localStorage.getItem("uid") || "";
  const navigate = useNavigate();

  // โหลดโฟลเดอร์จาก backend
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const url = new URL("http://localhost:3000/api/folders");
        if (currentUserId) url.searchParams.set("userId", currentUserId);
        const res = await fetch(url.toString());
        const data = await res.json();

        // ✅ ป้องกัน folders.map is not a function
        if (Array.isArray(data)) {
          setFolders(data);
        } else {
          setFolders([]);
        }
      } catch (err) {
        console.error("❌ Error loading folders:", err);
        setFolders([]);
      }
    };

    fetchFolders();
  }, [currentUserId]);

  // ฟังก์ชันเพิ่มโฟลเดอร์
  const handleAdd = async () => {
    if (!newFolder.trim()) {
      alert("กรุณาใส่ชื่อโฟลเดอร์");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolder,
          userId: currentUserId,
        }),
      });

      if (!res.ok) throw new Error("Failed to add folder");
      setNewFolder(""); // ล้างช่อง input

      // reload รายการใหม่
      const url = new URL("http://localhost:3000/api/folders");
      if (currentUserId) url.searchParams.set("userId", currentUserId);
      const reload = await fetch(url.toString());
      const data = await reload.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Add folder failed:", err);
      alert("เพิ่มโฟลเดอร์ไม่สำเร็จ");
    }
  };

  // เมื่อกดเข้าไปยังโฟลเดอร์
  const handleOpenFolder = (folderName) => {
    navigate(`/folder/${folderName}`);
  };

  return (
    <div className="container">
      <h2>📂 Folders</h2>
      <div>
        <input
          placeholder="เพิ่มชื่อโฟลเดอร์"
          value={newFolder}
          onChange={(e) => setNewFolder(e.target.value)}
        />
        <button onClick={handleAdd}>Add Folder</button>
      </div>

      <div style={{ marginTop: "20px" }}>
        {Array.isArray(folders) &&
          folders.map((f, idx) => (
            <div
              key={idx}
              style={{ margin: "10px 0", cursor: "pointer", color: "blue" }}
              onClick={() => handleOpenFolder(f.name || f)}
            >
              <span role="img" aria-label="folder">📁</span> {f.name || f}
            </div>
          ))}
      </div>
    </div>
  );
}

export default Folder;
