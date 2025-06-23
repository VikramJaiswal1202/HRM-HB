"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function EmployeeTasks({ employeeId = "685650f557f2b29451b6d2c0" }) {
  const [tasks, setTasks] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState({}); // { taskId: File }

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`/api/employee/tasks?employeeId=${employeeId}`);
      if (res.data.success) {
        setTasks(res.data.tasks);
      }
    } catch (error) {
      console.error(error);
      alert("Error loading tasks");
    }
  };
  
  const handleFileChange = (e, taskId) => {
    setSelectedFiles((prev) => ({ ...prev, [taskId]: e.target.files[0] }));
  };
  
  const handleUpdate = async (taskId, status) => {
    const formData = new FormData();
    formData.append("taskId", taskId);
    formData.append("status", status);
    if (status === "completed" && selectedFiles[taskId]) {
      formData.append("file", selectedFiles[taskId]);
    }
    
    try {
      const res = await axios.post("/api/employee/update-task", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        alert("Task updated successfully!");
        fetchTasks();
      }
    } catch (error) {
      alert(error.response?.data?.error || "Error updating task");
      console.error(error);
    }
  };
  
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">My Assigned Tasks</h1>
      {tasks.length === 0 && <p>No tasks found for you.</p>}

      {tasks.map((task) => (
        <div key={task._id} className="bg-gray-100 rounded-lg p-4 space-y-2">
          <div>
            <strong>Title:</strong> {task.title}
          </div>
          <div>
            <strong>Description:</strong> {task.description}
          </div>
          
          <div>
            <strong>Status:</strong> {task.status}
          </div>
          
          {task.imagePath && (
            <div>
              <img
                src={task.imagePath}
                alt="Task Upload"
                className="mt-2 w-32 h-32 rounded"
              />
            </div>
          )}

          {task.status !== "completed" && (
            <div className="mt-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, task._id)}
                className="mb-2"
              />
              <button
                onClick={() => handleUpdate(task._id, "completed")}
                className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded"
              >
                Mark as Completed
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
