"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportForm() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({ employeeId: "", date: "", notes: "" });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get('/api/employees');
        if (res.data.success) setEmployees(res.data.employees);
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (formData.employeeId) fetchReports(formData.employeeId);
  }, [formData.employeeId]);

  const fetchReports = async (empId) => {
    try {
      const res = await axios.get(`/api/reports?employeeId=${empId}`);
      if (res.data.success) setReports(res.data.reports);
    } catch (err) {
      console.error('Fetch reports error:', err);
    }
  };

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();
    data.append('employeeId', formData.employeeId);
    data.append('date', formData.date);
    data.append('notes', formData.notes);
    if (file) data.append('file', file);

    try {
      const res = await axios.post('/api/reports', data);
      if (res.data.success) {
        setSubmitted(true);
        fetchReports(formData.employeeId);
        setFile(null);
        setFormData({ ...formData, notes: "" });
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  return (
    <div>
      <h2>📅 Employee Reporting Update</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Choose Employee: </label>
          <select name="employeeId" value={formData.employeeId} onChange={handleChange} required>
            <option value="">Select</option>
            {employees.map(emp => (
              <option key={emp.employeeId} value={emp.employeeId}>
                {emp.employeeId} - {emp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Date: </label>
          <input type="date" name="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <label>Notes: </label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} />
        </div>
        <div>
          <label>Attach Image / Document: </label>
          <input type="file" onChange={handleFileChange} />
        </div>
        <button type="submit">Submit</button>
      </form>

      {submitted && <p style={{ color: 'green' }}>✅ Submitted!</p>}

      {reports.length > 0 && (
        <div>
          <h3>Previous Reports</h3>
          <ul>
            {reports.map(r => (
              <li key={r._id} style={{ marginBottom: '10px' }}>
                <strong>ID:</strong> {r.employeeId}<br />
                <strong>Date:</strong> {new Date(r.date).toLocaleDateString()}<br />
                {r.notes && <><strong>Notes:</strong> {r.notes}<br /></>}
                {r.imagePath && (
                  <>
                    <strong>Uploaded File:</strong> <a href={encodeURI(r.imagePath)} target="_blank" rel="noopener noreferrer">View</a>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
