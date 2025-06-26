"use client";

import { useState, useEffect } from "react";

export default function TestManagerPage() {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [error, setError] = useState(null);

  // ✅ 1️⃣ Fetch all managers
  useEffect(() => {
    async function fetchManagers() {
      try {
        setLoadingManagers(true);
        // 👉 IMPORTANT: Append role=manager
        const res = await fetch("/api/company/users?role=manager");
        const data = await res.json();
        if (res.ok) {
          setManagers(data.users || []);
        } else {
          setError(data.message || "Error fetching managers");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingManagers(false);
      }
    }
    fetchManagers();
  }, []);

  // ✅ 2️⃣ Fetch employees for selected manager
  useEffect(() => {
    async function fetchEmployees() {
      if (!selectedManager) return;

      try {
        setLoadingEmployees(true);
        const res = await fetch(`/api/hr/manager-employees?managerId=${selectedManager}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setEmployees(data.users);
        } else {
          setError(data.message || "Error fetching employees");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingEmployees(false);
      }
    }
    fetchEmployees();
  }, [selectedManager]);
const handleUnassign = async (userId) => {
  if (!confirm("Are you sure you want to unassign this employee?")) return;

  try {
    const res = await fetch("/api/hr/unassign-user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId }),
    });
    // …

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error unassigning employee");
      } else {
        alert(data.message);
        // Remove employee from list
        setEmployees((prev) => prev.filter((emp) => emp._id !== userId));
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>👔 Manager & Employee Management</h1>

      {loadingManagers && <div>Loading managers...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="manager">Select Manager: </label>
        <select
          id="manager"
          value={selectedManager}
          onChange={(e) => setSelectedManager(e.target.value)}
        >
          <option value="">-- Choose a Manager --</option>
          {managers.map((mgr) => (
            <option key={mgr._id} value={mgr._id}>
              {mgr.name} ({mgr.username})
            </option>
          ))}
        </select>
      </div>

      {loadingEmployees && <div>Loading employees...</div>}

      {!loadingEmployees && employees.length > 0 && (
        <div>
          <h2>Employees Assigned:</h2>
          <ul>
            {employees.map((emp) => (
              <li key={emp._id}>
                {emp.name} ({emp.username})
                <button
                  style={{
                    marginLeft: "1rem",
                    padding: "0.25rem 0.5rem",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => handleUnassign(emp._id)}
                >
                  Unassign
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loadingEmployees && selectedManager && employees.length === 0 && (
        <div>No employees assigned to this manager.</div>
      )}
    </div>
  );
}