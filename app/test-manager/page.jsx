"use client";

import { useState, useEffect } from "react";

export default function TestManagerPage() {
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [employees, setEmployees] = useState([]);
  const [managerTasks, setManagerTasks] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [error, setError] = useState(null);

  // Task assignment state
  const [assigningEmployeeId, setAssigningEmployeeId] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  // ✅ 1️⃣ Fetch all managers
  useEffect(() => {
    async function fetchManagers() {
      try {
        setLoadingManagers(true);
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

  // ✅ 3️⃣ Unassign employee
  const handleUnassign = async (userId) => {
    if (!confirm("Are you sure you want to unassign this employee?")) return;

    try {
      const res = await fetch("/api/hr/unassign-user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Error unassigning employee");
      } else {
        alert(data.message);
        setEmployees((prev) => prev.filter((emp) => emp._id !== userId));
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ✅ 4️⃣ Confirm and assign task
  const handleConfirmAssignTask = async (userId) => {
    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }
    try {
      const res = await fetch("/api/hr/assign-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, title: taskTitle, description: taskDescription }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setAssigningEmployeeId(null);
        setTaskTitle("");
        setTaskDescription("");
      } else {
        alert(data.message || "Error assigning task");
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // ✅ 5️⃣ Fetch manager tasks
  useEffect(() => {
    async function fetchManagerTasks() {
      if (!selectedManager) return;

      try {
        setLoadingTasks(true);
        const res = await fetch(`/api/hr/manager-tasks?managerId=${selectedManager}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setManagerTasks(data.tasks);
        } else {
          setError(data.message || "Error fetching manager tasks");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingTasks(false);
      }
    }
    fetchManagerTasks();
  }, [selectedManager]);

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
          onChange={(e) => {
            setSelectedManager(e.target.value);
            setAssigningEmployeeId(null);
            setTaskTitle("");
            setTaskDescription("");
            setManagerTasks([]);
            setEmployees([]);
          }}
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
                <button
                  style={{
                    marginLeft: "1rem",
                    padding: "0.25rem 0.5rem",
                    background: "green",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setAssigningEmployeeId(emp._id);
                    setTaskTitle("");
                    setTaskDescription("");
                  }}
                >
                  Assign Task
                </button>

                {assigningEmployeeId === emp._id && (
                  <div style={{ marginTop: "1rem", paddingLeft: "1rem" }}>
                    <input
                      style={{ padding: "0.25rem", marginRight: "0.5rem" }}
                      type="text"
                      placeholder="Task Title"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                    />
                    <input
                      style={{ padding: "0.25rem", marginRight: "0.5rem" }}
                      type="text"
                      placeholder="Task Description"
                      value={taskDescription}
                      onChange={(e) => setTaskDescription(e.target.value)}
                    />
                    <button
                      style={{
                        padding: "0.25rem 0.5rem",
                        background: "blue",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleConfirmAssignTask(emp._id)}
                    >
                      Confirm
                    </button>
                    <button
                      style={{
                        padding: "0.25rem 0.5rem",
                        marginLeft: "0.5rem",
                        background: "gray",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setAssigningEmployeeId(null);
                        setTaskTitle("");
                        setTaskDescription("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loadingEmployees && selectedManager && employees.length === 0 && (
        <div>No employees assigned to this manager.</div>
      )}

      {/* ✅ Manager Assigned Task Status */}
      {loadingTasks && <div>Loading assigned tasks status...</div>}

      {!loadingTasks && managerTasks.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Assigned Tasks Status</h2>
          <ul>
            {managerTasks.map((task) => (
              <li key={task._id}>
                <strong>{task.title}</strong> - Assigned To: {task.assignedTo.name}
                <div>
                  Status:{" "}
                  <span
                    style={{
                      color:
                        task.status === "pending"
                          ? "orange"
                          : task.status === "in_progress"
                          ? "blue"
                          : "green",
                    }}
                  >
                    {task.status}
                  </span>
                  {task.completionFile && (
                    <>
                      {" | "}
                      File:{" "}
                      <a
                        href={task.completionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "blue" }}
                      >
                        View
                      </a>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
