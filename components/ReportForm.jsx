"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ReportForm() {
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    employeeId: "",
    date: "",
    notes: "",
  });
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);

  // Fetch employee list on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await axios.get("/api/employees");
        if (res.data.success) {
          setEmployees(res.data.employees);
        } else {
          console.error("Error fetching employees", res.data.error);
        }
      } catch (err) {
        console.error("Error fetching employees", err);
      }
    };
    fetchEmployees();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.date) {
      alert("Employee and Date are required");
      return;
    }

    const data = new FormData();
    data.append("employeeId", formData.employeeId);
    data.append("date", formData.date);
    data.append("notes", formData.notes);
    if (file) data.append("image", file);

    try {
      const res = await axios.post("/api/reports", data);
      setResponse(res.data);
    } catch (err) {
      console.error("Error submitting report", err);
      alert("Error submitting report");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">📋 Employee Reporting Update</h2>

        <label className="block mb-1">Choose Employee</label>
        <select
          name="employeeId"
          value={formData.employeeId}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-4"
        >
          <option value="">Select employee</option>
          {employees.map((emp) => (
            <option key={emp.employeeId} value={emp.employeeId}>
              {emp.employeeId} - {emp.name}
            </option>
          ))}
        </select>

        <label className="block mb-1">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded mb-4"
        />

        <label className="block mb-1">Notes (optional)</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          placeholder="Write your update here..."
        />

        <label className="block mb-1">Attach Image / Document</label>
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="w-full mb-4"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Submit
        </button>

        {response && (
          <div className="mt-4 bg-green-100 border border-green-400 p-2 rounded text-sm">
            ✅ Submitted!
            <pre className="mt-1">{JSON.stringify(response, null, 2)}</pre>
          </div>
        )}
      </form>
    </div>
  );
}
