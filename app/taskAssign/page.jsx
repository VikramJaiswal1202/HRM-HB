"use client";

import { useState, useEffect } from "react";

// Sidebar Component with Homepage redirect to /homepageM
function Sidebar() {
  return (
    <div
      style={{
        width: 90,
        background: "#14213d",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 24,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
        boxShadow: "2px 0 12px 0 rgba(20,33,61,0.08)",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          background: "#fff",
          color: "#14213d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 24,
          marginBottom: 36,
          boxShadow: "0 2px 8px rgba(20,33,61,0.08)",
        }}
      >
        R
      </div>
      <div style={{ width: "100%" }}>
        {[
          { icon: "🏠", label: "Homepage", link: "/homepageM" },
          { icon: "👥", label: "Employees", link: "/employeesM" },
          { icon: "👤", label: "Intern", link: "/intern" },
          { icon: "📅", label: "Attendance and Timing", link: "/attendance" },
          { icon: "📅", label: "View Attendance", link: "/presentEmployees" },
          { icon: "🕒", label: "Timing Reporting", link: "/reporting" },
          { icon: "📝", label: "Task Assign", link: "/taskAssign" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              marginBottom: 30,
              textAlign: "center",
              cursor: "pointer",
              transition: "background 0.15s",
              borderRadius: 8,
              padding: "6px 0",
              userSelect: "none",
            }}
            onClick={() => (window.location.href = item.link)}
            onMouseOver={e => e.currentTarget.style.background = "#22305a"}
            onMouseOut={e => e.currentTarget.style.background = "transparent"}
          >
            <span style={{ fontSize: 24 }}>{item.icon}</span>
            <div style={{ fontSize: 13, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: "auto", marginBottom: 28, textAlign: "center" }}>
        <span
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#22223b",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            cursor: "pointer",
            marginBottom: 2,
          }}
          onClick={() => { window.location.href = "/login"; }}
        >
          ↩
        </span>
        <div
          style={{ fontSize: 12, marginTop: 4, cursor: "pointer", color: "#fff" }}
          onClick={() => { window.location.href = "/login"; }}
        >
          Logout
        </div>
      </div>
    </div>
  );
}

