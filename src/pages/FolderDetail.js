import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function FolderDetail() {
  const { name } = useParams(); // ดึงชื่อโฟลเดอร์จาก URL
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const url = new URL("http://localhost:3000/api/files");
        if (name) url.searchParams.set("folder", name);

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // ✅ ใช้ token
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch files");
        }

        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Error loading files:", err.message);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [name]);

  const handleDownload = async (f) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/download/${f.storedName}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Download failed");
      }

      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = f.filename || "downloaded_file";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("❌ Download failed: " + err.message);
      console.error("❌ Download error:", err.message);
    }
  };

  return (
    <div className="container">
      <h2>📁 Files in Folder: {name}</h2>

      {loading ? (
        <p>⏳ กำลังโหลด...</p>
      ) : !Array.isArray(files) || files.length === 0 ? (
        <p>⚠️ ยังไม่มีไฟล์ในโฟลเดอร์นี้</p>
      ) : (
        <div className="grid">
          {files.map((f) => (
            <div key={f.id} className="card">
              <div className="card-body">
                <h3 className="card-title">{f.filename}</h3>
                <p>📄 <b>ชื่อจริง:</b> {f.filename}</p>
                <p>📑 <b>ประเภท:</b> {f.mime}</p>
                <p>⏱️ <b>อัปโหลดเมื่อ:</b>{" "}
                  {new Date(f.uploadedAt).toLocaleString()}
                </p>
                <button
                  onClick={() => handleDownload(f)}
                  className="btn-download"
                >
                  ⬇️ ดาวน์โหลด
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }
        .card {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.15);
        }
        .card-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .card-body p {
          margin: 6px 0;
          font-size: 14px;
          color: #333;
        }
        .btn-download {
          display: inline-block;
          margin-top: 10px;
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
          cursor: pointer;
        }
        .btn-download:hover {
          background: #0056b3;
        }
      `}</style>
    </div>
  );
}

export default FolderDetail;
