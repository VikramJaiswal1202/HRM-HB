"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function AllUploads() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchAllReports = async () => {
      try {
        const res = await axios.get('/api/reports'); // no employeeId query → get all
        if (res.data.success) {
          setReports(res.data.reports);
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    };
    fetchAllReports();
  }, []);

  // Helper: check if file is an image
  const isImage = (path) => {
    return /\.(png|jpg|jpeg|gif|webp)$/i.test(path);
  };

  return (
    <div>
      <h2>📂 All Employee Uploads</h2>
      {reports.length === 0 ? (
        <p>No uploads found.</p>
      ) : (
        <ul>
          {reports.map(r => (
            <li key={r._id} style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
              <strong>Employee ID:</strong> {r.employeeId}<br />
              <strong>Date:</strong> {new Date(r.date).toLocaleDateString()}<br />
              {r.notes && <><strong>Notes:</strong> {r.notes}<br /></>}
              {r.imagePath && (
                <div>
                  {isImage(r.imagePath) ? (
                    <img src={encodeURI(r.imagePath)} alt="Uploaded" style={{ maxWidth: "300px", display: "block", marginTop: "5px" }} />
                  ) : (
                    <p>📄 <a href={encodeURI(r.imagePath)} target="_blank" rel="noopener noreferrer">Download File</a></p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
