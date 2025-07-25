import React, { useState } from "react";

function UploadFile() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [folder, setFolder] = useState("");
  const [encryptionKey, setEncryptionKey] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const generateKey = () => {
    // สุ่มรหัส 32 ตัวอักษร (เช่นใช้ AES-256)
    const randomKey = Array.from(
      { length: 32 },
      () => Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setEncryptionKey(randomKey);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !filename || !folder || !encryptionKey) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // เชื่อมต่อกับ backend เพื่ออัปโหลดไฟล์
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("filename", filename);
      formData.append("folder", folder);
      formData.append("encryptionKey", encryptionKey);

      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        alert("ไฟล์ถูกอัปโหลดสำเร็จ!");
      } else {
        alert(result.error || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
      }
    } catch (err) {
      console.error('❌ Upload error:', err);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ server');
    }
  };

  return (
    <div className="container">
      <h2>Upload File</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <input
          type="text"
          placeholder="ตั้งชื่อไฟล์"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="ชื่อโฟลเดอร์"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="รหัสเข้ารหัส (Encryption Key)"
          value={encryptionKey}
          onChange={(e) => setEncryptionKey(e.target.value)}
          required
        />
        <button type="button" onClick={generateKey}>
          Generate Key
        </button>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default UploadFile;
