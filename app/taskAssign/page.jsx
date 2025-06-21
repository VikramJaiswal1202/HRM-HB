'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TaskAssignPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    priority: "medium",
    status: "pending"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageM" },
    { label: "Employees", icon: "👥", route: "/employeesM" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance and timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
    { label: "Task Assign", icon: "📝",route: "/taskAssign"},
  ];

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const mockTasks = [
          {
            id: 1,
            title: "Complete project documentation",
            description: "Write detailed documentation for the new feature",
            assignedDate: "2023-06-15",
            deadline: "2023-06-20",
            priority: "high",
            status: "in-progress"
          },
          {
            id: 2,
            title: "Fix login page bug",
            description: "Users unable to login with Google accounts",
            assignedDate: "2023-06-10",
            deadline: "2023-06-12",
            priority: "high",
            status: "completed"
          },
          {
            id: 3,
            title: "Prepare presentation",
            description: "Create slides for quarterly review meeting",
            assignedDate: "2023-06-05",
            deadline: "2023-06-18",
            priority: "medium",
            status: "pending"
          }
        ];
        
        setTasks(mockTasks);
      } catch (error) {
        setMessage("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline) {
      setMessage("Title and deadline are required");
      return;
    }

    // In a real app, this would be an API call
    const newTaskWithId = {
      ...newTask,
      id: tasks.length + 1,
      assignedDate: new Date().toISOString().split('T')[0]
    };

    setTasks([...tasks, newTaskWithId]);
    setMessage("Task added successfully!");
    setNewTask({
      title: "",
      description: "",
      deadline: "",
      priority: "medium",
      status: "pending"
    });

    // Clear message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f6f9fc]">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-20 bg-[#0D1A33] text-white flex flex-col items-center py-6 justify-between z-40">
        <div className="w-full">
          <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center text-[#0D1A33] font-bold text-xl mb-8 shadow mx-auto">
            E
          </div>
          <nav className="flex flex-col gap-3 w-full items-center">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                className={`flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors ${
                  item.label === "Task Assign" ? "bg-[#1a2b4c]" : ""
                }`}
                onClick={() => router.push(item.route)}
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="w-full flex justify-center">
          <button
            onClick={() => router.push("/login")}
            className="fixed bottom-6 left-6 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors z-50"
            style={{ color: "#fff", fontSize: "13px" }}
          >
            <span style={{ fontSize: "22px" }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            <span style={{ fontSize: "11px" }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="bg-[#4267b2] shadow flex items-center px-8 h-16">
          <span className="text-white font-bold text-2xl tracking-wide">
            PulseHR - Employee Portal
          </span>
        </header>
        <div className="w-full h-[2px] bg-[#e9eef6]" />

        {/* Task Content */}
        <main className="flex-1 flex flex-col items-center justify-start w-full py-8">
          <div className="w-full max-w-6xl flex flex-col gap-8 px-4">
            {/* Task Assignment Form */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-[#0D1A33] mb-4">Assign New Task</h2>
              
              {message && (
                <div className={`mb-4 p-3 rounded ${
                  message.includes("success") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="title" className="font-medium text-[#0D1A33]">Task Title*</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="deadline" className="font-medium text-[#0D1A33]">Deadline*</label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={newTask.deadline}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label htmlFor="description" className="font-medium text-[#0D1A33]">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="priority" className="font-medium text-[#0D1A33]">Priority</label>
                  <select
                    id="priority"
                    name="priority"
                    value={newTask.priority}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="status" className="font-medium text-[#0D1A33]">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={newTask.status}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="md:col-span-2 bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Assign Task
                </button>
              </form>
            </div>

            {/* Task List */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#0D1A33]">Your Tasks</h2>
                <div className="text-sm text-gray-500">
                  Showing {tasks.length} tasks
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No tasks assigned yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-[#e9eef6] rounded-lg text-base">
                    <thead>
                      <tr className="bg-[#f4f7fb] text-[#0D1A33]">
                        <th className="py-3 px-6 border-b text-left">Title</th>
                        <th className="py-3 px-6 border-b text-left">Description</th>
                        <th className="py-3 px-6 border-b text-left">Assigned</th>
                        <th className="py-3 px-6 border-b text-left">Deadline</th>
                        <th className="py-3 px-6 border-b text-left">Priority</th>
                        <th className="py-3 px-6 border-b text-left">Status</th>
                        <th className="py-3 px-6 border-b text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={task.id} className="hover:bg-[#f4f7fb]">
                          <td className="py-3 px-6 border-b">{task.title}</td>
                          <td className="py-3 px-6 border-b text-sm text-gray-600">
                            {task.description || "-"}
                          </td>
                          <td className="py-3 px-6 border-b">{task.assignedDate}</td>
                          <td className="py-3 px-6 border-b">{task.deadline}</td>
                          <td className="py-3 px-6 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="py-3 px-6 border-b">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status.replace("-", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-6 border-b">
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                              className="border border-[#e9eef6] rounded px-2 py-1 text-sm bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskAssignPage;