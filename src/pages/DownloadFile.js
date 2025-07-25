// src/pages/DownloadFile.js
import React, { useEffect, useState } from "react";

function DownloadFile() {
  const [files, setFiles] = useState([]);

  // ดึงข้อมูลจาก Backend (ในที่นี้จำลองการดึงไฟล์จาก API)
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/files'); 
        const data = await res.json();
        setFiles(data);  // เก็บข้อมูลไฟล์จาก API ลงใน state
      } catch (err) {
        console.error("Failed to fetch files:", err);
      }
    };

    fetchFiles();
  }, []);

  const handleDownload = async (fileId) => {
    try {
      // เมื่อคลิกดาวน์โหลด เรียก API ของ Backend เพื่อดาวน์โหลดไฟล์
      const response = await fetch(`http://localhost:3000/api/download/${fileId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // ส่ง token เพื่อการตรวจสอบ
        }
      });

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();  // เปลี่ยนไฟล์ที่ดาวน์โหลดเป็น Blob
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `file_${fileId}.pdf`;  // กำหนดชื่อไฟล์ที่ดาวน์โหลด
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error during download:", error);
      alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
    }
  };

  return (
    <div className="container">
      <h2>Download Files</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Folder</th>
            <th>Date Upload</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.filename}</td>
              <td>{file.folder}</td>
              <td>{file.uploadedAt}</td>
              <td>
                <button onClick={() => handleDownload(file.id)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DownloadFile;
