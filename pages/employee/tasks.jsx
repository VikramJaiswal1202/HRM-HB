"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function EmployeeTasks({ employeeId }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (employeeId) {
      fetchTasks();
    }
  }, [employeeId]);

  const fetchTasks = async () => {
    const res = await axios.get(`/api/employee/tasks?employeeId=${employeeId}`);
    if (res.data.success) {
      setTasks(res.data.tasks);
    }
  };
  
  const updateTaskStatus = async (taskId, status) => {
    const res = await axios.put("/api/employee/tasks", { taskId, status });
    if (res.data.success) {
      fetchTasks();
    }
  };
  
  return (
    <div>
      <h2>My Assigned Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task._id}>
            <strong>{task.title}</strong> - {task.description}
            <div>
              Status: <strong>{task.status}</strong> | 
              <button 
                onClick={() => updateTaskStatus(task._id, "completed")}
                disabled={task.status === "completed"}
              >
                Mark Completed
              </button>
              <button 
                onClick={() => updateTaskStatus(task._id, "assigned")}
                disabled={task.status === "assigned"}
              >
                Mark Not Completed
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
