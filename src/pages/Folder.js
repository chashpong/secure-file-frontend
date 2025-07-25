// src/pages/Folder.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Folder() {
  const [folders, setFolders] = useState(["Work", "Personal", "Secret"]);
  const [newFolder, setNewFolder] = useState("");
  const navigate = useNavigate();

  const handleAddFolder = () => {
    if (!newFolder.trim()) return;
    if (folders.includes(newFolder.trim())) {
      alert("โฟลเดอร์นี้มีอยู่แล้ว");
      return;
    }
    setFolders([...folders, newFolder.trim()]);
    setNewFolder("");
  };

  const goToFolder = (folderName) => {
    navigate(`/folder/${folderName}`);
  };

  return (
    <div className="container">
      <h2>Folders</h2>
      <input
        type="text"
        placeholder="เพิ่มชื่อโฟลเดอร์"
        value={newFolder}
        onChange={(e) => setNewFolder(e.target.value)}
      />
      <button onClick={handleAddFolder}>Add Folder</button>

      <div className="folder-grid">
        {folders.map((name, index) => (
          <div key={index} className="folder" onClick={() => goToFolder(name)}>
            📁<br />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Folder;
