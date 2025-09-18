// src/pages/UploadFile.js
import React, { useState, useEffect } from "react";

// ===== helper functions =====
const isHex64 = (s) => /^[0-9a-f]{64}$/i.test(String(s || ""));
const hexToBytes = (hex) =>
  new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
const bytesToHex = (buf) =>
  [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const sha256Hex = async (text) => {
  const enc = new TextEncoder().encode(String(text));
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return bytesToHex(buf);
};
async function deriveKeyBytes(input) {
  const hex = isHex64(input) ? input : await sha256Hex(input);
  return hexToBytes(hex);
}

function UploadFile() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [folder, setFolder] = useState(localStorage.getItem("lastFolder") || "");
  const [folders, setFolders] = useState([]);
  const [encryptionKey, setEncryptionKey] = useState("");
  const [warning, setWarning] = useState("");

  const currentUserId = localStorage.getItem("uid") || "";

  // โหลดโฟลเดอร์จาก backend
  useEffect(() => {
    const loadFolders = async () => {
      try {
        const url = new URL("http://localhost:3000/api/folders");
        if (currentUserId) url.searchParams.set("userId", currentUserId);
        const res = await fetch(url.toString());
        const data = await res.json();

        // ✅ ป้องกัน folders.map error
        if (Array.isArray(data)) {
          setFolders(data);
        } else {
          setFolders([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch folders", err);
        setFolders([]);
      }
    };
    loadFolders();
  }, [currentUserId]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const generateKey = () => {
    const key = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setEncryptionKey(key);
    setWarning("✅ ระบบสร้างคีย์ 64 hex (256-bit) ให้อัตโนมัติแล้ว");
  };

  const handleKeyChange = (val) => {
    setEncryptionKey(val);
    if (val && !isHex64(val)) {
      setWarning("ℹ️ รหัสธรรมดาจะถูกแปลงเป็น SHA-256 (64 hex) อัตโนมัติ");
    } else if (val.length === 64 && isHex64(val)) {
      setWarning("✅ ใช้คีย์ hex 64 ตัวตามที่คุณใส่");
    } else {
      setWarning("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !filename) {
      alert("กรุณาเลือกไฟล์และตั้งชื่อไฟล์");
      return;
    }
    if (!encryptionKey.trim()) {
      alert("กรุณาใส่รหัสสำหรับเข้ารหัส (หรือกด Generate)");
      return;
    }
    if (!folder.trim()) {
      alert("กรุณาเลือกโฟลเดอร์");
      return;
    }

    try {
      const plainBuf = await file.arrayBuffer();
      const keyBytes = await deriveKeyBytes(encryptionKey.trim());
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["encrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(16)); // ✅ 16 bytes ตรงกับ backend
      const cipherBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        plainBuf
      );

      const formData = new FormData();
      formData.append("cipher", new Blob([cipherBuf]), `${Date.now()}_${file.name}.enc`);
      formData.append("originalName", file.name);
      formData.append("filename", filename);
      formData.append("folder", folder);
      formData.append("iv", bytesToHex(iv)); // ✅ ส่ง 32 hex
      formData.append("mime", file.type || "application/octet-stream");
      if (currentUserId) formData.append("userId", currentUserId);

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      alert("✅ อัปโหลดไฟล์ที่เข้ารหัสแล้วสำเร็จ");
      localStorage.setItem("lastFolder", folder);

      setFile(null);
      setFilename("");
      setEncryptionKey("");
      setWarning("");
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <h2>🔒 Upload File (Client-side Encryption: AES-GCM)</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />

        <input
          placeholder="ตั้งชื่อไฟล์"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
        />

        <label>เลือกโฟลเดอร์</label>
        <select value={folder} onChange={(e) => setFolder(e.target.value)}>
          <option value="">-- เลือกโฟลเดอร์ --</option>
          {Array.isArray(folders) &&
            folders.map((f) => (
              <option key={f._id || f.name} value={f.name}>
                {f.name}
              </option>
            ))}
        </select>

        <input
          placeholder="รหัสเข้ารหัส (64 hex หรือข้อความธรรมดา)"
          value={encryptionKey}
          onChange={(e) => handleKeyChange(e.target.value)}
        />
        {warning && <p style={{ color: "blue" }}>{warning}</p>}

        <button type="button" onClick={generateKey}>
          Generate Key (hex64)
        </button>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadFile;
