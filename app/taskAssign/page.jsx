'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const TaskAssignPage = () => {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    deadline: "",
    employeeId: ""
  });

  const sidebarItems = [
    { label: "Homepage", icon: "🏠", route: "/homepageM" },
    { label: "Employees", icon: "👥", route: "/employeesM" },
    { label: "Intern", icon: "👥", route: "/intern" },
    { label: "Attendance and timing", icon: "🗓️", route: "/attendance" },
    { label: "View Attendance", icon: "🗓️", route: "/presentEmployees" },
    { label: "Timing Reporting", icon: "⏱️", route: "/reporting" },
    { label: "Task Assign", icon: "📝", route: "/taskAssign"},
  ];

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockTasks = [
          {
            id: 1,
            title: "Complete project documentation",
            description: "Write detailed documentation for the new feature",
            deadline: "2023-06-20"
          },
          {
            id: 2,
            title: "Fix login page bug",
            description: "Users unable to login with Google accounts",
            deadline: "2023-06-12"
          }
        ];
        
        setTasks(mockTasks);
      } finally {
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      setEmployeeLoading(true);
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data.employees || []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setEmployeeLoading(false);
      }
    };
    
    fetchTasks();
    fetchEmployees();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline || !newTask.employeeId) return;

    // Here you would typically send the task to your backend API
    // For now, we'll just update the local state
    const newTaskWithId = {
      ...newTask,
      id: tasks.length + 1,
      assignedDate: new Date().toISOString().split('T')[0],
      employeeName: employees.find(emp => emp.employeeId === newTask.employeeId)?.name || "Unknown"
    };

    setTasks([...tasks, newTaskWithId]);
    setNewTask({
      title: "",
      description: "",
      deadline: "",
      employeeId: ""
    });

    // Show success message
    alert("Task assigned successfully!");
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
        <button
          onClick={() => router.push("/login")}
          className="mb-4 flex flex-col items-center gap-1 hover:bg-[#1a2b4c] rounded py-2 w-16 transition-colors"
        >
          <span className="text-2xl">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 19C7.58172 19 4 15.4183 4 11C4 6.58172 7.58172 3 12 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </span>
          <span className="text-[11px]">Logout</span>
        </button>
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

              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-[#0D1A33]">Select Employee</label>
                  <select
                    name="employeeId"
                    value={newTask.employeeId}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    required
                    disabled={employeeLoading}
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee) => (
                      <option key={employee.employeeId} value={employee.employeeId}>
                        {employee.name} ({employee.department || 'No department'})
                      </option>
                    ))}
                  </select>
                  {employeeLoading && <p className="text-sm text-gray-500">Loading employees...</p>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-[#0D1A33]">Task Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-[#0D1A33]">Description</label>
                  <textarea
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-medium text-[#0D1A33]">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={newTask.deadline}
                    onChange={handleInputChange}
                    className="border border-[#e9eef6] rounded-lg px-3 py-2 bg-[#f4f7fb]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#4267b2] hover:bg-[#314d80] text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Assign Task
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskAssignPage;