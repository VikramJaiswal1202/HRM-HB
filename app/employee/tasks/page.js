"use client";

import { useEffect, useState } from "react";

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
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>✅ My Tasks</h1>
      {loading && <div>Loading tasks...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!loading && tasks.length === 0 && <div>No tasks assigned.</div>}

      {!loading &&
        tasks.map((task) => (
          <div
            key={task._id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "8px",
              marginBottom: "1rem",
            }}
          >
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>
              Assigned By: {task.assignedBy?.name} ({task.assignedBy?.username})
            </p>
            <p>Status: <strong>{task.status}</strong></p>
            <p>Created At: {new Date(task.createdAt).toLocaleString()}</p>

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
              >
                <input
                  type="file"
                  name="fileInput"
                  required
                  style={{ marginRight: "1rem" }}
                />
                <button type="submit">Mark Done</button>
              </form>
            )}
            {task.status === "completed" && task.completionFile && (
              <div>
                ✅ Completed.{" "}
                <a href={task.completionFile} target="_blank" rel="noreferrer">
                  View Uploaded File
                </a>
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
