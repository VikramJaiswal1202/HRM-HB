"use client";

import { useEffect, useState } from "react";

// Sidebar with updated links and functional logout
function Sidebar() {
  return (
    <div
      style={{
        width: 80,
        background: "#14213d",
        color: "#fff",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 20,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "#fff",
          color: "#14213d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 22,
          marginBottom: 32,
        }}
      >
        R
      </div>
      <div style={{ width: "100%" }}>
        <a href="/homepageE" style={{ color: "#fff", textDecoration: "none" }}>
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <span style={{ fontSize: 22 }}>🏠</span>
            <div style={{ fontSize: 13, marginTop: 4 }}>Homepage</div>
          </div>
        </a>
        <a href="/viewattendanceE" style={{ color: "#fff", textDecoration: "none" }}>
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <span style={{ fontSize: 22 }}>📅</span>
            <div style={{ fontSize: 13, marginTop: 4 }}>View Attendance</div>
          </div>
        </a>
        <a href="/taskassignE" style={{ color: "#fff", textDecoration: "none" }}>
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <span style={{ fontSize: 22 }}>📝</span>
            <div style={{ fontSize: 13, marginTop: 4 }}>Task Assign</div>
          </div>
        </a>
      </div>
      <div style={{ marginTop: "auto", marginBottom: 24, textAlign: "center" }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#22223b",
            color: "#fff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            cursor: "pointer",
          }}
          onClick={() => { window.location.href = "/login"; }}
        >
          <span style={{ fontSize: 18 }}>↩</span>
        </span>
        <div
          style={{ fontSize: 12, marginTop: 4, cursor: "pointer" }}
          onClick={() => { window.location.href = "/login"; }}
        >
          Logout
        </div>
      </div>
    </div>
  );
}

// Navbar
function Navbar() {
  return (
    <div
      style={{
        height: 56,
        background: "#3357b7",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        paddingLeft: 100,
        fontWeight: "bold",
        fontSize: 24,
        letterSpacing: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      PulseHR
    </div>
  );
}

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/employee/tasks", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks || []);
      } else {
        setError(data.message || "Error loading tasks");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  async function handleCompleteTask(taskId, file) {
    const formData = new FormData();
    formData.append("completionFile", file);

    const res = await fetch(`/api/employee/tasks/${taskId}`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      fetchTasks();
    } else {
      alert(data.message || "Error submitting task");
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f8" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 80 }}>
        <Navbar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            minHeight: "calc(100vh - 56px)",
            padding: "40px 0",
            background: "#f4f6f8",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              padding: "32px 32px 24px 32px",
              minWidth: 600,
              width: "100%",
              maxWidth: 800,
              color: "Black",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 24, color: "Black" }}>
              Your Tasks
            </div>
            {loading && <div>Loading tasks...</div>}
            {error && <div style={{ color: "red" }}>{error}</div>}
            {!loading && tasks.length === 0 && (
              <div>No tasks assigned.</div>
            )}
            {!loading &&
              tasks.map((task) => (
                <div
                  key={task._id}
                  style={{
                    border: "1px solid #e0e0e0",
                    padding: "18px 20px",
                    borderRadius: "8px",
                    marginBottom: "1.2rem",
                    background: "#fafbfc",
                  }}
                >
                  <div style={{ fontWeight: 500, fontSize: 17, marginBottom: 6 }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 15, marginBottom: 8, color: "#444" }}>
                    {task.description}
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: "#888" }}>Assigned By:</span>{" "}
                    {task.assignedBy?.name} ({task.assignedBy?.username})
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>
                    <span style={{ color: "#888" }}>Status:</span>{" "}
                    <strong
                      style={{
                        color:
                          task.status === "completed"
                            ? "#219653"
                            : task.status === "pending"
                            ? "#f2994a"
                            : "#333",
                      }}
                    >
                      {task.status}
                    </strong>
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 10 }}>
                    <span style={{ color: "#888" }}>Created At:</span>{" "}
                    {new Date(task.createdAt).toLocaleString()}
                  </div>
                  {task.status === "pending" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const file = e.target.elements.fileInput.files[0];
                        if (!file) {
                          alert("Please attach a file before submitting.");
                          return;
                        }
                        handleCompleteTask(task._id, file);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      <input
                        type="file"
                        name="fileInput"
                        required
                        style={{
                          marginRight: "1rem",
                          fontSize: 14,
                          padding: "2px 0",
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          background: "#3357b7",
                          color: "#fff",
                          border: "none",
                          borderRadius: 4,
                          padding: "6px 18px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        Mark Done
                      </button>
                    </form>
                  )}
                  {task.status === "completed" && task.completionFile && (
                    <div style={{ marginTop: 10 }}>
                      <span style={{ color: "#219653", fontWeight: 500 }}>
                        ✅ Completed.
                      </span>{" "}
                      <a
                        href={task.completionFile}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: "#3357b7",
                          textDecoration: "underline",
                          marginLeft: 8,
                        }}
                      >
                        View Uploaded File
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}