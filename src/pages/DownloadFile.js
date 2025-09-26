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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/files", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();

        console.log("📂 Files API response:", data);
        setFiles(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("❌ Failed to load files:", e);
        setFiles([]);
      }
    })();
  }, []);

  const handleDownload = async (f) => {
    try {
      // ✅ ให้ user กรอกรหัสผ่านตอนกดดาวน์โหลด
      const decryptKey = prompt(
        `ใส่รหัสถอดรหัสสำหรับไฟล์: ${f.filename}`
      );
      if (!decryptKey || !decryptKey.trim()) {
        alert("❌ ต้องใส่รหัสก่อนดาวน์โหลด");
        return;
      }

      // ✅ ดาวน์โหลดโดยใช้ token
      const res = await fetch(
        `http://localhost:3000/api/download/${f.storedName}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (!res.ok) throw new Error("Download failed");
      const cipherBuf = await res.arrayBuffer();

      // 🔑 เตรียม key และ iv
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

      // 💾 Save ไฟล์
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
      <h2>📥 Download Encrypted Files (กดแล้วใส่รหัสทันที)</h2>

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
          {files.length > 0 ? (
            files.map((f) => (
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
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                ไม่มีไฟล์ที่อัปโหลด
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DownloadFile;
