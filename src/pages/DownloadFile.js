// src/pages/DownloadFile.js
import React, { useEffect, useState } from "react";

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

function DownloadFile() {
  const [files, setFiles] = useState([]);
  const [decryptKey, setDecryptKey] = useState("");
  const currentUserId = localStorage.getItem("uid") || "";

  useEffect(() => {
    (async () => {
      try {
        if (!currentUserId) {
          alert("❌ ไม่พบ userId, กรุณา login ก่อน");
          return;
        }
        const url = new URL("http://localhost:3000/api/files");
        url.searchParams.set("userId", currentUserId); // ✅ ส่ง userId
        const res = await fetch(url.toString());
        const data = await res.json();
        setFiles(data);
      } catch (e) {
        console.error("Failed to load files:", e);
      }
    })();
  }, [currentUserId]);

  const handleDownload = async (f) => {
    try {
      if (!decryptKey.trim()) {
        alert("กรุณาใส่รหัสสำหรับถอดรหัสไฟล์");
        return;
      }
      if (!currentUserId) {
        alert("❌ ไม่มี userId (ยังไม่ได้ login)");
        return;
      }

      // 1) ดาวน์โหลด ciphertext (แนบ userId)
      const res = await fetch(
        `http://localhost:3000/api/download/${f.id}?userId=${currentUserId}`
      );
      if (!res.ok) throw new Error("Download failed");
      const cipherBuf = await res.arrayBuffer();

      // 2) เตรียม key และ iv แล้วถอดรหัสบน client
      const keyBytes = await deriveKeyBytes(decryptKey.trim());
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["decrypt"]
      );
      const ivBytes = hexToBytes(f.iv);

      const plainBuf = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes },
        cryptoKey,
        cipherBuf
      );

      // 3) สร้าง Blob ด้วย mime เดิม แล้ว save
      const blob = new Blob([plainBuf], {
        type: f.mime || "application/octet-stream",
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = f.filename || "downloaded_file";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("❌ Decrypt error:", e);
      alert("ถอดรหัสไม่สำเร็จ (คีย์ไม่ตรง หรือไฟล์/iv ไม่ถูกต้อง)");
    }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("th-TH");

  return (
    <div className="container">
      <h2>📥 Download Encrypted Files (ถอดรหัสที่เบราว์เซอร์)</h2>

      <div style={{ margin: "8px 0" }}>
        <input
          placeholder="รหัสสำหรับถอดรหัส (hex64 หรือข้อความธรรมดา)"
          value={decryptKey}
          onChange={(e) => setDecryptKey(e.target.value)}
          style={{ width: "360px" }}
        />
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Folder</th>
            <th>Date Upload</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {files.map((f) => (
            <tr key={f.id}>
              <td>{f.filename}</td>
              <td>{f.folder}</td>
              <td>{fmt(f.uploadedAt)}</td>
              <td>
                <button onClick={() => handleDownload(f)}>
                  Download & Decrypt
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DownloadFile;