// Navbar Component
function Navbar() {
  return (
    <div
      style={{
        height: 60,
        background: "#4a6fc1", // Changed to match the blue in your screenshot
        color: "#fff",
        display: "flex",
        alignItems: "center",
        paddingLeft: 30,
        fontWeight: "bold",
        fontSize: 30,
        letterSpacing: 1,
        boxShadow: "0 2px 12px rgba(20,33,61,0.07)",
      }}
    >
      PulseHR
    </div>
  );
}

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

  // Fetch all managers
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

  // Fetch employees for selected manager
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

  // Unassign employee
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

  // Confirm and assign task
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

  // Fetch manager tasks
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
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(120deg, #f4f6f8 60%, #e3e9f7 100%)" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 90, minHeight: "100vh" }}>
        <Navbar />
        <div style={{
          minHeight: "calc(100vh - 60px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}>
          <div
            style={{
              background: "rgba(255,255,255,0.98)",
              borderRadius: 18,
              boxShadow: "0 8px 32px rgba(44,62,80,0.10)",
              padding: "38px 38px 32px 38px",
              minWidth: 700,
              width: "100%",
              height: "100vh",
              margin: "32px auto",
              color: "#22223b",
              transition: "box-shadow 0.2s",
              border: "1px solid #e3e9f7",
            }}
          >
            <h1 style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 30,
              color: "#14213d",
              display: "flex",
              alignItems: "center",
              gap: 14,
              letterSpacing: 1,
            }}>
              <span role="img" aria-label="icon" style={{ fontSize: 32 }}>📊</span>
              Manager & Employee Management
            </h1>

            {loadingManagers && <div>Loading managers...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}

            <div style={{ marginBottom: "2.2rem" }}>
              <label htmlFor="manager" style={{ fontWeight: 600, marginRight: 12, fontSize: 17 }}>
                Select Manager:
              </label>
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
                style={{
                  padding: "0.6rem 1.2rem",
                  borderRadius: 8,
                  border: "1.5px solid #bfc9e0",
                  fontSize: 16,
                  background: "#f7faff",
                  fontWeight: 500,
                  outline: "none",
                  minWidth: 260,
                  boxShadow: "0 1px 4px rgba(44,62,80,0.04)",
                  transition: "border 0.2s",
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
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 22,
                  color: "#22305a",
                  letterSpacing: 0.5,
                }}>Employees Assigned:</h2>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "22px",
                  marginBottom: 18,
                }}>
                  {employees.map((emp) => (
                    <div
                      key={emp._id}
                      style={{
                        background: "linear-gradient(120deg, #e3e9f7 60%, #f7faff 100%)",
                        border: "1.5px solid #dbe6fd",
                        borderRadius: 14,
                        padding: "22px 26px",
                        minWidth: 270,
                        maxWidth: 320,
                        boxShadow: "0 2px 12px rgba(44,62,80,0.07)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        position: "relative",
                        transition: "box-shadow 0.2s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: "#14213d", display: "flex", alignItems: "center" }}>
                        <span style={{
                          background: "#3357b7",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 36,
                          height: 36,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          marginRight: 12,
                          boxShadow: "0 2px 8px rgba(51,87,183,0.10)",
                        }}>
                          {emp.name?.[0]?.toUpperCase() || "U"}
                        </span>
                        {emp.name}
                        <span style={{ color: "#888", fontWeight: 400, fontSize: 15, marginLeft: 8 }}>
                          ({emp.username})
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                        <button
                          style={{
                            padding: "0.35rem 1.2rem",
                            background: "#e53935",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 15,
                            boxShadow: "0 1px 4px rgba(229,57,53,0.08)",
                            transition: "background 0.15s",
                          }}
                          onClick={() => handleUnassign(emp._id)}
                        >
                          Unassign
                        </button>
                        <button
                          style={{
                            padding: "0.35rem 1.2rem",
                            background: "#3357b7",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 15,
                            boxShadow: "0 1px 4px rgba(51,87,183,0.08)",
                            transition: "background 0.15s",
                          }}
                          onClick={() => {
                            setAssigningEmployeeId(emp._id);
                            setTaskTitle("");
                            setTaskDescription("");
                          }}
                        >
                          Assign Task
                        </button>
                      </div>
                      {assigningEmployeeId === emp._id && (
                        <div style={{
                          marginTop: 18,
                          width: "100%",
                          background: "#fff",
                          border: "1.5px solid #cfd8dc",
                          borderRadius: 10,
                          padding: "14px 12px",
                          boxShadow: "0 2px 8px rgba(44,62,80,0.04)",
                        }}>
                          <input
                            style={{
                              padding: "0.4rem",
                              marginRight: "0.5rem",
                              borderRadius: 6,
                              border: "1.5px solid #bfc9e0",
                              fontSize: 15,
                              marginBottom: 10,
                              width: "96%",
                              display: "block",
                              background: "#f7faff",
                              fontWeight: 500,
                            }}
                            type="text"
                            placeholder="Task Title"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                          />
                          <input
                            style={{
                              padding: "0.4rem",
                              marginRight: "0.5rem",
                              borderRadius: 6,
                              border: "1.5px solid #bfc9e0",
                              fontSize: 15,
                              marginBottom: 10,
                              width: "96%",
                              display: "block",
                              background: "#f7faff",
                              fontWeight: 500,
                            }}
                            type="text"
                            placeholder="Task Description"
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                          />
                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              style={{
                                padding: "0.35rem 1.2rem",
                                background: "#219653",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 15,
                                boxShadow: "0 1px 4px rgba(33,150,83,0.08)",
                              }}
                              onClick={() => handleConfirmAssignTask(emp._id)}
                            >
                              Confirm
                            </button>
                            <button
                              style={{
                                padding: "0.35rem 1.2rem",
                                background: "#757575",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: 15,
                                boxShadow: "0 1px 4px rgba(117,117,117,0.08)",
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
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!loadingEmployees && selectedManager && employees.length === 0 && (
              <div style={{ color: "#888", fontWeight: 500, fontSize: 16, marginBottom: 24 }}>
                No employees assigned to this manager.
              </div>
            )}

            {/* Manager Assigned Task Status */}
            {loadingTasks && <div>Loading assigned tasks status...</div>}

            {!loadingTasks && managerTasks.length > 0 && (
              <div style={{ marginTop: "2.5rem" }}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  marginBottom: 22,
                  color: "#22305a",
                  letterSpacing: 0.5,
                }}>Assigned Tasks Status</h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "22px",
                  }}
                >
                  {managerTasks.map((task) => (
                    <div
                      key={task._id}
                      style={{
                        background: "linear-gradient(120deg, #f7faff 60%, #e3e9f7 100%)",
                        border: "1.5px solid #dbe6fd",
                        borderRadius: 14,
                        padding: "22px 26px",
                        minWidth: 270,
                        maxWidth: 340,
                        boxShadow: "0 2px 12px rgba(44,62,80,0.07)",
                        display: "flex",
                        flexDirection: "column",
                        marginBottom: 8,
                        transition: "box-shadow 0.2s",
                        position: "relative",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
                        <span
                          style={{
                            background: "#3357b7",
                            color: "#fff",
                            borderRadius: "50%",
                            width: 34,
                            height: 34,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: 17,
                            marginRight: 12,
                            boxShadow: "0 2px 8px rgba(51,87,183,0.10)",
                          }}
                        >
                          {task.assignedTo?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 17, color: "#14213d" }}>
                          {task.title}
                        </span>
                      </div>
                      <div style={{ fontSize: 15, marginBottom: 5, color: "#444" }}>
                        <span style={{ color: "#888" }}>Assigned To:</span>{" "}
                        <span style={{ fontWeight: 600 }}>{task.assignedTo.name}</span>
                      </div>
                      <div style={{ fontSize: 15, marginBottom: 5 }}>
                        <span style={{ color: "#888" }}>Status:</span>{" "}
                        <span
                          style={{
                            color:
                              task.status === "pending"
                                ? "#f2994a"
                                : task.status === "in_progress"
                                ? "#3357b7"
                                : "#219653",
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {task.status}
                        </span>
                        {task.completionFile && (
                          <>
                            {" "}
                            |{" "}
                            <a
                              href={task.completionFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "#3357b7",
                                textDecoration: "underline",
                                fontWeight: 600,
                              }}
                            >
                              View File
                            </a>
                          </>
                        )}
                      </div>
                      {task.description && (
                        <div style={{ fontSize: 14, color: "#888", marginTop: 6 }}>
                          <span style={{ fontWeight: 600 }}>Description:</span> {task.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}