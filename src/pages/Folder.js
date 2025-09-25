import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Folder() {
  const [folders, setFolders] = useState([]);
  const [newFolder, setNewFolder] = useState("");
  const navigate = useNavigate();

  // โหลดโฟลเดอร์จาก backend
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/folders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ ใช้ token
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch folders");
        }

        const data = await res.json();
        setFolders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error loading folders:", err.message);
        setFolders([]);
      }
    };

    fetchFolders();
  }, []);

  // ฟังก์ชันเพิ่มโฟลเดอร์
  const handleAdd = async () => {
    if (!newFolder.trim()) {
      alert("กรุณาใส่ชื่อโฟลเดอร์");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ ใช้ token
        },
        body: JSON.stringify({ name: newFolder }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to add folder");
      }

      setNewFolder("");

      // reload รายการใหม่
      const reload = await fetch("http://localhost:3000/api/folders", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await reload.json();
      setFolders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Add folder failed:", err.message);
      alert(err.message || "เพิ่มโฟลเดอร์ไม่สำเร็จ");
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
        {Array.isArray(folders) && folders.length > 0 ? (
          folders.map((f) => (
            <div
              key={f._id}
              style={{ margin: "10px 0", cursor: "pointer", color: "blue" }}
              onClick={() => handleOpenFolder(f.name)}
            >
              <span role="img" aria-label="folder">📁</span> {f.name}
            </div>
          ))
        ) : (
          <p>⚠️ ยังไม่มีโฟลเดอร์</p>
        )}
      </div>
    </div>
  );
}

export default Folder;
