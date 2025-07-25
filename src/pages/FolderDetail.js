// src/pages/FolderDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function FolderDetail() {
  const { name } = useParams(); // รับชื่อโฟลเดอร์จาก URL
  const [files, setFiles] = useState([]);

  // จำลองไฟล์ที่อยู่ในโฟลเดอร์
  useEffect(() => {
    const dummyFiles = [
      { id: 1, filename: "budget.xlsx", uploadedAt: "2025-07-21" },
      { id: 2, filename: "presentation.pptx", uploadedAt: "2025-07-20" },
    ];
    setFiles(dummyFiles);
  }, [name]);

  const handleDownload = (fileId) => {
    alert(`ดาวน์โหลดไฟล์ ID: ${fileId} จากโฟลเดอร์ "${name}"`);
  };

  return (
    <div className="container">
      <h2>Folder: {name}</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ชื่อไฟล์</th>
            <th>วันที่อัปโหลด</th>
            <th>ดาวน์โหลด</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td>{file.filename}</td>
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

export default FolderDetail;
