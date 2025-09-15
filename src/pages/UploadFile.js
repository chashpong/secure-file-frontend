// UploadFile.js
import React, { useState } from "react";

// helpers
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
  // ถ้าเป็น hex 64 แล้ว ใช้ตามนั้น ไม่งั้นทำ SHA-256
  const hex = isHex64(input) ? input : await sha256Hex(input);
  return hexToBytes(hex); // 32 bytes
}

function UploadFile() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [folder, setFolder] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");
  const [warning, setWarning] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const generateKey = () => {
    const key = [...crypto.getRandomValues(new Uint8Array(32))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    setEncryptionKey(key);
    setWarning("✅ สร้างคีย์แบบ 64 hex ให้เรียบร้อยแล้ว");
  };

  const handleKeyChange = (val) => {
    setEncryptionKey(val);
    if (val && !isHex64(val)) {
      setWarning(
        "ℹ️ คุณใส่รหัสปกติ ระบบจะทำ SHA-256 ให้อัตโนมัติ → คีย์ 64 hex"
      );
    } else if (val.length === 64 && isHex64(val)) {
      setWarning("✅ ใช้คีย์ hex 64 ตัวตามที่คุณกำหนด");
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

    try {
      // 1) อ่านไฟล์เป็น ArrayBuffer
      const plainBuf = await file.arrayBuffer();

      // 2) เตรียมคีย์และ iv (16 bytes สำหรับ AES-GCM)
      const keyBytes = await deriveKeyBytes(encryptionKey.trim());
      const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        "AES-GCM",
        false,
        ["encrypt"]
      );
      const iv = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes → 32 hex

      // 3) เข้ารหัสบน client
      const cipherBuf = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        cryptoKey,
        plainBuf
      );

      // 4) อัปโหลด "ciphertext" + metadata
      const formData = new FormData();
      formData.append(
        "cipher",
        new Blob([cipherBuf]),
        `${Date.now()}_${file.name}.enc`
      );
      formData.append("originalName", file.name);
      formData.append("filename", filename);
      formData.append("folder", folder);
      formData.append("iv", bytesToHex(iv));
      formData.append("mime", file.type || "application/octet-stream");

      const res = await fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Upload failed");

      alert("✅ อัปโหลดไฟล์ที่เข้ารหัสแล้วสำเร็จ (ฝั่งเซิร์ฟเวอร์ไม่รู้คีย์)");
      setFile(null);
      setFilename("");
      setFolder("");
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
        <input
          placeholder="ชื่อโฟลเดอร์ (ถ้ามี)"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
        />
        <input
          placeholder="รหัสเข้ารหัส (พิมพ์อะไรก็ได้ หรือใส่ 64 ตัว hex)"
          value={encryptionKey}
          onChange={(e) => handleKeyChange(e.target.value)}
        />
        {warning && <p style={{ color: "blue", fontSize: "14px" }}>{warning}</p>}
        <button type="button" onClick={generateKey}>
          Generate Key (hex64)
        </button>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadFile;
