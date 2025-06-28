"use client";

import { useState, useEffect } from "react";

// Sidebar Component
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
          { icon: "🏠", label: "Homepage", link: "/homepage" },
          { icon: "📋", label: "My Tasks", link: "/tasks" },
          { icon: "📅", label: "Attendance", link: "/attendance" },
          { icon: "👤", label: "Profile", link: "/profile" },
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
        background: "#4a6fc1",
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

export default function EmployeeHomepage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completionFile, setCompletionFile] = useState({});
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Mock user data - replace with actual user context
  const currentUser = {
    name: "John Doe",
    username: "johndoe",
    role: "employee"
  };

  // Fetch user's assigned tasks
  useEffect(() => {
    async function fetchMyTasks() {
      try {
        setLoading(true);
        // Replace this with your actual API endpoint to fetch user's tasks
        // const res = await fetch("/api/employee/my-tasks", {
        //   method: "GET",
        //   credentials: "include",
        // });
        
        // Mock data for demonstration - replace with actual API call
        const mockTasks = [
          {
            _id: "1",
            title: "Complete Project Documentation",
            description: "Prepare comprehensive documentation for the new project including technical specifications and user guides.",
            status: "pending",
            assignedBy: { name: "Sarah Johnson", username: "sarahj" },
            createdAt: "2024-01-15T10:00:00Z",
            dueDate: "2024-01-25T17:00:00Z"
          },
          {
            _id: "2",
            title: "Code Review for Authentication Module",
            description: "Review the authentication module code and provide feedback on security implementations.",
            status: "in_progress",
            assignedBy: { name: "Mike Chen", username: "mikec" },
            createdAt: "2024-01-10T09:00:00Z",
            dueDate: "2024-01-20T17:00:00Z"
          },
          {
            _id: "3",
            title: "Database Optimization",
            description: "Optimize database queries for better performance in the reporting module.",
            status: "completed",
            assignedBy: { name: "Sarah Johnson", username: "sarahj" },
            createdAt: "2024-01-05T14:00:00Z",
            dueDate: "2024-01-15T17:00:00Z",
            completionFile: "/files/db-optimization-report.pdf"
          }
        ];
        
        setTasks(mockTasks);
        
        // Actual API call would look like this:
        // const data = await res.json();
        // if (res.ok) {
        //   setTasks(data.tasks || []);
        // } else {
        //   setError(data.message || "Error fetching tasks");
        // }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMyTasks();
  }, []);

  // Update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      setUpdatingTaskId(taskId);
      
      // Mock API call - replace with actual endpoint
      // const res = await fetch("/api/employee/update-task-status", {
      //   method: "PATCH",
      //   headers: { "Content-Type": "application/json" },
      //   credentials: "include",
      //   body: JSON.stringify({ taskId, status: newStatus }),
      // });
      
      // Update local state for demo
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      
      alert("Task status updated successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Submit task completion with file
  const handleSubmitCompletion = async (taskId) => {
    const file = completionFile[taskId];
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      setUpdatingTaskId(taskId);
      
      // Mock file upload - replace with actual endpoint
      alert("Task completed and file uploaded successfully!");
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task._id === taskId 
          ? { ...task, status: "completed", completionFile: `/files/${file.name}` }
          : task
      ));
      
      setCompletionFile(prev => ({ ...prev, [taskId]: null }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#f2994a";
      case "in_progress": return "#3357b7";
      case "completed": return "#219653";
      default: return "#888";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending": return "Pending";
      case "in_progress": return "In Progress";
      case "completed": return "Completed";
      default: return status;
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(120deg, #f4f6f8 60%, #e3e9f7 100%)" }}>
      <Sidebar />
      <div style={{ flex: 1, marginLeft: 90, minHeight: "100vh" }}>
        <Navbar />
        <div style={{
          minHeight: "calc(100vh - 60px)",
          padding: "32px",
          background: "transparent",
        }}>
          {/* Welcome Header */}
          <div style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: 18,
            boxShadow: "0 8px 32px rgba(44,62,80,0.10)",
            padding: "32px",
            marginBottom: "24px",
            border: "1px solid #e3e9f7",
          }}>
            <h1 style={{
              fontSize: 32,
              fontWeight: 800,
              marginBottom: 12,
              color: "#14213d",
              display: "flex",
              alignItems: "center",
              gap: 16,
              letterSpacing: 1,
            }}>
              <span role="img" aria-label="wave" style={{ fontSize: 36 }}>👋</span>
              Welcome back, {currentUser.name}!
            </h1>
            <p style={{ fontSize: 18, color: "#666", marginBottom: 0 }}>
              Here's an overview of your assigned tasks and current progress.
            </p>
          </div>

          {/* Tasks Section */}
          <div style={{
            background: "rgba(255,255,255,0.98)",
            borderRadius: 18,
            boxShadow: "0 8px 32px rgba(44,62,80,0.10)",
            padding: "38px",
            border: "1px solid #e3e9f7",
          }}>
            <h2 style={{
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 30,
              color: "#14213d",
              display: "flex",
              alignItems: "center",
              gap: 14,
              letterSpacing: 1,
            }}>
              <span role="img" aria-label="tasks" style={{ fontSize: 32 }}>📋</span>
              My Tasks
            </h2>

            {loading && (
              <div style={{ 
                fontSize: 16, 
                color: "#666", 
                textAlign: "center", 
                padding: "40px" 
              }}>
                Loading your tasks...
              </div>
            )}

            {error && (
              <div style={{ 
                color: "#e53935", 
                background: "#ffebee", 
                padding: "16px", 
                borderRadius: 8, 
                marginBottom: 24 
              }}>
                {error}
              </div>
            )}

            {!loading && !error && tasks.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#888",
                fontSize: 18,
              }}>
                <span style={{ fontSize: 48, marginBottom: 16, display: "block" }}>📝</span>
                No tasks assigned yet. Check back later!
              </div>
            )}

            {!loading && !error && tasks.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                gap: "24px",
              }}>
                {tasks.map((task) => (
                  <div
                    key={task._id}
                    style={{
                      background: "linear-gradient(120deg, #f7faff 60%, #e3e9f7 100%)",
                      border: "1.5px solid #dbe6fd",
                      borderRadius: 16,
                      padding: "26px",
                      boxShadow: "0 4px 16px rgba(44,62,80,0.08)",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      position: "relative",
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(44,62,80,0.12)";
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(44,62,80,0.08)";
                    }}
                  >
                    {/* Task Header */}
                    <div style={{ marginBottom: 16 }}>
                      <h3 style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#14213d",
                        marginBottom: 8,
                        lineHeight: 1.3,
                      }}>
                        {task.title}
                      </h3>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: getStatusColor(task.status),
                        color: "#fff",
                        padding: "4px 12px",
                        borderRadius: 20,
                        fontSize: 14,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}>
                        {getStatusText(task.status)}
                      </div>
                    </div>

                    {/* Task Description */}
                    <p style={{
                      fontSize: 15,
                      color: "#555",
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}>
                      {task.description}
                    </p>

                    {/* Task Details */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
                        <span style={{ fontWeight: 600 }}>Assigned by:</span> {task.assignedBy.name}
                      </div>
                      {task.dueDate && (
                        <div style={{ fontSize: 14, color: "#888", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      <div style={{ fontSize: 14, color: "#888" }}>
                        <span style={{ fontWeight: 600 }}>Created:</span> {new Date(task.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Task Actions */}
                    {task.status === "pending" && (
                      <button
                        style={{
                          padding: "10px 20px",
                          background: "#3357b7",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: 14,
                          boxShadow: "0 2px 8px rgba(51,87,183,0.20)",
                          transition: "background 0.15s",
                          marginRight: 8,
                        }}
                        onClick={() => handleUpdateTaskStatus(task._id, "in_progress")}
                        disabled={updatingTaskId === task._id}
                        onMouseOver={e => e.currentTarget.style.background = "#2347a0"}
                        onMouseOut={e => e.currentTarget.style.background = "#3357b7"}
                      >
                        {updatingTaskId === task._id ? "Updating..." : "Start Task"}
                      </button>
                    )}

                    {task.status === "in_progress" && (
                      <div>
                        <input
                          type="file"
                          onChange={(e) => setCompletionFile(prev => ({
                            ...prev,
                            [task._id]: e.target.files[0]
                          }))}
                          style={{
                            marginBottom: 12,
                            padding: 8,
                            border: "1px solid #ddd",
                            borderRadius: 6,
                            fontSize: 14,
                            width: "100%",
                          }}
                        />
                        <button
                          style={{
                            padding: "10px 20px",
                            background: "#219653",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 14,
                            boxShadow: "0 2px 8px rgba(33,150,83,0.20)",
                            transition: "background 0.15s",
                          }}
                          onClick={() => handleSubmitCompletion(task._id)}
                          disabled={updatingTaskId === task._id}
                          onMouseOver={e => e.currentTarget.style.background = "#1e7e34"}
                          onMouseOut={e => e.currentTarget.style.background = "#219653"}
                        >
                          {updatingTaskId === task._id ? "Submitting..." : "Complete Task"}
                        </button>
                      </div>
                    )}

                    {task.status === "completed" && task.completionFile && (
                      <a
                        href={task.completionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "10px 20px",
                          background: "#e8f5e8",
                          color: "#219653",
                          textDecoration: "none",
                          borderRadius: 8,
                          fontWeight: 600,
                          fontSize: 14,
                          border: "1px solid #c8e6c9",
                          transition: "background 0.15s",
                        }}
                        onMouseOver={e => e.currentTarget.style.background = "#d4edda"}
                        onMouseOut={e => e.currentTarget.style.background = "#e8f5e8"}
                      >
                        📎 View Submitted File
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}